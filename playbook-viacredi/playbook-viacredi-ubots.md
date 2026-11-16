# Playbook · Testando agentes de IA na oferta de crédito

Brief de produção para o Claude Code. Case Viacredi + Ubots. 11 slides (eram 10; o slide de resultados entrou na revisão de 16/11), 16:9, mesmo modelo e recursos do Playbook Sicoob Crediauc.

---

## 0. Como usar este arquivo

1. Coloque este .md na raiz do projeto, junto com a pasta `assets/` (lista na seção 6).
2. Peça ao Claude Code: "Leia `playbook-viacredi-ubots.md` e construa o deck seguindo as seções 2 a 5. Depois rode o QA da seção 7."
3. Saídas esperadas:
   - `dist/playbook-viacredi-ubots.html`: deck navegável, um `<section>` de 1440×810 por slide
   - `dist/playbook-viacredi-ubots.pdf`: PDF com 11 páginas de 1440×810 pt, exportado via Playwright (Chromium), texto selecionável
   - `dist/previews/slide-01.png` … `slide-10.png` para revisão

Regras de copy (não negociáveis):
- O texto deste arquivo é a copy final. Não reescreva, não acrescente adjetivos, não troque palavras.
- Nenhum travessão (— ou –) em nenhum texto visível.
- Tudo marcado com `[A CONFIRMAR]` deve aparecer destacado em magenta no rascunho, para ninguém publicar sem revisão.
- Números do case aparecem pequenos e contextualizados. Nenhum slide tem número gigante como herói.

---

## 1. Narrativa

**Espinha**
- Era uma vez: instituições financeiras vendiam crédito com bots de fluxo e roteiros fechados.
- Todo dia: cada risco novo virava uma regra nova.
- Até que um dia: chegou a IA generativa, e o instinto foi empilhar regras nela também.
- Por causa disso: o agente ficou mecânico, um bot de fluxo mais caro.
- Por causa disso: a Viacredi tirou o excesso de regras, explicou ao agente o papel dele e manteve só os guardrails críticos.
- Até que finalmente: uma conversa sobre reforma de cozinha virou contratação, e o método ficou replicável.

**Posição:** em oferta de crédito com IA generativa, contexto bem escrito protege e vende mais do que regra empilhada. Segurança onde importa, conversa de verdade no resto.

**Protagonista:** Giovanna, responsável pelo projeto na Viacredi. As falas dela conduzem o material.

**Densidade:** material de leitura (PDF baixado da LP). Títulos são frases completas. Alguns slides têm mais texto (2, 4, 7), outros são dominados por wireframe (3, 5, 6, 8, 9).

---

## 2. Sistema visual (Ubots)

Tokens:

```css
--ouro:        #FDC348;  /* acento, palavras destacadas em títulos, CTA, numerais */
--escuro:      #070401;  /* texto principal e fundos dark */
--branco:      #FFFDF9;  /* fundo dominante */
--cinza-medio: #6C6C71;  /* texto secundário, legendas */
--cinza-claro: #AFAFB4;  /* bordas, placeholders, linhas de campo */
--ouro-suave:  #FFF3D1;  /* gradiente do fundo claro e caixas de "Entrega" (derivado do ouro) */
```

- Títulos: Poppins Bold (Google Fonts). Corpo: Nunito Regular/SemiBold.
- **Regra dura: nenhum azul, nenhum teal, em nada.** O Crediauc tem um bloco teal no slide 6 (cor do Sicoob); aqui ele vira `--escuro`.
- Ícones: evitar. O motivo decorativo da marca são numerais tipográficos grandes em ouro (1, 2, 3) e o zigue-zague ondulado em ouro do Crediauc.
- Fundo claro: `--branco` com gradiente radial suave de `--ouro-suave` no canto superior direito, como no Crediauc.
- Slides escuros: 4 e 10 (alternância alto/calmo; nunca dois escuros seguidos).
- Contraste: corpo e legendas com no mínimo 4,5:1. Texto `--cinza-medio` só sobre `--branco`. Ouro nunca como cor de texto pequeno sobre branco (falha contraste): sobre branco, ouro só em títulos ≥ 40px ou como fundo de pílula/botão com texto escuro.

Componentes recorrentes (copiar do Crediauc):
- **Header:** logo Ubots | divisória | logo Viacredi, canto superior esquerdo. Contador `02 / 11` no canto superior direito.
- **Pílula de seção:** fundo `--ouro-suave`, texto 12px: `Playbook · Agentes de IA na Oferta de Crédito`.
- **Título:** Poppins Bold 44px, com 2 a 4 palavras em `--ouro` (indicadas abaixo entre `==assim==`).
- **Subtítulo:** Nunito 16px, `--cinza-medio`, máximo 2 linhas.
- **Campo para preencher:** rótulo Nunito SemiBold 12px + caixa com borda 1px `--cinza-claro`, raio 8px, placeholder em cinza.
- **Caixa "Entrega":** fundo `--ouro-suave`, rótulo "Entrega:" em negrito.
- **Card de citação da Giovanna:** aspas grandes em ouro, texto Nunito Italic 18px, assinatura "Giovanna · [cargo A CONFIRMAR], Viacredi". Foto circular opcional (ver seção 6).
- **Mock de WhatsApp:** cabeçalho escuro com nome "Agente Viacredi", balões do cooperado em branco com borda e do agente em `--ouro-suave`. Sem logo do WhatsApp em destaque (um ícone pequeno basta, como no Crediauc).
- **Anotação numerada:** círculo ouro com numeral escuro, ligado por linha fina ao ponto do wireframe.

---

## 3. Copy e layout por slide

### Slide 1 · Capa
**Layout:** capa clean (revisão de 16/11). Header só com o logo Ubots. À esquerda: pílula, título, subtítulo e público. À direita: painel ouro com o celular da conversa de contratação e os ícones de IA e WhatsApp. A Viacredi não aparece na capa; o case entra no contexto, a partir do slide 2.

- Pílula: `Guia Prático`
- Título: Como vender crédito ==no WhatsApp== com agentes de IA
- Subtítulo: O método de uma cooperativa que liberou mais de R$ 150 mil em crédito ainda na fase de testes
- Rótulo de público: Material para
- Tags de público: `Cooperativas de Crédito` · `Bancos e Fintechs` · `Instituições Financeiras` · `Serviços Financeiros` · `Financeiras`

---

### Slide 2 · O ponto de partida
**Layout:** texto corrido à esquerda (60%), coluna de cards à direita (40%), card da protagonista na base. Slide com mais texto.

- Título: Entenda o ==ponto de partida==
- Subtítulo: Uma cooperativa de 74 anos decidiu testar IA generativa na venda de crédito, sem abrir mão da proximidade com os cooperados.
- Corpo (esquerda):

  A Viacredi, cooperativa do Sistema Ailos com sede em Blumenau, tem mais de 1 milhão de cooperados e mais de 100 postos em Santa Catarina e no Paraná. A proximidade com os cooperados sempre esteve no centro da sua atuação.

  O desafio era ampliar a oferta de crédito com agentes de IA sem abrir mão da proximidade no atendimento. Era um território novo: a cooperativa usava bots de fluxo, baseados em regras fixas, e ainda não tinha indicadores de IA generativa para orientar o teste.

- Cards à direita, título "Ponto de partida":
  - **Bots de fluxo** · Conversas limitadas a regras e caminhos predefinidos.
  - **Sem histórico** · Sem indicadores prévios de IA generativa para comparar.
  - **Parceria com a Ubots** · Construir e testar um agente de IA para a oferta de crédito.
- Card da protagonista (faixa inferior): **Giovanna** · [cargo A CONFIRMAR] · Conduziu o projeto desde o primeiro teste até a operação atual.

---

### Slide 3 · O erro natural
**Layout:** wireframe comparativo em dois painéis lado a lado, ligados por uma seta, sobre o fundo claro. Citação da Giovanna embaixo à esquerda, callout escuro embaixo à direita.

- Título: Evite ==empilhar regras== no agente
- Subtítulo: Cada "não pode" parecia tornar o agente mais seguro. Na prática, a conversa ficava rígida e o tom, robótico.
- Painel esquerdo, "Instruções por regras" (mock de editor de prompt, linhas riscadas de amarelo suave):
  - Não fale sobre…
  - Não responda se…
  - Não ofereça…
  - Sempre use a frase…
  - Não saia do roteiro…
  - Selo no canto: `+ 1 regra a cada ajuste`
- Painel direito, "Conversa resultante" (mock de WhatsApp curto):
  - Agente: "Olá. Temos uma linha de crédito disponível para você. Deseja saber mais? Responda SIM ou NÃO."
  - Cooperado: "Depende, pra que serve?"
  - Agente: "Não entendi sua resposta. Responda SIM ou NÃO."
- Legenda sob os painéis (11px): Exemplo ilustrativo.
- Citação: "A gente colocava regra atrás de regra: não pode isso, não pode aquilo. E o agente ficava cada vez mais mecânico." [Fala A CONFIRMAR com a Giovanna]
- Callout escuro: Na prática, era IA generativa trabalhando com os mesmos limites de um bot de fluxo.

---

### Slide 4 · A virada (escuro)
**Layout:** fundo `--escuro`. Título e subtítulo no topo, três colunas de wireframe ("Saiu / Entrou / Ficou"), citação grande à direita ou na base, faixa com a mensagem-chave. Slide com mais texto.

- Título: Explique ao agente ==o papel dele==
- Subtítulo: Em julho, a Viacredi reduziu as regras, deixou claro o papel do agente no prompt e preservou os guardrails essenciais de segurança.
- Coluna 1, **O que saiu** (borda tracejada cinza, itens riscados):
  - Regras de comportamento em excesso
  - Roteiro fechado para cada resposta
- Coluna 2, **O que entrou** (borda ouro):
  - O objetivo da conversa
  - O contexto do cooperado e da oferta
  - Liberdade para conversar sobre o que o cooperado trouxer
- Coluna 3, **O que ficou** (fundo ouro, texto escuro):
  - Guardrails críticos de segurança
  - Transparência sobre custos
  - Contratação pelo canal seguro
- Citação: "Quando expliquei ao agente qual era o papel dele e o que ele precisava alcançar, a experiência melhorou na hora. Hoje, quando aparece um problema, eu levo para a própria IA e a gente constrói a solução junto." [Fala A CONFIRMAR com a Giovanna]
- Linha de apoio (cinza claro): Saudação, transbordo e volume de mensagens passaram a ser ajustados com apoio da IA, sem criar uma regra a cada mudança.
- Faixa final (ouro, Poppins 22px): Segurança onde importa, conversa de verdade no resto.

---

### Slide 5 · A conversa da cozinha
**Layout:** wireframe complexo. Mock de celular com a conversa à esquerda (45%); à direita, quatro anotações numeradas ligadas por linhas a pontos da conversa. Título e subtítulo em cima, largura total.

- Título: Deixe a conversa ==seguir o cooperado==
- Subtítulo: Poucos dias após a mudança, uma conversa sobre reforma de cozinha terminou em contratação de crédito, sem roteiro pronto.
- Conversa no celular (substituir pelo print anonimizado aprovado; se não houver print, usar esta reconstituição com a legenda "Reconstituição a partir do relato do projeto"):
  1. Cooperada: "Já tenho um crédito contratado, mas achei bom saber que tem outro disponível."
  2. Agente: "Que bom! Posso perguntar o que você está planejando?"
  3. Cooperada: "Estou reformando a cozinha."
  4. Agente: conversa sobre a reforma (balão com texto em barras, sem conteúdo inventado)
  5. Agente: apresenta a linha de crédito ligada ao plano da reforma (barras)
  6. Cooperada: decide contratar (barras + selo ouro "Contratação")
- Anotações:
  - **1 Escuta** · Em vez de insistir na oferta, o agente procura entender o interesse.
  - **2 Contexto** · A cooperada fala da reforma, e o agente acompanha o assunto com naturalidade.
  - **3 Oferta com sentido** · O crédito passa a fazer sentido dentro do plano da cooperada.
  - **4 Decisão da cooperada** · A cooperada decide contratar. A conversa não seguiu um roteiro pronto.
- Legenda (11px): Conversa anonimizada. Dados da cooperada preservados.

---

### Slide 6 · Liberdade com responsabilidade
**Layout:** três cards de mesma altura, cada um com um mini wireframe. Citação da Giovanna em faixa na base.

- Título: Combine liberdade com ==transparência e segurança==
- Subtítulo: O agente esclarece custos, orienta a contratação pelo canal seguro e envolve o time humano quando necessário.
- Card 1, **Custos às claras**
  - Mini chat: cooperado pergunta sobre os custos da retirada → agente explica que é um crédito com juros e IOF, contextualiza e oferece encaminhar ao time humano para comparar com outras linhas.
  - Linha de apoio: Transparência sem esperar o cooperado insistir.
- Card 2, **Fechamento pelo app**
  - Mini chat: cooperado pergunta se dá para fechar ali mesmo, pelo WhatsApp → agente explica que a contratação é 100% digital pelo aplicativo, por segurança, e envia o passo a passo (lista numerada 1, 2, 3 em barras).
  - Linha de apoio: O canal seguro vira orientação, e não bloqueio.
- Card 3, **Transbordo com contexto**
  - Wireframe de uma "Nota para o time de negócios" (cartão estilo post-it ouro suave):
    - Cooperado: [nome]
    - Interesse: linha de crédito [X]
    - Ponto em aberto: quer comparar com outras linhas
    - Histórico: conversa completa anexada
  - Linha de apoio: O transbordo ficou baixo. Quando ocorre, o time recebe o contexto e continua sem pedir repetição ao cooperado.
- Faixa de citação: "O mercado costuma travar tudo num roteiro fechado. A liberdade guiada por contexto é o que deixa a experiência perto de um atendimento humano bem feito." [Fala A CONFIRMAR com a Giovanna]

---

### Slide 7 · Como o teste aconteceu
**Layout:** linha do tempo horizontal ocupando 65% da largura (5 marcos, numerais ouro), painel lateral "O papel da Ubots" à direita. Slide com mais texto.

- Título: Teste pouco, ==pause e volte melhor==
- Subtítulo: A Viacredi começou com cooperados reais, pequenos volumes e filtros de risco, e usou cada pausa para ajustar o agente.
- Linha do tempo:
  - **Abril a junho** · Testes controlados. Pausas frequentes para refinar o agente, preparar o time e definir os novos indicadores.
  - **Junho** · Pausa total para reestruturar os disparos e planejar a escala.
  - **1ª semana de julho** · Reformulação das instruções e esclarecimento do papel do agente: menos regras e mais contexto.
  - **2ª semana de julho** · Testes retomados com a nova versão do agente.
  - **Até dezembro** · Meta de rodar mais de 10% das ações ativas com agente generativo.
- Painel "O papel da Ubots" (card com borda ouro):

  A Ubots construiu o primeiro agente em parceria com a Viacredi e ofereceu a plataforma para a equipe testar no próprio ritmo. Com o Agent Builder, o time ganhou autonomia: Giovanna já criou quatro agentes sem depender da equipe de implementação.

  Próximos passos: testar um agente mais generalista e expandir para produtos sem risco de crédito, como cartões e aplicações, no onboarding de novos cooperados.

---

### Slide 8 · Os resultados do teste (escuro)
**Layout:** novo (revisão de 16/11, a pedido da Steph): os resultados saem do slide 2 e ganham slide próprio. Card ouro com o resultado de negócio à esquerda; grade 2 × 2 de cards escuros à direita. Números em tamanho moderado, sempre com contexto.

- Título: Acompanhe ==os resultados do teste==
- Subtítulo: Números alcançados ainda na fase de testes, antes de a operação estar totalmente estruturada.
- Resultados:
  - Geração de negócio
  - **+R$ 150 mil** · em crédito liberado por meio do agente, ainda na fase de testes.
  - Eficiência no transbordo
  - **Transbordo baixo** · Quando acontece, o agente envia uma nota com o contexto para o time de negócios.
  - Conversão espontânea
  - **Conversa que vira contratação** · Uma conversa sobre reforma de cozinha terminou em contratação, sem roteiro pronto.
  - Autonomia do time
  - **4 agentes** · construídos pela própria equipe no Agent Builder, sem depender da implementação.
  - Escala
  - **+10%** · meta de ações ativas com agente generativo até dezembro.
- Rodapé (11px): Os resultados da Viacredi não constituem projeção para outras instituições.

---

### Slide 9 · Método 1: o papel do agente
**Layout:** como o slide 4 do Crediauc. Grade de 6 campos para preencher à esquerda (2 colunas × 3 linhas), caixa escura com checklist à direita, dica na base.

- Título: Escreva ==o papel do agente==
- Subtítulo: Comece pelo propósito: por que o agente existe, com quem vai conversar e até onde pode ir.
- Campos:
  - **Objetivo** · Qual resultado a conversa deve buscar?
  - **Público** · Para quem é a oferta e em que momento da relação?
  - **Oferta** · Quais linhas e condições o agente pode apresentar?
  - **Tom** · Como a sua instituição conversa quando atende bem?
  - **Transbordo** · Quando o humano assume e o que ele precisa receber?
  - **Fechamento** · Por qual canal a contratação é concluída?
- Caixa escura, título "Guardrails críticos: o que nunca muda" (checkboxes vazios, zigue-zague ouro no canto):
  - Informações que o agente não pode pedir nem expor
  - Condições que exigem análise humana
  - Transparência sobre juros, IOF e demais custos
  - Canal seguro para a contratação
  - Quem revisa as conversas e com que frequência
- Dica (ícone de lâmpada pequeno ou numeral, faixa ouro suave): Na Viacredi, a própria IA ajudou a construir os guardrails e ajustar a operação. Comece por esse diálogo.

---

### Slide 10 · Método 2: testar e medir
**Layout:** três colunas de etapas com numerais grandes (como slide 5 do Crediauc), cada uma com caixa "Entrega" e campos Data/Responsável. Abaixo, linha de 6 indicadores ligados por ícones de linha (como slide 8 do Crediauc). Barra escura final com perguntas de avaliação e checkboxes de decisão.

- Título: Teste em ==volume controlado== e meça
- Subtítulo: Comece com poucos disparos, acompanhe as conversas e decida com indicadores se continua, ajusta ou amplia.
- Etapas:
  - **1 Preparação** · Defina o papel e os limites do agente, o público inicial com filtros de risco, os responsáveis e os indicadores do teste. **Entrega:** agente pronto para conversar com um grupo pequeno. Campos: Data · Responsável
  - **2 Teste** · Comece com poucos disparos, acompanhe as conversas e faça pausas para ajustar o que for necessário. **Entrega:** conversas revisadas e ajustes registrados. Campos: Início · Término · Responsável
  - **3 Avaliação** · Reúna os resultados, os transbordos e os aprendizados sobre a qualidade das conversas. **Entrega:** decisão de continuar, ajustar ou ampliar. Campos: Data · Responsável
- Indicadores:
  - **Resposta** · Cooperados que responderam ÷ cooperados abordados
  - **Avanço** · Conversas que chegaram à apresentação da oferta
  - **Contratação** · Contratações ÷ conversas com interesse
  - **Valor** · Crédito contratado no período
  - **Transbordo** · Transferências para o humano e seus motivos
  - **Qualidade** · Conversas revisadas sem desvio dos guardrails
- Barra escura:
  - O teste respondeu ao objetivo definido na página 9?
  - Quais situações exigiram participação humana?
  - O que ajustar antes de ampliar o volume?
  - Checkboxes: Continuar · Ajustar · Ampliar

---

### Slide 11 · CTA (escuro)
**Layout:** igual ao slide 9 do Crediauc. Título centralizado, dois cards na base.

- Pílula: `Playbook · Agentes de IA na Oferta de Crédito`
- Título: Quer aplicar ==este método== na sua instituição?
- Card esquerdo:
  - **Converse com a Ubots sobre a sua operação**
  - Traga a linha de crédito que faz sentido testar e as definições do playbook. Podemos construir os próximos passos juntos.
  - Botão ouro: `Falar com um especialista →` (link: [URL A CONFIRMAR, com UTM])
- Card direito, "Leve para a conversa" (checkboxes com pílula de slide):
  - Papel do agente · pág. 9
  - Guardrails críticos · pág. 9
  - Plano de teste e responsáveis · pág. 10
  - Indicadores e critério de decisão · pág. 10

---

## 4. Ritmo dos layouts

| # | Fundo | Peso | Layout |
|---|---|---|---|
| 1 | Claro | Visual | Capa dividida |
| 2 | Claro | Texto | Texto + cards |
| 3 | Claro | Wireframe | Comparativo em dois painéis |
| 4 | Escuro | Texto + estrutura | Três colunas + citação |
| 5 | Claro | Wireframe complexo | Celular anotado |
| 6 | Claro | Wireframe | Três cards com mini chats |
| 7 | Claro | Texto + linha do tempo | Timeline + painel lateral |
| 8 | Escuro | Resultados | Card ouro + grade 2 × 2 |
| 9 | Claro | Campos | Grade preenchível + caixa escura |
| 10 | Claro | Campos + métricas | Etapas + indicadores + barra escura |
| 11 | Escuro | CTA | Título + dois cards |

---

## 5. Implementação técnica

- HTML único, CSS com os tokens da seção 2, fontes Poppins e Nunito via Google Fonts (ou locais em `assets/fonts/`).
- Cada slide: `<section class="slide" style="width:1440px;height:810px">`, com `page-break-after: always`.
- Wireframes (chats, editor de prompt, nota de transbordo, timeline) em HTML/CSS ou SVG inline, nunca imagem rasterizada.
- Campos preenchíveis: no PDF final, avaliar `<input>` virando campos de formulário. Se não for viável, manter caixas visuais (como no Crediauc).
- Export: Playwright, `page.pdf({ width: '1440px', height: '810px', printBackground: true })`.
- Gerar previews PNG de cada slide para revisão.

---

## 6. Materiais de apoio (pasta `assets/`)

| Arquivo | Uso | Status |
|---|---|---|
| `logo-ubots.svg` (versões para fundo claro e escuro) | Header de todos os slides | Necessário |
| `logo-viacredi.svg` (claro e escuro) | Header, ao lado do logo Ubots | Necessário + aprovação de uso pela Viacredi |
| `miv-ubots.pdf` ou guia de marca | Conferir tokens, zigue-zague e regras de logo | Necessário |
| `playbook-crediauc.pdf` (e o HTML/Figma original, se existir) | Referência de componentes; reaproveitar código acelera muito | Necessário |
| `print-cozinha.png` | Slide 5, substitui a reconstituição | Desejável, anonimizado e aprovado |
| `print-iof.png`, `print-app.png` | Slide 6, mini chats | Desejável, anonimizados e aprovados |
| `giovanna.jpg` (retrato, fundo neutro) | Card de citação nos slides 2 e 4 | Opcional, com autorização de uso de imagem |
| Fontes Poppins e Nunito | Se o ambiente não acessar Google Fonts | Opcional |
| URL da LP/diagnóstico com UTM | Botão do slide 10 | Necessário |

Fotos de banco de imagem não entram. Se não houver retrato da Giovanna, o card de citação usa só aspas e assinatura.

---

## 7. Pendências e QA

Confirmar antes de publicar:
- [ ] Cargo da Giovanna
- [ ] Falas da Giovanna nos slides 3, 4 e 6: foram adaptadas do relato do case e precisam de aprovação dela e da Viacredi
- [ ] Prints aprovados (ou aprovação da reconstituição do slide 5)
- [ ] Uso do logo Viacredi e menção ao Sistema Ailos
- [ ] URL do CTA

QA visual (rodar após o build):
- [ ] Nenhum azul ou teal; nenhum travessão no texto visível
- [ ] Contraste ≥ 4,5:1 no menor texto de cada slide (registrar o valor)
- [ ] Contador de página correto (`01 / 11` … `11 / 11`)
- [ ] Copy idêntica à deste arquivo
- [ ] Nenhum `[A CONFIRMAR]` sobrando na versão final
- [ ] Dois slides escuros nunca em sequência
- [ ] PDF com texto selecionável e 11 páginas de 1440×810
