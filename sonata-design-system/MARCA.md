Sistema visual das redes sociais da Sonata Aparelhos Auditivos (Porto Alegre). Ele organiza o que o feed já tem de melhor — fotos de gente de verdade ocupando o post inteiro, o azul-marinho do logo, o verde-água do site, a Poppins leve com a palavra em negrito itálico — e dá um passo à frente: paleta fechada, véus em degradê no lugar de caixas, uma assinatura gráfica só (as ondas que abraçam o "S" do logo), tamanhos de letra pensados para quem tem 60 anos ou mais e modelos de post que uma pessoa ou uma IA monta sem errar. Tudo aqui vale para o canvas real do post, com 1080 px de largura.

## Essência

**Ondas: o som que aproxima.** A Sonata não vende aparelho; devolve conversa, risada, música e a voz de quem a gente ama. O som chega em ondas, e as ondas são a linguagem do sistema: nos arcos, na faixa fluida da base, na linha de som, no ritmo entre cheio e vazio.

A marca se comporta como as sócias, as fonoaudiólogas Daiana Cardoso Kuse e Fernanda Brugiolo:

| Traço | No visual | No texto |
|---|---|---|
| Próxima | Pessoas juntas, perto, se tocando; manuscrito nas datas | "você", "a gente", "quem você ama" |
| Efetiva | Uma ideia por post, hierarquia de três níveis | Frases curtas, verbo no começo |
| Profissional | Grid fixo, paleta fechada, assinatura da fono no educativo | Termos corretos, sem promessa milagrosa |
| Cuidadosa | Respiro, contraste alto, letra grande | Sem medo, sem pena, sem pressa |

Verbos da marca: **ouvir, escutar, conversar, estar junto, estar perto, se mover**. Toda arte mostra ou sugere pelo menos um deles.

## Para quem falamos

- **Ela, 60+**: mulher aposentada, classe AB, ativa. É quem mais aceita o tratamento, cuida do aparelho e muitas vezes compra também para o marido. Fale com ela como quem decide.
- **Os filhos que cuidam, 50–65**: classe AB, procuram segurança e informação clara para os pais.

Isso define três regras de forma: texto nunca abaixo de 28 px no canvas (corpo a partir de 38 px), contraste mínimo de 4,5:1 e no máximo 35 palavras na arte. Mostre pessoas de 60+ bonitas, ativas e acompanhadas; nunca sozinhas e tristes para "dramatizar" a perda.

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
| Afeto — vida, convivência, datas | 35% | `frase-foto`, `frase`, `data` |
| Cuidado — saúde auditiva explicada | 30% | `educativo`, carrossel |
| Tecnologia — aparelhos e recursos | 15% | `tecnologia` |
| Sonata — fonos, pacientes, condições | 20% | `fono`, `depoimento`, `oferta` |

`oferta` aparece no máximo em 1 de cada 5 posts. Alterne fundos claros e escuros no grid do perfil: nunca três posts seguidos no mesmo tema.

## Cor

A paleta é **fechada**: duas famílias de 10 tons — `marinho-50…900` e `agua-50…900` — mais `branco` e dois cinzas que só existem para texto (`cinza-700`, `cinza-500`). Nenhuma outra cor entra na arte: nada de dourado, laranja, vermelho ou verde-bandeira, nem em selo, nem em data comemorativa. Cores de outras famílias só aparecem dentro de fotos.

- `marinho-700` (#143D66) é a cor exata do logo. `agua-400` (#66D2CD) é o verde-água do site. As escalas foram construídas a partir delas, com passos regulares de luminosidade.
- Proporção por post: 60% fundo, 30% marinho (texto e blocos), 10% verde-água (ênfase e grafismo). No tema `agua` e no `marinho`, inverta os papéis, mas mantenha um único acento.
- Gradientes permitidos são só três: o halo radial do próprio tema (`fundo-2` sobre `fundo`), o gradiente `mar` (`agua-800` → `marinho-900`, 160°) e o véu de foto (transparente → `veu-foto`). Nada de degradê entre marinho e água no texto.

### Os cinco fundos (temas)

Cada post recebe um tema; os tokens semânticos (`fundo`, `titulo`, `enfase`, `apoio`, `rotulo`, `legenda`, `grafismo-*`, `cta-*`) trocam sozinhos.

| Tema | Fundo | Título / ênfase | Use para |
|---|---|---|---|
| `claro` | `branco` + halo `agua-100` | `marinho-700` / `agua-600` | Educativo, fono, miolo de carrossel |
| `bruma` | `agua-50` + halo `agua-200` | `marinho-700` / `agua-700` | Frases, depoimentos — o respiro com cor |
| `agua` | `agua-400` + halo `agua-300` | `marinho-900` / `marinho-700` | Datas, fechamento, números de prova |
| `marinho` | `marinho-800` + halo `marinho-700` | `branco` / `agua-400` | Tecnologia, oferta, frase de impacto |
| `mar` | `agua-800` → `marinho-900` | `branco` / `agua-300` | Capa de carrossel, lançamento, noite |

### Contraste (verificado, WCAG)

- **Nunca texto branco sobre `agua-400`** (1,8:1). O botão atual do site faz isso; nas redes, texto sobre água é sempre `marinho-800` ou `marinho-900`.
- `agua-600` sobre branco tem 3,7:1: serve só para a ênfase do título (64 px ou mais). Em texto menor, use `agua-700` (5,4:1).
- `agua-400` como texto só sobre `marinho-800` ou mais escuro (7,6:1).
- Ênfase colorida existe só no título. No apoio e no corpo, nada de cor nem de asterisco.

## Tipografia

**Poppins** continua (é a fonte do site) e ganha um papel fixo para cada peso. A assinatura é a mesma do "prazer de *ouvir*" do site: a frase em **Light 300**, a voz calma, e de 1 a 3 palavras em **ExtraBold 800 itálico**, a palavra que vibra.

| Estilo | Tamanho / entrelinha | Peso | Uso |
|---|---|---|---|
| `display` | 112 / 1,04 | 300 | A frase do post. Máx. 4 linhas; reduz até 80 px |
| `titulo` | 84 / 1,08 | 300 | Título de educativo, tecnologia, fono. Reduz até 60 px |
| `titulo-compacto` | 64 / 1,12 | 300 | Miolo de carrossel, citação |
| `enfase` | herda | 800 itálico | 1 trecho por título, cor `enfase` |
| `apoio` | 42 / 1,35 | 400 | Até 3 linhas, 22 palavras |
| `corpo` | 38 / 1,45 | 400 | Só no miolo do carrossel |
| `rotulo` | 28 / 1,2, +0,16em | 600, CAIXA ALTA | Editoria ou data |
| `nome` | 34 / 1,2 | 600 | Quem assina |
| `chamada` | 34 | 600 | CTA e chips |
| `legenda` | 28 / 1,4 | 400 | Crédito, nota legal. O menor texto possível |
| `numeral` | 220 / 0,9 | 800 itálico | Preço, número do passo, "2.500" |
| `manuscrito` | 150 / 1 | Ms Madi | Só datas: 1 a 4 palavras, mínimo 120 px |

- Títulos em caixa baixa de frase (só a primeira letra maiúscula). Caixa alta é exclusiva do `rotulo`.
- Alinhamento à esquerda, sempre. Centralizado só no logo da base do modelo `data`.
- **Manuscrito**: uma única fonte cursiva (Ms Madi) no lugar das várias que o feed usa hoje. Entra só no modelo `data` e nunca é a única fonte da informação: a data vai no `rotulo`, em Poppins.
- Proibido no sistema: fontes condensadas, Poppins Black em título inteiro (como em "DIA MUNDIAL DA AUDIÇÃO"), texto em contorno, sombra em texto.

## Grid, margens e espaçamento

| Formato | Canvas | Margens (lados · topo · base) |
|---|---|---|
| `feed` (padrão, também carrossel) | 1080 × 1350 | 96 · 96 · 96 |
| `quadrado` (anúncio, WhatsApp) | 1080 × 1080 | 88 · 88 · 88 |
| `story` (e capa de Reels) | 1080 × 1920 | 96 · `story-topo` 250 · `story-base` 320 |

- Grid de 6 colunas de 128 px (`grid-coluna`), calha de 24 px, dentro da margem de 96 px: 888 px úteis. Texto de apoio ocupa de 4 a 6 colunas.
- O grid 3:4 do perfil corta cerca de 34 px de cada lado do post 4:5. A margem de 96 px já protege texto e logo; foto e grafismo podem sangrar.
- Linha de base de 8 px. Espaços só da escala: `esp-8`, `esp-16`, `esp-24`, `esp-32`, `esp-48`, `esp-64`, `esp-96`, `esp-128`.
- Ritmo vertical fixo: rótulo → título `esp-24`; título → apoio `esp-32`; texto → foto ou grafismo, no mínimo `esp-48`; apoio → CTA `esp-64`.
- **Respiro**: pelo menos 40% do canvas sem texto. Se não couber, corte texto, não espaço.

## Hierarquia

Todo post tem um ponto de entrada e três níveis de texto, lidos nesta ordem:

1. **Imagem ou grafismo** — a foto, o aparelho, o número. É o que para o dedo.
2. **Título** — uma frase, uma ênfase. É o maior texto da arte, pelo menos o dobro do apoio.
3. **Apoio** — completa ou explica; nunca repete o título.
4. **Assinatura** — logo, `legenda`, CTA, indicador de página. Pequena e sempre no mesmo lugar.

Um elemento por nível. Se dois disputam a atenção (dois números, duas fotos, título e CTA do mesmo tamanho), um deles sai.

## Elementos

Todos derivam das duas ondas que abraçam o "S" do logo. Use **no máximo dois grafismos por post**, nunca atrás de texto.

- **Véus** — a peça que mais trabalha no sistema. Degradê suave (curva senoidal) da cor do tema até o transparente, saindo do lado onde fica o texto: da base (`frase-foto`, `fono`, stories), da esquerda (`educativo`, `oferta`, `depoimento`) ou do topo. Cores: `marinho-900` e `agua-900` nos temas escuros, `branco` e `agua-50` nos claros, `agua-400` no fechamento do carrossel. Um véu curto no topo protege o logo quando a foto é clara ali. O véu cobre o texto, nunca o rosto.
- **Ondas no foco** — três arcos finos (9 px), brancos, ao redor da cabeça de quem escuta, abrindo para o lado do texto: o som chegando à pessoa. Na ficha, `foto.ondas` com o ponto em porcentagem ("46% 27%"). Use só quando a pessoa está ouvindo algo ou alguém.
- **Arcos de escuta** — três traços concêntricos com ponta redonda, do mais forte (dentro, `grafismo-forte`) ao mais suave (fora, `grafismo-suave`), cortados pela borda num canto. Nos posts de cor são a assinatura; sobre foto, ficam finos e brancos.
- **Onda** — faixa fluida em duas camadas. Em posts de cor, pousa na base. Sobre foto, vira **campo de onda**: a cor do tema sobe da base com borda ondulada e a foto continua por trás, sem moldura (`data`, miolo do carrossel).
- **Linha de som** — barras simétricas que crescem no centro, largura útil do grid, 112 px de altura. Só em frases sem foto.
- **Recorte de produto** — o aparelho em PNG transparente, flutuando com `sombra-flutuante` no centro de anéis de escuta. Nunca dentro de círculo ou caixa.
- **CTA** — pílula `raio-pilula`, 104 px de altura, `cta-fundo` e `cta-texto`, verbo + objeto + seta. Um por post.
- **Chips** — até 3 benefícios de uma ou duas palavras, com ponto `grafismo-forte`.
- **Selo** — círculo de 248 px em `cta-fundo` com `numeral` reduzido ("18x"). Só em `oferta`.
- **Assinatura de pessoa** — nome em `nome` e detalhe em `legenda` sob um fio curto de `grafismo-forte`. Nunca retrato em círculo.
- **Indicador de página** — pontos de 16 px, ativo em pílula de 56 px, no rodapé do carrossel.

## Fotografia

**Foto sempre estourada.** A foto ocupa o post inteiro, ou sobe da base até uma onda; nunca em círculo, caixa, moldura com canto recortado ou janela. Quem aparece na foto não pode parecer preso a uma forma. A legibilidade vem do véu, não do recorte.

- Pessoas de 60+ **com alguém**: casal, netos, amigas, família, a fono. Em movimento: caminhando, cantando, rindo, torcendo, viajando.
- Luz natural e quente, pele real, fundo com profundidade (parque, casa, rua, consultório claro).
- Enquadre deixando ar do lado do texto: rosto no terço de cima quando o véu vem da base; pessoa à direita quando o véu vem da esquerda. Ajuste com `foco` (object-position) até nenhum rosto ficar sob o véu.
- As fonos olham para a câmera; as demais pessoas olham umas para as outras ou para o que estão vivendo.
- Aparelho: recorte limpo em PNG, ou foto de uso real (atrás da orelha, nas mãos, no estojo). Sempre com `legenda` "Imagem ilustrativa ampliada." quando ampliado.
- Evite: close de exame com otoscópio, pessoa sozinha e aflita para dramatizar a perda, fundo branco de banco de imagem, filtro colorido. A única cor sobre a foto é o véu da paleta.
- Use os arquivos originais em alta (mínimo 1080 px no lado menor). Fotos do site da Sonata já servem: sócias, gaúcho, casal no karaokê, mulher no parque, adaptação do aparelho.

## Logo

- Três versões: `sonata-marinho` (fundos `claro`, `bruma`, `agua` e véus claros), `sonata-branco` (`marinho`, `mar` e fotos com véu escuro) e `sonata-agua` (só sobre `marinho-800` ou `marinho-900`, quando o branco pesar).
- Altura de 64 px no feed e no story, 56 px no quadrado. Área livre ao redor: a altura do "S".
- Posição fixa: canto superior esquerdo, sobre o véu curto do topo quando há foto. Exceções: sobre o campo de onda em `data` e no canto inferior direito do `depoimento` sem foto. Um logo por post; o miolo do carrossel não leva logo.
- Nunca recolorir fora das três versões, distorcer, contornar ou aplicar sobre área clara de foto sem véu.

## Movimento (Reels e stories)

Os arcos se desenham de dentro para fora (2,4 s, curva suave, 0,25 s entre arcos); a onda desliza devagar na horizontal; a linha de som pulsa no ritmo da fala. Cortes no tempo da frase, nunca piscando. Legenda embutida sempre, em `apoio` branco sobre véu.

## O passo à frente (o que muda no feed atual)

- Várias fontes cursivas e condensadas → Poppins com papéis fixos + um único manuscrito, só em datas.
- Ondas e formas diferentes a cada post → arcos de escuta e uma onda padronizada, tirados do logo.
- Fotos em caixas, círculos e molduras → foto sempre estourada, com véu em degradê da paleta do lado do texto.
- Verde-água em vários tons soltos → duas escalas fechadas de 10 tons e cinco fundos.
- Texto branco sobre verde-água → texto marinho sobre água.
- Letras de 20 a 24 px no canvas → mínimo de 28 px, corpo a partir de 38 px.
- Logo em posições variadas → posições fixas por modelo.
- Muito texto na arte → no máximo 35 palavras; o resto na legenda.

## Modelos

| Modelo | Pilar | Temas | Composição |
|---|---|---|---|
| `frase-foto` | Afeto | marinho, mar, claro | Foto estourada, véu da base (ou da esquerda), frase grande |
| `frase` | Afeto | todos | Sem foto: o vazio é o protagonista, arcos e linha de som |
| `educativo` | Cuidado | claro, bruma | Foto estourada, véu claro da esquerda, assinatura da fono |
| `tecnologia` | Tecnologia | marinho, mar | Aparelho recortado no centro dos anéis, ou foto de uso sob véu |
| `data` | Afeto | agua, bruma, mar | Foto estourada e campo de onda subindo da base com o manuscrito |
| `depoimento` | Sonata | bruma, claro, marinho | Com foto: pessoa estourada e véu; sem foto: a citação ocupa o post |
| `fono` | Sonata | claro, bruma | Foto da sócia estourada, véu claro da base, nome sob fio |
| `oferta` | Sonata | marinho, mar | Foto de pessoas sob véu marinho, ou só cor; selo e um CTA |
| `carrossel-capa` / `-passo` / `-fim` | Cuidado | mar · claro · agua | Capa com foto e véu; passo com foto subindo numa onda; fim com a fono |

Cada modelo tem um card com variações e regras. Para montar posts com IA, siga o **Guia para IA**: a IA escreve uma ficha JSON (`ia/ficha-post.schema.json`) e o motor `Sonata.render()` aplica este manual sozinho.
