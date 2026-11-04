# Velora — site (one page) · copy editorial v2

Novo site da Velora, construído a partir de dois documentos:

- **Copy:** `velora-copy-site-v2-editorial.md` (v2.0 · 01/11/2026) — bloco de publicação, seções 00 a 07, e as regras de implementação (§C) e critérios de aceite (§D). Substitui a copy v1.
- **Design:** `briefing-design-site-velora.md` (v1.0 · 01/11/2026) — paleta, tipografia, grid, diagramas, movimento.

Os dois documentos **não estão neste repositório** (o repositório é público e eles têm notas internas de validação).

Nesta fase o site é **uma página só**, com a navegação levando às seções.

## Como rodar

Precisa só de Node 18+. Não há dependências para instalar.

```bash
npm run preview            # gera dist/ e abre em http://localhost:4173
npm run preview:revisao    # gera dist-revisao/ (pendências marcadas) em http://localhost:4173
npm run build              # só gera dist/
npm run arquivo-unico      # gera arquivo-unico/velora-site.html: um só HTML com CSS, JS, fontes e fotos embutidos (~1,3 MB)
node scripts/verificar.mjs caminho/para/velora-copy-site-v2-editorial.md   # confere copy e regras editoriais (ver abaixo)
```

`dist/` é o site pronto: um `index.html`, os assets e o `robots.txt`. Pode ir para qualquer hospedagem estática (Netlify, Vercel, Cloudflare Pages, GitHub Pages, servidor próprio), na raiz ou em subpasta.

| Pasta | Para quê |
|---|---|
| `dist/` | Versão publicável. Nenhuma nota, placeholder ou pendência aparece. |
| `dist-revisao/` | A mesma página com caixas tracejadas **PENDENTE** onde entram casos, equipe, tela real do Radar e aviso de privacidade. Só para revisão interna (não versionada). |

## Estrutura

```
config.mjs                 decisões em aberto num só lugar (formulário, agenda, faixas, privacidade, fotos, casos, equipe, indexação)
build.mjs                  gera dist/ ou dist-revisao/ e avisa o que falta para publicar
src/paginas/home.mjs       as seções 00–07, com a copy transcrita
src/conteudo/etapas.mjs    as 5 etapas do sistema (faixa do hero e seção 02)
src/conteudo/fotos.mjs     fotos editoriais: arquivo, proporção e texto alternativo
src/lib/diagramas.mjs      linha do RHOI e ilustração do Velora Radar
src/lib/componentes.mjs    botões, rótulos, formulário, regra do CTA, exhibit de caso
src/lib/layout.mjs         <head> (OG, favicon), cabeçalho, menu do celular e rodapé
src/lib/logo.mjs           logo oficial em SVG (completo, compacto e só a palavra)
src/conteudo/logo-velora.mjs  desenho do logo, gerado por scripts/vetorizar-logo.py (não editar à mão)
src/assets/css/site.css    tokens e componentes do Velora Design System
src/assets/js/site.js      menu, circuito do sistema, entrada das seções, formulário e medição
src/assets/fonts/          Space Grotesk 700, Manrope 400–600, JetBrains Mono 500 (woff2, subset latino, licença OFL)
src/assets/img/            fotos tratadas (WebP, 2 tamanhos cada), favicon e ícone (emblema), imagem de compartilhamento (og.jpg)
scripts/verificar.mjs      confere a página contra a copy v2 e mede as regras editoriais
scripts/tratar-fotos.py    recorte e tratamento P&B das fotos (Python + Pillow; originais fora do repositório)
scripts/vetorizar-logo.py  vetoriza o PNG oficial do logo (Python + numpy, Pillow e potracer; PNG fora do repositório)
scripts/servidor.mjs       servidor local de pré-visualização
scripts/arquivo-unico.mjs  empacota dist/ num HTML único e autocontido
```

## Arquitetura da página (copy v2, §A)

Uma seção, uma função. Fundos alternados Ink / Bone.

| # | Seção | Fundo | O que tem |
|---|---|---|---|
| 00 | Hero | Ink | Promessa, dois CTAs e a faixa *Inteligência · Acesso · Demanda · Conversão · Medição* |
| 01 | Onde a aquisição trava | Bone | Quatro dores e a **única** faixa de evidências (painel Ink, 4 dados com fonte e ano) |
| 02 | O sistema | Ink | A **única** representação das cinco etapas: um circuito 01 → 05 com o retorno para 01 |
| 03 | O que entregamos | Bone | Quatro frentes com entregáveis; o **Velora Radar** dentro de Inteligência comercial; Liderança de crescimento (GLaaS) como faixa transversal |
| 04 | Como trabalhamos | Ink | RHOI: só ritmo, sequência e decisão |
| 05 | Para quem | Bone | Tecnologia B2B em destaque; espaço reservado (invisível) para dois casos |
| 06 | Formas de trabalhar | Ink | Só a relação de contratação; o ponto de partida em Acid |
| 07 | Conversa inicial | Bone | Formulário; espaço reservado (invisível) para a equipe |

Saíram da v1: frases-ponte, diagrama desconectado × conectado, trilho do hero, ciclo fixo da seção 03, seção própria do Radar, seção de evidências com a estrutura de caso vazia, lista das etapas no rodapé.

## Conferência da copy e das regras

`scripts/verificar.mjs` lê o bloco de publicação do MD (entre `PUBLICACAO_INICIO` e `PUBLICACAO_FIM`) e confere:

1. **Copy → página:** cada trecho está na página exatamente como escrito (pontuação incluída; só maiúsculas/minúsculas ficam livres, porque o CSS controla a caixa dos rótulos). Resultado atual: **134/134**.
2. **Página → copy:** lista todo texto visível que não vem da copy. Resultado atual: **nenhum**, além de marca, numeração, *Menu* e *Pular para o conteúdo*; as faixas de faturamento aparecem à parte, como sugestão a validar.
3. **Regras editoriais (§C e §D):** os cinco nomes do sistema só no hero e na seção 02; cada dado uma única vez e nenhum outro percentual; os quatro dados na mesma faixa, com fonte e ano; Velora Radar uma única vez, junto de Inteligência comercial; subtítulo do hero com até 25 palavras (19); nenhuma das expressões vetadas; nenhum "Agendar" sem agenda real; nenhuma seção de caso ou equipe sem conteúdo; campos obrigatórios. Resultado atual: todas ok.

Texto visível: **978 palavras na v2 contra 1.515 na v1 (−35%)**.

## Decisões tomadas nesta versão

**CTA e agenda (regra da copy v2, §C)**
- A copy pede *Agendar conversa de diagnóstico*, mas também que "Agendar" só apareça se abrir uma agenda real. Como ainda não há agenda configurada, os CTAs do hero e do formulário dizem **Solicitar conversa**. Ao preencher `config.mjs → agendaUrl`, voltam a *Agendar conversa de diagnóstico* e o envio validado do formulário abre a agenda.
- No cabeçalho, o botão é **Conversar** (o quinto item da navegação da copy): curto, e não promete agenda.

**Formulário**
- Campos e opções da copy v2. Obrigatórios: nome, e-mail corporativo, empresa, cargo e principal desafio. Faixa de faturamento em seleção, opcional por enquanto (`config.mjs → faturamentoObrigatorio`); WhatsApp profissional opcional.
- Mensagens de validação, erro e sucesso: as da copy v1 (a v2 não as redefine).
- Medição sem dados pessoais: eventos em `window.dataLayer` (Google Tag Manager ou equivalente) com só o nome do evento e o id do formulário — `velora_form_visualizacao`, `velora_form_inicio`, `velora_form_envio_valido` e `velora_agenda_aberta`. O **agendamento efetivado** acontece na ferramenta de agenda e deve ser medido lá (ou pelo evento de confirmação que ela oferecer).

**Texto que não vem literalmente da copy**
- Rótulos das seções 01–07: os títulos das seções no próprio MD (*Onde a aquisição trava*, *O sistema*…), com a numeração.
- *© 2026 Velora · Growth & Beyond* no rodapé; *Pular para o conteúdo* e *Menu* / *Fechar* para acessibilidade.
- Faixas de faturamento (sugestão de trabalho, ver pendências).
- SEO title e meta description: os da copy v1 (a v2 não os redefine).

**Elementos visuais**
- **Hero:** foto editorial sangrando à direita com vinheta; a primeira frase do título em cinza, a segunda em branco; a faixa das cinco etapas na base.
- **01:** foto fixa à esquerda enquanto as quatro dores rolam; faixa de evidências em painel Ink com ~80% em Acid; cada fonte leva à pesquisa original.
- **02:** circuito das cinco etapas com numeração grande. Ao entrar na tela, a luz percorre 01 → 05 e o retorno uma vez (menos de 5 s) e volta a 01; depois, a etapa sob o mouse acende. No celular, vira lista vertical com o retorno pela esquerda. Todo o texto fica sempre visível.
- **03:** o Velora Radar desenhado como um radar (anéis, varredura única, contas, prioridades em Acid, sinais, pessoas ligadas a uma conta). É um diagrama do papel do Radar, **não uma tela do produto**: sem dados, nomes ou números, e sem prometer previsão de intenção de compra.
- **04:** foto sangrando à direita e as letras R H O I em escala de cartaz.
- **06:** numeração grande; o 01 (Diagnóstico de Aquisição, o ponto de partida) em bloco Acid.
- **07:** foto do feixe de luz fixa à esquerda; formulário em fundo Bone (foco em Ink, nunca linha Acid no claro).

**Fotografia**
- 5 fotos fornecidas pela Velora (01/11/2026), tratadas em P&B (`scripts/tratar-fotos.py`). A foto da seção 04 foi reprocessada no tratamento escuro, porque a seção agora é Ink.
- As pessoas nas fotos não são identificadas e nenhuma legenda sugere que sejam sócios ou clientes.

**Design**
- Um ponto Acid por tela: o botão da navegação fica em contorno enquanto outro foco Acid está visível (CTA do hero e do formulário, dado em destaque, circuito, Radar, ponto de partida).
- Tons de apoio ajustados para contraste AA (texto terciário 48% / 60%, linhas de diagrama 40% / 52%); numerais inativos a 36%.
- Nenhuma animação em repetição; com `prefers-reduced-motion`, nada anima.
- Imagem de compartilhamento (`og.jpg`, 1200 × 630) com o título do hero e o logo; as tags `og:image` e `og:url` saem quando `urlBase` estiver preenchido.

## Logo, cabeçalho, rodapé e animações (04/11/2026)

**Logo.** O PNG oficial (versão escura) foi vetorizado (`scripts/vetorizar-logo.py`) e conferido contra o original: 0,2% de pixels diferentes, só nas bordas suavizadas. Emblema, palavra e *Growth & Beyond* usam a cor do fundo (grafite #282828 no claro, #F2F2F2 no escuro, como nos dois arquivos enviados); o ponto mantém o verde do arquivo (#CFF500). Cada listra do emblema é uma forma própria, para a animação. Três versões: **completo** (rodapé), **compacto** sem *Growth & Beyond* (cabeçalho, onde a assinatura ficaria com 4 px de altura) e **só a palavra** (cartaz do rodapé). Favicon e ícone de toque usam o emblema; o favicon troca de cor com o tema claro/escuro do navegador.

**Cabeçalho.** Transparente sobre o hero; sólido, com desfoque, a partir da primeira rolagem, e um pouco mais baixo. Some ao descer e volta ao subir (nunca some com o menu aberto, com foco do teclado dentro dele ou com movimento reduzido). Um traço único desliza até o link da seção atual e acompanha o mouse. Uma linha fina na base mostra o progresso de leitura. No celular, o menu ocupa a tela, com os itens numerados como as seções e entrada em sequência. Sem JavaScript, fica sólido e fixo.

**Rodapé.** Logo completo e o manifesto da copy; a navegação como índice das seções, em linha (o mesmo desenho da faixa do hero); colunas de **Contato** e **Empresa** que só aparecem quando preenchidas em `config.mjs → contato` e `config.mjs → empresa`; linha legal (© , CNPJ e política de privacidade quando houver) e *Voltar ao topo*; por fim, *velora.* em escala de cartaz, cortada pela borda, com o ponto em Acid.

**Animações.** Cada uma conta algo da página, e nenhuma se repete:
- o emblema se monta listra a listra, depois entram a palavra e o ponto (cabeçalho ao carregar; rodapé ao chegar);
- títulos do hero e das seções sobem palavra por palavra de trás de uma máscara (o leitor de tela ouve a frase inteira);
- no hero, a foto assenta, texto e botões entram em sequência e uma luz percorre a faixa das cinco etapas;
- os quatro dados contam até o valor publicado quando a faixa de evidências aparece;
- as fotos abrem a partir da borda de onde sangram (e começam a carregar 1.200 px antes, para não abrirem vazias);
- no circuito, as ligações se desenham na ordem do fluxo antes de a luz percorrer as etapas;
- as letras do RHOI sobem de trás da linha; o bloco Acid do ponto de partida (06) se preenche depois do número;
- no rodapé, *velora.* sobe por trás da borda e o ponto acende por último.

As durações passam das do briefing (até 400 ms) nas entradas de título, foto e logo (até 1,4 s), a pedido, para dar fluidez; continuam só com transformação e opacidade, sem repetição, sem rebote e sem nada que pisque. Com `prefers-reduced-motion`, nada anima e o cabeçalho não some. Sem JavaScript, tudo aparece no estado final.

## Verificações feitas

- Copy e regras editoriais: 134/134 trechos, nenhum texto fora da copy, todas as regras ok (`scripts/verificar.mjs`; também testado contra uma página adulterada, que ele reprova).
- axe-core (WCAG 2.2 AA + boas práticas): 0 violações no desktop e no celular.
- 70 testes de interação (Playwright): logo, cabeçalho (transparente, sólido, some e volta, progresso, traço da navegação), títulos animados com nome acessível inteiro, contagem dos dados, abertura das fotos, rodapé, fotos, CTAs coerentes com a agenda, circuito (percurso, mouse, retorno), radar, navegação marcando a seção, âncoras, validação e sucesso do formulário, eventos de medição sem dados pessoais, abertura da agenda após envio válido, menu do celular, áreas de toque, movimento reduzido e página sem JavaScript.
- Larguras de 320 a 1920 px sem rolagem horizontal nem texto estourando.
- HTML único aberto direto do disco, sem rede: fontes, 5 fotos e ícone embutidos, sem erros.

## Pendências antes de publicar

Bloqueiam a publicação:
- [ ] **Destino do formulário** (`config.mjs → formularios.conversa`), de preferência HubSpot. Hoje está em modo demonstração: valida, mostra a mensagem de sucesso e **não envia nada** (aviso no console). Fazer um teste real de criação de contato com a origem do lead.
- [ ] **Agenda real** (`config.mjs → agendaUrl`), se a conversa for agendada direto. Sem ela, o site continua com *Solicitar conversa*.
- [ ] **Aviso de privacidade / LGPD** e link da política de dados (`config.mjs → privacidade`). O texto não faz parte da copy aprovada.
- [ ] **Faixas de faturamento** (`config.mjs → faixasFaturamento`) e se o campo deve ser obrigatório para triagem.
- [ ] **Medição:** instalar o Google Tag Manager (ou equivalente) para receber os eventos do `dataLayer`.
- [ ] **Indexação:** trocar `config.mjs → indexavel` para `true` (remove o noindex e libera o robots.txt) e preencher `urlBase` (canonical, og:url, og:image).

- [ ] **Dados do rodapé** (`config.mjs → contato` e `config.mjs → empresa`): e-mail, telefone/WhatsApp, LinkedIn, razão social, CNPJ e endereço. Só aparece o que for preenchido.

Conteúdo a validar ou produzir:
- [ ] Dois casos com números, período, atribuição e autorização (`config.mjs → casos`): contexto, obstáculo, ações, indicador e comparação.
- [ ] Equipe: retrato e duas linhas de senioridade por pessoa, com papel no projeto (`config.mjs → equipe`). Validar composição e títulos.
- [ ] Captura real do Velora Radar e confirmação dos recursos que o desenho ilustra.
