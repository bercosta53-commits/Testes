# Radar Velora · Melhorias na tela de Sinais

> Documento de produto para o time de desenvolvimento. Escopo: ajustes básicos de confiança, ordenação e filtros, gráfico, estágio de compra e **playbooks combinados**.
>
> **Premissa:** os ângulos de abordagem foram escritos para quem vende a lideranças de Marketing/Growth (persona que já aparece na tela). Ajustar à oferta do Velora antes de publicar.

---

## Sumário

1. [Ajustes básicos de confiança](#1-ajustes-básicos-de-confiança)
2. [Ordenação e filtros](#2-ordenação-e-filtros)
3. [Gráfico](#3-gráfico)
4. [Estágio de compra](#4-estágio-de-compra)
5. [Playbooks combinados](#5-playbooks-combinados)
6. [Ordem de entrega](#6-ordem-de-entrega)

**Por que esta ordem:** os ajustes básicos vêm primeiro porque, se o vendedor duvida do número, nada do resto é usado. O estágio de compra diz **quem priorizar**; o playbook combinado diz **o que fazer**. Juntos, são o diferencial.

---

## 1. Ajustes básicos de confiança

| # | Problema observado | Ajuste | Critério de aceite |
|---|---|---|---|
| 1.1 | A lista diz "mais forte primeiro", mas Bridge & Co. (+8.34) aparece acima de Contraktor (+21.94). | Garantir que a ordem siga o critério do rótulo. O rótulo passa a refletir a ordenação escolhida (ver seção 2). | Para qualquer ordenação, o item *n* nunca tem valor maior que o item *n−1* no critério exibido. |
| 1.2 | Sinais de junho e agosto aparecem na caixa de "Hoje". | Cada tipo de sinal ganha uma **janela de validade** (tabela abaixo). Sinal vencido sai da caixa e continua só no histórico da conta e no gráfico. | Nenhum sinal fora da janela do seu tipo aparece na caixa de "Hoje". |
| 1.3 | "33 ↗ +49" é ambíguo: não diz o período nem o valor anterior. | Mostrar a variação com o período e a base: `33 ↗ +18 em 30 dias (era 15)`. | Toda variação exibida tem período explícito; passar o mouse mostra o valor anterior. |
| 1.4 | Contribuições com duas casas decimais (+23.25, +19.61) sugerem uma precisão que o modelo não tem. | Exibir inteiros (`+23`) e uma **barra de força** de 3 níveis (forte, médio, contexto). Os decimais ficam só no detalhe técnico do score. | Lista e cards não exibem decimais. |
| 1.5 | "Falar com Liderança de Marketing/Growth do Astrea (a identificar)". | Nunca exibir um placeholder. Mostrar a persona e: (a) os nomes encontrados no enriquecimento, ou (b) um botão explícito `Buscar contatos`. | O texto "(a identificar)" não aparece em nenhum estado da tela. |
| 1.6 | 2 Atenção + 117 Monitoramento = 119, mas a caixa tem 171 sinais. | Os contadores do topo passam a ser os **estágios de compra** (seção 4) e sempre somam o total. Contas fora de qualquer faixa aparecem como "Frio". | A soma dos contadores do topo é igual ao total exibido. |

### Janela de validade por tipo de sinal (proposta inicial)

| Tipo de sinal | Janela na caixa "Hoje" | Meia-vida no score |
|---|---|---|
| Lançamento ligado a IA | 45 dias | a manter a atual |
| Lançamento de produto | 45 dias | a manter a atual |
| Bloco de contratações | 30 dias | a manter a atual |
| Nova parceria | 60 dias | a manter a atual |
| Nova unidade | 90 dias | a manter a atual |

> A janela da caixa é diferente da meia-vida: a meia-vida define quanto o sinal pesa no score; a janela define até quando ele merece ação. Calibrar ambas com os dados de Útil/Ruído.

---

## 2. Ordenação e filtros

### 2.1 Ordenação

Seletor único no cabeçalho da lista, substituindo o texto fixo "mais forte primeiro".

| Opção | Definição | Uso |
|---|---|---|
| **Maior aceleração** *(padrão sugerido)* | Variação do score da conta nos últimos 7 dias | Quem está esquentando **agora** |
| Força do sinal | Contribuição do sinal ao score no dia de hoje (já com decaimento) | Os sinais mais relevantes |
| Mais recente | Data do sinal, da mais nova para a mais antiga | Ver o que chegou |
| Score da conta | Score total atual da conta | Quem já está quente |
| Tier / Fit | Tier da conta, depois score | Focar nas contas ICP |

O critério de desempate é sempre a data mais recente.

### 2.2 Filtros

Chips acima da lista, cada um com a **contagem** de resultados: `Lançamento IA (12)` `Parceria (8)`.

| Filtro | Tipo | Valores |
|---|---|---|
| Estágio de compra | múltipla escolha | Frio, Aquecendo, Ativo, Pronto |
| Tipo de sinal | múltipla escolha | Lançamento IA, Lançamento de produto, Contratações, Nova parceria, Nova unidade |
| Playbook ativo | múltipla escolha | Lista dos playbooks combinados (seção 5) + "Qualquer combinado" |
| Tier | múltipla escolha | A, B, C |
| Janela | escolha única | 7, 30 ou 90 dias |
| Setor | múltipla escolha | Setores da base |
| UF | múltipla escolha | UFs da base |
| Responsável | múltipla escolha | Usuários + "Sem responsável" |
| Só não vistos | liga/desliga | — |

**Regras de comportamento**

- Dentro de um mesmo filtro, os valores combinam por **OU**; entre filtros diferentes, por **E**.
- Os contadores do cabeçalho ("Pronto", "Ativo"...) são clicáveis e aplicam o filtro de estágio.
- Os filtros ficam na URL, para que um link compartilhado abra a mesma visão.
- **Visões salvas**: o usuário salva uma combinação com nome (ex.: "Tier A + IA nesta semana") e ela aparece no menu lateral.
- Botão `Limpar filtros` visível sempre que houver algum ativo.
- Estado vazio com a sugestão de remover o filtro mais restritivo.
- Os atalhos `j` / `k` continuam funcionando sobre a lista filtrada.

### 2.3 Alternar "Por sinal" / "Por conta"

Hoje a lista é de sinais, mas o detalhe é da conta, então uma conta com três sinais aparece espalhada.

- **Por sinal** (atual): um item por sinal.
- **Por conta**: um item por conta, mostrando o sinal mais forte e um selo `+2 sinais`. Esta é a visão natural para trabalhar com estágios e playbooks combinados.

### 2.4 Item da lista (novo layout)

```
┌──────────────────────────────────────────────────────────────┐
│ [logo] Aurum Software  B   ● Ativo            27 out   ╱‾‾  │
│        Lançamento do agente jurídico Jux           ▮▮▮ +23  │
│        ⚡ Lançamento com tração                              │
└──────────────────────────────────────────────────────────────┘
```

- Selo de estágio (seção 4).
- Barra de força + valor inteiro, no lugar do decimal.
- Mini-gráfico de 30 dias (seção 3.2).
- Selo do playbook combinado, quando houver (seção 5).

---

## 3. Gráfico

### 3.1 Gráfico principal do detalhe da conta

Sai do canto direito e passa a ocupar **a largura total**, logo abaixo do título da conta.

| Elemento | Especificação |
|---|---|
| Período | Opções de 30, 90 e 180 dias; padrão 90 |
| Eixo Y | Fixo de 0 a 100, para que contas diferentes sejam comparáveis |
| Linha do score | Linha em degraus: sobe com cada sinal e desce com o decaimento |
| **Faixas de estágio** | Faixas horizontais suaves no fundo (Frio, Aquecendo, Ativo, Pronto), com o nome na margem direita. O vendedor vê quanto falta para a próxima faixa |
| Marcadores de sinal | Um ponto por sinal, com **tamanho pela força** e **cor pelo tipo** de sinal |
| **Projeção de decaimento** | Linha tracejada dos próximos 30 dias, supondo que não chegue sinal novo, com o texto: "sem sinal novo, cai para 18 em 30 dias" |
| Anotação de playbook | Marca vertical no dia em que um playbook combinado foi ativado, com o nome dele |
| Interação | Passar o mouse no marcador mostra título, data e contribuição; clicar destaca o sinal no bloco "Por que está com N" |
| Rótulos | Sem sobreposição: quando dois rótulos colidem, um deles vai para o tooltip |
| Legenda | Os tipos de sinal, clicáveis para esconder ou mostrar |

O texto técnico "Score de hoje… meia-vida…" sai da tela principal: a projeção tracejada explica o decaimento visualmente. O texto vai para um link "Como o score é calculado".

### 3.2 Mini-gráfico na lista

- Últimos 30 dias do score da conta, em uma linha.
- Último ponto na cor do estágio atual.
- Sem eixos nem rótulos; passar o mouse mostra `Δ7d: +12`.

É a mudança que mais deixa a lista dinâmica: dá para ver a tendência sem abrir a conta.

---

## 4. Estágio de compra

Substitui os status atuais "Monitoramento" e "Atenção" por quatro estágios que contam a trajetória da conta.

### 4.1 Definição

| Estágio | Regra (limiares iniciais, a calibrar) | Leitura para o vendedor |
|---|---|---|
| **Frio** | Score < 15, ou nenhum sinal válido | Fora do radar agora |
| **Aquecendo** | Score de 15 a 29 | Algo começou a acontecer; acompanhar |
| **Ativo** | Score de 30 a 49, **ou** 2 ou mais tipos de sinal diferentes em 30 dias | Há um movimento real; preparar a abordagem |
| **Pronto** | Score ≥ 50, **ou** playbook combinado ativo em conta Tier A/B | Abordar agora |

Mapeamento com os status atuais: "Monitoramento" corresponde a Aquecendo e Ativo; "Atenção" corresponde a Pronto.

### 4.2 Regras

- **Histerese:** uma conta só desce de estágio quando fica 5 pontos abaixo do limiar. Isso evita a conta oscilar entre estágios a cada dia.
- **Mudança de estágio é um evento.** Subir de estágio gera um alerta na caixa: "3 contas entraram em Pronto hoje". Descer não gera alerta, só aparece no histórico.
- O estágio aparece em quatro lugares: selo na lista, contadores do topo, faixas no gráfico e cabeçalho do detalhe da conta.
- Os contadores do topo passam a ser `Pronto · Ativo · Aquecendo · Frio` e somam o total (resolve o ajuste 1.6).

### 4.3 Critério de aceite

- Toda conta tem exatamente um estágio.
- O estágio exibido é coerente com o score e com as faixas do gráfico.
- A mudança de estágio fica registrada com data no histórico da conta.

---

## 5. Playbooks combinados

### 5.1 Por que combinação

Um sinal isolado é ambíguo: um lançamento pode ser só um anúncio. **Dois sinais que contam a mesma história** são uma narrativa: um lançamento seguido de vagas de aquisição significa que a empresa está investindo para o produto vender.

É também o principal diferencial frente a ferramentas como o 6sense, que mostram *que* a conta está ativa, mas não *qual história* os sinais contam.

### 5.2 Regras de detecção

- Um playbook combinado é ativado quando **dois ou mais sinais** dos tipos definidos aparecem **na mesma conta** dentro da **janela de co-ocorrência** do playbook.
- **Prioridade:** quando um combinado é ativado, ele substitui os playbooks de sinal isolado daquela conta. Os sinais isolados passam a aparecer como evidência do combinado.
- Se mais de um combinado for ativado, vale o de maior prioridade no catálogo (5.4).
- O combinado expira quando o sinal mais antigo da combinação sai da sua janela de validade.
- Ativar um combinado conta para o estágio de compra (seção 4).

### 5.3 Anatomia de um playbook

| Campo | Pergunta que responde |
|---|---|
| Gatilho | Quais sinais, em qual janela, com quais condições (tier, setor) |
| Leitura | O que provavelmente está acontecendo na empresa |
| Dor provável | Que problema isso costuma gerar |
| Quem procurar | Persona principal e secundária; quem evitar |
| Janela de ação | Até quando a abordagem faz sentido |
| Ângulo | Como abrir a conversa |
| Não dizer | O que soa como vigilância ou erra a leitura |
| Pergunta de descoberta | A pergunta que valida a hipótese na primeira conversa |
| Sequência | Canais e dias |
| Prova | Qual caso ou dado usar |
| Sucesso | O que conta como resultado |

### 5.4 Catálogo inicial

Em ordem de prioridade.

#### A. Lançamento com tração

| Campo | Conteúdo |
|---|---|
| Gatilho | Lançamento (produto ou IA) **+** bloco de contratações de aquisição/receita, até 30 dias de distância |
| Leitura | Não foi só um anúncio: estão investindo para o produto vender |
| Dor provável | Transformar o lançamento em pipeline; rampa do time novo; prova de valor rápida |
| Quem procurar | Head de Marketing/Growth; secundário: quem lidera o time que está sendo contratado |
| Janela de ação | 30 dias |
| Ângulo | "Como fazer o lançamento sair do anúncio e virar pipeline" |
| Não dizer | "Vi que vocês abriram vagas" |
| Descoberta | "Qual é a meta de adoção do [produto] no próximo trimestre, e de onde vocês esperam que ela venha?" |
| Sequência | D0 LinkedIn · D2 e-mail · D5 ligação · D10 e-mail com caso |
| Prova | Caso de cliente que acelerou um lançamento |
| Sucesso | Reunião marcada em até 21 dias |

#### B. Expansão via canal

| Campo | Conteúdo |
|---|---|
| Gatilho | Nova parceria **+** nova unidade, até 60 dias de distância |
| Leitura | Estão entrando em um mercado novo apoiados por um parceiro |
| Dor provável | Marca desconhecida na praça nova; coordenar o marketing com o parceiro; medir o que vem do canal |
| Quem procurar | Alianças/Canais; Marketing; gerente da nova unidade |
| Janela de ação | 60 dias |
| Ângulo | "Como gerar demanda local junto com o parceiro desde o primeiro mês" |
| Não dizer | Detalhes do acordo com o parceiro que não foram públicos |
| Descoberta | "Quanto da demanda da nova praça vocês esperam que venha do parceiro, e quanto precisa ser construída por vocês?" |
| Sequência | D0 e-mail · D3 LinkedIn · D7 ligação |
| Sucesso | Reunião marcada em até 30 dias |

#### C. Escalando operação

| Campo | Conteúdo |
|---|---|
| Gatilho | Nova unidade **+** bloco de contratações, até 45 dias de distância |
| Leitura | A expansão está saindo do papel com time próprio |
| Dor provável | Rampa de time novo; padronizar processo entre unidades |
| Quem procurar | Operações/Receita; gerente regional |
| Janela de ação | 45 dias |
| Ângulo | "Como fazer a unidade nova chegar à meta sem esperar o time amadurecer" |
| Não dizer | Citar as vagas diretamente |
| Descoberta | "Em quanto tempo a unidade nova precisa se pagar?" |
| Sucesso | Reunião marcada em até 30 dias |

#### D. Reposicionamento

| Campo | Conteúdo |
|---|---|
| Gatilho | Lançamento **+** nova parceria, até 45 dias de distância |
| Leitura | Estão mudando a proposta de valor ou entrando em uma categoria nova |
| Dor provável | Mensagem nova ainda não testada; co-marketing com o parceiro |
| Quem procurar | Marketing de produto; Head de Marketing |
| Janela de ação | 45 dias |
| Ângulo | "Como validar o novo posicionamento com o mercado antes de escalar a mídia" |
| Descoberta | "O que muda no cliente ideal de vocês com esse movimento?" |
| Sucesso | Reunião marcada em até 30 dias |

#### E. Lançamento sem braço comercial

| Campo | Conteúdo |
|---|---|
| Gatilho | Lançamento **sem** nenhuma contratação comercial ou de marketing nos 45 dias seguintes |
| Leitura | Lançaram, mas não têm estrutura para levar o produto ao mercado |
| Dor provável | Falta de capacidade de execução; para quem vende serviço, é uma oportunidade ainda melhor que a do playbook A |
| Quem procurar | Fundador ou C-level; Head de Marketing |
| Janela de ação | do dia 30 ao dia 60 após o lançamento |
| Ângulo | "Como ganhar tração com o time que vocês já têm" |
| Descoberta | "Quem hoje é responsável por fazer o [produto] chegar aos clientes?" |
| Sucesso | Reunião marcada em até 30 dias |
| ⚠ Confiança | Depende de uma **condição negativa** (ausência de vagas). Só ativar quando a cobertura de dados de vagas da conta for confiável; exibir com selo "confiança média" |

#### F. Momento de mudança

| Campo | Conteúdo |
|---|---|
| Gatilho | 3 ou mais sinais de tipos diferentes em 60 dias, sem combinação de A a E |
| Leitura | A empresa está em transformação, mesmo sem uma história única |
| Dor provável | Prioridades em disputa; orçamento sendo redistribuído |
| Quem procurar | C-level ou Head de Marketing |
| Janela de ação | 45 dias |
| Ângulo | Consultivo e aberto: "Muita coisa mudando aí. O que está no topo da lista para o próximo trimestre?" |
| Sucesso | Conversa de descoberta |

### 5.5 Exemplo completo: Aurum Software

**Sinais:**
- 27/out: Lançamento do agente jurídico Jux (Lançamento ligado a IA)
- 13/nov: Bloco de 2 vagas operacionais de aquisição/receita

**Combinação:** 17 dias de distância, dentro da janela de 30 dias → **A. Lançamento com tração**.
**Efeito:** a conta (Tier B) vai para o estágio **Pronto**, e o playbook A substitui os playbooks isolados.

**Rascunho de primeira mensagem** (cita o mercado, não a vigilância):

> Oi, [nome]. Acompanho o mercado de lawtech e o movimento de agentes jurídicos está acelerando rápido. Na maioria das empresas que vemos, o desafio depois do lançamento não é o produto, é fazer o canal de aquisição acompanhar. Faz sentido trocar 20 minutos sobre como vocês estão pensando a tração do Jux?

### 5.6 Como aparece na tela

Bloco novo no detalhe da conta, logo abaixo de "Por que [conta] está com N":

```
┌ ⚡ Playbook: Lançamento com tração ────────── janela: 13 dias restantes ┐
│ Evidência  Lançamento do Jux (27 out) + 2 vagas de aquisição (13 nov)   │
│ Leitura    Estão investindo para o Jux vender, não só anunciando.       │
│ Procure    Head de Marketing/Growth → [3 nomes encontrados]             │
│ Ângulo     Transformar o lançamento em pipeline                         │
│ Não diga   "Vi que vocês abriram vagas"                                 │
│ Pergunte   "Qual a meta de adoção do Jux no próximo trimestre?"         │
│                                                                         │
│ ☐ D0 LinkedIn  ☐ D2 E-mail  ☐ D5 Ligação  ☐ D10 Caso  [Copiar mensagem] │
└─────────────────────────────────────────────────────────────────────────┘
```

- O selo `⚡ Lançamento com tração` também aparece no item da lista.
- O dia da ativação aparece como anotação no gráfico (seção 3.1).
- Marcar um passo da sequência registra o evento (seção 5.7).

### 5.7 Ciclo de aprendizado

1. Cada abordagem fica registrada com o playbook usado.
2. O Radar mede o funil por playbook: **ativado → abordado → respondeu → reunião → oportunidade**.
3. Útil/Ruído, que já são coletados, passam a ser registrados também por playbook.
4. Uma visão de desempenho mostra a taxa de cada playbook, por exemplo: "Lançamento com tração: 31% de resposta · Momento de mudança: 6%".
5. Revisão mensal: playbooks com 30 ou mais abordagens e desempenho abaixo do combinado são reescritos ou aposentados. Dá para testar dois ângulos do mesmo playbook (teste A/B).

**Eventos a registrar:** `playbook_ativado`, `playbook_visualizado`, `passo_concluido`, `mensagem_copiada`, `resposta_recebida`, `reuniao_marcada`, `feedback_util`, `feedback_ruido`, `playbook_expirado`.

### 5.8 Modelo de dados (sugestão)

Os playbooks ficam como configuração, para o time comercial editar sem precisar de deploy:

```yaml
id: lancamento-com-tracao
nome: Lançamento com tração
prioridade: 1
versao: 1
gatilho:
  todos:
    - tipo: [lancamento_produto, lancamento_ia]
    - tipo: contratacoes
      categoria: [aquisicao, receita]
  janela_coocorrencia_dias: 30
  condicoes:
    tier: [A, B, C]
janela_acao_dias: 30
efeito:
  estagio_minimo: pronto        # só para Tier A/B
conteudo:
  leitura: "Estão investindo para o produto vender, não só anunciando."
  dor: ["Transformar lançamento em pipeline", "Rampa do time novo"]
  quem: { principal: "Head de Marketing/Growth", secundario: "Líder do time em contratação" }
  angulo: "Como fazer o lançamento sair do anúncio e virar pipeline"
  nao_dizer: ["Vi que vocês abriram vagas"]
  descoberta: "Qual é a meta de adoção do {produto} no próximo trimestre?"
  sequencia:
    - { dia: 0, canal: linkedin }
    - { dia: 2, canal: email }
    - { dia: 5, canal: ligacao }
    - { dia: 10, canal: email, conteudo: caso }
  sucesso: { evento: reuniao_marcada, prazo_dias: 21 }
```

Para o playbook E, o gatilho precisa aceitar uma condição de ausência (`nenhum: contratacoes`) e um requisito de cobertura de dados.

### 5.9 Governança

- **Quem escreve:** o melhor vendedor + marketing. Produto mantém a estrutura, não o conteúdo.
- **Versionamento:** cada alteração gera uma nova versão; as métricas são separadas por versão.
- **Revisão:** mensal, com a visão de desempenho (5.7).
- **Começar pequeno:** na v1, entregar os playbooks A, B e F com conteúdo fixo e checklist. A geração de mensagem e a visão de desempenho vêm depois.

---

## 6. Ordem de entrega

| Fase | Prazo | Entrega |
|---|---|---|
| **Fase 1: confiança** | 1–2 semanas | Ajustes 1.1 a 1.6 · seletor de ordenação · filtros em chips · gráfico principal em largura total com rótulos corrigidos |
| **Fase 2: dinâmica** | ~1 mês | Estágios de compra (substituem Monitoramento/Atenção) · faixas de estágio e projeção no gráfico · mini-gráfico na lista · alternar Por sinal/Por conta · visões salvas |
| **Fase 3: consultiva** | ~2 meses | Playbooks combinados A, B e F (conteúdo fixo + detecção + bloco na tela + selo na lista) · registro de eventos |
| **Fase 4: aprendizado** | contínuo | Playbooks C, D e E · visão de desempenho por playbook · rascunho de mensagem · teste A/B de ângulos |

### Fora do escopo deste documento

Mapa Fit × Momento, comitê de compra com nomes, resumos no Slack/e-mail e integração com CRM ficam para uma próxima rodada.
