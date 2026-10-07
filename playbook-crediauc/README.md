# Playbook de recuperação de crédito com IA · Ubots × Sicoob Crediauc

Deck 16:9 de 8 slides (1920×1080) em um único HTML, com PDF e PNGs exportados. O conteúdo e a estrutura seguem o brief em [`refs/BRIEF-playbook-crediauc.md`](refs/BRIEF-playbook-crediauc.md). A linguagem visual segue a apresentação [`refs/referencia-serie-videos-ubots.pdf`](refs/referencia-serie-videos-ubots.pdf), a referência de marca indicada depois do brief.

| Arquivo | O que é |
|---|---|
| [`src/index.html`](src/index.html) | O deck. HTML, CSS, JS, fontes e logo inline. Abre offline. |
| [`out/playbook-crediauc.pdf`](out/playbook-crediauc.pdf) | 8 páginas de 1920×1080 (1440×810 pt). |
| [`out/slides/`](out/slides) | `slide-01.png` … `slide-08.png`. |
| [`scripts/check.mjs`](scripts/check.mjs) | Verificação da seção 8 do brief + exportação de PNG e PDF. |
| [`scripts/embed-fonts.mjs`](scripts/embed-fonts.mjs) | Embute Poppins e Nunito (`@fontsource`) em base64 no HTML. |
| [`refs/`](refs) | Brief, PDF original, revisão editorial, apresentação de referência, print do site e logos recebidos. |

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
- texto ou caixa fora da área útil (120 px nas laterais, 48 px no topo, 100 px na base);
- pesos de fonte sem face embutida.

Depois confere as 8 páginas do PDF com `pdfinfo`.

**Texto corrido**, para o limite de 60 palavras, são os parágrafos, leads, faixas, perguntas, notas e avisos. Títulos, rótulos, números com legenda, cabeçalho e a microcopy dos componentes ficam fora da conta. Microcopy de componente inclui campos, checklists, passos das raias, nós do fluxograma e da cadeia, card de entrega e rótulos de diagrama. É a única leitura em que o copy final da seção 5 cabe no orçamento, como o brief afirma. O relatório mostra também o total de palavras visíveis por slide.

## Linguagem visual (da apresentação de referência)

Medida direto do PDF de referência: fontes, tamanhos, cores, raios e posições.

- **Tipografia:** Poppins nos títulos e rótulos (título de slide Bold 64 px, tracking −0,03 em). Nunito no texto corrido.
- **Grade:** margens de 120 px. Cabeçalho fixo com logo à esquerda e contador `03 / 08` à direita. Pílula de seção acima do título; o conteúdo começa em ~350 px e termina na linha de 980 px.
- **Componentes:**
  - cards brancos com borda `#EFE8D7` e sombra quente;
  - tiles de ícone `#FFF5CC` com ícone âmbar;
  - cards escuros `#080401` com ícone em círculo e as ondas amarelas da marca;
  - campos no estilo do formulário do site: rótulo acima e caixa arredondada com a dica dentro.
- **Fundos:** creme `#FFFCF2` com brilhos quentes suaves. Os slides 2 e 8 são escuros, com brilho atrás do conteúdo principal, como o slide de investimento da referência.
- **Palavra-chave em degradê** amarelo → âmbar (`#FFD836` → `#F3B12C`), também nos números do case. O script da página troca esse texto por `<text>` SVG preenchido com o degradê. Assim o PDF sai com texto preenchido por padrão de sombreamento, igual à referência. Com `background-clip: text`, o Chromium gera um grupo de transparência que alguns leitores (poppler) desenham com um fio na borda. Sem JavaScript, vale o degradê em CSS.

## Decisões que desviam do brief

O brief veio antes da referência de marca. Onde os dois divergem, valeu a referência:

- Nunito no lugar de Inter e JetBrains Mono.
- Rótulos em Poppins com só a inicial maiúscula, no lugar de mono em caixa alta.
- Cabeçalho no topo no lugar de rodapé.
- Margens de 120 px no lugar de 112/88.
- Capa clara com painel ilustrado, no lugar de capa escura.
- Ondas, brilhos suaves e sombras como grafismos, no lugar de só a estrela.
- A ilustração da capa é vetorial e abstrata: conversa do agente, transbordo para o humano e checklist. Não há mockup de celular nem foto.

Os demais desvios:

- **Contraste da palavra-chave.** O degradê da marca dá 1,35:1 sobre creme, e o brief pede 3:1 para texto grande. Por isso, o `check` mede esse contraste e lista cada ocorrência como **aviso de exceção de marca**, sem reprovar. O degradê é a única exceção. Em todo o resto, os tons da referência foram escurecidos onde viram texto pequeno:
  - texto da pílula: `#8F6A00`, com 4,5:1 (a referência usa `#C48F00`);
  - dica dos campos: `#736C64`;
  - contorno das caixinhas de check: `#A97C00`.
  
  Se a decisão for cumprir o brief à risca, basta trocar `--grad-marca` por uma cor sólida de 3:1, como `#B78400`.
- **Logo Ubots.** Vetorização do PNG recebido (`refs/logo-ubots.png`), com 0,13% de pixels divergentes. A tinta troca de cor por variável: escura em fundo claro e branca em fundo escuro.
- **Forma do copy.** O texto é o da seção 5. Só a forma muda em quatro pontos:
  - as dicas dos campos começam com maiúscula;
  - as perguntas do slide 6 ganharam "?";
  - os pares "rótulo — descrição" viraram título + texto;
  - "· slide 3" virou etiqueta à direita.
- **Não renderizado** (aguarda aprovação do Bernardo): o callout âmbar do slide 5 e o segundo bloco do slide 8 com a calculadora.

## TODO-ASSET (marcados no código)

- Logo Ubots oficial em SVG, versões clara e escura. Hoje o deck usa a vetorização do PNG.
- Logo Sicoob Crediauc e autorização de uso. O arquivo está em `refs/logo-sicoob-crediauc.png`, mas o deck mostra só o nome em texto.
- URL do botão "Falar com um especialista". Hoje é `href="#"`.
- Path oficial da estrela do v1.0 (`ubots-estudos-layout.html` não veio). Hoje o ícone do agente usa um asterisco de 4 pontas provisório.
- Brand book. Os grafismos seguem a apresentação de referência: ondas, brilhos e o painel da capa.

A foto da agência (`refs/foto-sicoob-crediauc.png`) não entra no deck: o cenário não usa fotos.
