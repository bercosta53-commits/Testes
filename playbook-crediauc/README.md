# Playbook de recuperação de crédito com IA · Ubots × Sicoob Crediauc

Deck 16:9 de 9 slides (1920×1080) em um único HTML, com PDF e PNGs exportados. O conteúdo e a estrutura seguem o brief em [`refs/BRIEF-playbook-crediauc.md`](refs/BRIEF-playbook-crediauc.md). A linguagem visual segue a apresentação [`refs/referencia-serie-videos-ubots.pdf`](refs/referencia-serie-videos-ubots.pdf), a referência de marca indicada depois do brief. A página 2, de introdução, entrou depois do brief: veja [Página 2 e LinkedIn Doc Ads](#página-2-e-linkedin-doc-ads).

| Arquivo | O que é |
|---|---|
| [`src/index.html`](src/index.html) | O deck. HTML, CSS, JS, fontes e logo inline. Abre offline. |
| [`out/playbook-crediauc.pdf`](out/playbook-crediauc.pdf) | 9 páginas de 1920×1080 (1440×810 pt). |
| [`out/slides/`](out/slides) | `slide-01.png` … `slide-09.png`. |
| [`scripts/check.mjs`](scripts/check.mjs) | Verificação da seção 8 do brief + exportação de PNG e PDF. |
| [`scripts/embed-fonts.mjs`](scripts/embed-fonts.mjs) | Embute Poppins e Nunito (`@fontsource`) em base64 no HTML. |
| [`refs/`](refs) | Brief, PDF original, revisão editorial, apresentação de referência, print do site e logos recebidos (Ubots e Sicoob Crediauc nas versões clara, escura e avatar). |

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

Depois confere com `pdfinfo` se o PDF tem uma página por slide.

**Texto corrido**, para o limite de 60 palavras, são os parágrafos, leads, faixas, perguntas, notas e avisos. Títulos, rótulos, números com legenda, cabeçalho e a microcopy dos componentes ficam fora da conta. Microcopy de componente inclui campos, checklists, passos das raias, nós do fluxograma e da cadeia, card de entrega, rótulos de diagrama e cards de capítulo da introdução. É a única leitura em que o copy final da seção 5 cabe no orçamento, como o brief afirma. O relatório mostra também o total de palavras visíveis por slide.

## Página 2 e LinkedIn Doc Ads

A página 2 apresenta o material antes do case. Ela também serve de prévia no LinkedIn Doc Ads, onde quem vê o anúncio lê as primeiras páginas antes de desbloquear o resto.

- **Assunto:** título e lead.
- **Formato e abordagem:** à esquerda.
- **O que você vai encontrar:** à direita, um card por capítulo (slides 3 a 8) com uma miniatura do visual de cada slide.
- **CTA:** na faixa escura, "Acesse o playbook completo". Na apresentação, o botão avança para o case. No PDF, é um link interno para a página 3.

A copy desta página é nova: não vem do PDF original nem da seção 5 do brief. Vale passar pela mesma revisão editorial do resto. Se a prévia do anúncio for limitada, inclua pelo menos as páginas 1 e 2, para o CTA aparecer antes do desbloqueio. Na largura do feed (cerca de 550 px), o título, os nomes das seções e dos capítulos e o botão continuam legíveis.

## Linguagem visual (da apresentação de referência)

Medida direto do PDF de referência: fontes, tamanhos, cores, raios e posições.

- **Tipografia:** Poppins nos títulos e rótulos (título de slide Bold 64 px, tracking −0,03 em). Nunito no texto corrido.
- **Grade:** margens de 120 px. Cabeçalho fixo com logo à esquerda e contador `03 / 08` à direita. Pílula de seção acima do título; o conteúdo começa em ~350 px e termina na linha de 980 px.
- **Componentes:**
  - cards brancos com borda `#EFE8D7` e sombra quente;
  - tiles de ícone `#FFF5CC` com ícone âmbar;
  - cards escuros `#080401` com ícone em círculo e as ondas amarelas da marca;
  - campos no estilo do formulário do site: rótulo acima e caixa arredondada com a dica dentro;
  - fluxos como trilhos (slides 6, 7 e 8): texto livre sobre o fundo, linha contínua com nós ou estações e cantos arredondados. Nada de caixas dentro de caixas, setinhas entre cards ou losango.
- **Hierarquia de cor:** o amarelo marca só o agente e a palavra-chave do título. O petróleo do logo Sicoob Crediauc (`#003641`) marca o humano, o time da cooperativa. Estrutura e texto ficam em neutros, e a faixa escura fecha o slide quando há uma conclusão (decisão no slide 8). Os traços que carregam sentido têm 3:1 sobre o creme: agente `#A97C00`, neutro `#8C8273`.
- **Assinatura dupla** em todas as páginas: logo Ubots | logo Sicoob Crediauc.
- **Tag das páginas internas** com iniciais maiúsculas, como a pílula "Recuperação de Crédito" da referência: "Playbook · Recuperação de Crédito com IA".
- **CTA final:** "Falar com um especialista" leva a https://ubots.com.br/ e abre em nova aba.
- **Capa:** a tag é "Guia Prático", para não repetir o título. O subtítulo forma duas linhas equilibradas, com a largura do título. A ilustração mostra o agente de IA conversando pelo WhatsApp:
  - símbolo de IA (conjunto de faíscas) no avatar da conversa e no selo do alto. O selo usa o degradê de IA (azul → violeta → rosa), com o mesmo peso do disco verde do WhatsApp;
  - cabeçalho "Agente de IA" com status online;
  - dois ícones do WhatsApp em verde `#25D366`.
  
  O glifo é o oficial (simple-icons 16.34.0, CC0). Como é marca da Meta, use só em verde ou branco e sem alterar a forma.
- **Ritmo:** o conteúdo começa 44 px depois do lead, ou 52 px depois do título quando não há lead. Todo slide termina na linha de 980 px.
  - Tiles de ícone têm 48 px e títulos de seção, 24 px.
  - Leads de duas linhas quebram equilibrados; dicas de campo e itens de checklist não deixam palavra sozinha na última linha.
- **Fundos:** creme `#FFFCF2` com brilhos quentes suaves. Os slides 3 e 9 são escuros, com brilho atrás do conteúdo principal, como o slide de investimento da referência.
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
- No fluxo do slide 7 não há losango nem caixas, só trilhos e estações, como nos slides 6 e 8. O trilho do agente passa pela pergunta, que é uma pílula escura com ícone de ramificação, e segue no "Não". O trilho do humano desce da pergunta no "Sim". Na revisão de layout, losango e caixinhas com setas foram apontados como visual datado.

Os demais desvios:

- **Contraste da palavra-chave.** O degradê da marca dá 1,35:1 sobre creme, e o brief pede 3:1 para texto grande. Por isso, o `check` mede esse contraste e lista cada ocorrência como **aviso de exceção de marca**, sem reprovar. O degradê é a única exceção. Em todo o resto, os tons da referência foram escurecidos onde viram texto pequeno:
  - texto da pílula: `#8F6A00`, com 4,5:1 (a referência usa `#C48F00`);
  - dica dos campos: `#736C64`;
  - contorno das caixinhas de check: `#A97C00`.
  
  Se a decisão for cumprir o brief à risca, basta trocar `--grad-marca` por uma cor sólida de 3:1, como `#B78400`.
- **Logo Ubots.** Vetorização do PNG recebido (`refs/logo-ubots.png`), com 0,13% de pixels divergentes. A tinta troca de cor por variável: escura em fundo claro e branca em fundo escuro.
- **Logo Sicoob Crediauc.** São os arquivos enviados pelo time (`refs/logo-sicoob-crediauc*.png`), embutidos como PNG e sem redesenho. Fundo claro: o PNG transparente, recortado. Fundo escuro: o mesmo PNG com "SICOOB" em branco, igual ao arquivo escuro oficial, que tem resolução menor e fundo preto opaco.
- **Forma do copy.** O texto é o da seção 5. Só a forma muda em quatro pontos:
  - as dicas dos campos começam com maiúscula;
  - as perguntas do slide 6 ganharam "?";
  - os pares "rótulo — descrição" viraram título + texto;
  - "· slide 3" virou etiqueta à direita. Com a página 2, as referências a slides subiram um número: escopo no slide 4, indicadores no slide 8.
- **Não renderizado** (aguarda aprovação do Bernardo): o callout âmbar do slide 6 (slide 5 do brief) e o segundo bloco do slide 9 (slide 8 do brief), com a calculadora.

## Ajustes da revisão de aprovação (Ubots)

Aplicados a partir do e-mail "Aprovação de materiais":

- **Capa:** pílula com o mesmo texto das outras páginas, "Playbook · Recuperação de crédito com IA".
- **Slide 3:** nota "(não incluídos no total acima)" depois de R$ 5.700,00.
- **Slide 3:** o rótulo da seta virou "Próximo passo recomendado para o Crediauc". Nem o PDF original nem a revisão editorial dizem quem fez a indicação. Se a recomendação veio do Crediauc, troque por "Próximo passo indicado pelo Crediauc".
- **Slide 5:** Preparação termina em "Fluxo de dados e forma de registro dos resultados definidos."
- **Slide 6:** as duas raias passam a ler da esquerda para a direita. O transbordo sai do passo 4 do agente e volta ao começo da faixa do humano, que agora abre com "Recebe o histórico e conduz a tratativa com contexto" e termina em "Concentra-se no fechamento e no registro dos acordos".
- **Slide 7:** a pergunta do fluxo virou "Pedido fora da política ou cooperado precisa de acolhimento?"
- **Slide 8:**
  - Interação: "Contratos com retorno registrado. Várias mensagens do mesmo contrato contam uma vez."
  - Resultado: "Soma dos acordos registrados. Documente o critério usado (valor original, atualizado ou negociado)."
- **Logo Sicoob Crediauc:** em todas as páginas.

## TODO-ASSET (marcados no código)

- Logo Ubots oficial em SVG, versões clara e escura. Hoje o deck usa a vetorização do PNG.
- Autorização de uso do logo Sicoob Crediauc. O logo já está aplicado em todas as páginas.
- Confirmar quem recomendou o próximo passo do case (slide 3): Ubots ("recomendado para o Crediauc") ou o próprio Crediauc ("indicado pelo Crediauc").
- Path oficial da estrela do v1.0 (`ubots-estudos-layout.html` não veio). Hoje o ícone do agente usa um asterisco de 4 pontas provisório.
- Brand book. Os grafismos seguem a apresentação de referência: ondas, brilhos e o painel da capa.

A foto da agência (`refs/foto-sicoob-crediauc.png`) não entra no deck: o cenário não usa fotos.
