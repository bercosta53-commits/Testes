# Sonata Social — Ondas

Design system das redes sociais da **Sonata Aparelhos Auditivos**: cores, tipografia, grid, espaçamento, hierarquia, elementos gráficos e 11 modelos de post — organizado para ser usado por pessoas e por ferramentas de IA.

![Modelos](previews/04-educativo.png)

## Por onde começar

| Para | Abra |
|---|---|
| Entender a marca e as regras | [`MARCA.md`](MARCA.md) — o manual (essência, voz, cor, tipo, grid, hierarquia, elementos, fotografia, logo) |
| Pedir posts a uma IA | [`ia/GUIA-IA.md`](ia/GUIA-IA.md) — instrução de sistema pronta, com regras, medidas e prompt |
| Aprovar o estudo | [`apresentacao/Sonata-Social-Ondas-aprovacao-v2.pdf`](apresentacao/Sonata-Social-Ondas-aprovacao-v2.pdf) — versão 2 para aprovação, 29 páginas, gerada de `apresentacao/estudo.html` |
| Ver todos os modelos | [`modelos/index.html`](modelos/index.html) no navegador, ou as imagens em [`previews/`](previews) |
| Valores exatos | [`tokens/tokens.json`](tokens/tokens.json) (fonte única) e [`tokens/tokens.css`](tokens/tokens.css) |

## Como a IA monta um post

1. A IA lê `ia/GUIA-IA.md` e `ia/modelos.json` e devolve uma **ficha JSON** por post, validada por [`ia/ficha-post.schema.json`](ia/ficha-post.schema.json).
2. O motor [`bundle/sonata.js`](bundle/sonata.js) (`Sonata.render(ficha)`) aplica cores, tipografia, margens, grafismos e logo, e reduz o título se ele não couber.
3. `Sonata.validar(ficha)` aponta o que fere as regras (texto demais, ênfase dupla, palavra fora do vocabulário, tema errado).
4. `node scripts/render.mjs ficha.json post.png` gera o PNG em 1080 px.

```json
{
  "modelo": "frase",
  "tema": "bruma",
  "rotulo": "Redescobrindo o mundo",
  "titulo": "Os pequenos sons fazem os *grandes* momentos.",
  "apoio": "O canto do bem-te-vi, a chaleira, o “boa noite” de quem você ama."
}
```

## Estrutura

```
MARCA.md                 manual da marca para redes sociais
ia/                      guia para IA, schema da ficha, catálogo de modelos
tokens/                  tokens.json (fonte única) → tokens.css
bundle/                  motor de layout (sonata.js), estilos, tipos, fontes locais
modelos/                 galeria e página de render
exemplos/                19 fichas reais (feed, story, quadrado, carrossel)
apresentacao/            o estudo em HTML e PDF
previews/                os exemplos renderizados
assets/logos/            marinho, verde-água e branco
assets/elementos/        arcos de escuta, onda, linha de som (SVG)
assets/fotos/            fotos do site da Sonata (sócias, pacientes, aparelhos)
fonts/                   Poppins e Ms Madi (SIL Open Font License)
scripts/                 build-tokens, exportar, render, pdf
```

## Comandos

```bash
node scripts/build-tokens.mjs        # tokens.json → tokens.css
node scripts/exportar.mjs            # SVGs dos grafismos, ia/modelos.json, modelos/exemplos.js
node scripts/render.mjs              # todas as fichas de exemplos/ → previews/ (precisa do Playwright)
node scripts/render.mjs ficha.json saida.png --escala=1
node scripts/pdf.mjs                 # apresentacao/estudo.html → PDF
```

## Observações

- As fotos em `assets/fotos/` vêm do site da Sonata (sonata.med.br). Para publicar, prefira os arquivos originais em alta.
- Regra de fotografia: foto sempre sangrada, nunca recortada em círculo, caixa ou moldura; o texto pousa sempre numa máscara de cor (faixa em onda, painel lateral ou arco), e o campo `foto.rosto` mantém a pessoa na área livre.
- O logo verde-água e o branco foram gerados a partir do arquivo marinho enviado. Substitua pelos arquivos oficiais quando possível, mantendo os nomes.
- Poppins e Ms Madi são distribuídas sob a SIL Open Font License 1.1 (Google Fonts).
