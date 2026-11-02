# Velora × Talent Four · Desenvolvimento de sistema de aquisição

Apresentação da proposta da Velora para a Talent Four Consulting: 42 slides em HTML (1920×1080), com navegação por teclado e exportação em PDF. A copy segue o documento de correção editorial e as correções v7 de novembro de 2026.

![Visão geral dos 42 slides](preview.jpg)

- **Apresentar:** abra `index.html` no Chrome, Edge ou Safari. A pasta inteira precisa ir junto, porque as fontes e as fotos são arquivos locais. Funciona sem internet.
- **PDF pronto:** [`talent-four-velora.pdf`](talent-four-velora.pdf) (42 páginas, 3,7 MB).

## Navegação

| Tecla | Ação |
|---|---|
| `→` `↓` `espaço` `PageDown` | Próximo slide |
| `←` `↑` `PageUp` | Slide anterior |
| `Home` / `End` | Primeiro / último |
| número + `Enter` | Vai direto ao slide (ex.: `16` `Enter`) |
| `G` | Visão geral; clique num slide para abri-lo |
| `F` | Tela cheia |

Também dá para clicar (metade direita avança, metade esquerda volta), deslizar no celular ou abrir direto num slide com `index.html#16`.

## Exportar

- **Pelo navegador:** Ctrl/Cmd + P → "Salvar como PDF". As margens já vêm zeradas e cada slide ocupa uma página.
- **Pelo script:** gera um PNG por slide e o PDF.

```sh
npm i -D playwright && npx playwright install chromium   # uma vez
node render.mjs            # → render/slide-NN.png e talent-four-velora.pdf
```

## Estrutura

| Slides | Parte | Conteúdo |
|---|---|---|
| 1–2 | Abertura | Capa e roteiro |
| 3–7 | **01 · A Velora** | Abertura · como contribuímos · contexto de mercado · cinco etapas · princípios |
| 8–12 | **02 · A Talent Four** | Abertura com os números da Talent · o que ouvimos · como cresceu · três oportunidades · transição |
| 13–34 | **03 · A proposta** | Abertura · visão do projeto · as três fases abaixo · time e colaboração (34) |
| 15–18 | Fase 1 · Diagnóstico | Abertura · quatro lentes · respostas que o diagnóstico entrega · passagem do plano de ação para o setup |
| 19–27 | Fase 2 · Preparação e implementação | Abertura · preparação do mercado · ~500 contas · frentes · radar de sinais · geração de demanda · prospecção · abordagem por tier · indicadores |
| 28–33 | Fase 3 · Operação e ajustes | Abertura · página de conversão · mídia e conteúdo · projeção de referência · RHOI · o que fica com a Talent |
| 35–41 | **04 · Investimento e projeções** | Abertura · investimento · condições comerciais · custo por etapa · retorno (ponto de equilíbrio) · três cenários · próximos passos |
| 42 | Encerramento | Contatos |

## Fundos, capítulos e limão

- **Fundo claro (Bone) como padrão** nos slides de conteúdo.
- **Fundo preto (Ink) marca os capítulos:** capa, as quatro aberturas de parte, as três aberturas de fase e o encerramento.
- **Quatro momentos-chave em preto:** contexto de mercado (5), três oportunidades (11), radar de sinais (23) e retorno projetado (39).
- **Aberturas de parte:** numeral gigante e índice das quatro partes, com a atual marcada por um fio limão.
- **Aberturas de fase:** numeral em marca-texto limão, foto P&B, duração e trilho dos seis meses.
- **Em todo slide:** o rodapé mostra as quatro partes, com a atual destacada. Dentro da proposta, o topo mostra `01 Diagnóstico · 02 Preparação · 03 Operação`, com a fase atual sublinhada.
- **Limão:** só em destaques de tamanho real, nunca em quadradinhos ou nós de diagrama e nunca como cor de texto no fundo claro. Aparece na etiqueta e no "×" da capa, nos numerais das fases, nos fios dos marcadores atuais, na linha do cenário conservador e como marca-texto nos pontos-chave.

## Linguagem visual (do site da Velora)

- **Tokens:** Ink `#0B0B0C`, Raise `#141416`, Acid `#CCFF00`, Bone `#F7F1ED` e Paper `#FFFFFF`. O texto secundário fica em 64%.
- **Fontes:** Space Grotesk 700, Manrope e JetBrains Mono, em `fonts/` (SIL Open Font License).
- **Escala:** títulos de 64 px, subtítulos de 34 px, texto de 24 px e rótulos mono de 15 a 17 px. Nenhum texto de leitura fica abaixo de 20 px.
- **Estrutura:** uma linha vertical fina à esquerda, com os rótulos pendurados nela; nós quadrados; fios em vez de caixas; tabelas com cabeçalho em mono e números tabulares.
- **Campos a preencher** aparecem em mono, com sublinhado tracejado: `[Nome]`, `[X]%`, `[N]`.

## Investimento, condições, custo por etapa e retorno

Premissas usadas nos slides 31 e 36 a 40:

| Item | Valor |
|---|---|
| Diagnóstico (mês 1) | R$ 15 mil |
| Preparação e implementação (mês 2) | R$ 18 mil |
| Operação e ajustes (meses 3 a 6) | R$ 21 mil/mês → R$ 84 mil |
| **Honorários Velora** | **R$ 117 mil** |
| Verba de mídia (meses 3 a 6, Google e LinkedIn, paga às plataformas) | ~R$ 10 mil/mês → R$ 40 mil |
| Ferramentas e conectores de IA (6 meses, usados desde o diagnóstico para mapear o mercado) | R$ 2 mil/mês → R$ 12 mil |
| **Investimento do período** | **R$ 169 mil** |
| Parcela por resultado | R$ 15 mil por conta nova (R$ 7,5 mil na 1ª alocação + R$ 7,5 mil com 3 posições ativas) |
| **Investimento total no cenário base** | **R$ 229 mil** |

Condições comerciais (slide 37): pagamento mensal com vencimento em 15 dias; ponto de decisão na semana 4, com as fases 2 e 3 confirmadas após o diagnóstico e preço travado; aviso prévio de 30 dias a partir do mês 3; mídia e ferramentas pagas pela Talent; proposta válida por 30 dias. Uma conta é nova quando está na lista das ~500 validada pelas duas partes, sem faturamento nos últimos 24 meses, sem negociação ativa no CRM no início (lista de exclusão anexa) e com a primeira alocação em até 12 meses após o fim do projeto.

Custo de referência = investimento do período (R$ 169 mil) ÷ volume da etapa no cenário:

| Etapa | Volume | Custo | Com a parcela | Meses de margem para pagar |
|---|---|---|---|---|
| Reunião | ~60 a 65 | R$ 2,6 a 2,8 mil | — | — |
| Homologação | 6 a 8 | R$ 21 a 28 mil | — | — |
| Contrato | 4 | R$ 42 mil | R$ 57 mil | — |
| Posição alocada | 24 | R$ 7 mil | R$ 9,5 mil | ~2,5 (~3,4 com a parcela) |

Ponto de equilíbrio (slide 39): R$ 20 mil × 14% = R$ 2,8 mil de margem por posição por mês, ou R$ 33,6 mil por ano. R$ 169 mil ÷ R$ 33,6 mil ≈ **5 posições × 12 meses**; com a parcela de 4 contas (R$ 229 mil), cerca de 7.

Cenários com rampa (slide 40). O ano 1 começa na primeira alocação; churn de 8% ao ano aplicado a partir do ano 2; sem expansão além das posições indicadas:

| | Conservador | **Base** | Otimista |
|---|---|---|---|
| Contas novas | 2 | **4** | 6 |
| Posições médias por conta (ano 1 → 2 → 3 a 5) | 1,5 → 2,5 → 3 | **2,5 → 5 → 6** | 3 → 6 → 7 |
| Receita no ano 1 | R$ 0,72 mi | **R$ 2,40 mi** | R$ 4,32 mi |
| Receita em 5 anos | R$ 5,2 mi | **R$ 20,3 mi** | R$ 35,9 mi |
| Margem bruta em 5 anos (14%) | R$ 0,73 mi | **R$ 2,84 mi** | R$ 5,02 mi |
| Investimento total | R$ 199 mil | **R$ 229 mil** | R$ 259 mil |
| Margem ÷ investimento | ~3,7x | **~12x** | ~19x |

Receita anual do cenário base (R$ mi): 2,40 · 4,42 · 4,88 · 4,49 · 4,13. Conservador: 0,72 · 1,10 · 1,22 · 1,12 · 1,03. No base, são ~R$ 5,1 mi por conta em 5 anos.

## Fotos

| Slide | Foto | Por quê |
|---|---|---|
| 1 · Capa | `reuniao.jpg` | Reunião de trabalho vista através do vidro |
| 12 · Transição | `porta.jpg` | Abrir a porta: "novas formas de abrir contas" |
| 15 · Fase 1 | `mesa.jpg` | Análise conjunta, sobre a mesa |
| 19 · Fase 2 | `apresentacao.jpg` | Definir junto com o time |
| 28 · Fase 3 | `movimento.jpg` | Operação, em movimento |
| 41 · Próximos passos | `chegada.jpg` | Início do trabalho |
| 42 · Encerramento | `elevador.jpg` | Parceria que sobe junto |

## A validar antes de apresentar

Campos com dado da Talent (aparecem no slide como campo a preencher):

- **Slide 9:** `[X]%` da receita em `[N]` contas; `[N]` contas novas por ano.
- **Slides 20 e 34:** nome da pessoa de produto e comercial (`[Nome]`).
- **Slides 39 e 40:** margem bruta real da Talent no lugar dos 14% (confirmar com o CEO).

Decisões nossas, preenchidas com os valores sugeridos nas correções:

- **Slide 37:** pagamento mensal em 15 dias, validade de 30 dias, aviso prévio de 30 dias a partir do mês 3, 24 meses sem faturamento e 12 meses de cauda para a parcela.
- **Slide 31:** prazos de oportunidades (até o mês 6), homologações (meses 5 a 9) e primeiras alocações (meses 6 a 12), a validar com o ciclo de compras da Talent.
- **Slide 41:** início do diagnóstico proposto para segunda-feira, 16/11.
- **Ferramentas:** mantidas desde o mês 1 (R$ 169 mil), justificadas pelo uso no diagnóstico. Se passarem a começar no mês 2, o período cai para R$ 167 mil e os slides 36, 38, 39 e 40 precisam ser recalculados.

Do documento de correção editorial:

- **Slide 5:** conferir fonte, universo e formulação exata das três estatísticas.
- **Slide 27:** definir "reunião qualificada", "oportunidade", "homologação" e "conta estratégica".
- **Slide 31:** definir atribuição e deduplicação entre frentes.
- **Slides 24, 30 e 34:** confirmar a divisão de trabalho entre o squad da Velora, a agência atual e o time da Talent.
- **Slide 34:** confirmar o papel de Leonardo Wartha (advisor ou sócio).
