# BRIEF — Playbook de recuperação de crédito com IA (Ubots × Sicoob Crediauc)

> Para rodar no Claude Code. Entregável: deck 16:9 de 8 slides, em HTML único + PDF.
> Cenário escolhido: **híbrido A + B** — diagramas como estrutura (B) e campos de preenchimento desenhados como componente (A).

---

## 0. Como executar

1. Crie a pasta `playbook-crediauc/` com `refs/`, `src/`, `scripts/` e `out/`.
2. Se tiver os arquivos, copie para `refs/`: `ubots-estudos-layout.html` (layout v1.0) e o PDF original do playbook. **Este brief já contém todo o copy final**, então os dois são só referência visual e de conferência.
3. Construa `src/index.html` (HTML, CSS e JS inline, um arquivo só) seguindo as seções 1 a 7.
4. Rode a verificação da seção 8 e corrija até passar.
5. Exporte `out/playbook-crediauc.pdf` e `out/slides/slide-01.png` ... `slide-08.png`.

Regra de ouro: **entregue o deck funcionando primeiro, com placeholders onde faltar asset (seção 7)**. Não pare para perguntar.

---

## 1. Objetivo e público

- Material rico da Ubots, em formato de apresentação, **acessível, prático e de leitura rápida**. Não é white paper.
- Público: gestores de cobrança, crédito e operações de cooperativas de crédito e instituições financeiras (ICP Tier A1 e A2).
- Eixo educativo: usar IA conversacional **não significa desumanizar**. Agente e humano atuam na mesma negociação, cada um com papel definido.
- Natureza do conteúdo: é um **roteiro de trabalho** (escopo, etapas, limites, transbordo, indicadores). Os campos de preenchimento são parte do produto.

## 2. Formato técnico

- Cada slide é um `<section class="slide">` de **1920×1080 px** fixos.
- Um wrapper escala o slide para caber na janela (`transform: scale`) e centraliza.
- Navegação: setas, espaço e clique; indicador `03 / 08` em JetBrains Mono.
- `@media print` e `@page { size: 1920px 1080px; margin: 0 }`: um slide por página, sem escala, sem chrome de navegação.
- Fontes: Poppins (400, 500, 600, 700, 800), Inter (400, 500, 600) e JetBrains Mono (500, 700). **Embuta as fontes** via `@fontsource/*` (npm), convertidas para base64 ou servidas localmente, para o PDF não depender de rede. Google Fonts `<link>` só como fallback.
- Margens do slide: 112 px laterais, 88 px topo e base. Grade de 12 colunas, gutter 32 px.
- Cada slide tem `<aside class="notes">` com notas do apresentador (1 a 2 frases).

## 3. Design tokens (herdados do layout v1.0)

```css
:root{
  --cream:#FFFCF5; --cream-2:#FAF7F0; --paper:#FFFFFF;
  --ink:#0A0503; --ink-2:#1B130D;
  --taupe:#7A5F52; --taupe-soft:#9A8577;
  --yellow:#FFDD1F; --gold:#F4B93E; --gold-deep:#E0A400; --chip-yellow:#FFF8DE;
  /* semântica agente × humano — fixa em TODOS os slides */
  --agent:#C98A00;  --agent-bg:#FAEDC6;  --agent-ink:#5C3F00;      /* agente = gold */
  --human:#2F6D7A;  --human-bg:#DBE8EA;  --human-ink:#1D454E;      /* humano = petróleo */
  --human-on-dark:#8FC1CB;                                          /* petróleo legível em fundo escuro; validar contraste >= 4.5:1 */
  --line:rgba(10,5,3,.09); --line-2:rgba(10,5,3,.05);
  --r-lg:22px; --r-md:16px; --r-sm:11px; --r-pill:999px;
}
```

**Tipografia** (px, base 1920):

| Uso | Fonte | Tamanho |
|---|---|---|
| Título da capa | Poppins 800, tracking -.02em | 96 |
| Título de slide | Poppins 700 | 56 (máx. 2 linhas) |
| Número gigante | Poppins 800, cor `--gold-deep` ou `--yellow` em fundo escuro | 120 a 160 |
| Corpo | Inter 400/500, cor taupe (ou branco 70% em fundo escuro) | **mínimo 26** |
| Rótulo de campo, eyebrow, fórmula, indicador | JetBrains Mono 500/700, caixa alta, tracking .1em | mínimo 18 |
| Rodapé e disclaimer | Inter | mínimo 20 |

Palavra-chave do título em `--gold-deep` (como no site e no v1.0). Em fundo escuro, usar `--yellow`.

**Ritmo de fundos:** 1 escuro · 2 escuro · 3 creme · 4 creme · 5 creme · 6 creme · 7 creme-2 · 8 escuro.

## 4. Componentes (construir uma vez, reusar)

- **`.eyebrow`**: pílula creme-amarelada com ponto gold, igual ao v1.0.
- **`.campo`** (a ficha do Cenário A): rótulo em mono caixa alta (18 px) + linha de preenchimento de 2 px (`--line` com cantos retos) + dica em Inter 22 px, taupe-soft. Variante `.campo.duplo` para "Data · Responsável" lado a lado. Deve parecer um campo a preencher (altura mínima 56 px), nunca um sublinhado de texto.
- **`.check`**: quadrado 28 px com borda de 2 px, usado em listas "documente antes de configurar".
- **`.numero`**: valor gigante + legenda em Inter 26.
- **`.raia`** (swimlane): faixa horizontal com cabeçalho colorido (agente = gold, humano = petróleo) e passos em cards. Setas SVG de passagem entre raias.
- **`.marco`**: círculo numerado 1, 2, 3 sobre linha de timeline (numeração aqui tem significado de ordem).
- **`.cadeia`**: nós ligados por seta (slide 7).
- **`.rodape`**: logo Ubots pequeno à esquerda, "Playbook · Recuperação de crédito com IA" ao centro (mono, 18 px, taupe-soft), `03 / 08` à direita. Ausente nos slides 1 e 8.
- **`.estrela`**: asterisco de 4 pontas da marca (path do v1.0), **único padrão decorativo**. Usar só na capa e no slide 8, em baixa opacidade, 1 ou 2 instâncias. Nada de glows, gradientes decorativos, mockup de celular, banco de imagens, nem cards numerados sem significado.
- **Ícones**: SVG inline, traço 2 px, `currentColor`, estilo do v1.0 (Feather-like). Máximo de 1 ícone por card.

## 5. Conteúdo e layout por slide (copy FINAL, não reescreva)

Orçamento: **no máximo 60 palavras visíveis de texto corrido por slide**. Rótulos, números e títulos não entram nessa conta. O copy abaixo já está dentro do orçamento.

### Slide 1 — Capa (fundo escuro)
- Eyebrow: `Playbook · Recuperação de crédito`
- H1: **Playbook de recuperação de crédito com IA** (destaque em amarelo: "com IA")
- Sub: `Inspirado no case Sicoob Crediauc. Um guia para planejar campanhas com agentes de inteligência artificial conversacional.`
- Motivo visual: trilho horizontal de 3 pontos ligados, com rótulos `Preparação — Operação — Avaliação` em mono (é o resumo do slide 4).
- Logo Ubots no canto superior esquerdo. `.estrela` em baixa opacidade no canto direito.

### Slide 2 — Case + conceito (fundo escuro)
- H2: **Cinco dias de atuação em negociações complexas**
- Texto (1 bloco): `Nos últimos cinco dias da campanha, um agente de IA da Ubots apoiou um colaborador do Sicoob Crediauc em dívidas que não avançavam na operação tradicional.`
- 4 `.numero` em destaque: `5 dias` · `6 contratos renegociados` · `R$ 23.402,22 renegociados` · `R$ 3.546,30 quitados`
- Faixa secundária abaixo, menor: `+ 6 renegociações fora do escopo inicial · R$ 5.700,00`
- **Diagrama proprietário "campanha × estratégia permanente"** (substitui o `[criar imagem ilustrativa]` do PDF): linha do tempo; à esquerda uma **janela delimitada** (retângulo com bordas definidas) rotulada `Campanha — período, carteira e condições delimitadas`; à direita um **ciclo contínuo** (laço fechado com seta) rotulado `Estratégia permanente — acompanhamento contínuo, responsabilidades e revisão de políticas`. Uma seta liga os dois com o rótulo `Próximo passo indicado no Crediauc`.
- Disclaimer (20 px, legível, visível): `Os resultados não constituem uma projeção para outras instituições.`
- Notas do apresentador: `Algumas conversas iniciadas pelo agente também levaram cooperados à agência física para concluir acordos.`

### Slide 3 — Escopo (fundo creme)
- H2: **Defina quando atuar e quais contratos trabalhar**
- Lead: `Conecte uma oportunidade de negociação a uma carteira delimitada. A proximidade do 13º salário, por exemplo, pode entrar no calendário.`
- **7 `.campo` em 3 grupos** (coluna esquerda, ~8 de 12 colunas):
  - **Por quê:** `Objetivo` (o desafio que a campanha pretende trabalhar) · `Oportunidade` (o período ou a condição que justifica a iniciativa) · `Avaliação` (período e indicadores usados para analisar o resultado)
  - **Quem:** `Carteira` (quais contratos serão incluídos e excluídos) · `Identificação` (como vincular cooperado, contrato e resultado)
  - **Como:** `Condições` (descontos, parcelas, vencimentos e demais possibilidades autorizadas) · `Exceções` (quais solicitações dependerão de análise humana)
- **Painel escuro lateral** (~4 de 12 colunas), título `Transforme as condições em limites explícitos` + 4 `.check`: `O que o agente poderá oferecer` · `Quais informações do cooperado entram na proposta` · `Quais condições exigem aprovação humana` · `Quem decide sobre uma exceção`

### Slide 4 — Etapas (fundo creme)
- H2: **Planeje antes, acompanhe durante e avalie depois**
- Timeline horizontal com 3 `.marco` (1, 2, 3). Cada marco é uma coluna com: título, 1 frase, **Entrega** em destaque (card amarelo-claro) e um `.campo` embaixo.
  1. **Preparação** — `Carteira, condições, responsáveis e regras de transbordo definidos. Fluxo de dados e registro de resultados confirmados.` Entrega: `Escopo documentado, políticas definidas e responsáveis identificados.` Campo: `Data · Responsável`
  2. **Operação** — `O agente conduz abordagens e negociações dentro das regras. O colaborador fecha, registra e atua nas exceções.` Entrega: `Histórico das tratativas e registro dos resultados por contrato.` Campo: `Início · Término · Responsável`
  3. **Avaliação** — `Consolide renegociações, valores e quitações. Revise exceções e transbordos.` Entrega: `Avaliação dos resultados e decisão: continuar, ajustar ou ampliar.` Campo: `Data · Responsável`
- Rodapé do slide: `Indicadores de avaliação no slide 7.` (a lista de indicadores do PDF fica só no slide 7, para não duplicar)
- Cor dos marcos: 1 e 3 ink; 2 `--yellow`.

### Slide 5 — Agente × humano (fundo creme)
- H2: **Agente e humano atuam na mesma negociação**
- Lead: `O agente amplia a capacidade de conduzir conversas. O colaborador participa do fechamento e das situações que exigem análise humana.`
- **Duas raias paralelas**, 4 passos cada, setas de passagem do passo 4 do agente para o passo 4 do humano (rótulo da seta: `transbordo com histórico`):
  - Raia **Agente de IA** (gold): `Inicia o contato pelo WhatsApp, de forma amigável` → `Conversa em linguagem natural e interpreta as possibilidades de pagamento` → `Cruza o contexto com as regras de crédito e apresenta aprovação ou contraproposta` → `Organiza a tratativa e transfere o que exige intervenção humana`
  - Raia **Colaborador humano** (petróleo): `Concentra-se no fechamento e no registro dos acordos` · `Assume negociações que exigem exceções às políticas` · `Dá continuidade quando o cooperado precisa de mais acolhimento` · `Recebe o histórico e conduz a tratativa com contexto`
- **3 degraus "Antes de iniciar, registre"** (escada ascendente da esquerda para a direita, cada degrau com um `.campo`): `Limite de oferta` — quais condições o agente pode apresentar? · `Limite de decisão` — quais condições dependem de análise ou aprovação humana? · `Limite de formalização` — quem confirma o fechamento e registra a operação?

### Slide 6 — Transbordo (fundo creme)
- H2: **Saiba quando o humano assume a conversa**
- Lead: `No Crediauc, houve duas situações de transferência: negociações que exigem exceções e cooperados que precisam de mais acolhimento.`
- **Fluxograma:** `Conversa com o agente` → losango `Fora das condições da política, ou cooperado precisa de acolhimento?` → **Não:** `Agente segue a negociação` (gold) · **Sim:** `Transbordo para o time humano` (petróleo) → `Humano conclui e registra`.
- Faixa abaixo do fluxo: `Registre o motivo da transferência, o responsável e as informações necessárias para continuar o atendimento.`
- **4 `.campo`** em grade 2×2: `Exceção` (quais pedidos estão fora das condições do agente) · `Destino` (quem recebe a tratativa) · `Atendimento` (em qual período o time humano está disponível) · `Continuidade` (quem conclui e registra a operação)

### Slide 7 — Métricas (fundo creme-2)
- H2: **Meça o que aconteceu na campanha**
- **`.cadeia` de 6 nós** (cada um: dimensão em mono, indicador em Poppins 600, "como acompanhar" em Inter 22):
  1. `Carteira` · Contratos incluídos · `Total de contratos elegíveis no início da campanha.`
  2. `Interação` · Contratos com resposta · `Contratos com retorno registrado; mensagens não contam como contratos diferentes.`
  3. `Negociação` · Conversão em acordo · `Contratos com acordo ÷ contratos com resposta × 100.`
  4. `Resultado` · Valor renegociado · `Soma dos acordos registrados, com critério de valor documentado.`
  5. `Recebimento` · Valor efetivamente recebido · `Pagamentos confirmados no período.`
  6. `Cumprimento` · Pagamentos previstos cumpridos · `Pagamentos realizados ÷ previstos no período × 100.`
- **Derivação lateral** (petróleo, ligada ao nó 3 por linha tracejada): `Participação humana` · Transbordos · `Quantidade de tratativas transferidas e seus motivos.`
- **Faixa de decisão** na base, com 3 chips `Continuar` · `Ajustar` · `Ampliar` e 4 perguntas curtas: `A campanha avançou no desafio definido?` · `Quais situações exigiram participação humana?` · `O que ajustar antes de uma nova aplicação?` · `Há elementos para continuidade ou ampliação?`
- Nota (22 px): `A decisão deve ser construída a partir dos resultados de cada instituição.`

### Slide 8 — CTA (fundo escuro)
- H2: **Planeje sua primeira campanha com IA conversacional**
- Texto: `Use este guia para organizar escopo, responsabilidades, cronograma e avaliação de uma campanha inicial.`
- Bloco `Converse com a Ubots sobre a sua operação` + `Leve o desafio que deseja trabalhar e as definições preenchidas neste playbook.`
- **Checklist "Leve para a conversa"** (4 `.check`, cada um com o número do slide de origem em mono): `Escopo · slide 3` · `Cronograma e responsáveis · slide 4` · `Limites de oferta, decisão e formalização · slide 5` · `Regras de transbordo e indicadores · slides 6 e 7`
- Botão amarelo **Falar com um especialista →** (um só; link `href="#"` com `TODO: URL`). Sem segundo CTA.
- Logo Ubots grande, `.estrela` em baixa opacidade.

## 6. Regras editoriais e de design (invioláveis)

- **Nenhum número fora da lista permitida:** `5`, `6`, `R$ 23.402,22`, `R$ 3.546,30`, `R$ 5.700,00`, `13º`, `×100`, numeração de slides e marcos. Não invente métrica, benchmark, percentual nem prazo.
- O cliente (Sicoob Crediauc) é protagonista; a Ubots aparece como apoio.
- Parágrafos correm em uma direção. Evite construções "não X, mas Y".
- Texto em português do Brasil, tom direto e profissional. "Cooperado" é o termo do case e fica.
- Contraste mínimo de 4.5:1 para texto; 3:1 para texto grande e elementos gráficos.
- Nunca use só a cor para distinguir agente e humano: as raias têm rótulo e ícone (agente: faísca/estrela; humano: pessoa).
- **Proibido:** gradient glows, pílulas decorativas, mockup de celular, banco de imagens, ilustração gerada por IA, cards numerados sem significado, Poppins em tudo sem hierarquia.

### Propostas de copy fora do PDF original (NÃO renderizar sem aprovação do Bernardo)
- Callout âmbar no slide 5: `Leitura da Ubots: o agente conduz a conversa; a decisão e o acolhimento continuam com pessoas.`
- Decisão em aberto: o slide 8 aponta só para o especialista, como no PDF. Se a calculadora da landing page entrar, será um segundo bloco no slide 8.

## 7. Assets pendentes (use placeholder e deixe marcado no código com `TODO-ASSET`)

| Asset | Placeholder provisório |
|---|---|
| Logo Ubots oficial (SVG, versões clara e escura) | SVG aproximado do v1.0 (estrela + círculo + wordmark "ubots" em Poppins 700) |
| Logo Sicoob Crediauc **e autorização de uso** | Só o texto "Sicoob Crediauc". **Não desenhe o logo** |
| URL do CTA | `href="#"` |
| Brand book / padrão gráfico oficial | Só a `.estrela` |

Fotos: **nenhuma** neste cenário.

## 8. Verificação (obrigatória antes de dizer que terminou)

Crie `scripts/check.mjs` com Playwright (Chromium, `executablePath` já configurado no ambiente; não rode `playwright install`) que:

1. Abre `src/index.html` em viewport 1920×1080 e, para cada `.slide`:
   - falha se `scrollHeight > clientHeight` ou `scrollWidth > clientWidth` (overflow);
   - conta as palavras de texto corrido e falha acima de 60 (exclua `.eyebrow`, rótulos mono, números, rodapé e `.notes`);
   - falha se algum texto visível tiver fonte menor que 18 px;
   - salva `out/slides/slide-NN.png`.
2. Varre todo o texto visível por números e falha se aparecer qualquer um fora da lista da seção 6.
3. Exporta `out/playbook-crediauc.pdf` (8 páginas de 1920×1080, `printBackground: true`) e confirma 8 páginas com `pdfinfo`.

Depois **abra cada PNG** e confira à vista:
- hierarquia clara: título, bloco central, rodapé;
- raias e setas do slide 5 sem sobreposição;
- fluxograma do slide 6 legível sem zoom;
- cadeia do slide 7 cabendo em uma linha, sem quebra feia;
- campos de preenchimento parecem campos, não sublinhados soltos;
- amarelo só em destaque e CTA; petróleo só no humano.

Corrija e repita até zerar as falhas.

## 9. Definition of Done

- [ ] `src/index.html` único e autocontido, abre offline.
- [ ] 8 slides, copy idêntico à seção 5.
- [ ] `check.mjs` passa sem falhas.
- [ ] `out/playbook-crediauc.pdf` com 8 páginas e `out/slides/*.png`.
- [ ] Lista final de `TODO-ASSET` pendentes, no resumo de entrega.
- [ ] Resumo de 5 linhas no máximo, sem recapitular passos.
