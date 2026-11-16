// Renderiza o template HTML quadro a quadro com o Chromium e junta com a narração.
// Uso: node render.cjs <data.json> <narration.wav> <saida.mp4> [--stills=1,5,9]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const [dataPath, audioPath, outPath, extra] = process.argv.slice(2);
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const tpl = path.join(__dirname, 'templates', data.style, 'index.html');
  if (!fs.existsSync(tpl)) throw new Error(`estilo não encontrado: ${data.style}`);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: data.width, height: data.height },
    deviceScaleFactor: 1,
  });
  page.on('pageerror', (e) => { console.error('erro no template:', e.message); process.exitCode = 1; });
  await page.addInitScript((d) => { window.__DATA__ = d; }, data);
  await page.goto('file://' + tpl);
  await page.evaluate(() => document.fonts.ready);

  if (extra && extra.startsWith('--stills=')) {
    for (const t of extra.slice(9).split(',').map(Number)) {
      await page.evaluate((x) => window.renderAt(x), t);
      const file = path.join(path.dirname(outPath), `still-${String(t).replace('.', '_')}.png`);
      await page.screenshot({ path: file });
      console.log('    ' + file);
    }
    await browser.close();
    return;
  }

  const ff = spawn('ffmpeg', [
    '-v', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(data.fps), '-c:v', 'mjpeg', '-i', '-',
    '-i', audioPath,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
    '-c:a', 'aac', '-b:a', '160k', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
    '-shortest', '-movflags', '+faststart', outPath,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg saiu com ' + c)) : res())));

  const total = Math.ceil(data.duration * data.fps);
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.renderAt(t), f / data.fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`    quadro ${f}/${total}`);
  }
  ff.stdin.end();
  await done;
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
