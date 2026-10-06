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

Versão 2, depois do retorno da On Nest: resultado mais profundo, captação antes do resultado e texto adaptado ao tipo de instituição. Os textos novos estão marcados para aprovação da Ubots. Marcadores entre chaves mudam conforme o tipo (tabela abaixo).

### Vocabulário por tipo de instituição

O tipo muda o texto, nunca os números.

| Marcador | Cooperativa | Banco | Financeira ou fintech | Outro |
|---|---|---|---|---|
| {inst} | a sua cooperativa | o seu banco | a sua financeira | a sua instituição |
| {daInst} / {naInst} | da / na sua cooperativa | do / no seu banco | da / na sua financeira | da / na sua instituição |
| {cliente(s)} | cooperado(s) | cliente(s) | cliente(s) | cliente(s) |
| Campo do formulário | Nome da cooperativa | Nome do banco | Nome da financeira ou fintech | Nome da instituição |
| Exemplo de e-mail | ana@cooperativa.com.br | ana@banco.com.br | ana@financeira.com.br | ana@instituicao.com.br |

### Abertura

- **Título:** Qual seria o potencial da IA na sua operação de recuperação?
- **Texto (novo):** Responda 10 perguntas sobre a sua operação de cobrança. Ao final, você informa seus dados e recebe o diagnóstico completo na hora.
- **Destaque:** No case Sicoob Crediauc, um colaborador acompanhado de um agente de IA renegociou, em 5 dias, cerca de metade do valor alcançado por 135 gerentes nos 75 dias anteriores.
- **Apoio ao destaque:** Considerando o período analisado, a experiência mostra um ganho relevante de capacidade operacional.
- **Pergunta 1 na própria abertura (substitui o botão "Começar diagnóstico"):** Para começar, que tipo de instituição você representa?
- **Microcopy:** 10 perguntas · cerca de 2 minutos · sem custo

### Perguntas

As opções e os valores não mudam. A redação se adapta ao tipo e cada pergunta diz por que é feita.

| Pergunta | Redação | Por que perguntamos |
|---|---|---|
| Pessoas | Quantas pessoas negociam dívidas {naInst} hoje? | Usamos para calcular a capacidade atual da equipe. |
| Contratos | Quantos contratos estão em atraso na carteira {daInst}? | Define o tamanho da fila a percorrer. |
| Dívida média | Qual o valor médio de uma dívida em atraso? (ajuda: Considere o saldo em atraso por contrato.) | Usamos para estimar o saldo em atraso. |
| Ritmo | Quantas renegociações cada pessoa fecha por dia, em média? | Com esse número, calculamos quanto tempo a equipe leva para percorrer a fila. |
| Régua | Como o {cliente} em atraso recebe a proposta hoje? | Mostra se o agente já parte de uma segmentação. |
| Canal | Por onde acontece a maior parte das negociações? | Mostra quanto da negociação já está no canal do agente. |
| Política | Como {inst} define desconto, prazo e parcela? | O agente só negocia sozinho dentro de regras escritas. |
| Dados | Como a equipe consulta a dívida e as condições do {cliente}? | O agente precisa consultar saldo, atraso e condições durante a conversa. |
| Consentimento | Os {clientes} autorizaram contato por WhatsApp? | Contato com registro protege a {instituição} perante o CDC e a LGPD. |

- **Ajuda da pergunta de pessoas:** cooperativa: "Conte gerentes e demais colaboradores que negociam, mesmo sem dedicação exclusiva."; banco: "Conte a equipe de cobrança e os gerentes que negociam, mesmo sem dedicação exclusiva."; demais: texto original.
- **Opção ajustada:** "Propostas por perfil de cliente" passou a "Propostas por perfil", para servir a cooperados e clientes.
- **Transição antes da pergunta 6:** Parte 1 concluída. Pelas suas respostas, a equipe {daInst} tem capacidade para cerca de [X] renegociações por mês. Agora, 5 perguntas sobre a prontidão para um agente de IA.
- **Rótulos:** Parte 1 de 2 · Sua operação, [n] de 5 / Pergunta [n] de 10 / Atalho: teclas 1 a [n]. / Voltar / Avançar / Voltar ao formulário

### Captação (substitui a prévia; nenhum número aparece antes do envio)

- **Rótulo:** Diagnóstico concluído
- **Título:** O diagnóstico {daInst} está pronto.
- **Texto:** Informe seus dados para ver o resultado completo nesta tela:
- **Lista:** Renegociações por mês, hoje e com um agente de IA / Tempo para percorrer a carteira em atraso e o saldo envolvido / A leitura de cada uma das 5 dimensões de prontidão / O que falta para o próximo nível / Um plano de piloto para {inst}, com base no case Sicoob Crediauc
- **Resumo das respostas:** Suas respostas (10), com "Alterar" em cada item
- **Campos:** Nome / E-mail de trabalho / WhatsApp / {Nome da cooperativa}
- **Aviso de e-mail pessoal (não bloqueia):** Se puder, use o e-mail {daInst}. Assim o especialista identifica a sua operação.
- **Sugestão pelo domínio do e-mail:** Usar "[Nome]"
- **Autorização (novo, ponto em aberto):** Autorizo a Ubots a entrar em contato sobre este diagnóstico.
- **Botão:** Ver diagnóstico completo
- **Microcopy:** Seus dados serão utilizados pelo time da Ubots para dar continuidade ao diagnóstico.
- **Erro do campo da instituição:** Informe o nome {da cooperativa / do banco / da financeira ou fintech / da instituição}.

### Análise (cerca de 1 segundo)

- **Título:** Preparando seu diagnóstico...
- **Linhas:** Calculando a capacidade atual {daInst} / Aplicando a faixa do nível de prontidão / Montando o plano de piloto

### Resultado

**Seções, na ordem:** Resumo / A carteira {daInst} hoje / O potencial com um agente de IA / Prontidão por dimensão / O caminho para o próximo nível (ou "O que vem depois") / Plano de piloto para {inst} / {inst} e o case Sicoob Crediauc / Conversa com especialista / Como calculamos

**Cabeçalho:** Diagnóstico · [instituição] · [data] / Nível de prontidão / [nível] / [n] de 15 pontos

**Resumo por nível:**

- **Preparar a base:** O ganho existe {naInst}, mas antes do agente vale organizar [dimensões com nota até 1, até duas, "e outros pontos"].
- **Pronta para piloto:** {inst} já tem o essencial para testar um agente numa campanha. (Com política, autorização ou dados em 0: "Antes, resolva [dimensão].")
- **Pronta para escalar:** Regras, canal e dados {daInst} estão maduros. O agente pode entrar na operação contínua. (Com regras, canal ou dados em até 1, ou autorização em 0: "{inst} tem quase toda a base pronta. Antes da operação contínua, resolva [dimensão].")

**Em resumo (3 linhas):**

1. Hoje, a equipe tem capacidade para cerca de [X] renegociações por mês. Com um agente de IA, a capacidade estimada é de [Y a Z][, acima dos cerca de N contratos em atraso].
2. Para percorrer a carteira em atraso: cerca de [X meses] hoje e [Y] com o agente. (Fila coberta: "A equipe já percorre a carteira atual em menos de 1 mês. O ganho está em liberar tempo para os casos que exigem análise.")
3. Prioridade: [dimensão crítica]. [Primeira frase da recomendação.] (Sem dimensão crítica: "Prioridade: desenhar o piloto. As 5 dimensões já têm base para começar." ou, no nível mais alto, "Prioridade: levar o agente para a operação contínua, começando por uma campanha curta.")

**Carteira hoje:** Título da prévia original ("No ritmo atual, a equipe {daInst} levaria cerca de [X meses] para percorrer toda a carteira em atraso." ou a versão de fila coberta). Indicadores: Contratos em atraso / Saldo em atraso estimado / Capacidade de renegociação por mês / Carteira negociada por mês.

**Potencial com IA:** Barras de capacidade de renegociação por mês (com o marcador "Carteira em atraso: cerca de [N] contratos") e de tempo para percorrer a carteira. Indicadores: Dívida renegociada a mais no primeiro mês / Carteira negociada por mês com IA / Capacidade equivalente estimada ([X a Y] pessoas, no ritmo atual da equipe). Frase: A equipe segue com os casos que exigem análise, decisão ou negociação personalizada. Nota: a nota original da faixa conservadora, com "{daInst}".

**Selos por dimensão:** Pronto para o agente (nota 2 ou mais) / Ajustar (nota 1) / Resolver antes do piloto (política, autorização ou dados em 0) / Ponto de atenção (régua ou canal em 0)

**Leitura de cada resposta:**

| Dimensão | Resposta | Leitura |
|---|---|---|
| Régua | A mesma mensagem para todos | Hoje a proposta é igual para todos. O agente rende mais quando a proposta considera a capacidade de pagamento de cada {cliente}. |
| Régua | Mensagens por faixa de atraso | Já existe segmentação por atraso. Falta considerar a capacidade de pagamento, que é o que define uma parcela que cabe no bolso. |
| Régua | Propostas por perfil | {inst} já separa propostas por perfil. Esse critério pode orientar o agente desde o primeiro contato. |
| Régua | Proposta ajustada caso a caso | A proposta já é ajustada caso a caso. O agente pode fazer esse ajuste em mais conversas e deixar a equipe com as exceções. |
| Canal | Ligação telefônica | A negociação depende de ligação. No WhatsApp, o {cliente} responde no tempo dele, inclusive fora do horário comercial. |
| Canal | SMS ou e-mail | A negociação acontece por SMS ou e-mail. Para o agente entrar, ela precisa ir para o WhatsApp. |
| Canal | WhatsApp com atendente | O WhatsApp já é o canal principal. O agente pode assumir as etapas operacionais e passar as exceções com o histórico. |
| Canal | WhatsApp com alguma automação | O WhatsApp já tem automação. O agente entra no canal que os {clientes} já usam e leva a negociação até a proposta. |
| Política | Cada caso depende de aprovação | Cada caso depende de aprovação. Sem alçadas escritas, o agente não fecha acordos sozinho. |
| Política | Faixas não escritas | As faixas existem, mas não estão escritas. Documentá-las vem antes do piloto. |
| Política | Regras documentadas por faixa | As regras estão documentadas por faixa. Esse é o ponto de partida para configurar as alçadas do agente. |
| Política | Regras parametrizadas no sistema | As regras estão parametrizadas no sistema. O agente pode consultar as condições e propor acordos dentro das alçadas. |
| Dados | Planilhas e relatórios exportados | A consulta depende de planilhas e relatórios. O agente precisa de uma forma de consultar saldo, atraso e condições. |
| Dados | Sistema central, sem API | O sistema central ainda não tem API. É preciso um caminho simples para o agente consultar saldo e condições. |
| Dados | API que a TI pode liberar | O sistema tem API que a TI pode liberar. Uma integração simples já viabiliza o piloto. |
| Dados | API já usada em canais digitais | A API já atende outros canais digitais. A integração do agente pode seguir o mesmo caminho. |
| Consentimento | Não sabemos | Não há clareza sobre quem autorizou contato por WhatsApp. Confirme esse ponto antes do piloto. |
| Consentimento | Só uma parte da base | Só parte dos {clientes} autorizou o contato. Isso limita o tamanho da carteira do piloto. |
| Consentimento | A maioria, com registro | A maioria dos {clientes} autorizou o contato, com registro. O contato pelo WhatsApp fica documentado desde o início. |

**O que as suas respostas mostram juntas (no máximo duas):**

- WhatsApp sem autorização mapeada: A negociação já acontece no WhatsApp, mas a autorização de contato não está mapeada. Com o agente, o volume de contatos cresce, e esse ponto pesa mais.
- WhatsApp com autorização parcial: {inst} já negocia pelo WhatsApp, mas a autorização de contato não cobre toda a base.
- Dados prontos, regras não: [Os dados já estão disponíveis por API. / A TI pode liberar os dados por API.] O que falta para o agente negociar sozinho são as regras escritas.
- Regras prontas, dados não: As regras já estão escritas. O que falta é o agente consultar os dados de cada contrato.
- Régua por perfil, canal fora do WhatsApp: As propostas já variam por perfil, mas a conversa ainda depende de ligação, SMS ou e-mail. Levar a negociação para o WhatsApp destrava o agente.
- Menos de 1 renegociação por pessoa por dia, com 12 pessoas ou mais: Cada pessoa fecha menos de 1 renegociação por dia. Isso pode indicar que a negociação divide tempo com outras demandas, como acontecia com os gerentes da Crediauc.

**Caminho para o próximo nível:** {inst} está a [N] pontos do nível "[nível]". O caminho recomendado, começando pelo ponto que mais limita o agente: [dimensão]: de "[resposta atual]" para "[resposta sugerida]". Nesse nível, a faixa passa de [a a b] para [c a d] vezes a capacidade atual: [X a Y] renegociações por mês, com a mesma equipe. No nível mais alto: {inst} já está no nível mais alto do diagnóstico. O próximo passo é levar o agente para a operação contínua.

**Plano de piloto:** formato por nível ("Primeiro, um workshop para organizar [...]. Depois, uma campanha com data para acabar, com os {clientes} que já autorizaram contato." / "Uma campanha de 5 a 15 dias, com data para acabar, como a Crediauc fez no Desenrola. Carteira bem definida, prazo claro e indicadores de contratos e valor renegociado." / "Uma campanha curta para definir quais casos passam para a equipe. Depois, a operação contínua."). Linhas, conforme cada resposta: Carteira inicial / Canal / Proposta / Alçadas / Dados / Equipe / Linha de base / Indicadores. A linha do ponto crítico recebe o selo "Prioridade". Substitui os "Próximos passos" da versão anterior, que repetiam o plano.

**Case Sicoob Crediauc:** tabela do artigo, mais uma frase por tipo (cooperativa: "A Crediauc também é uma cooperativa de crédito, com mais de 92 mil cooperados. Lá, os gerentes dividiam o tempo entre a agência e as negociações."; demais: "O case é de uma cooperativa, mas o formato se aplica {ao seu banco / à sua financeira / à sua instituição}: o agente negocia pelo WhatsApp, dentro das suas regras, e passa as exceções com o histórico."), uma frase sobre a dívida média comparada ao valor médio renegociado por contrato no case (cerca de R$ 3,6 mil a R$ 3,9 mil) e o limite: O case é uma campanha curta. Não é taxa de conversão nem média de mercado. Por isso o diagnóstico usa uma faixa conservadora, e o piloto mede o resultado real {daInst}. Link: Ler o case.

**Conversa com especialista (um clique, sem novo formulário):**

| Nível | Título | Texto |
|---|---|---|
| Preparar a base | Quer organizar esses pontos com a Ubots? | O time da Ubots pode revisar o diagnóstico com você e ajudar {inst} a organizar [...] antes de um piloto. |
| Pronta para piloto | Quer desenhar o piloto {daInst}? | O time da Ubots pode revisar o diagnóstico com você e definir carteira, prazo e indicadores para um piloto de 5 a 15 dias. |
| Pronta para escalar | Quer levar o agente para a operação contínua? | O time da Ubots pode avaliar com você a integração via API e os critérios de transbordo para a equipe. (Sem API: "...como o agente vai consultar os dados e quais casos passam para a equipe.") |

- **Botão:** Conversar com um especialista
- **Microcopy:** Sem novo formulário. O especialista recebe este diagnóstico.
- **Confirmação:** Pedido registrado. O time da Ubots vai falar com você pelo WhatsApp [número], com este diagnóstico em mãos.
- **Sem registro possível:** Abrimos a página de contato da Ubots em uma nova aba. / Não conseguimos registrar o pedido agora. Abrimos a página de contato da Ubots em uma nova aba.

**Como calculamos:** Capacidade hoje: pessoas × renegociações por pessoa por dia × 21 dias úteis. Com IA: capacidade hoje × [a a b], conforme o nível de prontidão (2 a 3, 3 a 5 ou 4 a 7 vezes). Saldo em atraso: contratos em atraso × valor médio da dívida. Dívida renegociada a mais no primeiro mês: renegociações a mais, limitadas aos contratos em atraso, × valor médio da dívida. A estimativa não considera novos atrasos nem a taxa de aceite das propostas. As faixas são premissas conservadoras, não uma promessa de resultado.

**Ações:** Salvar em PDF / Refazer diagnóstico

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

### Novidades da versão 2 no painel

- **Selo:** Pediu conversa (lista e detalhe), com "Pediu conversa em [data]".
- **Lista:** "Ponto crítico: [dimensão]" abaixo do nível.
- **Coluna "Potencial adicional":** [valor] no primeiro mês (um valor só quando os extremos coincidem). O saldo a mais vale para o primeiro mês: depois disso, a fila já é menor.
- **Detalhe:** Saldo em atraso estimado / Ponto crítico / O que o lead viu (as 3 linhas do resumo e as leituras cruzadas; para leads da versão anterior, "Leitura do diagnóstico", com a nota "Este lead viu a versão anterior do resultado, sem a prioridade e as leituras cruzadas.") / Perguntas para a primeira ligação, conforme o ponto crítico.
- **CSV:** colunas novas no fim: Pediu conversa, Data do pedido, Ponto crítico, Saldo em atraso estimado, Meses para percorrer a carteira hoje, Meses com IA (mínimo e máximo).

**Botões:** Exportar CSV / Limpar dados de demonstração

**Confirmação de limpeza:** Remover todos os leads de demonstração? Essa ação não pode ser desfeita.  
**Botões:** Remover leads / Cancelar

**Lista vazia:** Ainda não há leads no painel. Ao concluir um diagnóstico em `/diagnostico`, os dados aparecem aqui.

**Toast de novo lead (opcional, ao voltar para o painel):** Novo diagnóstico recebido: [instituição], [nível].
