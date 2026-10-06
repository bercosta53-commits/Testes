# Copy deck: Diagnóstico de recuperação com IA

Os textos abaixo são a versão-base para o protótipo. Onde houver variante A/B, o protótipo apresenta a A e mantém a B como alternativa para teste após a publicação.

**Tom:** direto, consultivo e analítico, com linguagem simples e próxima. Frases curtas, voz ativa e sem superlativos. O leitor é gestor de cobrança, crédito ou operações em cooperativa, banco ou financeira.

---

## 0. Metadados da página

- **Title:** Diagnóstico de recuperação com IA | Ubots
- **Meta description:** Em 2 minutos, tenha uma estimativa do potencial de renegociação da sua operação com um agente de IA no WhatsApp e veja os principais pontos para preparar um piloto.
- **OG title:** Qual é o potencial da IA na sua operação de recuperação?
- **OG description:** Diagnóstico gratuito a partir da experiência do Sicoob Crediauc. Resultado disponível na hora.

---

## 1. Hub da apresentação (`/`)

**Título:** Diagnóstico de recuperação com IA

**Subtítulo:** Uma proposta da On Nest para transformar o case Sicoob Crediauc em uma experiência capaz de gerar conversas comerciais mais qualificadas para a Ubots.

**Cartão 1:** No artigo  
Como o diagnóstico entra no conteúdo e em quais momentos o leitor é convidado a avançar.

**Cartão 2:** A experiência  
O que o gestor responde, visualiza e recebe ao longo do diagnóstico.

**Cartão 3:** O lead no comercial  
Quais informações chegam ao time de vendas e como elas podem apoiar a abordagem.

**Rodapé:** Protótipo On Nest. Dados de demonstração.

---

## 2. Mock do artigo (`/artigo`)

**Botão de controle (topo):** Mostrar pontos de entrada / Ocultar pontos de entrada

**Etiquetas dos destaques:** Ponto de entrada 1 · Após os resultados / Ponto de entrada 2 · Fim do artigo / Ponto de entrada 3 · Barra fixa

**Categoria:** Recuperação de crédito

**Título:** IA na recuperação de crédito: a experiência do Sicoob Crediauc na renegociação de dívidas complexas

**Linha de autoria:** Por Ubots. 6 min de leitura.

**Resumo (caixa amarela):**  
Nos últimos 5 dias da campanha Desenrola Brasil, o Sicoob Crediauc colocou um agente de IA da Ubots para conduzir negociações pelo WhatsApp. Com um colaborador acompanhando a operação, foram renegociados R$ 23,4 mil. Nos 75 dias anteriores, 135 gerentes haviam renegociado R$ 46,2 mil.

**Índice lateral:** Resumo / O desafio / Como o agente atuou / Resultados / O que podemos observar

### O desafio

A Crediauc tem mais de 92 mil cooperados e oferecia diferentes condições de renegociação durante a campanha. Parte das dívidas, porém, exigia uma análise mais detalhada: havia clientes com vários produtos em atraso e necessidade de ajustar parcelas e prazos caso a caso.

Esse tipo de negociação exigia bastante tempo dos gerentes. Como a equipe também precisava atender outras demandas das agências e da operação, a capacidade de avançar sobre essa carteira era limitada.

### Como o agente atuou

O agente iniciava a conversa pelo WhatsApp, entendia a capacidade de pagamento do cooperado e estruturava uma proposta dentro das políticas definidas pela cooperativa.

Quando a negociação precisava de uma avaliação específica, o colaborador recebia a conversa com o histórico já organizado e podia assumir o atendimento a partir dali.

O WhatsApp também permitia que o cooperado respondesse no momento mais conveniente, mantendo a negociação em andamento sem depender de uma ligação em horário comercial.

### Resultados

**Tabela:**

| Indicador | Operação humana | Agente de IA + 1 colaborador |
|---|---|---|
| Período | 75 dias | 5 dias |
| Equipe | 135 gerentes | 1 colaborador |
| Contratos renegociados | 13 | 6 |
| Valor renegociado | R$ 46.228,00 | R$ 23.402,22 |
| Valor quitado | R$ 23.566,20 | R$ 3.546,30 |

**Fonte:** Sicoob Crediauc e Ubots.

> **[Ponto de entrada 1]**

### O que podemos observar

A experiência mostra um uso bastante prático da IA na recuperação de crédito: o agente pode assumir etapas operacionais da negociação, organizar informações e manter as conversas em andamento.

Com isso, a equipe consegue dedicar mais atenção aos casos que exigem análise, decisão ou negociação personalizada.

Outro ponto relevante é a possibilidade de construir a proposta a partir da capacidade de pagamento informada pelo próprio cooperado, dentro das regras definidas pela instituição.

> **[Ponto de entrada 2]**

---

## 3. Pontos de entrada

### Ponto 1 · Após a tabela de resultados

**Variante A — usar no protótipo**

- **Título:** Qual seria o potencial da IA na sua operação de recuperação?
- **Texto:** Responda 10 perguntas sobre a sua operação e receba uma estimativa aplicada à sua carteira.
- **Botão:** Fazer o diagnóstico
- **Microcopy:** Cerca de 2 minutos. Sem custo.

**Variante B**

- **Título:** Como esses resultados se comparam à realidade da sua operação?
- **Texto:** O diagnóstico considera a sua estrutura atual e estima o impacto que um agente de IA poderia ter na capacidade de renegociação.
- **Botão:** Fazer o diagnóstico

### Ponto 2 · Fim do artigo

- **Título:** Veja como esse cenário se aplicaria à sua carteira
- **Texto:** Em cerca de 2 minutos, o diagnóstico estima o potencial da IA na sua operação e indica os principais pontos para estruturar um piloto.
- **Botão:** Fazer o diagnóstico
- **Link secundário:** Prefiro falar com um especialista

### Ponto 3 · Barra fixa (após 40% de scroll)

- **Desktop:** Qual seria o potencial da IA na sua operação? Faça o diagnóstico em 2 minutos.
- **Mobile:** Qual seria o potencial da IA na sua operação?
- **Botão:** Fazer o diagnóstico
- **Fechar (aria-label):** Fechar convite

---

## 4. Diagnóstico (`/diagnostico`)

Versão 3: resultado em uma página no desktop (no máximo uma rolagem), captação antes do resultado e texto adaptado ao tipo de instituição. Tudo fica num arquivo só, `src/DiagnosticoRecuperacaoIA.jsx`, pronto para ferramentas de vibe code. Os textos marcados como novos dependem de aprovação da Ubots.

### Vocabulário por tipo de instituição

O tipo muda o texto, nunca os números. Nos textos, os marcadores abaixo são trocados automaticamente.

| Marcador | Cooperativa | Banco | Financeira ou fintech | Outro |
|---|---|---|---|---|
| {inst} | a sua cooperativa | o seu banco | a sua financeira | a sua instituição |
| {daInst} / {naInst} | da / na sua cooperativa | do / no seu banco | da / na sua financeira | da / na sua instituição |
| {cliente(s)} | cooperado(s) | cliente(s) | cliente(s) | cliente(s) |
| Campo do formulário | Nome da cooperativa | Nome do banco | Nome da financeira ou fintech | Nome da instituição |

### Abertura

- **Título:** Qual seria o potencial da IA na sua operação de recuperação?
- **Texto (novo):** Responda 10 perguntas sobre a sua operação de cobrança. Ao final, você informa seus dados e recebe o diagnóstico completo na hora.
- **Destaque e apoio:** iguais à versão anterior.
- **Pergunta 1 na própria abertura (novo):** Para começar, que tipo de instituição você representa?
- **Microcopy:** 10 perguntas · cerca de 2 minutos · sem custo

### Perguntas

As opções e os valores não mudam ("Propostas por perfil de cliente" virou "Propostas por perfil"). A redação se adapta ao tipo e cada pergunta diz por que é feita:

| Pergunta | Redação por tipo | Por que perguntamos |
|---|---|---|
| Pessoas | Quantas pessoas negociam dívidas {naInst} hoje? | Usamos para calcular a capacidade atual da equipe. |
| Contratos | Quantos contratos estão em atraso na carteira {daInst}? | Define o tamanho da fila a percorrer. |
| Dívida média | (sem mudança) | Usamos para estimar o saldo em atraso. |
| Ritmo | (sem mudança) | Com esse número, calculamos o tempo para percorrer a fila. |
| Régua | Como o {cliente} em atraso recebe a proposta hoje? | Mostra se o agente já parte de uma segmentação. |
| Canal | (sem mudança) | Mostra quanto da negociação já está no canal do agente. |
| Política | Como {inst} define desconto, prazo e parcela? | O agente só negocia sozinho dentro de regras escritas. |
| Dados | Como a equipe consulta a dívida e as condições do {cliente}? | O agente precisa consultar saldo, atraso e condições durante a conversa. |
| Consentimento | Os {clientes} autorizaram contato por WhatsApp? | Contato com registro protege {a cooperativa / o banco / ...} perante o CDC e a LGPD. |

**Transição antes da pergunta 6 (novo):** Parte 1 concluída. A equipe {daInst} tem capacidade para cerca de [X] renegociações por mês. Agora, a prontidão para um agente de IA.

### Captação (substitui a prévia; nenhum número aparece antes do envio)

- **Rótulo:** Diagnóstico concluído
- **Título:** O diagnóstico {daInst} está pronto.
- **Texto:** Informe seus dados para ver, nesta tela:
- **Lista:** O potencial com um agente de IA: renegociações por mês e tempo para percorrer a carteira / A prontidão nas 5 dimensões, com a leitura de cada resposta / Por onde começar {naInst}
- **Campos:** Nome / E-mail de trabalho / WhatsApp / {Nome da cooperativa}
- **Autorização (novo, ponto em aberto):** Autorizo a Ubots a entrar em contato sobre este diagnóstico.
- **Botão:** Ver diagnóstico completo (durante o envio: Preparando o diagnóstico)
- **Microcopy:** Seus dados serão utilizados pelo time da Ubots para dar continuidade ao diagnóstico.
- **Link:** Revisar respostas

### Resultado (uma página)

1. **Cabeçalho:** Diagnóstico · [instituição] / [nível] / resumo do nível. À direita (abaixo, no celular), a escala dos 3 níveis com o atual em amarelo: Preparar a base · Pronta para piloto · Pronta para escalar.
   - **Preparar a base:** Antes do agente, vale organizar [até duas dimensões mais fracas].
   - **Pronta para piloto:** {Inst} já tem o essencial para testar um agente numa campanha. (Com política, autorização ou dados em 0: "{Inst} pode testar um agente numa campanha depois de resolver [essas dimensões].")
   - **Pronta para escalar:** Regras, canal e dados {daInst} estão maduros. O agente pode entrar na operação contínua. (Com alguma dimensão abaixo de 2: "{Inst} tem quase toda a base pronta. Antes da operação contínua, resolva [dimensão].")
2. **O potencial com um agente de IA** / Capacidade de renegociação por mês: Com agente de IA [faixa] · Hoje [X] · Tempo para percorrer a carteira ([com IA], hoje: [X]; ou "Fila em dia", a equipe já cobre a carteira no mês) · Dívida renegociada a mais no 1º mês ([valor] ou "Sem fila represada"; saldo em atraso: [valor]) · nota: "Faixa conservadora: [a] a [b] vezes a capacidade atual, conforme a prontidão. Valores sobre o saldo renegociado, não sobre o valor recebido."
3. **Prontidão por dimensão:** [n]/15 no título; nota de cada dimensão, selo "Prioridade" na mais fraca e uma linha de leitura por resposta:

| Dimensão | Respostas 0 · 1 · 2 · 3 |
|---|---|
| Régua | Mesma proposta para todos, sem olhar a capacidade de pagamento. · Segmenta só por atraso, sem olhar a capacidade de pagamento. · Propostas por perfil já podem orientar o agente. · Proposta caso a caso: o agente leva esse ajuste para mais conversas. |
| Canal | Negociação por ligação, fora do canal do agente. · SMS ou e-mail, fora do canal do agente. · WhatsApp com atendente: o agente assume as etapas operacionais. · WhatsApp com automação: o agente entra no canal que os {clientes} já usam. |
| Política | Cada caso depende de aprovação: o agente não fecha acordos sozinho. · Faixas não escritas: o agente ainda não tem alçadas para seguir. · Regras documentadas: base para as alçadas do agente. · Regras parametrizadas: o agente propõe dentro das alçadas. |
| Dados | Dados em planilhas, sem consulta direta para o agente. · Sistema sem API: falta um caminho de consulta para o agente. · API que a TI pode liberar: uma integração simples resolve. · API já usada em canais digitais: a integração segue o mesmo caminho. |
| Consentimento | Não se sabe quem autorizou o contato por WhatsApp. · Só parte da base autorizou: o agente começa por esse grupo. · (sem opção 2) · Base autorizada, com registro: o agente pode iniciar o contato. |

4. **Por onde começar:** 3 passos lado a lado no desktop. Primeiro a ação de cada dimensão com nota até 1, na ordem de prioridade (política, autorização, dados, régua, canal); depois os passos gerais. No nível "Pronta para escalar", o passo "Piloto" sai.
   - **Régua:** Segmente a carteira pela capacidade de pagamento, para propor parcelas que cabem no bolso.
   - **Canal:** Leve a negociação para o WhatsApp, onde o {cliente} responde no tempo dele.
   - **Política:** Escreva as alçadas: até onde vão desconto, prazo e carência sem aprovação.
   - **Dados:** Liste com a TI os dados que o agente vai consultar (saldo, atraso, condições) e por onde eles saem.
   - **Consentimento:** Revise quem autorizou contato por WhatsApp e registre a autorização.
   - **Piloto:** Comece com uma campanha com data para acabar, como a Crediauc fez no Desenrola.
   - **Transbordo:** Defina quais exceções vão para um analista, sempre com o histórico da conversa.
   - **Acompanhamento:** Acompanhe a reincidência dos acordos: parcela que cabe no orçamento é cumprida até o fim.
5. **Conversa com especialista** (faixa escura no fim da página; no desktop, o mesmo botão também fica no topo até o pedido):
   - **Preparar a base:** Quer organizar esses pontos com a Ubots? / O time da Ubots pode revisar o diagnóstico com você e indicar por onde começar antes de um piloto.
   - **Pronta para piloto:** Quer desenhar o piloto {daInst}? / O time da Ubots pode revisar o diagnóstico com você e definir carteira, prazo e indicadores para um piloto de 5 a 15 dias.
   - **Pronta para escalar:** Quer levar o agente para a operação contínua? / O time da Ubots pode avaliar com você a integração e os critérios de transbordo para a equipe.
   - **Botão:** Conversar com um especialista
   - **Confirmação:** Pedido registrado. O time da Ubots vai falar com você pelo WhatsApp, com este diagnóstico em mãos. (Quando o componente roda sem o registro do pedido, o botão abre `CONFIG.ctaUrl` numa nova aba, sem mensagem de confirmação. O endereço precisa ser confirmado com a Ubots.)
6. **Rodapé:** Como calculamos: pessoas × renegociações por dia × 21 dias úteis, multiplicado pela faixa do nível. Cada resposta usa o valor de referência da faixa escolhida. / Refazer diagnóstico

### Seletor do modo demonstração (`?demo=1`)

- **Título:** Modo demonstração
- **Cenários:** Cooperativa média / Banco regional maduro / Cooperativa no início (abrem na captação)
- **Botão:** Preencher formulário (no cenário do banco, usa "Banco Exemplo" e ana@banco-exemplo.com.br)
- **Fechar:** Ocultar


---

## 5. Painel do comercial (`/painel`)

**Título:** Leads do diagnóstico

**Subtítulo:** Uma visão das informações que chegam ao time comercial após cada diagnóstico. Dados de demonstração.

**Colunas:** Contato / Instituição / Nível / Renegociações por mês / Potencial adicional / Origem

**Formato da coluna "Renegociações por mês":** 504 hoje, estimativa de 1.512 a 2.520 com IA

**Rótulos de origem (`utm_content`):**

- `pos-tabela`: Artigo, após os resultados
- `cta-final`: Artigo, fim do texto
- `barra-fixa`: Artigo, barra fixa
- sem UTM: Acesso direto

### Detalhe do lead

**Seções:** Respostas / Prontidão por dimensão / Sugestão de abordagem

**Sugestão de abordagem por nível:**

- **Preparar a base:** A operação ainda tem alguns pontos importantes para estruturar, principalmente em regras de negociação e acesso aos dados. Uma boa primeira conversa pode ser um workshop para organizar esses critérios e avaliar, na sequência, a viabilidade de um piloto.

- **Pronta para piloto:** Os principais fundamentos já estão presentes. A oportunidade é desenhar um piloto curto, entre 5 e 15 dias, com uma carteira bem definida, prazo claro e indicadores de contratos e valor renegociado.

- **Pronta para escalar:** A operação já apresenta boa maturidade em regras, canais e acesso aos dados. A conversa pode avançar para um modelo contínuo, considerando integração via API e critérios de transbordo para a equipe.

**Linha de abertura sugerida para o SDR:**  
Oi, [nome]. Vi o diagnóstico [da/do/de] [instituição] e achei interessante o cenário que apareceu [na dimensão de menor nota, com artigo, ou "na capacidade de renegociação"]. Posso compartilhar como a Crediauc estruturou o piloto e comparar com a realidade de vocês?

A preposição vem da primeira palavra do nome digitado ("do Banco Sul", "da Cooperativa Vale", "do Sicoob Centro") e, quando ela não indica o gênero, fica "de".

**Variante para quem pediu conversa:** Oi, [nome]. Recebi seu pedido de conversa sobre o diagnóstico [da/do/de] [instituição]. O cenário [da dimensão] chamou atenção. Posso compartilhar como a Crediauc estruturou o piloto e comparar com a realidade de vocês?

### Novidades no painel

- **Selo:** Pediu conversa (lista e detalhe), com "Pediu conversa em [data]".
- **Lista:** "Ponto crítico: [dimensão]" abaixo do nível.
- **Coluna "Potencial adicional":** [valor] no primeiro mês (um valor só quando os extremos coincidem). Depois do primeiro mês, a fila já é menor.
- **Detalhe:** Saldo em atraso estimado / Ponto crítico / O que o lead viu no resultado (o resumo e o "Por onde começar") / Perguntas para a primeira ligação, conforme o ponto crítico.
- **CSV:** colunas novas no fim: Pediu conversa, Data do pedido, Ponto crítico, Saldo em atraso estimado, Meses para percorrer a carteira hoje, Meses com IA (mínimo e máximo).
