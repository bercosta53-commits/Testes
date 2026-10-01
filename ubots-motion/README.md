# Motion Ubots | Case Transpocred (v3)

Motion de 20 s para estimular o download do e-book "Um case de originação via WhatsApp que vale R$ 103 milhões".
A v3 refaz a peça numa linha mais limpa e "Apple": muito respiro, tipografia revelada por máscara e foco, números em odômetro, um único objeto 3D (o balão da Ubots em ouro) e movimentos com curvas de bezier suaves. Não há explosões, tremor nem clarões.

## Entregáveis (`out/`)

| Arquivo | Formato | Uso |
|---|---|---|
| `ubots_case_transpocred_v3_4x5.mp4` | 1080×1350 | Feed Meta / LinkedIn (principal) |
| `ubots_case_transpocred_v3_9x16.mp4` | 1080×1920 | Stories / Reels (conteúdo dentro da área segura) |
| `ubots_case_transpocred_v3_1x1.mp4` | 1080×1080 | Feed quadrado |
| `capa_<fmt>_final.png` / `capa_<fmt>_abertura.png` | idem | Capas / thumbnails |

H.264 High, yuv420p, BT.709, 30 fps, AAC 256 kbps 48 kHz, faststart. Áudio em −14 LUFS integrado com pico ≤ −1 dBTP.

## Roteiro (1 compasso da trilha = 2 s; cada cena dura 2 compassos)

| Tempo | Cena | Som |
|---|---|---|
| 0–4 s | O balão acende do escuro; "Quanto crédito cabe numa conversa de **WhatsApp**?" | Intro: arpejo com filtro abrindo, pad, sopro de ar |
| 4–8 s | "**32** dias" em odômetro; o balão vira luz ao fundo | Groove entra: kick, clap, baixo com sidechain |
| 8–12 s | O balão vira hub; linhas conectam Base, Oferta, Unidades e Automação | Entra o hook melódico; sinos de vidro a cada conexão |
| 12–16 s | "R$ **103** milhões" em odômetro + gráfico de crescimento | Auge: stabs, chimbal aberto; break em 15,5 s |
| 16–20 s | Revelação para o branco a partir do balão; logos, headline, CTA | Resolve em C; pop do CTA, brilho em 18,4 s |

## Como gerar

```bash
npm i                                        # three@0.160.0
pip install playwright==1.56.0 numpy scipy pyloudnorm
./build.sh                                   # eventos -> áudio -> 3×600 quadros -> MP4 + capas
# Só um formato:   FORMATS=4x5 ./build.sh
# Só re-mux:       SKIP_RENDER=1 ./build.sh
# Conferência:     GL=swiftshader python3 render3.py preview 3,6.5,10.8,14.8,18.8 4x5
```

Em CPU (swiftshader), cada formato leva cerca de 15 a 25 min; os três rodam em paralelo.

## Arquivos

- `index3.html`: cena (Three.js para o balão e DOM/SVG para tipografia, odômetros, conexões e gráfico). Tudo é função pura de `t`; layouts por formato estão em `FMT`.
- `render3.py`: renderizador Playwright (`events`, `preview`, `full`) com formato via `?f=`.
- `audio3.py`: trilha sintetizada (120 BPM; Fmaj7–G–Em7–Am → C) + SFX sincronizados por `events3.json` + master com limitador true-peak.
- `index2.html`, `render.py`, `audio2.py`: versão v2 (histórico).

## Pendências antes de publicar

- **`assets/ubots.png` é PROVISÓRIO** (wordmark gerado em Poppins Bold). Troque pelo logo oficial.
- **Logo da Transpocred**: hoje é texto. Para usar o oficial, troque `#tp` em `#end` por `<img src="assets/transpocred.svg">` com a mesma altura do logo da Ubots.
- Validar com o cliente: "R$ 103 milhões em crédito originado", "32 dias" e "Baixe o case completo". O gráfico é ilustrativo e não tem eixos nem valores.
- Depois de trocar os logos, basta rodar `./build.sh` de novo.
