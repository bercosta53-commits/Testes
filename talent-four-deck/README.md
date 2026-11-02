# Talent Four × Velora · Do relacionamento ao sistema

Apresentação da estratégia e da proposta da Velora para a Talent Four Consulting: 36 slides em HTML (1920×1080), com navegação por teclado e exportação em PDF.

![Visão geral dos 36 slides](preview.jpg)

- **Apresentar:** abra `index.html` no Chrome, Edge ou Safari. A pasta inteira precisa ir junto, porque as fontes e as fotos são arquivos locais. Funciona sem internet.
- **PDF pronto:** [`talent-four-velora.pdf`](talent-four-velora.pdf) (36 páginas, 2,5 MB).

## Navegação

| Tecla | Ação |
|---|---|
| `→` `↓` `espaço` `PageDown` | Próximo slide |
| `←` `↑` `PageUp` | Slide anterior |
| `Home` / `End` | Primeiro / último |
| número + `Enter` | Vai direto ao slide (ex.: `24` `Enter`) |
| `G` | Visão geral; clique num slide para abri-lo |
| `F` | Tela cheia |

Também dá para clicar (metade direita avança, metade esquerda volta), deslizar no celular ou abrir direto num slide com `index.html#15`.

## Exportar

- **Pelo navegador:** Ctrl/Cmd + P → "Salvar como PDF". As margens já vêm zeradas e cada slide ocupa uma página.
- **Pelo script:** gera um PNG por slide e o PDF.

```sh
npm i -D playwright && npx playwright install chromium   # uma vez
node render.mjs            # → render/slide-NN.png e talent-four-velora.pdf
```

## Roteiro

| # | Bloco | Layout |
|---|---|---|
| 1–2 | Capa e roteiro | Foto P&B fundida ao Ink; lista numerada |
| 3–6 | A Velora | Tese em escala de cartaz · circuito de 5 etapas com retorno · 4 princípios · dados com o número grande |
| 7–10 | O que entendemos | Números da operação · trilha de venda com chaves · curva de faturamento · tabela "ouvimos × causa" |
| 11–13 | Os três desafios | Três palavras · hoje × com o sistema · frase-ponte com foto |
| 14 | Estrutura em 6 meses | Gantt com as três fases e o horizonte de 12 a 18 meses |
| 15–17 | Fase 1 · Diagnóstico | Abertura da fase · quatro lentes convergindo · plano em três horizontes |
| 18–24 | Fase 2 · Setup | Abertura · comitê de compra (radar) · 500 contas em matriz · três frentes · capturar × provocar · processo por tier · régua de RevOps em escada |
| 25–31 | Fase 3 · Execução | Abertura · ritmo mês a mês · site hoje × nova LP · squad de mídia · projeção de referência · RHOI · tabela de custos a preencher |
| 32–36 | Fechamento | Time · investimento · conta de referência · próximos passos · contatos |

## Decisões de design

A linguagem visual vem do HTML do novo site da Velora.

- **Tokens:** Ink `#0B0B0C`, Raise `#141416`, Acid `#CCFF00`, Bone `#F7F1ED` e Paper `#FFFFFF`. O texto secundário fica em 64%.
- **Fontes:** Space Grotesk 700 nos títulos, Manrope no texto e JetBrains Mono em rótulos, eyebrows e numeração. Os arquivos estão em `fonts/` (todas SIL Open Font License).
- **Fio condutor:** uma linha vertical fina à esquerda de todos os slides, com os rótulos de seção pendurados nela, como no site.
- **Ácido:** só no ponto que importa em cada slide. No fundo claro, o ácido nunca vira texto; aparece só como marca-texto atrás de texto Ink.
- **Sem caixas:** a estrutura é feita com fios, espaço e nós quadrados. Não há sombras, gradientes decorativos nem cards repetidos.
- **Tabelas:** cabeçalho em mono, fios horizontais finos, números tabulares e nenhuma zebra.
- **Fases:** cada fase abre com um slide próprio (numeral gigante, foto e trilho dos 6 meses). Os slides internos levam no topo o marcador `01 Diagnóstico · 02 Setup · 03 Execução`, com a fase atual sublinhada.
- **Ritmo:** fundos escuros e claros se alternam, como nas seções do site. As fotos P&B do site aparecem só na capa, na frase-ponte e nas aberturas de fase.

## A validar antes de apresentar

Pendências do briefing:

- Mensalidade agora que inclui o squad de mídia (slide 33).
- Verba de mídia e ferramentas (slide 33, campo em branco).
- Nome dos tiers: A1/B2/B3 ou A1/B2/C3 (slides 20 e 23).
- Pedir ao Marcelo: valor faturado e margem por consultor, proporção PJ × CLT e peso das 5 maiores contas.
- Data do kick-off (slide 35).

Conteúdo que eu propus e que precisa do seu aval:

- **Princípios 01 a 03** (slide 5). Só o "o ativo fica com o cliente" veio do briefing.
- **Slide 9:** li o "−15% em 2025 e +10% em 2026" como faturamento total, o que dá um índice de 93,5 contra 2024 (−6,5%). Se o número se referir a outra coisa, o slide precisa mudar.
- **Slide 34:** usa a nossa estimativa de faturamento (~R$ 86 mi) e de margem bruta (12–16%) para chegar a "4 a 5 consultores-ano pagam o investimento fixo". Avalie se quer mostrar essa estimativa ao cliente.
- **Detalhes operacionais propostos:** critérios de ICP (20), mensagens e ofertas por papel do comitê (19), cadências e responsáveis por tier (23), donos de cada etapa do RevOps (24), rito semanal de aprovação com o Marcelo (17, 28), papel da agência atual (32) e exemplos do plano de ação (17).
- **Contatos do slide 36:** vieram da apresentação Velora anterior, no Drive.
