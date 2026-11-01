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
node scripts/verificar.mjs caminho/para/velora-copy-site-v1.md   # confere a copy (ver abaixo)
```

`dist/` é o site pronto: um `index.html`, os assets e o `robots.txt`. Pode ir para qualquer hospedagem estática (Netlify, Vercel, Cloudflare Pages, GitHub Pages, servidor próprio), na raiz ou em subpasta.

### Duas versões

| Pasta | Para quê |
|---|---|
| `dist/` | Versão publicável. Nenhuma nota, placeholder ou pendência aparece. |
| `dist-revisao/` | A mesma página com caixas tracejadas **PENDENTE** onde entram fotos, casos, retratos, tela do Radar e contatos. Só para revisão interna (não versionada). |

## Estrutura

```
config.mjs                 decisões em aberto num só lugar (formulário, faixas, fotos, casos, sócios, contatos, indexação)
build.mjs                  gera dist/ ou dist-revisao/
src/paginas/home.mjs       as 9 seções da home, com a copy transcrita
src/conteudo/etapas.mjs    as 5 etapas do sistema (usadas no texto e nos diagramas)
src/lib/diagramas.mjs      ciclo do sistema, desconectado × conectado, linha do tempo RHOI, Radar no sistema
src/lib/componentes.mjs    botões, rótulos, frase-ponte, formulário, exhibit de caso
src/lib/layout.mjs         <head>, navegação e rodapé
src/assets/css/site.css    tokens e componentes do Velora Design System
src/assets/js/site.js      menu, ciclo interativo, entrada das seções, formulário
src/assets/fonts/          Space Grotesk 700, Manrope 400–600, JetBrains Mono 500 (woff2, subset latino, licença OFL)
scripts/verificar.mjs      confere o texto da página contra o MD da copy
scripts/servidor.mjs       servidor local de pré-visualização
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

**Design**
- Tons de apoio ajustados para passar em contraste AA: texto terciário a 48% sobre escuro (briefing: 44%) e 60% sobre claro (briefing: 48%); linhas de diagrama a 40% sobre escuro (32%) e 52% sobre claro (40%).
- Um ponto Acid por tela: enquanto o CTA do hero está visível, o botão da navegação fica em contorno; o número central do ciclo fica em branco, e o Acid marca só a etapa ativa e a entrega que sai dela.
- O título do hero ocupa 3 linhas no desktop (o briefing pede até 2): a primeira frase numa linha, a segunda em duas. Com o texto atual não cabe em 2 no tamanho Display XL.
- O tamanho do título e os espaços do hero também se ajustam à altura da tela, para o hero inteiro (com o diagrama) caber em 1440 × 900 e os CTAs ficarem visíveis em notebooks de 1366 × 768.
- O hero desenha o ciclo uma vez (Inteligência → … → Medição → Inteligência) e acende a etapa 01. Não há animação em repetição. Na seção 03, a etapa ativa acompanha a rolagem.
- Com `prefers-reduced-motion`, nada anima: diagramas já completos.
- As perguntas do formulário aparecem como dica visível sob cada rótulo (não como placeholder), para não sumirem ao digitar nem serem cortadas no celular.

## Verificações feitas

- Copy literal: 161/161 trechos.
- axe-core (WCAG 2.1 AA + boas práticas): 0 violações no desktop e no celular.
- Testes de interação (Playwright): ciclo (abertura, mouse, rolagem), CTA em contorno, navegação marcando a seção, âncoras, validação e sucesso do formulário, menu do celular (abrir, Esc, fechar ao escolher), sem rolagem horizontal a 390 px, áreas de toque, movimento reduzido, página sem JavaScript.
- Larguras conferidas: 320, 390, 834, 1024, 1200, 1280, 1366 e 1440 px, sem rolagem horizontal.
- Briefing de design: nenhum gradiente, glow, sombra, emoji ou canto ≥ 16 px; só as cores da paleta.

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
- [ ] Captura real do Velora Radar, com recursos validados (`config.mjs → fotos['radar-tela']`).
- [ ] Fotos editoriais (briefing de fotos à parte): `onde-trava`, `como-trabalhamos`, `icp-tecnologia`, `icp-profissionais`, `icp-financeiros`.
- [ ] Contatos e LinkedIn do rodapé (`config.mjs → contato`).
- [ ] Proporção escuro/claro e tons de apoio derivados.
- [ ] Logotipo: a v1 usa a assinatura tipográfica *Velora · Growth & Beyond* (não havia arquivo de logo nos briefings).
