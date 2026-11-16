# Pesquisa: skills, conectores e mercado para criação e edição de vídeo

Data: 16/11/2026. Objetivo: mapear o que existe para montarmos aqui um fluxo avançado de criação e edição de vídeo conduzido pelo Claude.

## Limites desta pesquisa

- Preços e números de instalação vêm de blogs, agregadores e revendedores de API. São indicativos; confirmar na página oficial antes de contratar.
- As skills da comunidade (seção 3) não foram auditadas. Ler os scripts antes de rodar.
- Nenhuma skill de vídeo nem de "buscar skills" apareceu na sessão na nuvem; usei a busca de skills, plugins e conectores da própria conta.

## 0. O concorrente analisado: "Estúdio de Vídeos Automáticos" (@yurizandotv)

Fontes: o anúncio em vídeo (57 s, transcrito aqui) e a página de vendas `estudio-videos.pages.dev/guia297`.

**O que ele vende.** Um painel que roda no PC (Windows 10/11, abre no navegador), R$ 297 em pagamento único, entregue pela Kiwify com videoaulas de monetização ("Código Renda Digital"). Garantia de 7 dias.

**O que o painel faz, segundo o anúncio.** Você escreve a ideia ou cola o link de um vídeo que deu certo. Ele escreve o roteiro cena por cena, cria um personagem e o mantém igual no vídeo inteiro, gera e anima cada cena, coloca voz, música e legenda, refaz uma cena quando você pede, entrega título, descrição, tags e thumbnail, e tira a versão vertical do mesmo tema.

**Como funciona por baixo, segundo a página.** "Não precisa de chave de API. Os estilos da aba 'Estilos IA' usam a sua assinatura do Claude (Pro ou Max) ou do Codex." Ou seja: não há vídeo generativo. É o Claude escrevendo animações em código, com narração e legenda automáticas e render local. Os mais de 150 "estilos" são templates e skills (quadro a quadro, mão desenhando, mascote pixel, HUD cyberpunk, colagem, kinetic, isométrico, line art, mapas, iceberg, bonecos 2D).

**Formatos que ele mostra.** Reels e Shorts 9:16 e vídeos longos 16:9 para canal dark: mapas e geopolítica, comparação de tamanhos em 3D, iceberg, curiosidades, histórias do Reddit, psicologia, finanças.

**Conclusão.** É a mesma arquitetura da "base local" recomendada na seção 6. O diferencial dele é a biblioteca de estilos e o painel, não uma tecnologia que não temos.

| Capacidade dele | Nosso estúdio (`video-studio/`) hoje |
|---|---|
| Roteiro cena por cena a partir do tema | Sim (Claude escreve o `video.json`) |
| Narração automática | Sim, uma voz pt-BR local (Piper) |
| Legenda sincronizada palavra a palavra | Sim (Whisper) |
| Animação de cada cena | Sim, um estilo (`kinetic`) |
| Versão vertical e horizontal do mesmo roteiro | Sim (`--format`) |
| Refazer uma cena a pedido | Sim, editando o JSON e renderizando de novo |
| +150 estilos | Não: 1 estilo |
| Personagem consistente, cenas ilustradas | Não |
| Música | Não |
| Título, descrição, tags, thumbnail | Não automatizado |
| Clonar o estilo de um vídeo por link | Não |
| Painel no navegador | Não: uso pelo chat ou linha de comando |

## 1. O que já temos no ambiente

| Recurso | Situação |
|---|---|
| `ffmpeg` / `ffprobe` | Instalados |
| Node 22 | Instalado (base para Remotion e HyperFrames) |
| Chromium + Playwright | Instalados (renderização de HTML para vídeo) |
| Python 3 | Instalado (Whisper/faster-whisper instaláveis via pip) |
| `yt-dlp` | Não instalado |

Ou seja: corte, legenda, reenquadramento, mixagem de áudio e motion graphics por código já rodam aqui sem nenhuma conta externa.

## 2. Plugins no diretório da Anthropic (nenhum está ativado)

| Plugin | O que faz | Precisa de conta externa? |
|---|---|---|
| **Remotion** (12 skills) | Vídeo programático em React: animações, áudio, legendas, 3D, render | Não. Licença Remotion é paga para empresas com 4+ pessoas |
| **video-shotcraft** | Vídeos de produto "cinematográficos" em Remotion, com receitas de takes, SFX e template | Não |
| **watch-video** | Faz o Claude "assistir" um vídeo: keyframes com ffmpeg + transcrição (Whisper local ou Groq/OpenAI) | Não no modo local; `yt-dlp` para URLs |
| **Video Cleanup** | Limpeza de áudio (ruído, loudness), qualidade de imagem, marca d'água, lower third, cartela final | Não (Python + ffmpeg) |
| **Social Media Skills** (106 skills) | Estratégia, roteiro, legenda, vídeo com IA, voz, CapCut, Canva, publicação, analytics | Não para as skills; as ferramentas citadas sim |
| **AI Video Editor & Timeline (ManyMotions)** | Gera takes e imagens, monta em timeline multi-faixa, legenda queimada, exporta MP4 | Sim, conta ManyMotions |
| **videodb** | Upload, indexação, busca dentro do vídeo, edição, legendas, transcodificação | Sim, conta VideoDB |
| **together-ai-skills** | Geração de vídeo, imagem e áudio pela API da Together AI | Sim, chave de API |

## 3. Skills abertas da comunidade (fora do diretório)

| Skill | O que faz |
|---|---|
| `heygen-com/hyperframes` | Vídeo a partir de HTML: planejar, escrever HTML, adicionar mídia, lint, preview, render. Alternativa ao Remotion sem React |
| `remotion-dev/skills` | Skills oficiais do Remotion (mesmo conteúdo do plugin acima) |
| `Surojit16/video-editing-skill` | Edição por linguagem natural: cortes, remoção de silêncio (jump cut), legendas estilizadas, textos. ffmpeg + Whisper local |
| `6missedcalls/video-editing-skill` | Variante com 3 estilos de legenda (Hormozi, padrão, minimal) |
| `NeverSight/learn-skills.dev` (video-edit) | Remoção de silêncio com VAD neural (Silero), legendas com faster-whisper, corte vertical, clipes de YouTube, compressão |
| `agricidaniel/claude-video` | Suíte maior: FFmpeg, Whisper e ferramentas de geração |
| `browser-use/video-use` | Edição de vídeo dirigida por agente |
| Skill gratuita da Kapwing | Transcreve, decide cortes, gera gráficos, mixa áudio e entrega um Short pronto |

## 4. Conectores (MCP) disponíveis no diretório

Conectados hoje: Gmail e Supabase. Instalados mas não conectados: Google Drive, Windsor.ai, Cloudflare.

| Conector | Para quê | Etapa |
|---|---|---|
| **HyperFrames by HeyGen** | Slides animados e motion graphics em HTML, com render de vídeo | Criação |
| **Descript** | Importar mídia e editar/criar vídeo por prompt | Edição |
| **AI Producer by OpusClip** | Legendas, b-roll, enquadrar quem fala, melhorar voz | Edição / cortes |
| **Riverside** | Preparar, editar, clipar e publicar vídeos e podcasts | Gravação / edição |
| **Tella** | Editar e publicar gravações de tela (blur, destaques, overlays, SFX) | Tutoriais |
| **Canva** | Buscar, criar, preencher e exportar designs | Thumbnails / capas |
| **Moda** | Motion graphics, anúncios Meta, social | Criação |
| **vidIQ** | Pesquisa de palavras-chave, vídeos fora da curva, tendências (YouTube, Instagram, TikTok) | Pauta |
| **Windsor.ai for Social Media** | Analisar e publicar em Instagram, Facebook, TikTok, YouTube, LinkedIn | Publicação |
| **Motion Creative Analytics** / **AdWhispr** | Analisar criativos e anúncios de concorrentes | Pesquisa |
| **ElevenLabs** | O conector do diretório é de agentes de voz, não de narração. Narração (TTS) seria via API com chave | — |

Não apareceram conectores de Runway (vídeo), Kling, Veo, Sora ou CapCut. Esses entram por API com chave.

## 5. Mercado: o que os concorrentes entregam

| Categoria | Ferramentas | O que vendem | Dá para replicar aqui? |
|---|---|---|---|
| Cortes de vídeo longo para curto | OpusClip, Submagic (Magic Clips), Choppity | Escolher os melhores trechos, reenquadrar em 9:16, legendar | Sim: transcrição + Claude escolhendo trechos + ffmpeg |
| Legenda e "polimento" | Submagic, Captions, CapCut | Legenda animada palavra a palavra, zooms, b-roll, ganchos, corte de silêncio | Sim: Whisper com tempo por palavra + Remotion/HyperFrames |
| Edição por texto | Descript | Editar o vídeo editando a transcrição, tirar vícios de fala, limpar áudio | Sim, em grande parte (transcrição + ffmpeg) |
| Avatar e dublagem | HeyGen, Synthesia, ElevenLabs | Apresentador virtual, clone de voz, tradução com sincronia labial | Não localmente; exige API paga |
| Vídeo generativo | Veo, Sora, Kling, Runway, Seedance | Takes criados por texto ou imagem | Não localmente; exige API paga |
| Motion graphics por código | Remotion, HyperFrames | Animações, explicativos, vídeos de produto e de dados | Sim, 100% local |
| Gravação e tutorial | Riverside, Tella | Gravar, limpar e publicar | Parcial (conectores) |

Referências de preço encontradas: OpusClip a partir de ~US$ 29/mês; Submagic a partir de ~US$ 12/mês. Vídeo generativo por API fica entre ~US$ 0,03 e 0,75 por segundo: Kling ~0,05–0,07, Veo ~0,05 (Lite 720p) a 0,40 (Standard), Sora 2 Pro ~0,75.

## 6. Recomendação

Montar em três camadas, da mais barata para a mais cara:

1. **Base local, custo zero.** ffmpeg + faster-whisper + Remotion (ou HyperFrames). Cobre o que OpusClip, Submagic e Descript vendem: transcrição, corte de silêncio e de vícios de fala, legenda animada, 9:16, zooms, lower thirds, trilha com ducking, normalização de áudio. Ativar os plugins **Remotion**, **watch-video** e **Video Cleanup**.
2. **Mídia de apoio por API.** Narração (ElevenLabs), b-roll de banco gratuito (Pexels/Pixabay), imagens. Custo baixo e por uso.
3. **Generativo e avatar, só quando o formato pedir.** Veo/Kling para takes, HeyGen para avatar. É a camada cara; entra por projeto.

Para pauta e distribuição: vidIQ (o que está performando) e Windsor.ai for Social Media (publicar), que já está parcialmente instalado.

## 7. Decisões pendentes

- Remotion (React, ecossistema maior) ou HyperFrames (HTML, mais simples) como motor de motion graphics.
- Este repositório é o Evolution Manager (painel da Evolution API). Vale decidir se o fluxo de vídeo fica aqui em uma pasta própria ou em um repositório dedicado.
- Trazer para o repositório (`.claude/skills/`) a skill de edição já criada, para ela existir também nas sessões na nuvem.

## Fontes

- [MindStudio: edição de vídeo com Claude Code e HyperFrames](https://www.mindstudio.ai/blog/ai-video-editing-claude-code-hyperframes)
- [Kapwing: skill gratuita de edição com Claude Code](https://www.kapwing.com/resources/how-to-edit-videos-with-claude-code-free-ai-video-editing-skill/)
- [Skillselion: melhores skills de Remotion](https://skillselion.com/guides/best-remotion-skills-for-claude-code)
- [autoae: skills de motion graphics comparadas](https://autoae.online/blog/claude-motion-graphics-skills)
- [colaos: skill HyperFrames](https://colaos.ai/skills/hyperframes/)
- [claudeskills.info: melhores skills de vídeo](https://claudeskills.info/best/video-skills/)
- [skills.cat: Surojit16/video-editing-skill](https://skills.cat/skills/surojit16/video-editing-skill)
- [GitHub: 6missedcalls/video-editing-skill](https://github.blesdmm.dns-dynamic.net/6missedcalls/video-editing-skill)
- [Skillselion: agricidaniel/claude-video](https://skillselion.com/skills/agricidaniel/claude-video)
- [Skillselion: browser-use/video-use](https://skillselion.com/skills/browser-use/video-use)
- [fal: melhores APIs de texto para vídeo 2026](https://fal.ai/learn/tools/best-text-to-video-apis-2026)
- [Atlas Cloud: APIs de vídeo comparadas por custo por segundo](https://www.atlascloud.ai/blog/case-studies/Top-5-ai-video-apis-compared-speed-latency-and-cost-per-second-2026)
- [Apiframe: preços de APIs de vídeo 2026](https://apiframe.ai/blog/ai-video-api-pricing-2026)
- [OpusClip: melhores editores de vídeo com IA](https://www.opus.pro/blog/best-ai-video-editors)
- [Choppity: alternativas ao OpusClip](https://www.choppity.com/blog/best-opus-clip-alternatives/)
- [Toolradar: Submagic vs OpusClip](https://toolradar.com/compare/submagic-vs-opusclip)
