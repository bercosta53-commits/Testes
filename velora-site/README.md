# Velora — site v1 (one page)

Primeira versão do novo site da Velora, construída a partir de dois documentos:

- **Copy:** `velora-copy-site-v1.md` (v1.0 · 01/11/2026) — home, seções 01 a 09.
- **Design:** `briefing-design-site-velora.md` (v1.0 · 01/11/2026) — paleta, tipografia, grid, diagramas, movimento.

Os dois documentos **não estão neste repositório** (o repositório é público e eles têm notas internas de validação).

Nesta primeira fase o site é **uma página só**: a home da copy, com a navegação levando às seções.

## Como rodar

Precisa só de Node 18+. Não há dependências para instalar.

```bash
npm run preview            # gera dist/ e abre em http://localhost:4173
npm run preview:revisao    # gera dist-revisao/ (pendências marcadas) em http://localhost:4173
npm run build              # só gera dist/
npm run arquivo-unico      # gera arquivo-unico/velora-site.html: um só HTML com CSS, JS, fontes e fotos embutidos (~1 MB)
node scripts/verificar.mjs caminho/para/velora-copy-site-v1.md   # confere a copy (ver abaixo)
```

`dist/` é o site pronto: um `index.html`, os assets e o `robots.txt`. Pode ir para qualquer hospedagem estática (Netlify, Vercel, Cloudflare Pages, GitHub Pages, servidor próprio), na raiz ou em subpasta.

### Duas versões

| Pasta | Para quê |
|---|---|
| `dist/` | Versão publicável. Nenhuma nota, placeholder ou pendência aparece. |
| `dist-revisao/` | A mesma página com caixas tracejadas **PENDENTE** onde entram casos, credenciais, retratos dos sócios, tela real do Radar e contatos. Só para revisão interna (não versionada). |

## Estrutura

```
config.mjs                 decisões em aberto num só lugar (formulário, faixas, fotos, casos, sócios, contatos, indexação)
build.mjs                  gera dist/ ou dist-revisao/
src/paginas/home.mjs       as 9 seções da home, com a copy transcrita
src/conteudo/etapas.mjs    as 5 etapas do sistema (usadas no texto e nos diagramas)
src/conteudo/fotos.mjs     fotos editoriais provisórias: arquivo, texto alternativo e fonte
src/lib/diagramas.mjs      trilho do hero, ciclo do sistema, desconectado × conectado, RHOI, radar
src/lib/componentes.mjs    botões, rótulos, frase-ponte, formulário, exhibit de caso
src/lib/layout.mjs         <head>, navegação e rodapé
src/assets/css/site.css    tokens e componentes do Velora Design System
src/assets/js/site.js      menu, ciclo interativo, entrada das seções, formulário
src/assets/fonts/          Space Grotesk 700, Manrope 400–600, JetBrains Mono 500 (woff2, subset latino, licença OFL)
src/assets/img/            fotos tratadas (WebP, 2 tamanhos cada)
scripts/verificar.mjs      confere o texto da página contra o MD da copy
scripts/tratar-fotos.py    recorte e tratamento P&B das fotos (Python + Pillow; originais fora do repositório)
scripts/servidor.mjs       servidor local de pré-visualização
scripts/arquivo-unico.mjs  empacota dist/ num HTML único e autocontido (para abrir direto ou enviar como anexo)
```

## Conferência da copy

`scripts/verificar.mjs` lê o MD da copy e confere, frase por frase, se cada trecho da home, da navegação e das mensagens do formulário está na página **exatamente** como foi escrito (pontuação incluída; só maiúsculas/minúsculas ficam livres, porque o CSS controla a caixa dos rótulos). Depois lista todo texto visível que **não** vem da copy, para revisão humana. Resultado atual: 161 trechos conferidos, nenhum divergente.

## Decisões tomadas nesta versão

**One page**
- Menu: *O sistema · Como trabalhamos · Para quem · Velora Radar* levam às seções. **Insights** e **Sobre** saíram por não terem seção na home; voltam quando houver páginas internas.
- Todos os CTAs de diagnóstico (menu, hero, seção 08, rodapé) levam ao formulário da seção 09 (`#agendar`).
- Saíram os CTAs de apoio que apontavam para páginas internas: *Conheça as cinco etapas*, *Entenda o nosso método*, *Conheça o Velora Radar*, *Veja onde podemos atuar*. *Começar pelo diagnóstico* (seção 08) ficou e leva ao formulário.
- Os nós dos diagramas do ciclo e do Radar levam ao bloco da etapa correspondente na seção 03.

**Texto que não vem literalmente da copy** (a lista completa sai do `verificar.mjs`)
- Rótulos de ligação no ciclo, tirados da linha "Entrega" de cada etapa: *Contas priorizadas · Conversas iniciadas · Familiaridade e argumentos · Motivos de ganho ou perda · Informações que voltam à Inteligência*.
- *Desconectado* / *Conectado* no diagrama da seção 02 (nome do diagrama no briefing de design).
- Seção 07: enquanto não houver casos validados, aparece a **estrutura de cada caso** (Contexto, Trava, O que conectamos, Resultado), com os campos do modelo de card da copy, **sem nome e sem número**. Quando houver casos em `config.mjs → casos`, os exhibits reais entram no lugar.
- Faixas de faturamento do formulário (sugestão de trabalho, ver pendências).
- Rodapé: *© 2026 Velora · Growth & Beyond*; manifesto reaproveitado do título da página Sobre (*Estratégia faz diferença quando encontra a operação.*).
- Acessibilidade: *Pular para o conteúdo*, *Menu* / *Fechar* e descrições dos diagramas para leitor de tela.

**Fotografia (provisória)**
- As 5 fotos são do banco **Pexels** (licença Pexels: uso comercial livre, sem atribuição obrigatória, edição permitida), escolhidas pela direção do briefing §8: gente real trabalhando, flagrante e não pose, quadro, papel e tela; nada de aperto de mão, gráfico subindo ou grupo posado.
- Todas tratadas no mesmo padrão: P&B, contraste suave, grão leve; mais escuras nas seções Ink e levemente quentes nas seções Bone. A foto do hero foi espelhada para a composição.
- As pessoas nas fotos **não** são da Velora nem clientes, e nenhuma legenda sugere isso. Os retratos dos sócios continuam pendentes: só com produção própria.
- Fontes: hero [18999479](https://www.pexels.com/photo/18999479/) · 02 [7433869](https://www.pexels.com/photo/7433869/) · 04 [5439478](https://www.pexels.com/photo/5439478/) · 06 Tecnologia B2B [16323454](https://www.pexels.com/photo/16323454/) · 09 [5668492](https://www.pexels.com/photo/5668492/).
- Ritmo: foto nas seções claras de pessoas e raciocínio (02, 04, 06) e na abertura e no fechamento (hero, 09); as seções escuras de sistema e dados (03, 05, 07) ficam com os diagramas.
- Para trocar por produção própria: `config.mjs → fotos` (mesmas chaves de `src/conteudo/fotos.mjs`).

**Elementos visuais**
- **Hero:** foto editorial sangrando à direita com vinheta que funde ao Ink; o título atravessa a imagem. Na base, o **trilho do sistema** (01 → 05 com o retorno de Medição para Inteligência): um pulso Acid percorre o caminho uma vez (5 s) e a etapa 01 acende.
- **02:** foto sangrando à esquerda; o diagrama *desconectado × conectado* mostra o antes em Paper (ligações interrompidas) e o depois em Ink, com o retorno em Acid se desenhando por último.
- **03:** numeração monumental das etapas e ciclo fixo que acompanha a rolagem; a cada troca de etapa, um pulso Acid percorre a entrega que sai dela.
- **04:** foto sangrando à direita e as letras R H O I em escala de cartaz.
- **05:** o Velora Radar desenhado como um radar (anéis, varredura única, contas, contas prioritárias em Acid, sinais, comitê de compra) com legenda numerada ligando cada item à etapa. É um diagrama do papel do Radar, **não uma tela do produto**: sem dados, nomes ou números.
- **06:** Tecnologia B2B em destaque, na largura inteira, com foto; Serviços profissionais e Serviços financeiros só com texto, lado a lado.
- **08:** numeração grande; o 01 (ponto de partida) em bloco Acid.
- **09:** foto da conversa sangrando à esquerda, na altura da seção inteira.
- **Rodapé:** assinatura *Velora* em escala de cartaz, cortada pela borda (desenho decorativo, não texto).

**Design**
- Tons de apoio ajustados para passar em contraste AA: texto terciário a 48% sobre escuro (briefing: 44%) e 60% sobre claro (briefing: 48%); linhas de diagrama a 40% sobre escuro (32%) e 52% sobre claro (40%).
- Um ponto Acid por tela: enquanto o CTA do hero está visível, o botão da navegação fica em contorno; nos diagramas o Acid marca só a etapa ativa, a entrega que sai dela, o retorno do ciclo ou as contas prioritárias.
- Numerais grandes inativos (seção 03) e índices do exhibit (07) a 36% de opacidade: o mínimo que passa em contraste para texto grande.
- O título do hero ocupa 3 linhas no desktop (o briefing pede até 2): a primeira frase numa linha, a segunda em duas. Com o texto atual não cabe em 2 no tamanho Display XL.
- O tamanho do título e os espaços do hero se ajustam à altura da tela: o hero inteiro (com o trilho) cabe em 1440 × 900.
- Nenhuma animação em repetição: o pulso do hero dura 5 s (limite da WCAG 2.2.2 para movimento sem botão de pausa) e a varredura do radar, 2,2 s.
- Com `prefers-reduced-motion`, nada anima: diagramas já completos.
- As perguntas do formulário aparecem como dica visível sob cada rótulo (não como placeholder), para não sumirem ao digitar nem serem cortadas no celular.

## Verificações feitas

- Copy literal: 161/161 trechos.
- axe-core (WCAG 2.1 AA + boas práticas): 0 violações no desktop e no celular.
- 35 testes de interação (Playwright): pulso do trilho, carregamento das 5 fotos, ciclo (rolagem, pulso, mouse), radar, CTA em contorno, navegação marcando a seção, âncoras, validação e sucesso do formulário, menu do celular (abrir, Esc, fechar ao escolher), sem rolagem horizontal, áreas de toque, movimento reduzido, página sem JavaScript.
- Larguras conferidas: 320, 390, 768, 834, 1024, 1200, 1280, 1366, 1440 e 1920 px, sem rolagem horizontal.
- Briefing de design: nenhum glow, neon, sombra, emoji ou canto ≥ 16 px; só as cores da paleta. Os únicos degradês são as vinhetas que fundem as fotos ao Ink (briefing §8).

## Pendências antes de publicar

Bloqueiam a publicação:
- [ ] **Destino do formulário.** Hoje está em modo demonstração: valida, mostra a mensagem de sucesso e **não envia nada** (aviso no console). Definir o fluxo (Calendly, CRM, e-mail) e configurar em `config.mjs → formularios.diagnostico`. Ajustar a mensagem de sucesso se o agendamento for direto.
- [ ] **Contato do lead.** Os 5 campos da copy (nome, empresa, cargo, faturamento, origem) **não incluem e-mail nem telefone**. Sem isso, ou sem um agendamento que capture o contato, não há como retornar.
- [ ] **Faixas de faturamento** (`config.mjs → faixasFaturamento`): confirmar.
- [ ] **Política de privacidade e consentimento (LGPD)** do formulário.
- [ ] **Indexação:** `config.mjs → indexavel` está `false` (noindex + robots bloqueando). Trocar para `true` e preencher `urlBase` na publicação.

Conteúdo a validar ou produzir (checklist da copy e do design):
- [ ] Headline do hero com os sócios.
- [ ] Política do diagnóstico (gratuito, pago ou híbrido) — o texto atual não anuncia gratuidade.
- [ ] 2 ou 3 casos com autorização, indicador, variação, período e base de comparação (`config.mjs → casos`).
- [ ] Credenciais verificadas dos sócios e retratos de produção própria (`config.mjs → socios`).
- [ ] Captura real do Velora Radar, com recursos validados; o desenho do radar não substitui a tela do produto.
- [ ] Aprovar as fotos provisórias ou substituí-las por produção própria (briefing de fotos à parte).
- [ ] Validar os recursos que o desenho do Radar ilustra (contas prioritárias, sinais, comitê de compra) — os mesmos que a copy já afirma.
- [ ] Contatos e LinkedIn do rodapé (`config.mjs → contato`).
- [ ] Proporção escuro/claro e tons de apoio derivados.
- [ ] Logotipo: a v1 usa a assinatura tipográfica *Velora · Growth & Beyond* (não havia arquivo de logo nos briefings).
