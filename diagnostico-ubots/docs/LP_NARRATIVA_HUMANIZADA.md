# LP Ubots — narrativa humanizada alinhada ao Diagnóstico v2

## Objetivo
Transformar a entrada do diagnóstico em uma história de negócio: uma carteira que cresce, uma equipe que precisa tratar cada pessoa com atenção, a IA como apoio (não substituição), uma demonstração real e uma avaliação prática, personalizada e transparente.

**Fonte de verdade:** `docs/PROMPT_LOVABLE.md`, especialmente o fluxo da intro, 10 perguntas, 5 dimensões, níveis de prontidão, cálculo e resultado. Esta proposta **não altera** cálculos, perguntas, pontuação, integração ou promessas do case.

## Narrativa e copy da landing page completa (fora do quiz)

### 1 — Hero: tensão + convite
**Eyebrow:** Recuperação de crédito com inteligência artificial

**Título:** Sua carteira em atraso não espera. Sua equipe não consegue estar em todas as negociações.

**Subtítulo:** Recuperar crédito exige mais do que disparar mensagens. Exige entender a realidade de cada pessoa, negociar dentro de regras claras e ter tempo para acompanhar cada conversa. Descubra como a IA pode ampliar a capacidade da sua operação — e o que precisa estar preparado antes de começar.

**CTA:** Fazer meu diagnóstico gratuito

**Microcopy:** 10 perguntas · cerca de 2 minutos · resultado personalizado na hora.

**Fotografia 1:** fotografia documental de pessoas reais trabalhando em atendimento/negociação financeira no Brasil; diversidade natural, expressão concentrada mas acolhedora, sem estética futurista, robôs ou apertos de mão encenados. Ocupação até 40% da primeira dobra, com recorte amplo e luz natural. Texto alternativo descritivo, sem atribuir pessoas à Ubots ou à Crediauc.

### 2 — A dor: mostrar que entendemos a operação
**Título:** Por trás de cada contrato em atraso, existe uma conversa que ainda precisa acontecer.

**Texto:** A equipe liga, envia mensagens, consulta sistemas, verifica condições e solicita aprovações. Enquanto isso, novas pendências entram na carteira. Nem todo contato se transforma em acordo — e nem todo acordo se sustenta. A questão não é pressionar mais pessoas; é conseguir conversar melhor, com consistência e no momento certo.

**Transição:** E se a tecnologia cuidasse das etapas repetitivas para que sua equipe pudesse se concentrar nas negociações que realmente exigem uma pessoa?

### 3 — Caminho: o que um agente faz, sem prometer autonomia irrestrita
**Título:** IA não substitui a relação. Ajuda a dar escala a ela.

**Texto:** Com regras de negociação definidas, acesso às informações necessárias e autorização para contato, um agente de IA pode iniciar conversas pelo WhatsApp, entender a capacidade de pagamento, apresentar alternativas compatíveis com a política da instituição e transferir exceções para um analista com o histórico organizado.

**Notas:** Não afirmar que toda instituição está pronta; o diagnóstico identifica lacunas. Evitar “cobrança 100% autônoma” e “recuperação garantida”.

### 4 — Prova: caso real, sem comparação causal enganosa
**Eyebrow:** Na prática | Sicoob Crediauc

**Título:** Mais conversas conduzidas com inteligência. Mais tempo para os casos complexos.

**Texto:** Na campanha Desenrola Brasil, a Crediauc utilizou um agente de IA da Ubots para apoiar negociações pelo WhatsApp. Em cinco dias, com acompanhamento de um colaborador, foram renegociados R$ 23,4 mil em seis contratos. A experiência mostra como tecnologia e atendimento humano podem atuar juntos.

**Observação importante:** Campanhas com períodos, equipes e contextos diferentes não permitem concluir um ganho causal direto; o case é um exemplo de aplicação, não uma promessa.

**Fotografia 2:** pessoa adulta usando celular em casa, com naturalidade e dignidade (sem representar dívida, inadimplência ou angústia por estereótipos). Uma fotografia documental com contraste humano ao primeiro bloco de equipe. Não usar imagem de cooperado real sem autorização. Legenda: “A negociação acontece também no tempo de quem está do outro lado.”

### 5 — O diagnóstico: valor concreto
**Título:** E na sua instituição? O que faz sentido automatizar primeiro?

**Texto:** Responda dez perguntas simples sobre volume da carteira, tamanho da equipe, ritmo de acordos e cinco aspectos de prontidão. Você recebe uma leitura específica da sua realidade — não uma apresentação comercial disfarçada.

**Entregas em três blocos:**
1. **Capacidade e potencial:** renegociações por mês, prazo estimado para percorrer a carteira e valor renegociado no primeiro mês, comparando operação atual com uma faixa ilustrativa para IA.
2. **Prontidão em cinco dimensões:** régua de cobrança, canal de negociação, política de negociação, acesso aos dados e consentimento/LGPD.
3. **Plano de ação:** a dimensão prioritária e os três próximos passos mais relevantes — seja para preparar a base, testar um piloto ou escalar.

**CTA:** Descobrir minha capacidade de recuperação

**Microcopy:** Gratuito · 10 perguntas · estimativas, não garantias.

### 6 — Como funciona
**Título:** Dois minutos para entender melhor por onde começar.

**Passos:**
1. Conte como sua equipe negocia hoje.
2. Mostre como são definidos contatos, condições e acesso aos dados.
3. Veja sua análise completa e decida os próximos passos.

**Privacidade:** Antecipar antes de iniciar que os dados de contato serão solicitados para liberar o resultado. Vincular a política de privacidade real e não prometer anonimato.

### 7 — CTA final
**Título:** A próxima conversa sobre recuperação de crédito pode começar com um diagnóstico melhor.

**Texto:** Nem toda operação precisa da mesma tecnologia ou está no mesmo momento. Descubra o que faz sentido para a sua instituição, com números estimados, limites claros e prioridades práticas.

**CTA principal:** Fazer meu diagnóstico gratuito
**CTA secundário:** Entender a solução Ubots

## Integração com a aplicação existente
- CTA aponta para `/diagnostico`; a primeira pergunta (tipo de instituição) já abre dentro da introdução, reduzindo fricção.
- Preservar as **10 perguntas**, `dados.ts`, `calculo.ts`, `formatar.ts`, `entrega.ts` e os campos do HubSpot, sem reescrever números.
- A calculadora indica **renegociado**, não valor efetivamente recebido.
- Níveis: “Preparar a base” (0–5/15), “Pronta para piloto” (6–10/15) e “Pronta para escalar” (11–15/15).
- Caso de teste obrigatório do prompt original: 63 → 130–190 renegociações/mês, 8 → 3–4 meses, R$ 32 mil → R$ 63–95 mil no primeiro mês (cenário definido na documentação).
- UTM e eventos de tracking não podem se perder na passagem para o quiz.
- Design: Sora, #FFFBEF, #141414 e #FFC800, fotografia natural, espaço em branco, comunicação B2B sóbria; mobile-first.

## Adaptação aplicada ao protótipo (nesta revisão)
A intro de `src/components/Fluxo.jsx` foi humanizada: novo título centrado na capacidade da equipe, novo texto de promessa real, fotografia de profissionais (imagem editorial ilustrativa, não um registro do case), apresentação do exemplo Crediauc sem extrapolação. Isso é **a primeira tela do diagnóstico**, não uma substituição completa da LP no Lovable.

## Checklist antes de publicar
- Conferir autorização/licença e disponibilidade da(s) fotografia(s); substituir por imagens da equipe ou banco licenciado, se disponível.
- Confirmar autorização para divulgar o nome e indicadores da Crediauc.
- Testar todos os tipos de instituição (para banco, nunca usar “cooperado”).
- Validar o caso de teste numérico e a captura no HubSpot.
- Revisar visual/mobile (360px), loading e acessibilidade.
