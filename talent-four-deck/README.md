# Velora × Talent Four · Desenvolvimento de sistema de aquisição

Apresentação da proposta da Velora para a Talent Four Consulting: 39 slides em HTML (1920×1080), com navegação por teclado e exportação em PDF. A copy segue o documento de correção editorial de novembro de 2026.

![Visão geral dos 39 slides](preview.jpg)

- **Apresentar:** abra `index.html` no Chrome, Edge ou Safari. A pasta inteira precisa ir junto, porque as fontes e as fotos são arquivos locais. Funciona sem internet.
- **PDF pronto:** [`talent-four-velora.pdf`](talent-four-velora.pdf) (39 páginas, 3,6 MB).

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
| 8–11 | **02 · A Talent Four** | Abertura com os números da Talent · como cresceu · três oportunidades · transição |
| 12–33 | **03 · A proposta** | Abertura · visão do projeto · as três fases abaixo · time e colaboração (33) |
| 14–17 | Fase 1 · Diagnóstico | Abertura · quatro lentes · respostas que o diagnóstico entrega · passagem do plano de ação para o setup |
| 18–26 | Fase 2 · Preparação e implementação | Abertura · preparação do mercado · ~500 contas · frentes · radar de sinais · geração de demanda · prospecção · abordagem por grupo · indicadores |
| 27–32 | Fase 3 · Operação e ajustes | Abertura · página de conversão · mídia e conteúdo · projeção de referência · RHOI · o que fica com a Talent |
| 34–38 | **04 · Investimento e projeções** | Abertura · investimento · custo por etapa · retorno projetado · próximos passos |
| 39 | Encerramento | Contatos |

## Fundos, capítulos e limão

- **Fundo claro (Bone) como padrão** nos slides de conteúdo.
- **Fundo preto (Ink) marca os capítulos:** capa, as quatro aberturas de parte, as três aberturas de fase e o encerramento.
- **Quatro momentos-chave em preto:** contexto de mercado (5), três oportunidades (10), radar de sinais (22) e retorno projetado (37).
- **Aberturas de parte:** numeral gigante e índice das quatro partes, com a atual marcada por um fio limão.
- **Aberturas de fase:** numeral em marca-texto limão, foto P&B, duração e trilho dos seis meses.
- **Em todo slide:** o rodapé mostra as quatro partes, com a atual destacada. Dentro da proposta, o topo mostra `01 Diagnóstico · 02 Preparação · 03 Operação`, com a fase atual sublinhada.
- **Limão:** só em destaques de tamanho real, nunca em quadradinhos ou nós de diagrama e nunca como cor de texto no fundo claro. Aparece na etiqueta e no "×" da capa, nos numerais das fases, nos fios dos marcadores atuais e como marca-texto nos pontos-chave: princípio 04, resposta 05 do diagnóstico, primeiro passo da prospecção, A1, valor do investimento, posição alocada e retorno.

## Linguagem visual (do site da Velora)

- **Tokens:** Ink `#0B0B0C`, Raise `#141416`, Acid `#CCFF00`, Bone `#F7F1ED` e Paper `#FFFFFF`. O texto secundário fica em 64%.
- **Fontes:** Space Grotesk 700, Manrope e JetBrains Mono, em `fonts/` (SIL Open Font License).
- **Escala:** títulos de 64 px, subtítulos de 34 px, texto de 24 px e rótulos mono de 15 a 17 px. Nenhum texto de leitura fica abaixo de 20 px.
- **Estrutura:** uma linha vertical fina à esquerda, com os rótulos pendurados nela; nós quadrados; fios em vez de caixas; tabelas com cabeçalho em mono e números tabulares.

## Investimento, custo por etapa e retorno

Premissas usadas nos slides 30, 35, 36 e 37:

| Item | Valor |
|---|---|
| Diagnóstico (mês 1) | R$ 15 mil |
| Preparação e implementação (mês 2) | R$ 18 mil |
| Operação e ajustes (meses 3 a 6) | R$ 21 mil/mês → R$ 84 mil |
| **Honorários Velora** | **R$ 117 mil** |
| Verba de mídia (meses 3 a 6, paga às plataformas) | ~R$ 10 mil/mês → R$ 40 mil |
| Ferramentas e conectores de IA (6 meses) | R$ 2 mil/mês → R$ 12 mil |
| **Investimento do período** | **R$ 169 mil** |
| Parcela por resultado | R$ 15 mil por conta nova → R$ 60 mil com 4 contas |
| **Investimento total no cenário** | **R$ 229 mil** |

Custo de referência = investimento do período (R$ 169 mil) ÷ volume da etapa no cenário:

| Etapa | Volume | Custo | Com a parcela por resultado |
|---|---|---|---|
| Reunião | ~60 a 65 | R$ 2,6 a 2,8 mil | — |
| Homologação | 6 a 8 | R$ 21 a 28 mil | — |
| Contrato | 4 | R$ 42 mil | R$ 57 mil |
| Posição alocada | 24 (4 × 6) | R$ 7 mil | R$ 9,5 mil |

Retorno (LTV de 5 anos, churn de 8% ao ano aplicado à receita a partir do ano 2):

| | Ano 1 | Ano 2 | Ano 3 | Ano 4 | Ano 5 | Total |
|---|---|---|---|---|---|---|
| Receita das 4 contas (R$ mi) | 5,76 | 5,30 | 4,88 | 4,49 | 4,13 | **24,5** |

- 4 contas × 6 posições × R$ 20 mil/mês = R$ 480 mil/mês, ou R$ 5,76 mi no primeiro ano. São R$ 6,1 mi por conta em 5 anos.
- Margem bruta de referência de 14% (faixa de 12% a 16%, estimativa do briefing): R$ 3,4 mi em 5 anos (R$ 2,9 a 3,9 mi).
- Margem ÷ investimento total de R$ 229 mil: ~15x (13x a 17x).
- Payback: 3 a 4 meses de margem das 4 contas ativas (R$ 67 mil/mês a 14%).

## Fotos

| Slide | Foto | Por quê |
|---|---|---|
| 1 · Capa | `reuniao.jpg` | Reunião de trabalho vista através do vidro |
| 11 · Transição | `porta.jpg` | Abrir a porta: "novas formas de abrir contas" |
| 14 · Fase 1 | `mesa.jpg` | Análise conjunta, sobre a mesa |
| 18 · Fase 2 | `apresentacao.jpg` | Definir junto com o time |
| 27 · Fase 3 | `movimento.jpg` | Operação, em movimento |
| 38 · Próximos passos | `chegada.jpg` | Início do trabalho |
| 39 · Encerramento | `elevador.jpg` | Parceria que sobe junto |

## A validar antes de apresentar

Do documento de correção (seção 3):

- **Slide 5:** conferir fonte, universo e formulação exata das três estatísticas.
- **Slide 8:** validar com a Talent os números de operação e equipe.
- **Slide 26:** definir "reunião qualificada", "oportunidade", "homologação" e "conta estratégica". Os prazos aparecem como referência a combinar.
- **Slide 30:** total padronizado em ~60 a 65 reuniões (40 + 10 a 15 + 10). Falta definir atribuição e deduplicação entre frentes.
- **Slides 23, 29 e 33:** confirmar a divisão de trabalho entre o squad da Velora, a agência atual e o time da Talent.
- **Slide 33:** confirmar o papel de Leonardo Wartha (advisor ou sócio).
- **Slide 35:** formalizar em contrato o que conta como conta nova e como primeira alocação para a parcela por resultado.
- **Slide 38:** data de início.
- **Slides 20 e 25:** os tiers seguem A1/B2/B3. O documento sugere A/B/C como alternativa.

Interpretações dos valores, a confirmar:

- R$ 15 mil, R$ 18 mil e R$ 21 mil são honorários mensais de cada fase; a operação tem 4 meses.
- A verba de mídia (~R$ 10 mil/mês) roda só nos 4 meses de operação.
- Ferramentas e conectores de IA: R$ 2 mil por mês durante os 6 meses.
- "R$ 20 mil por posição" é o faturamento mensal da Talent por consultor alocado.
- As 6 posições por conta valem desde o primeiro ano, sem rampa de entrada.
- A margem bruta de 14% é a estimativa do briefing. O slide 37 mostra a margem da Talent; avalie se quer exibi-la ao cliente.

Conteúdo que não vem do documento de correção:

- Capa "Velora × Talent Four · Desenvolvimento de sistema de aquisição", conforme pedido.
- Slides 16 e 17 (respostas do diagnóstico e passagem para o setup), escritos a partir do roteiro do briefing.
- Slides 36 e 37 (custo por etapa e retorno projetado), calculados a partir das premissas acima.
- Roteiro, aberturas, encerramento com contatos e as etiquetas de prazo do slide 38.
