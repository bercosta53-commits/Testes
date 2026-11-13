# Playbook · Testando agentes de IA na oferta de crédito

Brief de produção para o Claude Code. Case Viacredi + Ubots. 10 slides, 16:9, mesmo modelo e recursos do Playbook Sicoob Crediauc.

---

## 0. Como usar este arquivo

1. Coloque este .md na raiz do projeto, junto com a pasta `assets/` (lista na seção 6).
2. Peça ao Claude Code: "Leia `playbook-viacredi-ubots.md` e construa o deck seguindo as seções 2 a 5. Depois rode o QA da seção 7."
3. Saídas esperadas:
   - `dist/playbook-viacredi-ubots.html`: deck navegável, um `<section>` de 1440×810 por slide
   - `dist/playbook-viacredi-ubots.pdf`: PDF com 10 páginas de 1440×810 pt, exportado via Playwright (Chromium), texto selecionável
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
- **Header:** logo Ubots | divisória | logo Viacredi, canto superior esquerdo. Contador `02 / 10` no canto superior direito.
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
**Layout:** header só com o logo Ubots. Texto à esquerda, ilustração à direita: painel ouro com celular mostrando uma conversa de contratação de crédito (oferta, plano da cooperada, simulação com juros e IOF, contratação pelo app), cartão "Contexto do Cooperado" e ícones de IA e WhatsApp. Textos da capa em Title Case (revisão de 13/11).

- Pílula: `Guia Prático`
- Título: Testando ==Agentes de IA== na Oferta de Crédito
- Subtítulo: Menos regras, mais contexto: o que a Viacredi aprendeu ao colocar um agente de IA para conversar com cooperados sobre crédito, e como levar esse teste para a sua instituição.
- Chips de etapas: `1 Preparar o Agente` → `2 Testar em Volume Controlado` → `3 Avaliar e Escalar`
- Rótulo de público: Material para
- Linha de origem (abaixo do título, discreta): Baseado no case Viacredi + Ubots
- Tags de público: `Cooperativas de Crédito` · `Bancos e Fintechs` · `Instituições Financeiras` · `Serviços Financeiros` · `Financeiras`

---

### Slide 2 · O ponto de partida
**Layout:** texto corrido à esquerda (60%), coluna de cards à direita (40%), card da protagonista na base. Slide com mais texto.

- Título: Uma cooperativa de 74 anos decidiu ==testar IA generativa== na venda de crédito
- Corpo (esquerda):

  A Viacredi, cooperativa do Sistema Ailos com sede em Blumenau, tem mais de 1 milhão de cooperados e mais de 100 postos em Santa Catarina e no Paraná. Relacionamento próximo sempre foi a estratégia da casa.

  O desafio era ampliar a oferta de linhas de crédito com agentes de IA sem perder esse jeito de atender. E sem referência de mercado: até ali, a cooperativa trabalhava com bots de fluxo, de regras fixas, e não tinha nenhuma métrica de IA generativa para comparar.

- Cards à direita, título "Ponto de partida":
  - **Bots de fluxo** · Conversas presas a regras fixas e caminhos pré-definidos.
  - **Sem histórico** · Nenhum indicador de IA generativa para usar como base.
  - **Parceria com a Ubots** · Construir e testar um agente de IA para a oferta de crédito.
- Card da protagonista (faixa inferior): **Giovanna** · [cargo A CONFIRMAR] · Conduziu o projeto do primeiro teste à operação atual.
- Faixa de resultados (revisão de 13/11, escura, números em ouro de tamanho moderado):
  - Fase de teste
  - Resultados do teste
  - Números obtidos antes de a operação estar totalmente estruturada.
  - **+R$ 150 mil** · em crédito liberado por meio do agente
  - **4 agentes** · construídos pela própria equipe no Agent Builder
  - **Transbordo baixo** · com nota de contexto para o time de negócios
  - **+10%** · meta de ações ativas com agente generativo até dezembro

---

### Slide 3 · O erro natural
**Layout:** wireframe comparativo em dois painéis lado a lado, ligados por uma seta, sobre o fundo claro. Citação da Giovanna embaixo à esquerda, callout escuro embaixo à direita.

- Título: O primeiro instinto foi ==empilhar regras==, e o agente virou um bot de fluxo
- Subtítulo: Cada "não pode" parecia deixar o agente mais seguro. Na prática, deixou a conversa mais rígida, e cada tentativa de torná-lo simpático com novas regras reforçava o tom robótico.
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

- Título: A virada veio quando o agente ==entendeu o papel dele==
- Subtítulo: Na primeira semana de julho, a Viacredi reformulou a lógica do agente. Tirou o excesso de regras, explicou no prompt o conceito e o objetivo do papel dele e manteve só os guardrails críticos de segurança, desenhados com a ajuda da própria IA.
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
- Linha de apoio (cinza claro): Saudação, transbordo e volume de mensagens passaram a ser ajustados em conjunto com a IA, sem nova regra manual.
- Faixa final (ouro, Poppins 22px): Segurança onde importa, conversa de verdade no resto.

---

### Slide 5 · A conversa da cozinha
**Layout:** wireframe complexo. Mock de celular com a conversa à esquerda (45%); à direita, quatro anotações numeradas ligadas por linhas a pontos da conversa. Título e subtítulo em cima, largura total.

- Título: Uma conversa sobre ==reforma de cozinha== terminou em contratação de crédito
- Subtítulo: Dias depois da mudança, uma cooperada respondeu à oferta dizendo que já tinha um crédito contratado, mas que era bom saber de outro disponível. Nada do que veio depois estava roteirizado.
- Conversa no celular (substituir pelo print anonimizado aprovado; se não houver print, usar esta reconstituição com a legenda "Reconstituição a partir do relato do projeto"):
  1. Cooperada: "Já tenho um crédito contratado, mas achei bom saber que tem outro disponível."
  2. Agente: "Que bom! Posso perguntar o que você está planejando?"
  3. Cooperada: "Estou reformando a cozinha."
  4. Agente: conversa sobre a reforma (balão com texto em barras, sem conteúdo inventado)
  5. Agente: apresenta a linha de crédito ligada ao plano da reforma (barras)
  6. Cooperada: decide contratar (barras + selo ouro "Contratação")
- Anotações:
  - **1 Escuta** · Em vez de repetir a oferta, o agente pergunta o motivo do interesse.
  - **2 Contexto** · A cooperada conta da reforma e o agente conversa sobre ela, como faria um bom atendente.
  - **3 Oferta com sentido** · O crédito aparece como resposta a um plano real, e não como disparo genérico.
  - **4 Decisão da cooperada** · A contratação vem da conversa. Nenhum passo estava previsto em roteiro.
- Legenda (11px): Conversa anonimizada. Dados da cooperada preservados.

---

### Slide 6 · Liberdade com responsabilidade
**Layout:** três cards de mesma altura, cada um com um mini wireframe. Citação da Giovanna em faixa na base.

- Título: A liberdade para conversar veio junto com ==transparência e segurança==
- Subtítulo: O mesmo contexto que deixa a conversa natural também protege o cooperado: o agente explica custos, orienta a contratação pelo canal seguro e chama o time humano quando faz sentido.
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
  - Linha de apoio: O transbordo ficou baixo. Quando acontece, o time continua a conversa sem pedir que o cooperado repita nada.
- Faixa de citação: "O mercado costuma travar tudo num roteiro fechado. A liberdade guiada por contexto é o que deixa a experiência perto de um atendimento humano bem feito." [Fala A CONFIRMAR com a Giovanna]

---

### Slide 7 · Como o teste aconteceu
**Layout:** linha do tempo horizontal ocupando 65% da largura (5 marcos, numerais ouro), painel lateral "O papel da Ubots" à direita. Slide com mais texto.

- Título: Testar pouco, pausar e voltar melhor ==fez parte do método==
- Subtítulo: A Viacredi não começou em escala. Começou com cooperados reais, volume baixo e filtros de risco, e tratou cada pausa como parte do teste.
- Linha do tempo:
  - **Abril a junho** · Testes controlados. Pausas frequentes para refinar o agente, preparar o time e definir os novos indicadores.
  - **Junho** · Pausa total para reestruturar os disparos e planejar a escala.
  - **1ª semana de julho** · A virada: menos regras, mais contexto.
  - **2ª semana de julho** · Testes retomados com a nova versão do agente.
  - **Até dezembro** · Meta de rodar mais de 10% das ações ativas com agente generativo.
- Painel "O papel da Ubots" (card com borda ouro):

  A Ubots entrou como parceira na construção do primeiro agente e como plataforma para o time testar no próprio ritmo. Com o Agent Builder, a equipe da Viacredi ganhou autonomia: Giovanna já construiu 4 agentes sem depender do time de implementação.

  Próximos passos da cooperativa: um agente mais generalista e agentes para produtos sem risco de crédito, como cartão e aplicações no onboarding de novos cooperados.

- Rodapé discreto: Mais de R$ 150 mil em crédito liberados antes de a operação estar totalmente estruturada.

---

### Slide 8 · Método 1: o papel do agente
**Layout:** como o slide 4 do Crediauc. Grade de 6 campos para preencher à esquerda (2 colunas × 3 linhas), caixa escura com checklist à direita, dica na base.

- Título: Antes de escrever regras, escreva ==o papel do agente==
- Subtítulo: Explique ao agente para que ele existe, com quem conversa e onde termina a autonomia dele. Preencha com as definições da sua instituição.
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
- Dica (ícone de lâmpada pequeno ou numeral, faixa ouro suave): Na Viacredi, a própria IA ajudou a desenhar os guardrails e a resolver os ajustes do dia a dia. Comece por aí.

---

### Slide 9 · Método 2: testar e medir
**Layout:** três colunas de etapas com numerais grandes (como slide 5 do Crediauc), cada uma com caixa "Entrega" e campos Data/Responsável. Abaixo, linha de 6 indicadores ligados por ícones de linha (como slide 8 do Crediauc). Barra escura final com perguntas de avaliação e checkboxes de decisão.

- Título: Teste em ==volume controlado== e meça o que muda na conversa
- Etapas:
  - **1 Preparação** · Papel do agente e guardrails escritos, público definido com filtros de risco, responsáveis e indicadores combinados. **Entrega:** agente pronto para conversar com um grupo pequeno. Campos: Data · Responsável
  - **2 Teste** · Disparos em volume baixo, leitura das conversas e pausas para ajustar sempre que preciso. **Entrega:** conversas revisadas e ajustes registrados. Campos: Início · Término · Responsável
  - **3 Avaliação** · Resultados, transbordos e qualidade das conversas consolidados. **Entrega:** decisão de continuar, ajustar ou ampliar. Campos: Data · Responsável
- Indicadores:
  - **Resposta** · Clientes que responderam ÷ clientes abordados
  - **Avanço** · Conversas que chegaram à apresentação da oferta
  - **Contratação** · Contratações ÷ conversas com interesse
  - **Valor** · Crédito contratado no período
  - **Transbordo** · Transferências para o humano e seus motivos
  - **Qualidade** · Conversas revisadas sem desvio dos guardrails
- Barra escura:
  - O teste respondeu ao objetivo definido no slide 8?
  - Quais situações exigiram participação humana?
  - O que ajustar antes de ampliar o volume?
  - Checkboxes: Continuar · Ajustar · Ampliar
- Rodapé (11px): Os resultados da Viacredi não constituem projeção para outras instituições.

---

### Slide 10 · CTA (escuro)
**Layout:** igual ao slide 9 do Crediauc. Título centralizado, dois cards na base.

- Pílula: `Playbook · Agentes de IA na Oferta de Crédito`
- Título: Desenhe o ==primeiro teste== de agente de IA na sua instituição
- Subtítulo: Use este guia para definir o papel do agente, os guardrails e o plano de teste antes de colocar a primeira conversa no ar.
- Card esquerdo:
  - **Converse com a Ubots sobre a sua operação**
  - Leve a linha de crédito que você quer testar e as definições preenchidas neste playbook.
  - Botão ouro: `Falar com um especialista →` (link: [URL A CONFIRMAR, com UTM])
- Card direito, "Leve para a conversa" (checkboxes com pílula de slide):
  - Papel do agente · slide 8
  - Guardrails críticos · slide 8
  - Plano de teste e responsáveis · slide 9
  - Indicadores e critério de decisão · slide 9

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
| 8 | Claro | Campos | Grade preenchível + caixa escura |
| 9 | Claro | Campos + métricas | Etapas + indicadores + barra escura |
| 10 | Escuro | CTA | Centralizado + dois cards |

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
- [ ] Contador de página correto (`01 / 10` … `10 / 10`)
- [ ] Copy idêntica à deste arquivo
- [ ] Nenhum `[A CONFIRMAR]` sobrando na versão final
- [ ] Dois slides escuros nunca em sequência
- [ ] PDF com texto selecionável e 10 páginas de 1440×810
