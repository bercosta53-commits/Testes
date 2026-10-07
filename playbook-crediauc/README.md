# Playbook de recuperação de crédito com IA · Ubots × Sicoob Crediauc

Deck 16:9 de 8 slides (1920×1080) em um único HTML, com PDF e PNGs exportados. Segue o brief em [`refs/BRIEF-playbook-crediauc.md`](refs/BRIEF-playbook-crediauc.md) (cenário híbrido A + B).

| Arquivo | O que é |
|---|---|
| [`src/index.html`](src/index.html) | O deck. HTML, CSS, JS, fontes e logo inline. Abre offline. |
| [`out/playbook-crediauc.pdf`](out/playbook-crediauc.pdf) | 8 páginas de 1920×1080 (1440×810 pt). |
| [`out/slides/`](out/slides) | `slide-01.png` … `slide-08.png`. |
| [`scripts/check.mjs`](scripts/check.mjs) | Verificação da seção 8 do brief + exportação de PNG e PDF. |
| [`scripts/embed-fonts.mjs`](scripts/embed-fonts.mjs) | Embute Poppins, Inter e JetBrains Mono (`@fontsource`) em base64 no HTML. |
| [`refs/`](refs) | Brief, PDF original, revisão editorial, print do site e logos recebidos. |

## Apresentar

Abra `src/index.html` no navegador.

- **→ / espaço / clique**: avança. **← / shift+espaço / clique no quarto esquerdo da tela**: volta. **Home / End**: primeiro e último slide.
- **N**: mostra as notas do apresentador.
- `#5` no fim do endereço abre direto no slide 5.
- **Imprimir → Salvar como PDF**: sai um slide por página, sem escala e sem a navegação.

## Rodar a verificação

```sh
npm install          # Playwright 1.56.1 + fontes; em outra máquina: npx playwright install chromium
npm run fonts        # só se as fontes mudarem: reembute as faces no HTML
npm run check        # verifica, salva os PNGs e o PDF; sai com erro se algo falhar
```

O `check` abre o deck com a rede bloqueada e testa cada slide:

- overflow do slide;
- texto vazando de cartões ou invadindo caixas alheias, e textos sobrepostos;
- texto corrido acima de 60 palavras;
- fonte abaixo de 18 px;
- números fora da lista da seção 6;
- contraste WCAG (4,5:1, ou 3:1 em texto grande);
- texto fora das margens de 112/88 px;
- pesos de fonte sem face embutida.

Depois confere as 8 páginas do PDF com `pdfinfo`.

**Texto corrido**, para o limite de 60 palavras, são os parágrafos, leads, faixas, perguntas, notas e avisos. Títulos, rótulos mono, números com legenda, rodapé e a microcopy dos componentes ficam fora da conta. Microcopy de componente inclui campos, checklists, passos das raias, nós do fluxograma e da cadeia, card de entrega e rótulos de diagrama. É a única leitura em que o copy final da seção 5 cabe no orçamento, como o brief afirma. O relatório mostra também o total de palavras visíveis por slide.

## Decisões que desviam do brief

- **Contraste.** O dourado `--gold-deep` dá 2,1:1 sobre creme, e o mínimo do próprio brief para texto grande é 3:1. Por isso, a palavra-chave dos títulos em fundo claro usa `--gold-titulo: #B78400` (3,1:1). Já a dica dos campos e o rodapé usam `--taupe-dica: #806A5D` (4,7:1), porque `--taupe-soft` dá 3,4:1. Os tokens originais seguem nos grafismos. `--human-on-dark` foi validado: 10,3:1 sobre `--ink`.
- **Logo Ubots.** Vetorização do PNG recebido (`refs/logo-ubots.png`), com 0,13% de pixels divergentes. A tinta troca de cor por variável: escura em fundo claro e creme em fundo escuro. Fica no lugar do "SVG aproximado" até chegar o SVG oficial.
- **Tipografia do copy.** O copy é o da seção 5. Só a forma muda em quatro pontos:
  - as dicas dos campos começam com maiúscula;
  - as perguntas do slide 6 ganharam "?";
  - os pares "rótulo — descrição" viraram rótulo mono + texto;
  - "· slide 3" virou etiqueta mono à direita.
- **Não renderizado** (aguarda aprovação do Bernardo): o callout âmbar do slide 5 e o segundo bloco do slide 8 com a calculadora.

## TODO-ASSET (marcados no código)

- Logo Ubots oficial em SVG, versões clara e escura. Hoje o deck usa a vetorização do PNG.
- Logo Sicoob Crediauc e autorização de uso. O arquivo está em `refs/logo-sicoob-crediauc.png`, mas o deck mostra só o nome em texto.
- URL do botão "Falar com um especialista". Hoje é `href="#"`.
- Path oficial da estrela do v1.0 (`ubots-estudos-layout.html` não veio). Hoje é um asterisco de 4 pontas provisório.
- Brand book. O deck usa só a estrela como grafismo.

A foto da agência (`refs/foto-sicoob-crediauc.png`) não entra no deck: o cenário não usa fotos.
