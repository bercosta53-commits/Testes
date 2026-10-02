# Série de Vídeos Ubots — Recuperação de Crédito

Apresentação executiva em 6 slides (16:9), com a identidade visual do site da Ubots: fundo creme, amarelo `#FFDD1E`, preto quente, títulos em Poppins com destaque em degradê, cards brancos arredondados e faixa escura.

**PDF:** [`Apresentacao-Serie-Videos-Ubots.pdf`](Apresentacao-Serie-Videos-Ubots.pdf)

| Slide | Conteúdo |
|---|---|
| 01 | Capa |
| 02 | Overview da produção (proposta, formato e direção) |
| 03 | Conteúdo da série (6 filmes por etapa do funil) |
| 04 | Linguagem e execução |
| 05 | O que será entregue (entregáveis e linha editorial) |
| 06 | Investimento |

## Como editar e gerar de novo

O conteúdo está todo em `apresentacao.html`. Para gerar o PDF, `render.mjs` imprime a página no Chromium headless (Playwright):

```sh
node render.mjs          # -> Apresentacao-Serie-Videos-Ubots.pdf
node render.mjs --png    # também salva previews/slide-0N.png
```

O logo é uma recriação em SVG feita a partir do site. Se tiver o arquivo oficial, troque o `<svg class="mark">` de cada slide.

Fontes: Poppins e Nunito (SIL Open Font License). Ícones: Lucide (ISC).
