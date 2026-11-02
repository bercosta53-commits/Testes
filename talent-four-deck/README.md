# Velora × Talent Four · Desenvolvimento de sistema de aquisição

Apresentação da proposta da Velora para a Talent Four Consulting: 40 slides em HTML (1920×1080), com navegação por teclado e exportação em PDF. A copy segue o documento de correção editorial de novembro de 2026.

![Visão geral dos 40 slides](preview.jpg)

- **Apresentar:** abra `index.html` no Chrome, Edge ou Safari. A pasta inteira precisa ir junto, porque as fontes e as fotos são arquivos locais. Funciona sem internet.
- **PDF pronto:** [`talent-four-velora.pdf`](talent-four-velora.pdf) (40 páginas, 3,7 MB).

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
| 3–7 | **01 · A Velora** | Como contribuímos · contexto de mercado · cinco etapas · princípios |
| 8–13 | **02 · A Talent Four** | O que foi construído · como cresceu · o que entendemos · três oportunidades · transição |
| 14–33 | **03 · A proposta** | Visão do projeto e as três fases abaixo |
| 16–17 | Fase 1 · Diagnóstico | Quatro lentes e plano priorizado |
| 18–26 | Fase 2 · Preparação e implementação | Preparação do mercado · ~500 contas · frentes · radar de sinais · geração de demanda · prospecção · abordagem por grupo · indicadores |
| 27–33 | Fase 3 · Operação e ajustes | Operação mês a mês · página de conversão · mídia e conteúdo · projeção de referência · RHOI · o que fica com a Talent |
| 34–39 | **04 · Time e investimento** | Time · investimento · custo por etapa · retorno projetado · próximos passos |
| 40 | Encerramento | Contatos |

## Fundos e mudanças de capítulo

- **Fundo claro (Bone) como padrão:** os slides de conteúdo ficam no claro.
- **Fundo preto (Ink) marca os capítulos:** a capa, as quatro aberturas de parte, as três aberturas de fase e o encerramento.
- **Quatro momentos-chave em preto:** dados de mercado (5), três oportunidades (12), radar de sinais (22) e retorno projetado (38). Nenhum fica ao lado de uma abertura, para o preto continuar lendo como sinal de capítulo.
- **Aberturas de parte:** numeral gigante, nome da parte, o que vem nela e um índice das quatro partes com a atual destacada.
- **Aberturas de fase:** numeral em marca-texto ácido, foto P&B, duração e trilho dos seis meses com os meses da fase marcados.
- **Em todo slide:** o rodapé mostra as quatro partes com a atual destacada. Dentro da proposta, o topo mostra `01 Diagnóstico · 02 Preparação · 03 Operação` com a fase atual sublinhada, e o rótulo de cada slide começa com "Fase N".

## Investimento, custo por etapa e retorno

Premissas usadas nos slides 31, 36, 37 e 38:

| Item | Valor |
|---|---|
| Diagnóstico (mês 1) | R$ 15 mil |
| Preparação e implementação (mês 2) | R$ 18 mil |
| Operação e ajustes (meses 3 a 6) | R$ 21 mil/mês → R$ 84 mil |
| **Honorários Velora** | **R$ 117 mil** |
| Verba de mídia (meses 3 a 6, paga às plataformas) | ~R$ 10 mil/mês → R$ 40 mil |
| **Investimento do período** | **R$ 157 mil** |
| Parcela por resultado (mantida da proposta anterior) | R$ 15 mil por conta nova → R$ 60 mil com 4 contas |
| **Investimento total no cenário** | **R$ 217 mil** |

Custo de referência = investimento do período (R$ 157 mil) ÷ volume da etapa no cenário:

| Etapa | Volume | Custo | Com a parcela por resultado |
|---|---|---|---|
| Reunião | ~60 a 65 | R$ 2,4 a 2,6 mil | — |
| Homologação | 6 a 8 | R$ 20 a 26 mil | — |
| Contrato | 4 | R$ 39 mil | R$ 54 mil |
| Posição alocada | 24 (4 × 6) | R$ 6,5 mil | R$ 9 mil |

Retorno (LTV de 5 anos, churn de 8% ao ano aplicado à receita a partir do ano 2):

| | Ano 1 | Ano 2 | Ano 3 | Ano 4 | Ano 5 | Total |
|---|---|---|---|---|---|---|
| Receita das 4 contas (R$ mi) | 5,76 | 5,30 | 4,88 | 4,49 | 4,13 | **24,5** |

- 4 contas × 6 posições × R$ 20 mil/mês = R$ 480 mil/mês, ou R$ 5,76 mi no primeiro ano. São R$ 6,1 mi por conta em 5 anos.
- Margem bruta de referência de 14% (faixa de 12% a 16%, estimativa do briefing): R$ 3,4 mi em 5 anos (R$ 2,9 a 3,9 mi).
- Margem ÷ investimento total de R$ 217 mil: ~16x (14x a 18x).
- Payback: 3 a 4 meses de margem das 4 contas ativas (R$ 67 mil/mês a 14%).

## Fotos

| Slide | Foto | Por quê |
|---|---|---|
| Capa | `atrio.jpg` | Estrutura e pessoa: "sistema de aquisição" |
| 13 · Transição | `porta.jpg` | Abrir a porta: "novas formas de abrir contas" |
| 16 · Fase 1 | `mesa.jpg` | Análise conjunta, sobre a mesa |
| 18 · Fase 2 | `apresentacao.jpg` | Definir junto com o time |
| 27 · Fase 3 | `movimento.jpg` | Operação, em movimento |
| 39 · Próximos passos | `chegada.jpg` | Início do trabalho |
| 40 · Encerramento | `elevador.jpg` | Parceria que sobe junto |

Ficaram de fora: o corredor com quatro pessoas e a xícara de café, que são horizontais e não cabem nos painéis verticais; a rua com aceno; e as fotos antigas do site (concreto, sofá, laptop e retrato). Elas continuam disponíveis se algum slide precisar.

## Linguagem visual (do site da Velora)

- **Tokens:** Ink `#0B0B0C`, Raise `#141416`, Acid `#CCFF00`, Bone `#F7F1ED` e Paper `#FFFFFF`. O texto secundário fica em 64%.
- **Fontes:** Space Grotesk 700, Manrope e JetBrains Mono, em `fonts/` (SIL Open Font License).
- **Estrutura:** uma linha vertical fina à esquerda, com os rótulos pendurados nela; nós quadrados; fios em vez de caixas; tabelas com cabeçalho em mono e números tabulares.
- **Ácido:** no máximo um ponto por slide. No fundo claro, só como marca-texto atrás de texto Ink; linhas e nós de destaque passam a Ink.

## A validar antes de apresentar

Do documento de correção (seção 3):

- **Slide 7:** conferir fonte, universo e formulação exata das três estatísticas.
- **Slide 9:** validar com a Talent os dados de carteira e equipe, e a autorização para citar clientes.
- **Slide 26:** definir "reunião qualificada", "oportunidade", "homologação" e "conta estratégica". Os prazos aparecem como referência a combinar.
- **Slide 31:** o total foi padronizado em ~60 a 65 reuniões (40 + 10 a 15 + 10). Falta definir atribuição e deduplicação entre frentes. O cenário agora considera 4 contas novas.
- **Slides 23, 30 e 35:** confirmar a divisão de trabalho entre o squad da Velora, a agência atual e o time da Talent.
- **Slide 35:** confirmar o papel de Leonardo Wartha (advisor ou sócio).
- **Slide 36:** formalizar em contrato o que conta como conta nova e como primeira alocação para o bônus.
- **Slide 39:** data de início.

Interpretações dos novos valores, a confirmar:

- R$ 15 mil, R$ 18 mil e R$ 21 mil são honorários mensais de cada fase; a operação tem 4 meses.
- A verba de mídia (~R$ 10 mil/mês) roda só nos 4 meses de operação.
- "R$ 20 mil por posição" é o faturamento mensal da Talent por consultor alocado.
- As 6 posições por conta valem desde o primeiro ano, sem rampa de entrada.
- A parcela por resultado (R$ 15 mil por conta) continua na proposta e entra no investimento total do retorno.
- A margem bruta de 14% é a estimativa do briefing. O slide 38 mostra a margem da Talent; avalie se quer exibi-la ao cliente.
- **Slides 20 e 25:** os tiers seguem A1/B2/B3. O documento sugere A/B/C como alternativa.

Escolhas de layout que não vêm do documento:

- Capa "Velora × Talent Four · Desenvolvimento de sistema de aquisição", conforme pedido (o documento sugeria evitar "sistema").
- Contexto de mercado passou para logo depois de "Como contribuímos" (o porquê antes do como).

- Roteiro (slide 2), as sete aberturas e o encerramento com contatos.
- Rótulos e subtítulos das aberturas.
- Slide 21: o destino "Novas oportunidades" (conversa qualificada, homologação, primeira alocação) como desenho de apoio.
- Slide 28: o acumulado de contatos mês a mês (500 / 1.000 / 1.500 / ~2.000).
- Slide 39: as etiquetas de prazo "A seguir" e "Antes do início".
