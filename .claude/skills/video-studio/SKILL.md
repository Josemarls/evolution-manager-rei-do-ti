---
name: video-studio
description: Cria vídeos narrados e animados (Reels, Shorts, TikTok, YouTube 16:9) a partir de um tema ou roteiro, sem gravação e sem API paga. Use quando o usuário pedir para criar, gerar, roteirizar ou renderizar um vídeo, ou para criar um novo estilo de animação.
---

# Estúdio de vídeo

Pipeline local em `video-studio/`: roteiro JSON -> narração (Piper) -> legenda palavra a palavra (Whisper) -> animação HTML renderizada no Chromium -> MP4 (ffmpeg).

## Fluxo

1. **Roteiro.** A partir do tema, escreva `video-studio/projects/<slug>/video.json`. Uma cena por ideia, 1 a 2 frases de narração cada (4 a 6 s). Gancho na primeira cena, fechamento na última. Reels: 20 a 45 s no total.
2. **Conferência.** `python3 video-studio/studio.py <video.json> --stills 2,6,10` gera imagens em `projects/<slug>/out/`. Olhe as imagens antes de renderizar: texto cortado, título em três linhas, lista que não cabe.
3. **Render.** `python3 video-studio/studio.py <video.json>` gera `out/<slug>-9x16.mp4`. Para a versão horizontal do mesmo roteiro, acrescente `--format 16:9`.
4. **Entrega.** Envie o MP4 ao usuário junto com título, descrição e hashtags sugeridos.

## Formato do `video.json`

```json
{
  "brand": "REI DO TI", "format": "9:16", "style": "kinetic", "voice": "faber",
  "scenes": [
    { "narration": "Texto falado.", "kicker": "Rótulo curto", "headline": "Título com *destaque*",
      "visual": { "type": "chips", "strike": true, "items": ["a", "b"] } }
  ]
}
```

- `headline`: até ~22 caracteres rende melhor; `*asteriscos*` pintam o destaque.
- `visual.type`: `chips` (pílulas; `strike: true` risca todas), `steps` (lista numerada), `checklist` (lista com ✓), `terminal` (`lines`; linha começando com `>` fica em destaque). Sem `visual`, a cena é só título.
- Até 4 itens por cena. A narração não aparece na cena; ela vira a legenda.

## Novo estilo

Cada estilo é uma pasta em `video-studio/templates/<nome>/index.html`. Contrato: ler `window.__DATA__` (cenas com `start`/`end`, `captions`, `width`, `height`, `duration`) e expor `window.renderAt(t)`, que desenha o quadro do segundo `t`. Toda animação deve ser função de `t`: não use animação CSS, `setTimeout` nem `requestAnimationFrame`, porque o render é quadro a quadro. Fontes e imagens ficam dentro da pasta do estilo, sem rede.

## Requisitos

`pip install -r video-studio/requirements.txt`, mais `ffmpeg`, Node e Playwright com Chromium. A voz e o modelo Whisper são baixados do Hugging Face no primeiro uso para `video-studio/.cache/`.

## Limites atuais

Uma voz (pt-BR, Piper "faber"), um estilo (`kinetic`), sem trilha sonora, sem imagens geradas e sem personagem.
