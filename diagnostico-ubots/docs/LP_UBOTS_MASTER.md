# UBOTS — Landing Page de Diagnóstico de Recuperação de Crédito com IA
**Documento-mestre de conteúdo, UX, visual e implementação**  
**Versão:** 2.0 · 13/10/2026  
**Status:** copy e interface da LP implementadas; publicação do build confirmada pela Vercel. Integração CRM e QA de ponta a ponta ainda exigem validação.

---

## 1. Visão executiva

**Produto oferecido:** diagnóstico interativo, gratuito, de recuperação de crédito com IA.

**Não é:** download de e-book, orçamento, simulador que promete receita, demonstração genérica de chatbot, formulário de contato comum ou avaliação financeira regulatória.

**O que o visitante faz:** responde **10 perguntas** (primeira na própria LP); informa dados profissionais ao final; recebe um resultado individualizado.

**O que recebe:** 
1. Potencial de negociação: capacidade atual versus cenário estimado com agente de IA.
2. Prontidão operacional: leitura de cinco dimensões, com prioridades.
3. Próximos passos: plano inicial adaptado ao nível da operação.

**Objetivo de conversão:** iniciar e concluir o diagnóstico; captar um contato qualificado e permitir solicitação de conversa com especialista.

**Personas:** líderes de cobrança/recuperação de crédito, negócios, relacionamento/agências, TI e diretoria, principalmente cooperativas, bancos e financeiras/fintechs.

**Princípio editorial:** a LP tem de ser percebida como **uma ferramenta que começa agora**, não como um artigo de vendas. A prova de valor e o case apoiam a decisão de responder, sem disputar atenção com a primeira pergunta.

**Mensagem principal:** “Qual o potencial da IA na sua recuperação de crédito?”

---

## 2. Links e fonte de verdade

- **LP publicada:** https://diagnostico-ubots.vercel.app/
- **Rota LP:** /
- **Rota diagnóstico:** /diagnostico
- **Protótipo interno:** /prototipo
- **Modo de demonstração:** /diagnostico?demo=1
- **Fonte da LP no GitHub:** https://github.com/bercosta53-commits/Testes/blob/claude/vibrant-davinci-c6elaw/diagnostico-ubots/src/pages/LandingPage.jsx
- **Especificação funcional original:** docs/PROMPT_LOVABLE.md, na mesma branch/pasta do repositório.
- **Integração original:** docs/INTEGRACAO.md.

**Regra de implementação:** alterar a apresentação e a narrativa da LP **sem** reescrever perguntas, pontuação, fórmulas, textos dinâmicos do resultado ou nomes de propriedades do HubSpot. Os arquivos dados, calculo, formatar e entrega são fontes de verdade da aplicação.

---

## 3. Arquitetura da LP — máximo de 4 blocos de conteúdo

| Ordem | Bloco | Objetivo | Elementos |
| --- | --- | --- | --- |
| 0 | Header | Identidade e acesso imediato | Logo Ubots + botão “Fazer diagnóstico” |
| 1 | Hero / primeira pergunta | Explicar em segundos e iniciar | H1, subtítulo, 3 mini-cards, microcopy, **card interativo 1/10** |
| 2 | O que você recebe | Mostrar benefício concreto | Título e 3 cards de resultado |
| 3 | Aplicação real: Crediauc | Confiança e humanização | Case curto, 2 números, 1 foto realista ilustrativa |
| 4 | CTA final | Retomar visitante indeciso | Box compacto + âncora para primeira pergunta |
| 5 | Rodapé | Transparência | Logo e nota de estimativas |

**Não adicionar** por padrão: FAQ extensa, planos e preços, 8 vantagens do WhatsApp, explicação longa de tecnologia, carrossel, depoimentos inventados, e-book, sucessivas seções “por que escolher a Ubots”, modal ou vídeo automático. São distrações para a conversão principal.

### Comportamento da primeira dobra

**Desktop ≥ 1024 px:** hero em 2 colunas; esquerda ~550 px, direita 385–445 px. A primeira pergunta **deve aparecer ao lado do título e sem exigir rolagem** em viewport típico de desktop, salvo limitações de altura extrema.

**Mobile 360–430 px:** fluxo vertical enxuto: selo → H1 → subtítulo → mini-cards → informações de tempo → card de pergunta. O card entra o mais cedo possível. Não inserir imagem no topo antes dele.

---

## 4. Copy final aprovada na LP

> **Nota:** os textos a seguir reproduzem o conteúdo da versão atual implementada, não propostas alternativas.

### 4.1 Header

**Logo:** Ubots.

**Identificador secundário (desktop):** Diagnóstico de crédito com IA

**CTA header:** Fazer diagnóstico

**Ação:** rolar para a janela da pergunta 1 na própria página (âncora #iniciar).

### 4.2 Hero — coluna esquerda

**Selo de contexto:**
> Ferramenta gratuita para instituições financeiras

**H1:**
> Qual o potencial da IA na sua recuperação de crédito?

A expressão “IA na sua recuperação de crédito?” recebe destaque em amarelo, como uma marca-texto sutil — não uma tarja.

**Texto de apoio:**
> Descubra o que sua equipe consegue negociar hoje, onde a IA pode ajudar e o que falta para começar.

**Mini-cards (três em linha no desktop):**

| Índice | Texto |
| --- | --- |
| 01 | Potencial |
| 02 | Prontidão |
| 03 | Próximos passos |

**Microcopy com ícones:**
> Cerca de 2 minutos · 10 perguntas · Sem custo

Não usar aqui CTA de “agendar demonstração”: a tarefa principal é responder à pergunta à direita.

### 4.3 Hero — janela interativa do diagnóstico

**Cabeçalho amarelo:**
> Comece seu diagnóstico

**Progresso:** 1 de 10, mais barra segmentada.

**Pergunta:**
> Que tipo de instituição você representa?

**Apoio:**
> Escolha uma opção para começar.

**Opções (botões clicáveis):**
1. Cooperativa de crédito
2. Banco
3. Financeira ou fintech
4. Outro tipo de instituição

**Nota inferior:**
> Resultado disponível após as respostas e o preenchimento dos seus dados profissionais.

**Interação obrigatória:** ao clicar numa opção, não abrir um segundo questionário do zero e não repetir a pergunta. Persistir o valor e abrir imediatamente a pergunta 2 na rota do diagnóstico.

| Opção | Valor técnico | Destino |
| --- | --- | --- |
| Cooperativa de crédito | cooperativa | /diagnostico?tipo=cooperativa&utm_content=lp-pergunta-1 |
| Banco | banco | /diagnostico?tipo=banco&utm_content=lp-pergunta-1 |
| Financeira ou fintech | financeira | /diagnostico?tipo=financeira&utm_content=lp-pergunta-1 |
| Outro tipo de instituição | outro | /diagnostico?tipo=outro&utm_content=lp-pergunta-1 |

Se “tipo” for ausente ou inválido, iniciar pela intro normal. O valor do tipo controla termos como “cooperado” versus “cliente”.

### 4.4 Bloco “O que você recebe”

**Eyebrow:**
> O que você recebe

**Título:**
> Respostas práticas para decidir melhor.

**Subtítulo:**
> Uma análise adaptada à sua carteira — não apenas uma pontuação.

**Card 1 — Potencial de negociação**
> Capacidade atual x cenário estimado com IA.

**Card 2 — Prontidão da operação**
> Avaliação em 5 dimensões, com prioridades.

**Card 3 — Plano para avançar**
> Três próximos passos específicos para você.

**Layout:** três cards horizontais no desktop; coluna única no celular. Ícone à esquerda e título/copy curtos à direita. Não transformar em três parágrafos.

### 4.5 Bloco escuro “Aplicação real”

**Eyebrow:**
> Aplicação real · Sicoob Crediauc

**Título:**
> IA apoia a equipe. Pessoas seguem no centro.

**Apoio:**
> No Desenrola Brasil, um agente da Ubots apoiou negociações pelo WhatsApp com acompanhamento humano.

**Indicador 1:**
> R$ 23,4 mil  
> Renegociados em 5 dias

**Indicador 2:**
> 6 contratos  
> Na campanha acompanhada

**Ressalva:**
> Resultado de um caso específico, não uma promessa de desempenho.

**Imagem:** foto editorial de equipe colaborando. Usar a imagem para humanização, **sem sugerir que as pessoas retratadas pertencem à Crediauc ou à Ubots**.

**Importante:** não comparar automaticamente os cinco dias com os 75 dias anteriores como se fossem um experimento controlado. Não converter renegociação em receita recebida.

### 4.6 Box final

**Título:**
> Pronto para conhecer sua operação?

**Texto:**
> Dez respostas mostram por onde começar.

**CTA:**
> Iniciar diagnóstico

**Ação:** voltar à pergunta visível no topo, âncora #iniciar.

### 4.7 Rodapé

**Logo:** Ubots.

**Nota:**
> Estimativas baseadas nas respostas, não garantias. Valor renegociado não equivale a valor recebido.

---

## 5. Identidade visual e direção de arte

**Referência visual fornecida:** LP institucional Ubots compartilhada na conversa, com predominância de preto, branco, amarelo, seções contrastantes, cards e tipografia forte. **Adaptar a linguagem, não reproduzir a extensão** da referência.

### 5.1 Tokens

| Elemento | Cor | Uso |
| --- | --- | --- |
| Amarelo Ubots | #FFC800 | CTAs, cabeçalho do quiz, destaques e números |
| Preto institucional | #141414 | Títulos, header CTA, texto principal |
| Preto seção case | #191919 | Fundo do bloco de prova |
| Off-white LP | #FAF9F6 | Fundo geral |
| Branco | #FFFFFF | Cards, janela do quiz, seção de benefícios |
| Creme suave | #FFF3C9 | Selo do hero |
| Linhas | #E7E2D7 / #EBE8E1 | Divisões discretas |
| Texto secundário | #605B54 / #6B6558 | Explicações e microcopy |

**Fonte:** Sora (pesos 400, 600 e 700) como no diagnóstico/protótipo. Evitar misturar várias famílias tipográficas.

**Estilo:** B2B financeiro contemporâneo, objetivo e humano. Bordas arredondadas 12–22 px, divisores discretos, sombra suave na janela principal. Evitar excesso de ornamentos, gradientes pesados, animação decorativa ou dashboards fictícios.

### 5.2 Composição e espaçamento

- **Container:** largura máxima de 1120 px; margens laterais de 20 px no mobile e 32 px a partir do breakpoint sm.
- **Header:** 68 px de altura aproximada; conteúdo alinhado ao grid.
- **Hero desktop:** duas colunas, gap de ~72 px e espaçamento vertical ~76 px.
- **Hero mobile:** espaçamento vertical ~36 px; card após o texto, sem foto intermediária.
- **H1:** clamp(2.15rem, 4.15vw, 3.45rem); line-height 1.1; tracking negativo discreto.
- **Texto do hero:** 16–17 px; entrelinha 1.6; até ~470 px de largura.
- **Card da pergunta:** raio de 22 px; padding de 20–24 px; opções de pelo menos 54 px de altura; gap de 9 px.
- **Cards de benefício:** três por linha em telas largas, um por linha em telas pequenas; padding de 20–24 px.
- **Bloco case:** texto à esquerda e imagem à direita no desktop; layout vertical no mobile.
- **Espaçamento de seção:** 40–64 px conforme tela, **sem grandes vazios artificiais**.
- **Foto do case:** largura total da coluna, altura ~220 px no mobile e ~305 px no desktop; recorte natural.

**Equilíbrio:** a janela do quiz é o elemento de maior hierarquia depois do H1. Imagem e case vêm abaixo, nunca antes da janela.

### 5.3 Imagens e humanização

**Foto principal da versão atual (somente bloco case):**
https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85

**Direção:** pessoas adultas em situação natural de trabalho/colaboração, diversidade brasileira quando houver casting próprio, iluminação realista, ambiente corporativo acessível, rostos e gestos naturais.

**Evitar:** robôs humanoides, circuitos, hologramas, aperto de mão posado, pessoas constrangidas por dívidas, atribuição falsa ao case, estética de banco de imagem exagerada.

**Produção:** substituir foto remota por arquivo aprovado/licenciado e hospedado no projeto antes da ativação de mídia; definir texto alternativo, tamanho otimizado e carregamento lazy abaixo da dobra. Uma segunda foto é opcional, **mas não deve competir com o quiz ou aumentar a LP**.

---

## 6. Diagnóstico vinculado: fluxo funcional completo

A LP é a camada de entrada. **O quiz e o resultado existentes devem permanecer funcionais.**

### 6.1 Perguntas, na ordem atual

| Nº | Fase | Pergunta / tema |
| --- | --- | --- |
| 1 | Sua operação | Que tipo de instituição você representa? (**na LP**) |
| 2 | Sua operação | Quantas pessoas negociam dívidas hoje? |
| 3 | Sua operação | Quantos contratos estão em atraso na carteira? |
| 4 | Sua operação | Qual o valor médio de uma dívida em atraso? |
| 5 | Sua operação | Quantos acordos cada pessoa fecha por dia, em média? |
| 6 | Sua prontidão | Como o cliente em atraso recebe a proposta hoje? |
| 7 | Sua prontidão | Por onde acontece a maior parte das negociações? |
| 8 | Sua prontidão | Como são definidos desconto, prazo e parcela? |
| 9 | Sua prontidão | Como a equipe consulta a dívida e as condições do cliente? |
| 10 | Sua prontidão | Os clientes autorizaram contato por WhatsApp? |

Os rótulos de pergunta mudam com o tipo de instituição onde previsto no código. Preservar as opções completas de cada pergunta em dados.js / docs/PROMPT_LOVABLE.md. As cinco dimensões de prontidão são: régua, canal, política, acesso aos dados e consentimento/LGPD.

### 6.2 Comportamento de navegação

- A primeira pergunta **já é uma pergunta real**, não um CTA disfarçado.
- Clique da opção: enviar valor técnico na URL, abrir /diagnostico na etapa quiz, índice 1 (pergunta 2), preservando a resposta.
- Durante quiz: feedback de seleção, avanço após ~280 ms, botão Voltar e progresso segmentado.
- Ao entrar na parte “Sua prontidão”: apresentar a transição que contextualiza a capacidade atual.
- Campo “Outro” na pergunta de integração abre campo de texto e exige “Continuar” manual.
- Ao concluir pergunta 10: abrir a captura de dados **antes** do resultado.
- Acessibilidade: navegação por teclado, foco em títulos, labels claros, estados aria e redução de movimento.

### 6.3 Captura

**Título dinâmico:** “O diagnóstico {daInst} está pronto.”

**Promessa antes do formulário:** mostrar capacidade/potencial, cinco dimensões e próximos passos.

**Campos existentes:**
- Nome
- E-mail de trabalho
- WhatsApp com DDD
- Instituição (rótulo personalizado)
- Cargo/área
- Consentimento: “Autorizo a Ubots a entrar em contato sobre este diagnóstico.”

**CTA:** Ver diagnóstico completo.

**Aviso de uso de dados:** “Seus dados serão utilizados pelo time da Ubots para dar continuidade ao diagnóstico.”

**Requisitos:** validação de entrada, mensagens de erro específicas, política de privacidade oficial em local acessível (a vincular) e envio de campos necessários ao CRM. Não anunciar anonimato.

### 6.4 Resultado — módulos obrigatórios

**A. Nível:** score em 15 pontos e resumo individualizado.

| Pontos | Nível |
| --- | --- |
| 0 a 5 | Preparar a base |
| 6 a 10 | Pronta para piloto |
| 11 a 15 | Pronta para escalar |

**B. Potencial com agente de IA:** quantidade estimada de contratos, valor da carteira em atraso; comparação Hoje x Com IA para renegociações/mês, tempo para percorrer carteira e valor renegociado no primeiro mês.

**C. Prontidão por dimensão:** cinco barras, pontuação e leitura de cada resposta; marcar a principal prioridade.

**D. Por onde começar:** três ações específicas, cada uma com critério “Pronto quando”.

**E. Próxima conversa:** CTA personalizado para especialista conforme nível; registrar interesse no HubSpot e refletir o estado real de envio.

**F. Aviso metodológico:** estimativa com base em respostas e premissas, números arredondados, limitações para respostas “Não sei”, renegociado ≠ recebido.

**Nunca** alterar multiplicadores, truncamentos, critérios de prioridade ou pontuação só para deixar o resultado mais persuasivo.

### 6.5 Teste de regressão oficial

Para as seguintes escolhas:
- Cooperativa de crédito
- 1 a 5 pessoas
- Até 1 mil contratos
- Até R$ 1 mil de dívida média
- Até 2 acordos por dia
- Primeira opção de **todas** as cinco perguntas de prontidão

**Resultado exato esperado:**

| Indicador | Esperado |
| --- | --- |
| Nível | Preparar a base; 0 de 15 |
| Resumo | Antes do agente, vale organizar a política de negociação e a autorização de contato. |
| Renegociações/mês | 63 hoje / 130 a 190 com IA |
| Prazo | 8 meses hoje / 3 a 4 meses com IA |
| Valor renegociado no mês 1 | R$ 32 mil hoje / R$ 63 a 95 mil com IA |
| Diferença estimada | +R$ 32 a 63 mil |
| Carteira | 500 contratos; cerca de R$ 250 mil |
| Prioridade | Política de negociação |

Este teste é critério obrigatório de aceite; conferir também pelo modo /diagnostico?demo=1. A multiplicação simplificada usa 21 dias úteis/mês, além das regras e limites próprios do módulo de cálculo.

---

## 7. Tracking, CRM e privacidade

### 7.1 Eventos

Preservar os eventos do diagnóstico já emitidos para o window e dataLayer, incluindo:
- visualizado
- iniciado (inclusive quando a 1ª resposta veio da LP)
- concluido (ao chegar à captura)
- lead_enviado
- pedido_conversa

**Tracking recomendado adicional da LP:** visualização da LP, clique no CTA header, escolha do tipo de instituição, clique no CTA final, com UTM preservada até o lead. Não disparar duas vezes eventos de início.

**Origem técnica da primeira pergunta:** utm_content=lp-pergunta-1.

### 7.2 HubSpot

Variáveis a configurar no ambiente adequado:
- VITE_HUBSPOT_PORTAL_ID
- VITE_HUBSPOT_FORM_GUID
- VITE_HUBSPOT_FORM_GUID_INTERESSE (opcional)

Campos mínimos e técnicos já previstos: firstname, email, phone, company, diag_area_atuacao, diag_tipo_instituicao, diag_nivel_prontidao, diag_pontos, diag_renegociacoes_mes_hoje, diag_renegociacoes_mes_ia_min, diag_renegociacoes_mes_ia_max, diag_potencial_adicional_min, diag_potencial_adicional_max, diag_saldo_atraso, diag_ponto_critico, diag_estimativa_aproximada, diag_respostas, diag_origem, diag_pediu_conversa, diag_pedido_conversa_em.

**PENDÊNCIA CRÍTICA:** no código atual, quando o HubSpot não está configurado, o envio cai em **modo de teste**: registra mensagens no console, pode armazenar dados no navegador, e o visitante ainda consegue visualizar o resultado. **Isso não é captura real de leads no CRM.** Não iniciar campanha paga sem validar um envio verdadeiro, incluindo o pedido de conversa.

**Correção de produto recomendada antes da ativação:** não exibir “pedido registrado” nem prometer contato em até um dia útil se a integração não estiver realmente configurada e confirmada. O usuário final deve receber confirmação honesta e falha tratada.

### 7.3 Privacidade

- Informar de modo claro a finalidade dos dados e o consentimento.
- Vincular a política de privacidade oficial da Ubots (URL a confirmar).
- Restringir acesso a informações de leads; não tratar o painel local do protótipo como CRM de produção.
- Não exibir detalhes pessoais, dívidas individuais ou dados bancários nas fotos nem no exemplo.
- A linguagem sobre WhatsApp e LGPD deve refletir a política real de contatos da instituição, sem apresentar interpretação jurídica absoluta.

---

## 8. SEO e metadados

**Title:** Diagnóstico de recuperação de crédito com IA | Ubots

**Meta description sugerida:** Descubra o potencial da IA na recuperação de crédito da sua instituição. Diagnóstico gratuito com 10 perguntas, análise de prontidão e próximos passos.

**H1 único:** Qual o potencial da IA na sua recuperação de crédito?

**Estrutura:** h2 para entregas, case e CTA; h3 para benefícios.

**Open Graph sugerido:** imagem exclusiva com marca Ubots + elemento do quiz (evitar imagem genérica sem contexto); título e descrição com diagnóstico e resultado personalizado.

**Performance:** imagem convertida para formato moderno quando possível, dimensões explícitas, lazy load fora da dobra e sem fontes redundantes.

---

## 9. Critérios de aceite — LP e aplicação

### 9.1 Comunicação e layout
- [ ] Uma pessoa identifica que se trata de um **diagnóstico gratuito** antes de rolar.
- [ ] H1 e subtítulo são curtos; nenhum bloco vira “parede de texto”.
- [ ] A janela da primeira pergunta é imediatamente visível no desktop.
- [ ] Em telas de 360 px, não há rolagem horizontal e a pergunta é alcançada sem seções intermediárias.
- [ ] Benefícios apresentados em **três cards**, com hierarquia clara.
- [ ] Case usa uma foto humana e dois números, sem excesso de texto.
- [ ] Contraste, grid, margens e espaçamentos são consistentes.
- [ ] A LP permanece curta; nenhuma seção comercial extra é adicionada automaticamente.

### 9.2 Funcionalidade
- [ ] Qualquer opção da 1ª pergunta leva diretamente à 2ª com o tipo persistido.
- [ ] O contador/progresso continua em 2 de 10.
- [ ] Cooperativa usa “cooperado”; bancos e financeiras usam “cliente”.
- [ ] Os dez passos funcionam com mouse, teclado e celular.
- [ ] Voltar e revisar respostas funcionam.
- [ ] A captura é validada antes do resultado.
- [ ] Cálculo confere **exatamente** com a tabela de teste de regressão.
- [ ] UTM e eventos são preservados.
- [ ] Um lead real aparece no HubSpot com atributos do diagnóstico.
- [ ] Pedido de especialista chega ao CRM antes de confirmar sucesso.
- [ ] Nenhum deploy é considerado pronto apenas porque o build está “READY”: testar UX, mídia, rota, CRM e consentimento.

---

## 10. Prompt único de implementação para Lovable / equipe de desenvolvimento

> Construa/refine a LP da Ubots para diagnóstico de recuperação de crédito com IA utilizando **integralmente as seções 3, 4, 5 e 6 deste documento**.
>
> A interface deve seguir a identidade da Ubots (amarelo #FFC800, preto #141414, branco e off-white, fonte Sora), com acabamento B2B premium, grid de 1120 px, excelente respiro, cards escaneáveis e **nenhuma seção supérflua**.
>
> **Prioridade absoluta:** deixar a primeira pergunta real, “Que tipo de instituição você representa?”, em um card branco de alto destaque, com cabeçalho amarelo “Comece seu diagnóstico”, à direita do hero no desktop. Mostrar opções clicáveis e contador “1 de 10”. A seleção avança diretamente para a pergunta 2 na rota /diagnostico, preservando o tipo da instituição e o parâmetro utm_content=lp-pergunta-1.
>
> Preserve todo o fluxo existente de dez perguntas, os cinco critérios de prontidão, a captura, o resultado personalizado e as integrações. **Não reescreva os módulos de cálculo nem invente novos indicadores.**
>
> Crie as demais seções somente como descritas: três cards do que será entregue; case Crediauc compacto em fundo preto com uma foto editorial de equipe e dois indicadores contextualizados; CTA final de retorno ao quiz; rodapé.
>
> Teste em desktop e celular (360 px), por navegação de teclado; execute o cenário oficial de regressão da seção 6.5. Publique apenas após validar o envio ao HubSpot.

---

## 11. Pendências para uma publicação operacional

1. **HubSpot:** configurar e testar submissões reais, inclusive pedido de especialista.
2. **Privacidade:** URL oficial da política e validação do texto de consentimento.
3. **Imagem:** licença/fornecimento definitivo; hoje usa imagem editorial externa e ilustrativa.
4. **QA visual:** confirmar renderização e responsividade em navegador real.
5. **Prova:** confirmar liberação final de uso do nome/resultado Sicoob Crediauc em mídia pública.

**Documento complementar, não substituído:** docs/PROMPT_LOVABLE.md contém o código e as regras detalhadas da aplicação. Este MD é o documento-mestre da **LP e da experiência integrada**, suficiente para orientar copy, layout, desenvolvimento, QA e handoff sem recriar a lógica de negócio.
