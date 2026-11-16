# Estúdio de vídeo

Gera vídeos narrados e animados a partir de um roteiro em JSON, tudo local e sem API paga.

```
tema -> roteiro (Claude) -> narração (Piper) -> legenda sincronizada (Whisper) -> animação (HTML + Chromium) -> MP4 (ffmpeg)
```

## Uso

```bash
pip install -r video-studio/requirements.txt
python3 video-studio/studio.py video-studio/projects/demo/video.json                 # vertical 9:16
python3 video-studio/studio.py video-studio/projects/demo/video.json --format 16:9   # horizontal
python3 video-studio/studio.py video-studio/projects/demo/video.json --stills 2,8,15 # só imagens de conferência
```

O vídeo sai em `projects/<nome>/out/`. Um vídeo de 23 s leva cerca de 1 minuto para renderizar.

## Estrutura

| Caminho | Função |
|---|---|
| `studio.py` | Orquestra: narra cada cena, alinha as palavras com o áudio, monta `build/data.json` |
| `render.cjs` | Abre o template no Chromium, captura quadro a quadro e junta com o áudio |
| `templates/kinetic/` | Estilo de animação (HTML). Cada estilo novo é uma pasta aqui |
| `projects/<nome>/video.json` | Roteiro: cenas com narração, título e elemento visual |

O formato do roteiro e o contrato para criar estilos estão em `.claude/skills/video-studio/SKILL.md`.

## Como a legenda é sincronizada

O texto exibido é sempre o do roteiro. O Whisper ouve a narração gerada e serve só de relógio: suas palavras são casadas com as do roteiro, e as que ele ouvir diferente recebem tempo interpolado das vizinhas.

## Limites atuais

Uma voz, um estilo, sem trilha sonora, sem imagens geradas e sem personagem. A fonte Inter vem embutida (licença SIL OFL, em `templates/kinetic/fonts/`).
