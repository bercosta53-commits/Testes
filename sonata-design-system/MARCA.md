Sistema visual das redes sociais da Sonata Aparelhos Auditivos (Porto Alegre). Ele parte do que o feed já tem de melhor (fotos de gente de verdade, o azul-marinho do logo, o verde-água do site, a Poppins) e sobe o padrão para o nível das melhores marcas de saúde: **composição modular**, com fotos em módulos de mesmo raio e cartões de cor que seguram o texto; **foto estourada com cartão flutuante** quando a imagem é a protagonista; **barra de assinatura** com logo, endereço e telefone em todo post; ícones de linha e elementos de interface (botões, aba vertical, controle de volume) que dão o ar de produto cuidado. Paleta fechada, letra grande para quem tem 60 anos ou mais e modelos que uma pessoa ou uma IA monta sem errar. Tudo aqui vale para o canvas real do post, com 1080 px de largura.

## Essência

**Ondas: o som que aproxima.** A Sonata não vende aparelho; devolve conversa, risada, música e a voz de quem a gente ama. O som chega em ondas, e as ondas são a linguagem do sistema: nas linhas finas que atravessam o fundo, na marca do rótulo, nos anéis ao redor do aparelho, no controle de volume, no ritmo entre módulos cheios e respiro.

A marca se comporta como as sócias, as fonoaudiólogas Daiana Cardoso Kuse e Fernanda Brugiolo:

| Traço | No visual | No texto |
|---|---|---|
| Próxima | Pessoas juntas, perto, se tocando; manuscrito nas datas | "você", "a gente", "quem você ama" |
| Efetiva | Uma ideia por post, hierarquia de três níveis, ícones que dizem o serviço | Frases curtas, verbo no começo |
| Profissional | Grid modular, raio único, barra de assinatura, paleta fechada | Termos corretos, sem promessa milagrosa |
| Cuidadosa | Respiro, contraste alto, letra grande, cantos arredondados | Sem medo, sem pena, sem pressa |

Verbos da marca: **ouvir, escutar, conversar, estar junto, estar perto, se mover**. Toda arte mostra ou sugere pelo menos um deles.

## Para quem falamos

- **Ela, 60+**: mulher aposentada, classe AB, ativa. É quem mais aceita o tratamento, cuida do aparelho e muitas vezes compra também para o marido. Fale com ela como quem decide.
- **Os filhos que cuidam, 50–65**: classe AB, procuram segurança e informação clara para os pais.

Isso define três regras de forma: texto nunca abaixo de 28 px no canvas (corpo a partir de 34 px, apoio a partir de 38 px), contraste mínimo de 4,5:1 e no máximo 35 a 40 palavras na arte (a lista, que é mais escaneável, vai a 60). Mostre pessoas de 60+ bonitas, ativas e acompanhadas; nunca sozinhas e tristes para "dramatizar" a perda.

## Voz

- Escreva em segunda pessoa, frases de até 12 palavras, uma ideia por post. O resto vai para a legenda do Instagram.
- Benefício antes da especificação: "Carregue à noite. Converse o dia inteiro." em vez de "bateria de íons de lítio com 24 h de autonomia".
- Use "perda auditiva", "ouvir melhor", "voltar a escutar". Nunca "surdo", "deficiente", "velhinho", "vovozinha", "problema de audição".
- Sem "imperdível", "não perca", "compre já". No máximo um ponto de exclamação por arte. Emoji só na legenda, nunca na arte.
- O regionalismo é patrimônio ("Bah, tchê!" abre o site), mas só em datas gaúchas e posts de bairro.
- Depoimento sempre com nome real, um detalhe (idade, cidade ou "paciente Sonata") e autorização por escrito.
- Educativo sempre assinado por uma das fonos em `legenda`: "Por Daiana Cardoso Kuse, fonoaudióloga".

| Em vez de | Escreva |
|---|---|
| Não sofra mais com a surdez! | Volte a escutar quem você ama. |
| Aparelhos com a melhor tecnologia do mercado | Pequeno no ouvido. Enorme na conversa. |
| Promoção imperdível!!! | Seu aparelho novo a partir de R$ 125 por mês. |
| Idosos com perda auditiva | Quem já não escuta como antes |

## Pilares e mix do mês

| Pilar | Peso | Modelos |
|---|---|---|
| Afeto — vida, convivência, datas | 35% | `destaque`, `frase`, `data` |
| Cuidado — saúde auditiva explicada | 30% | `bento`, `lista`, carrossel |
| Tecnologia — aparelhos e recursos | 15% | `tecnologia` |
| Sonata — fonos, pacientes, serviços, condições | 20% | `retrato`, `equipe`, `depoimento`, `lista`, `oferta` |

`oferta` aparece no máximo em 1 de cada 5 posts. Alterne no grid do perfil: foto estourada (`destaque`, `data`), composição modular clara (`névoa`) e composição modular escura (`marinho`); nunca três posts seguidos com o mesmo fundo.

## Cor

A paleta é **fechada**: duas famílias de 10 tons — `marinho-50…900` e `agua-50…900` — mais `branco` e dois cinzas que só existem para texto (`cinza-700`, `cinza-500`). Nenhuma outra cor entra na arte: nada de dourado, laranja, vermelho ou verde-bandeira, nem em selo, nem em data comemorativa. Cores de outras famílias só aparecem dentro de fotos.

- `marinho-700` (#143D66) é a cor exata do logo. `agua-400` (#66D2CD) é o verde-água do site. As escalas foram construídas a partir delas, com passos regulares de luminosidade.
- Proporção por post: 60% fundo e fotos, 30% marinho (texto e cartões), 10% verde-água (ênfase, ícone, um cartão de acento).
- Gradientes permitidos: o brilho suave dos cartões (`marinho-700` → `marinho-800`, `agua-300` → `agua-400`, saindo do canto superior direito), o módulo de produto (radial do próprio tema) e o véu curto da base na foto estourada. Nunca degradê entre marinho e água, nunca degradê no texto.

### Os quatro fundos (temas)

O tema vale para o post **e para cada cartão**: um cartão marinho sobre um fundo névoa troca sozinho as cores de título, ênfase, apoio, chip e botão (`data-theme` próprio).

| Tema | Fundo | Título / ênfase | Use para |
|---|---|---|---|
| `nevoa` | `marinho-100` | `marinho-700` / `agua-700` | O fundo de "app": bento, lista, retrato, oferta, tecnologia, passo |
| `claro` | `branco` | `marinho-700` / `agua-600` | Cartões sobre foto e sobre marinho; lista e frase claras |
| `agua` | `agua-400` | `marinho-900` / `marinho-600` | Cartão de acento (chamada, itens), fundo de datas e números |
| `marinho` | `marinho-800` | `branco` / `agua-400` | Fundo escuro do bento, frase, equipe, depoimento; cartão escuro sobre névoa |

Cartão padrão por fundo: névoa → cartão marinho · marinho → cartão claro · água → cartão claro · claro → cartão marinho. O segundo cartão (acento) é água. A barra de assinatura é branca em todos os fundos (névoa no fundo claro).

### Contraste (verificado, WCAG)

| Tema | Título | Ênfase | Apoio | Rótulo | Legenda | Texto do botão |
|---|---|---|---|---|---|---|
| névoa | 9,5 | 4,6 | 7,7 | 4,6 | 4,6 | 11,1 |
| claro | 11,1 | 3,7 | 9,0 | 5,4 | 5,4 | 11,1 |
| água | 8,9 | 4,0 | 7,6 | 6,2 | 7,6 | 13,7 |
| marinho | 13,7 | 7,6 | 9,7 | 9,6 | 7,1 | 8,9 |

- **Nunca texto branco sobre `agua-400`** (1,8:1). Texto sobre água é sempre `marinho-800` ou `marinho-900`.
- Ênfase abaixo de 4,5:1 (claro, água) só em título de 48 px ou mais.
- Ênfase colorida existe só no título. No apoio e no corpo, nada de cor nem de asterisco.

## Tipografia

**Poppins** continua (é a fonte do site), agora em **Medium 500** nos títulos: firme, contemporânea e muito legível. A ênfase muda **só a cor**, no mesmo peso: a palavra que vibra sem gritar.

| Estilo | Tamanho / entrelinha | Peso | Uso |
|---|---|---|---|
| `display` | 88 / 1,04 (64–76 dentro de cartões) | 500 | A frase do post: destaque, frase, manchete do bento. Reduz até 52 px |
| `titulo` | 64 / 1,08 (56 em cartão estreito) | 500 | Título dentro de cartões. Reduz até 40 px |
| `titulo-compacto` | 52 / 1,12 | 500 | Oferta, tecnologia, citação |
| `enfase` | herda | herda | 1 trecho de 1 a 3 palavras por título, cor `enfase` |
| `apoio` | 38 / 1,36 | 400 | Até 3 linhas, 18 palavras |
| `corpo` | 34 / 1,42 | 400 | Texto de cartão estreito e do carrossel. Nunca abaixo de 34 px |
| `rotulo` | 28 / 1,2, +0,14em | 600, CAIXA ALTA | Editoria, com a marca de ondas antes |
| `nome` | 34 / 1,2 | 600 | Quem assina; título de item de lista (38) |
| `chamada` | 32 | 600 | CTA, linha de chamada, chips |
| `legenda` | 28 / 1,4 | 400 | Crédito, nota legal, barra de assinatura. O menor texto possível |
| `numeral` | 150 / 0,92 (132 no cartão) | 600 | Preço e números de prova. "R$" sai em 48 px |
| `manuscrito` | 132 / 1 | Ms Madi | Só datas: 1 a 4 palavras, mínimo 96 px |

- Títulos em caixa baixa de frase. Caixa alta é exclusiva do `rotulo` e da aba vertical.
- Alinhamento à esquerda, sempre. Centralizado só no modelo `frase`.
- **Manuscrito**: uma única fonte cursiva (Ms Madi), só no modelo `data`, nunca a única fonte da informação (a data vai na pílula, em Poppins).
- Proibido: fontes condensadas, títulos em Black ou ExtraBold inteiros, itálico de efeito, texto em contorno, sombra em texto.

## Grid, margens e espaçamento

| Formato | Canvas | Margens | Área útil |
|---|---|---|---|
| `feed` (padrão, também carrossel) | 1080 × 1350 | 56 em volta; barra de 96 px a 48 px da base | 968 × 1126 |
| `quadrado` (anúncio, WhatsApp) | 1080 × 1080 | 56 em volta; barra igual | 968 × 856 |
| `story` (e capa de Reels) | 1080 × 1920 | 64 nas laterais, `story-topo` 220, barra acima de `story-base` 300 | 952 × 1280 |

- **Grid modular de 2 colunas** com calha única de 24 px (`grid-calha`): todo módulo ocupa 1 ou 2 colunas e 1 ou 2 linhas. A mesma calha separa os módulos da barra.
- **Raio único de 40 px** (`raio-40`) em todo cartão e módulo de foto; pílula (`raio-pilula`) em botões, chips, itens de lista, aba e barra.
- Respiro interno dos cartões: 48 px (40 px no quadrado). Entre elementos dentro do cartão: 24 px. O pé do cartão (chamada, assinatura, navegação) desce sempre para a base.
- Linha de base de 8 px. Espaços só da escala: `esp-8`, `esp-16`, `esp-24`, `esp-32`, `esp-48`, `esp-56`, `esp-64`, `esp-96`.
- No quadrado, os grids de duas linhas viram uma linha (o bento mostra uma foto só) e os cartões ficam mais compactos; o motor faz isso sozinho.

## Hierarquia

Todo post tem um ponto de entrada e três níveis de texto, lidos nesta ordem:

1. **Imagem** — a foto (estourada ou no maior módulo), o aparelho, o número. É o que para o dedo.
2. **Título** — uma frase, uma ênfase. O maior texto da arte, pelo menos 1,6× o apoio.
3. **Apoio** — completa ou explica; nunca repete o título.
4. **Ação e assinatura** — botão ou linha de chamada no pé do cartão; barra de assinatura no pé do post.

Um elemento por nível. Se dois disputam a atenção (dois números, dois títulos, dois CTAs), um deles sai. O módulo maior é sempre a foto ou o cartão de texto, nunca o de acento.

## Elementos

Todos derivam das duas ondas que abraçam o "S" do logo e da linguagem de interface que o público já usa no celular.

- **Cartão** — bloco de cor com tema próprio, raio 40, brilho suave no canto superior direito. Sobre foto estourada, flutua com `sombra-cartao`; no grid, apoia-se na calha, sem sombra.
- **Módulo de foto** — a foto preenche um retângulo de raio 40 dentro do grid; o rosto é enquadrado pelo motor. Todos os módulos de um post têm o mesmo raio.
- **Barra de assinatura** — pílula de 96 px no pé de todo post: logo, endereço, telefone e botão de seta. É a assinatura do sistema e substitui o logo solto. Só o miolo do carrossel não leva barra.
- **Selo de ícone** — círculo de 112 px no canto superior direito do cartão, com um ícone que resume o post (ondas, coração, som). Contrasta com o cartão.
- **Aba vertical** — pílula alta ao lado do cartão flutuante, com a editoria em caixa alta girada e um botão de seta. Só no `destaque` e na capa do carrossel.
- **Ícones de linha** — 16 ícones de traço 2 (base Feather, licença MIT): som, ondas, calendário, telefone, local, coração, seta, mais, check, bateria, bluetooth, conversa, pessoas, escudo, cartão, ajuste. Sempre dentro de botão, chip ou pílula; nunca soltos e nunca ilustrativos.
- **Botões** — círculo cheio (`cta-fundo`) ou contorno; 64 a 96 px. A **linha de chamada** é botão + texto (dentro de cartões); a **pílula de CTA** é texto + seta num círculo (frase, oferta grande, fim de carrossel). Um CTA por post.
- **Chips** — até 3 benefícios de uma ou duas palavras, cada um com ícone, em `chip-fundo`.
- **Itens de lista** — pílulas de 156 px de altura, alternando água e marinho (água e branco no fundo escuro), com título, uma linha de texto e botão de ícone.
- **Controle de volume** — pílula com ícone de som e cinco barras crescentes, três acesas: o "ouvir melhor" em forma de interface. Só no modelo `frase`.
- **Linhas de onda** — três ondas finas (3 px) atravessando o fundo atrás do grid, em `grafismo-medio`. Textura, nunca protagonista; nunca sobre foto.
- **Anéis de escuta** — três círculos finos ao redor do aparelho no módulo de produto.
- **Linha de som** — barras simétricas que crescem no centro. Alternativa ao controle de volume na `frase`.
- **Marca do rótulo** — as duas ondas do "S" em miniatura, antes de todo rótulo.
- **Assinatura de pessoa** — nome em `nome` e detalhe em `legenda` sob um fio curto de `grafismo-forte`; no módulo de foto, numa etiqueta clara no canto inferior.
- **Indicador de página** — pontos de 14 px, ativo em pílula de 48 px, dentro do cartão.

## Fotografia

Duas formas de usar foto, as duas sem moldura improvisada:

1. **Estourada** (`destaque`, `data`, capa do carrossel): a foto ocupa o post inteiro; um véu marinho curto escurece só a base; o texto pousa num **cartão flutuante** claro, com aba vertical e selo de ícone. O texto nunca fica solto sobre a imagem.
2. **Em módulos** (`bento`, `retrato`, `equipe`, `oferta`, `tecnologia`, passo e fim do carrossel): a foto preenche um ou mais módulos do grid, sempre com o mesmo raio 40, ao lado de cartões de cor.

- Nunca recorte pessoas em círculo, gota, arco ou forma livre. O único recorte permitido é o do aparelho (PNG transparente), dentro do módulo de produto.
- Na ficha, `foto.rosto` diz onde está o rosto na imagem ("57% 30%"): o motor enquadra a pessoa no terço de cima (estourada) ou um pouco acima do centro (módulo) e, se o corte não alcança, aproxima a foto até 1,35×.
- Pessoas de 60+ **com alguém**, em movimento, luz natural e quente, fundo com profundidade. As fonos olham para a câmera; as demais pessoas, umas para as outras.
- Aparelho: recorte limpo ou foto de uso real. Sempre com "Imagem ilustrativa ampliada." quando ampliado.
- Evite: exame clínico em close, pessoa sozinha e aflita, fundo branco de banco de imagem, filtro colorido.
- Use os originais em alta: mínimo 1080 px no lado menor para foto estourada, 600 px para módulo.

## Logo

- Três versões: `sonata-marinho` (barra clara e fundos claros), `sonata-branco` (barra escura) e `sonata-agua` (só sobre `marinho-800` ou `marinho-900`, quando o branco pesar).
- O logo mora **na barra de assinatura**, com 40 px de altura, à esquerda. Um logo por post; nada de logo solto sobre foto.
- Nunca recolorir fora das três versões, distorcer, contornar ou aplicar sobre foto.

## Movimento (Reels e stories)

As linhas de onda se desenham da esquerda para a direita (2,4 s, curva suave); cartões entram subindo 24 px com fade; as barras do controle de volume acendem uma a uma. Cortes no tempo da frase, nunca piscando. Legenda embutida sempre, num cartão.

## O passo à frente (o que muda no feed atual)

- Fotos em caixas improvisadas e texto solto sobre a imagem → grid modular de raio único, ou foto estourada com cartão flutuante.
- Logo em posições variadas → barra de assinatura fixa com logo, endereço e telefone.
- Várias fontes cursivas e condensadas → Poppins Medium nos títulos, ênfase só de cor, um único manuscrito nas datas.
- Ondas e formas diferentes a cada post → linhas de onda, marca do rótulo e anéis tirados do logo.
- Ícones e selos variados → 16 ícones de linha, sempre em botão, chip ou pílula.
- Verde-água em vários tons soltos → duas escalas fechadas de 10 tons e quatro fundos.
- Texto branco sobre verde-água → texto marinho sobre água.
- Letras de 20 a 24 px no canvas → mínimo de 28 px, corpo a partir de 34 px.
- Muito texto na arte → 35 a 40 palavras; o resto na legenda.

## Modelos

| Modelo | Pilar | Temas | Composição |
|---|---|---|---|
| `destaque` | Afeto | marinho, agua, claro | Foto estourada, cartão flutuante com título e chamada, aba vertical e selo |
| `bento` | Cuidado | nevoa, marinho, agua | a: manchete + mosaico · b: cartão + foto alta + foto · c: foto larga + cartão largo |
| `lista` | Sonata / Cuidado | nevoa, marinho, claro | Título + até 4 itens em pílula com ícone + CTA |
| `retrato` | Sonata | nevoa, marinho, agua | Cartão com título, chips e chamada ao lado da pessoa em módulo alto com botões |
| `frase` | Afeto | marinho, nevoa, agua, claro | Frase centralizada com controle de volume ou linha de som |
| `depoimento` | Sonata | marinho, nevoa, agua | Cartão com aspas, citação, nome e selo; com foto, a pessoa em módulo |
| `oferta` | Sonata | nevoa, marinho, agua | Cartão escuro com preço e chamada, foto alta, mini-cartão de garantias |
| `tecnologia` | Tecnologia | nevoa, marinho | Módulo de produto com anéis, cartão com chips de ícone, foto de uso |
| `data` | Afeto | marinho, agua, claro | Foto estourada, cartão claro com data, manuscrito e frase |
| `equipe` | Sonata | marinho, nevoa | As sócias em módulos com etiqueta de nome, cartão largo |
| `carrossel-capa` / `-passo` / `-fim` | Cuidado | marinho · nevoa · marinho | Capa estourada com aba; passo com foto e cartão; fim com a fono e contatos |

Para montar posts com IA, siga o **Guia para IA**: a IA escreve uma ficha JSON (`ia/ficha-post.schema.json`) e o motor `Sonata.render()` aplica este manual sozinho.
