#!/usr/bin/env python3
"""Estúdio de vídeo: roteiro JSON -> narração -> legenda sincronizada -> animação -> MP4.

Uso:  python3 video-studio/studio.py video-studio/projects/demo/video.json
      python3 video-studio/studio.py <video.json> --format 16:9 --stills 1,5,9
"""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata
import urllib.request
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / ".cache"
VOICES = {
    "faber": ("pt_BR-faber-medium", "pt/pt_BR/faber/medium"),
}
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main"
SIZES = {"9:16": (1080, 1920), "16:9": (1920, 1080), "1:1": (1080, 1080)}
LEAD, GAP, TAIL = 0.30, 0.35, 0.80  # silêncios, em segundos


def voice_path(name):
    stem, folder = VOICES[name]
    d = CACHE / "voices"
    d.mkdir(parents=True, exist_ok=True)
    for ext in (".onnx", ".onnx.json"):
        f = d / (stem + ext)
        if not f.exists():
            print(f"baixando voz {stem}{ext}…")
            urllib.request.urlretrieve(f"{HF}/{folder}/{stem}{ext}", f)
    return d / (stem + ".onnx")


def plain(text):
    return text.replace("*", "")


def read_wav(path):
    with wave.open(str(path)) as w:
        assert w.getnchannels() == 1 and w.getsampwidth() == 2, "esperado WAV mono 16 bits"
        return w.getframerate(), np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)


def synth(scenes, model, work):
    """Narra cada cena e junta tudo. Devolve (wav final, limites das cenas em segundos)."""
    rate, parts, bounds, pos = None, [], [], 0.0
    for i, sc in enumerate(scenes):
        out = work / f"scene{i:02d}.wav"
        subprocess.run([sys.executable, "-m", "piper", "-m", str(model), "-f", str(out)],
                       input=plain(sc["narration"]).encode(), check=True, stderr=subprocess.DEVNULL)
        r, audio = read_wav(out)
        rate = rate or r
        pre = LEAD if i == 0 else GAP
        parts += [np.zeros(int(pre * rate), np.int16), audio]
        bounds.append(pos + (0 if i == 0 else pre / 2))
        pos += pre + len(audio) / rate
    parts.append(np.zeros(int(TAIL * rate), np.int16))
    total = pos + TAIL
    bounds.append(total)
    final = work / "narration.wav"
    with wave.open(str(final), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
        w.writeframes(np.concatenate(parts).tobytes())
    return final, bounds, total


def norm(word):
    w = unicodedata.normalize("NFD", word.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def word_times(wav, script_words):
    """Tempo de cada palavra do roteiro, usando o Whisper só como relógio."""
    from faster_whisper import WhisperModel
    os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
    wav16 = wav.with_name("narration16k.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-ac", "1", "-ar", "16000", str(wav16)], check=True)
    _, pcm = read_wav(wav16)
    model = WhisperModel("small", device="cpu", compute_type="int8", download_root=str(CACHE / "whisper"))
    segs, _ = model.transcribe(pcm.astype(np.float32) / 32768, language="pt", word_timestamps=True)
    heard = [w for s in segs for w in s.words]
    sm = difflib.SequenceMatcher(a=[norm(w) for w in script_words], b=[norm(w.word) for w in heard], autojunk=False)
    times = [None] * len(script_words)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            times[a + k] = (float(heard[b + k].start), float(heard[b + k].end))
    matched = sum(t is not None for t in times)
    # palavras que o Whisper ouviu diferente: interpolar entre as vizinhas
    known = [i for i, t in enumerate(times) if t]
    if not known:
        raise SystemExit("não foi possível alinhar a narração com o roteiro")
    for i, t in enumerate(times):
        if t:
            continue
        prev = max((k for k in known if k < i), default=None)
        nxt = min((k for k in known if k > i), default=None)
        lo = times[prev][1] if prev is not None else 0.0
        hi = times[nxt][0] if nxt is not None else lo + 0.3 * (i - (prev or 0))
        span = (nxt if nxt is not None else i + 1) - (prev if prev is not None else -1)
        step = (hi - lo) / span
        idx = i - (prev if prev is not None else -1)
        times[i] = (lo + step * (idx - 1), lo + step * idx)
    return times, matched


def captions(scenes_words, max_words=3, max_chars=20):
    """Agrupa as palavras em blocos curtos de legenda, sem atravessar cenas nem pontuação."""
    groups = []
    for words in scenes_words:
        cur = []
        for w in words:
            size = sum(len(x["t"]) + 1 for x in cur) + len(w["t"])
            if cur and (len(cur) >= max_words or size > max_chars):
                groups.append(cur); cur = []
            cur.append(w)
            if re.search(r"[.!?,;:]$", w["t"]):
                groups.append(cur); cur = []
        if cur:
            groups.append(cur)
    out = []
    for i, g in enumerate(groups):
        end = groups[i + 1][0]["s"] if i + 1 < len(groups) else g[-1]["e"] + 0.4
        out.append({"start": g[0]["s"], "end": min(end, g[-1]["e"] + 0.6), "words": g})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--format", choices=SIZES, help="sobrescreve o formato do projeto")
    ap.add_argument("--stills", help="segundos separados por vírgula: gera só imagens de conferência")
    args = ap.parse_args()

    src = Path(args.project).resolve()
    proj = json.loads(src.read_text(encoding="utf-8"))
    fmt = args.format or proj.get("format", "9:16")
    width, height = SIZES[fmt]
    work = src.parent / "build"
    work.mkdir(exist_ok=True)

    print("1/3 narração…")
    wav, bounds, total = synth(proj["scenes"], voice_path(proj.get("voice", "faber")), work)

    print("2/3 legenda…")
    per_scene = [plain(s["narration"]).split() for s in proj["scenes"]]
    flat = [w for ws in per_scene for w in ws]
    times, matched = word_times(wav, flat)
    print(f"    {matched}/{len(flat)} palavras alinhadas pelo áudio")
    it = iter(times)
    scenes_words = [[{"t": w, "s": round(s, 3), "e": round(e, 3)} for w, (s, e) in zip(ws, it)] for ws in per_scene]

    data = {
        "style": proj.get("style", "kinetic"), "width": width, "height": height,
        "fps": proj.get("fps", 30), "duration": round(total, 3), "brand": proj.get("brand", ""),
        "scenes": [{**{k: v for k, v in s.items() if k != "narration"}, "start": round(bounds[i], 3),
                    "end": round(bounds[i + 1], 3)} for i, s in enumerate(proj["scenes"])],
        "captions": captions(scenes_words),
    }
    data_path = work / "data.json"
    data_path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

    out_dir = src.parent / "out"
    out_dir.mkdir(exist_ok=True)
    out = out_dir / f"{src.parent.name}-{fmt.replace(':', 'x')}.mp4"
    cmd = ["node", str(ROOT / "render.cjs"), str(data_path), str(wav), str(out)]
    if args.stills:
        cmd.append("--stills=" + args.stills)
    print("3/3 animação e render…")
    subprocess.run(cmd, check=True)
    print("pronto:", out_dir if args.stills else out)


if __name__ == "__main__":
    main()
