# BRIEF: e-book "Nomes que rolam na boca"

Documento para o Claude Code. Leia inteiro antes de escrever qualquer linha de código. Todo o texto do livro é em português do Brasil.

## 0. O que construir

Um e-book de leitura no celular que apresenta um estudo sobre os nomes de esportistas mais sonoros, estranhos e marcantes da história, sem qualquer relação com desempenho esportivo. O autor mostra o livro a amigos. O tom é de revista esportiva de prestígio, com a leveza de quem se diverte com o assunto.

Entregáveis:

1. `dist/index.html`: o livro, mobile-first, autocontido, abre bem no navegador do celular e pode ser hospedado em qualquer lugar. Rolagem vertical com páginas em proporção 9:16.
2. `dist/nomes-que-rolam-na-boca.pdf`: o mesmo livro em PDF, uma página por tela, 1080 x 1920 px, gerado do HTML (Playwright).
3. `fontes.md`: lista de fontes usadas em cada ficha de atleta.
4. `assets/fotos/manifest.json`: uma linha por foto, com slug, arquivo, crédito, licença e URL de origem.

Entradas já prontas, na mesma pasta deste brief:

- `dados_ranking.csv`: os 166 nomes (150 no ranking e 16 eliminados), com posição, grupo, nota e todas as sub-notas. Separador `;`, decimal com vírgula, UTF-8. É a fonte da verdade. Nada de nota ou posição digitada à mão no código.
- `ranking_fonetico_assinatura.md` e `grupos_nomes.md`: versões legíveis dos mesmos dados, para conferência.

## 1. Referência visual

A referência principal é um template de revista esportiva (preto, amarelo-limão, tipografia condensada em caixa alta, fotos escuras de página inteira). Complementam a referência o Players' Tribune e as revistas esportivas do New York Times: título forte, texto editorial com serifa, fotografia como protagonista.

O que aproveitar da referência:

| Padrão da referência | Como entra no livro |
|---|---|
| Título condensado em caixa alta, enorme, sobre a foto | Cabeçalho de grupo e de cada ficha do Top 10 |
| Aba vertical com título girado 90° na lateral | Faixa estreita (28 px) na borda esquerda da página, com o nome da seção girado |
| Foto escura de página inteira com título sobreposto | Pausas fotográficas e a página do campeão |
| Bloco colorido com texto em destaque no pé da página | Quadro "Por que esse nome" em cada ficha |
| Lista com marcador em triângulo | Lista de notas, com triângulo pequeno na cor de destaque |
| Fotos em círculo, em fileira, com legenda curta | Fileira dos 3 destaques de cada grupo |
| Página de sumário com miniaturas numeradas | Sumário clicável |

O que mudar: o amarelo da referência chama atenção demais. O livro usa uma paleta mais contida, com o destaque em âmbar queimado e muito mais área neutra. A foto é quem grita, a cor acompanha.

## 2. Design system

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `--tinta` | `#151A1F` | Fundo escuro, texto principal, páginas de foto |
| `--papel` | `#F3EEE4` | Fundo claro das páginas de texto |
| `--areia` | `#E4DAC8` | Painéis secundários, linhas, fundos de card |
| `--ambar` | `#B9893A` | Destaque único: números, filetes, tabs, marcadores |
| `--verde` | `#1E3B34` | Bloco escuro secundário (metodologia, quadros) |
| `--cinza` | `#6B7075` | Texto de apoio, legendas |
| `--osso` | `#FFFFFF` a 92% | Texto sobre fundo escuro |

Proporção: cerca de 80% neutros (tinta, papel, areia), 15% verde e âmbar, 5% reservado a um destaque pontual. Nenhuma página usa mais de uma cor de destaque ao mesmo tempo.

Contraste: o âmbar sobre `--papel` não passa em 4,5:1. Sobre papel, âmbar só em elementos decorativos (filetes, triângulos, tabs). Texto sobre papel é sempre `--tinta`. Âmbar como cor de texto só sobre `--tinta` ou `--verde`.

### Tipografia (duas famílias)

- Títulos, números, rótulos: **Barlow Condensed**, 700 e 800, caixa alta nos títulos, entrelinha 0,9 a 1,0.
- Texto corrido e citações: **Source Serif 4**, corpo de 17 px, entrelinha 1,55, linha de 60 a 70 caracteres.

Hospede as fontes no próprio projeto (woff2), sem depender de CDN.

Escala (celular, 390 px de largura): título de capa 88 px; título de seção 56 px; título de ficha 44 px; subtítulo 22 px; corpo 17 px; legenda 13 px; rótulo 12 px em caixa alta com espaçamento de 0,08em.

### Grid e páginas

- Cada "página" tem proporção 9:16, largura 100% da tela (máximo de 480 px, centralizada em telas maiores), altura derivada.
- Margens internas de 24 px. Faixa lateral esquerda de 28 px nas páginas de texto.
- Rolagem vertical com `scroll-snap-type: y mandatory`, uma página por "encaixe". Indicador discreto de progresso (barra fina no topo) e contador regressivo da posição quando estiver no ranking.
- Navegação por toque, teclado (setas) e sumário clicável. Botão "voltar ao sumário" fixo e pequeno.

### Bandeiras

Não use emoji de bandeira: eles não aparecem em Windows. Use SVG (pacote `flag-icons`, MIT) a partir do país de cada nome. O CSV traz a bandeira em emoji; mapeie para o código ISO do país.

### Componentes

1. **Linha do ranking.** Posição grande em Barlow, bandeira, nome, nota. Fundo `--papel`, filete âmbar de 2 px à esquerda nos primeiros 20 do ranking. 10 linhas por tela.
2. **Pausa fotográfica.** Página inteira, foto sangrando nas 4 bordas, véu escuro em degradê no terço inferior, posição enorme em âmbar, nome em caixa alta, linha de país e esporte. Veja seção 5.
3. **Meia página (Top 10).** Dois atletas por página. Cada metade tem foto em um lado, ficha no outro, nota em destaque.
4. **Página do campeão.** Uma página só, para o nº 1.
5. **Quadro de notas.** Quatro barras horizontais finas (Sonoridade, Estranheza, Assinatura, Estrutura) e a nota final. Barras em âmbar sobre `--tinta` ou verde.
6. **Fileira de círculos.** Três fotos redondas de 88 px, com nome e posição embaixo.

Sem foto disponível, todo componente tem um modo tipográfico: iniciais gigantes do atleta em Barlow, na cor `--areia` sobre `--tinta`, com a bandeira. O livro tem que funcionar sem nenhuma foto, e ficar melhor com elas.

## 3. Arquitetura do livro

Ordem das páginas. As quantidades abaixo são estimativas, e o total deve ficar perto de 60 páginas.

| # | Seção | Páginas | Conteúdo |
|---|---|:-:|---|
| 1 | Capa | 1 | Título, subtítulo, ano. Foto escura de estádio vazio ou arquibancada (genérica, de banco livre) ou modo tipográfico |
| 2 | Sumário | 1 | Clicável, numerado, com miniaturas |
| 3 | Abertura: por que fizemos isso | 2 | Texto da seção 6.1 |
| 4 | Metodologia | 3 | Texto da seção 6.2, fórmula, exemplo de ficha |
| 5 | Os 7 grupos | 8 | Uma página de abertura e uma por grupo, com 1 ou 2 destaques cada (seção 4) |
| 6 | Ranking, do 150º ao 11º | 14 + 15 | 14 páginas de linhas (10 por tela) intercaladas com 15 pausas fotográficas (seção 5) |
| 7 | Top 10, do 10º ao 2º | 5 | Meia página por atleta, 2 por tela |
| 8 | O campeão | 1 | Página inteira para o 1º colocado |
| 9 | Quem ficou de fora | 1 | Os 16 eliminados, em lista curta, com uma linha de graça sobre cada um |
| 10 | Como foi feito e créditos | 2 | Nota sobre o método, agradecimentos, créditos das fotos |

A contagem regressiva vai do 150º ao 1º. A posição de cada atleta sempre vem do CSV. As posições citadas neste brief valem para o CSV desta data, e se o CSV mudar, a lógica de seleção muda junto (veja a seção 5).

## 4. Os 7 grupos e os destaques

Cada grupo ganha uma página de abertura própria, no estilo da referência: foto ou fundo tipográfico escuro, título do grupo enorme em caixa alta, o perfil médio do grupo em uma linha, uma frase de definição e a fileira de círculos com os destaques. Os nomes de cada grupo estão na coluna `grupo` do CSV.

| Grupo | Destaques | Definição em uma linha |
|---|---|---|
| Cantados e fluidos | Zinedine Zidane, Romelu Lukaku | Abertos, melódicos, quase sem consoante travada |
| Cantigas em bloco | Lomana LuaLua, Papa Bouba Diop | Compostos ou longos, com eco, ditos sempre inteiros |
| Fluidos de manual | Kylian Mbappé, Jarno Trulli | Limpos e rítmicos, mas sem eco nem estranheza |
| Curtos e abertos | Muhammad Ali, Valentino Rossi | Enxutos, leves, de poucas sílabas |
| Longos e quase ilegíveis | Giannis Antetokounmpo, Khvicha Kvaratskhelia | Muita consoante, grafia estranha, impacto máximo |
| Travados e secos | Paul Pogba, Dennis Rodman | Poucas sílabas, fechadas, de som áspero |
| Nome único e apelidos | Vitinha, Djalminha | Uma palavra só, nome de guerra ou diminutivo |

Observação de método para o texto: os grupos vêm de um agrupamento estatístico (k-means, 7 grupos) e as fronteiras são fracas. O livro deve dizer isso com naturalidade ("os nomes formam um contínuo; os grupos são tendências").

## 5. As 15 pausas fotográficas

Entre as linhas do ranking aparecem 15 páginas inteiras, cada uma com foto, apresentação rápida do atleta e as notas. A lista abaixo foi escolhida por interesse do nome e por cobrir o ranking de ponta a ponta. Posições pelo CSV desta data:

| Posição | Atleta | Ângulo do nome (conteúdo editorial a desenvolver) |
|:-:|---|---|
| 131 | Eiður Guðjohnsen | Duas letras que o português não tem (ð) e um sobrenome islandês que parece de outro planeta |
| 121 | Jakub Błaszczykowski | O "ł" e a pilha de consoantes: um dos nomes mais difíceis do livro, e um dos que mais impressionam |
| 85 | Anatoliy Tymoshchuk | Sete sílabas ucranianas que terminam em "chuk" |
| 67 | Danny Drinkwater | Um verbo e uma dica de saúde ao mesmo tempo: "beba água" |
| 61 | Bastian Schweinsteiger | O nome alemão que pede fôlego |
| 41 | Muhammad Ali | O nome que foi trocado: de Cassius Clay para Muhammad Ali, em 1964, um nome escolhido que chamou atenção justamente por destoar |
| 35 | Malo Gusto | Para o ouvido brasileiro, soa como "mau gosto" |
| 30 | Khvicha Kvaratskhelia | Quatro consoantes seguidas no começo e uma sequência que parece feita de percussão |
| 28 | Siphiwe Tshabalala | O "la-la" duplicado, feito para ser gritado por um narrador, e a dança da comemoração |
| 25 | Kareem Abdul-Jabbar | Um nome islâmico na NBA dos anos 70, quando praticamente não existiam nomes assim na liga |
| 19 | Tore André Flo | "Tore" soa como "torre" no Brasil, e ele tinha 1,93 m; gol da Noruega contra o Brasil, Copa de 1998 |
| 18 | Giannis Antetokounmpo | Treze letras que viraram um nome mundial |
| 15 | Ole Gunnar Solskjær | Nome duplo e sobrenome com "skj": uma das cinco inspirações do ranking |
| 14 | Duje Ćaleta-Car | Sobrenome que abre e fecha no mesmo som, "Ća...Car", como um soneto eslavo |
| 12 | Loris Capirossi | O som rola na boca como cambalhota; e "Capirossi" lembra "capiroto" para o ouvido brasileiro |

Regras:

- Se o CSV mudar e algum desses atletas sair do ranking ou trocar de posição, mantenha os atletas e use a posição nova. Se um deles sair do corte dos 150, substitua por um vizinho de posição e registre no `fontes.md`.
- Cada pausa traz: (a) posição, nome, bandeira, país e esporte; (b) apresentação em até 70 palavras, com o que o atleta foi, o principal título ou feito e por que o nome é interessante; (c) o quadro de notas.
- Os "ângulos do nome" acima vêm do autor do estudo e são o coração de cada ficha. O resto (carreira, títulos) precisa ser pesquisado e confirmado com fonte (seção 7).

### Top 10

Meia página para cada um, do 10º ao 2º, dois por tela. O 1º, Lomana LuaLua, ocupa uma página inteira, com tratamento de capa. O Top 10 do CSV desta data:

| Pos. | Atleta | Ângulo do nome |
|:-:|---|---|
| 10 | Romelu Lukaku | "Ro-me-lu Lu-ka-ku": o "lu" duplicado em sequência |
| 9 | Jay-Jay Okocha | O nome começa repetido, "Jay-Jay", e termina em "-cha": parece uma batida |
| 8 | Maurren Higa Maggi | Três nomes e um "g" que volta: uma cantiga brasileira |
| 7 | Bixente Lizarazu | "Li-za-ra-zu" vai e volta como um palíndromo sonoro; "Bixente" é a grafia basca |
| 6 | Dikembe Mutombo | "Dikembe / Mutombo" rimam, "-kem-be" e "-tom-bo" |
| 5 | Shaquille O'Neal | "Shaquille" e "O'Neal" rimam em "-quille / -neal" |
| 4 | Djemba-Djemba | Reduplicação perfeita, com hífen |
| 3 | Papa Bouba Diop | "Pa-pa Bou-ba" trava e solta como batida de bongô |
| 2 | Zinedine Zidane | Aliteração em "Z" e quase-rima entre "-dine" e "-dane" |
| 1 | Lomana LuaLua | "Lua-Lua": a reduplicação pura. Um nome que já nasce como refrão |

A página do LuaLua é a mais trabalhada do livro: foto de página inteira, título gigante, o nome escrito sílaba por sílaba (Lo-ma-na Lu-a-Lu-a), nota, e a frase que explica por que ele lidera. Nenhum outro atleta tem o nome reduzido a sílabas assim. A posição do LuaLua é decisão do autor: ele lidera o ranking, e se algum recálculo tirar o LuaLua do 1º, pare e avise o autor em vez de seguir.

## 6. Textos de partida

Estes textos são rascunhos para o Code refinar sem mudar o sentido. Valem as regras de escrita da seção 8.

### 6.1 Abertura (2 páginas)

Título: **Nomes que rolam na boca**

> Este livro mede uma coisa que quase ninguém mede: o som do nome de quem joga. Gols, medalhas e recordes ficaram fora. A pergunta é outra. Quais nomes do esporte soam melhor, soam mais estranhos, ficam na cabeça?
>
> Tudo começou com cinco nomes: Tore André Flo, Lomana LuaLua, Papa Bouba Diop, Ole Gunnar Solskjær e Zinedine Zidane. Quem ouve um deles uma vez nunca mais esquece. Ficou a dúvida simples de saber o que eles têm em comum.
>
> A resposta virou um método e o método virou um ranking de 150 nomes, de [N países] e [N esportes]. A lista é uma opinião defendida com critério. Cada nota tem motivo, e você pode discordar de qualquer uma.

Substitua `[N países]` e `[N esportes]` pelas contagens reais do CSV. Se o CSV não trouxer o esporte, marque `[DADO A CONFIRMAR]` e preencha na pesquisa das fichas.

### 6.2 Metodologia (3 páginas)

Página 1, a ideia: cada nome recebe notas de 0 a 10 em oito critérios, reunidos em quatro camadas, mais um peso pequeno para a fama e um desconto para apelidos. A escuta é a de um brasileiro lendo em voz alta.

Página 2, as camadas, com um exemplo por critério:

| Camada | Peso | Critérios | Exemplo |
|---|:-:|---|---|
| Sonoridade | 30% | Fluidez (sílabas abertas), pronúncia (um brasileiro lê sem tropeçar), musicalidade (variedade de vogais, assonância, final aberto) | Osaka e Saka fluem. Schweinsteiger pede fôlego |
| Estranheza | 20% | Raridade (quão incomum é o nome dentro da própria cultura) e impacto (complexidade, jogo de palavras, contraste com o contexto) | Drinkwater e Capirossi pelo jogo de palavras. Kareem Abdul-Jabbar pelo contraste |
| Assinatura | 25% | Eco (repetição de som dentro do nome inteiro) e bloco (nome dito sempre inteiro) | Lua-Lua, Pa-pa Bou-ba, Gian-lu-ca Pa-gliu-ca |
| Estrutura | 15% | Cadência (acentos em intervalos regulares) e evocação (o nome aponta para um país ou cultura) | Zidane marca o passo. Solskjær chama a Noruega |
| Fama | 10% | De 1 (desconhecido) a 5 (ícone mundial) | O peso é pequeno de propósito, para o ranking não virar uma lista de lendas |
| Apelido | desconto | Menos 0,33 na nota final quando o nome é um nome de guerra | Vitinha, Djalminha, Gervinho |

A fórmula, escrita em uma linha de tipografia grande:

`Nota = 0,30 x Sonoridade + 0,20 x Estranheza + 0,25 x Assinatura + 0,15 x Estrutura + 0,10 x Fama - Apelido`

Página 3, como ler uma ficha, com uma ficha-exemplo anotada (use Tore André Flo ou Capirossi) e a franqueza sobre o método: as notas são julgamento, não ciência; três critérios (impacto, eco e bloco) entraram ao longo do estudo para dar conta de nomes que os critérios iniciais subestimavam, e há uma nota sobre isso na página final. O ranking continua a existir em duas versões: a "sonora" (total de 0 a 60, dividido por 6), que ignora Eco, Bloco e Fama, e a "Assinatura", que é a do livro. Uma frase explica a diferença.

### 6.3 Introduções de grupo (modelo, 2 a 3 frases cada)

> **Cantados e fluidos.** Quase não há consoante travando a boca. O nome corre do começo ao fim, como Zidane e Lukaku, e dá vontade de repetir.

> **Cantigas em bloco.** São nomes que pedem para ser ditos inteiros. LuaLua e Papa Bouba Diop têm som repetido por dentro, e é isso que os faz parecer refrão.

> **Longos e quase ilegíveis.** Aqui a graça é o espanto. Antetokounmpo e Kvaratskhelia fazem o leitor parar, e o impacto vem da dificuldade.

Escreva os outros quatro no mesmo tom e na mesma medida, com a definição do grupo na primeira frase.

### 6.4 Ficha modelo

Use o modelo abaixo como exemplo de tom para todas as fichas. Não copie palavra por palavra.

> **19º · Tore André Flo** · Noruega · Futebol
> Centroavante de 1,93 m que passou pelo Chelsea e pela seleção norueguesa. Fez o gol da Noruega na vitória por 2 a 1 sobre o Brasil na Copa de 1998.
> **O nome:** "Tore" soa como "torre" ao ouvido brasileiro, e foi exatamente isso que ele foi na área. O resto vem como um verso curto: Tore An-dré Flo.
> Sonoridade 8,7 · Estranheza 8,5 · Assinatura 7,8 · Estrutura 6,5 · Fama 3

Os números do exemplo são ilustrativos. As notas reais vêm do CSV (calcule as camadas a partir das sub-notas e confira com a coluna `nota_assinatura`).

## 7. Pesquisa e fatos

- Todo fato de carreira (clube, título, data, placar) vem de fonte pública confiável, pesquisada pelo Code com WebSearch/WebFetch, e entra em `fontes.md`, por atleta. Sem fonte, não entra no livro.
- Os fatos da seção 5 que o autor passou (por exemplo, Flo e o gol de 1998, Capirossi e os títulos, Kareem e o nome islâmico) são ponto de partida e também precisam de confirmação.
- Atletas que já morreram (por exemplo, Lev Yashin, Muhammad Ali, Roland Ratzenberger, Dikembe Mutombo): confira e trate com respeito. Nenhuma piada ligada à morte. Para Ratzenberger, o texto fala só do nome e da carreira, sem jogo de palavras.
- Atleta com menos de 18 anos na data de publicação (confirme a idade de cada um): sem foto, só modo tipográfico.
- O que não está no CSV nem foi pesquisado fica marcado como `[DADO A CONFIRMAR]` e vira lista para o autor ao final.

## 8. Regras de escrita

Aplique a skill `humanizador-copy` em todo texto do livro. O que importa na prática:

- Sem travessão (— ou –) em nenhum texto. Use vírgula, ponto, dois-pontos ou parênteses.
- Sem a estrutura "não é X, é Y" e sem fechamento que repete o parágrafo.
- Sem palavras de folder: "incrível", "fascinante", "verdadeira joia", "jornada", "universo".
- Frases de comprimento variado. Uma ideia por parágrafo. Tom de quem conta uma história a um amigo, com humor e sem forçar piada.
- Cada ficha tem pelo menos um detalhe que só aquele atleta tem.
- Decimais com vírgula, "9º" e não "9o", sílabas separadas por hífen ao escrever o nome ("Lo-ma-na Lu-a-Lu-a").
- Se um texto puder ser assinado por qualquer outro livro de esporte, reescreva com um fato do atleta.

## 9. Fotos

O Code não baixa foto de internet por conta própria. Os direitos das imagens são do autor.

1. Crie, para cada atleta que precisa de foto, um espaço de imagem com o caminho `assets/fotos/{slug}.jpg` (slug em minúsculas, sem acento, com hífen).
2. Enquanto a foto não existir, o componente usa o modo tipográfico (seção 2). O livro deve rodar completo sem nenhuma foto.
3. O autor coloca as fotos na pasta e roda `npm run build` de novo. O build lê `assets/fotos/manifest.json` para mostrar o crédito embaixo de cada imagem e na página final.
4. Fontes aceitáveis a sugerir ao autor: Wikimedia Commons (conferir a licença e dar o crédito exigido) e agências com licença contratada. O Code lista no `README.md` os 15 + 10 atletas com a foto necessária, o formato (vertical, mínimo de 1200 px de largura) e um link de busca para o autor.
5. Foto de atleta nunca entra com recorte que corte a cabeça. Use `object-fit: cover` com `object-position` ajustável por atleta no manifesto.
6. Nenhuma foto de atleta menor de 18 anos.

## 10. Especificação técnica

- Projeto estático, sem backend. Node 20, Vite ou Astro, à escolha do Code. O que importa é que `npm run build` gere `dist/` e `npm run pdf` gere o PDF.
- O texto de cada ficha fica em arquivos de conteúdo (`content/fichas/{slug}.md`) com frontmatter (posição, slug, país, esporte, ângulo do nome). As notas e posições são lidas do CSV no build.
- O HTML final tem CSS e JS embutidos e as imagens em `assets/`. Peso total do HTML abaixo de 2 MB e das imagens abaixo de 8 MB. As fotos são servidas em `webp`, com `loading="lazy"`.
- `lang="pt-BR"`. Contraste mínimo de 4,5:1 no texto. Alvos de toque de 44 px. Respeitar `prefers-reduced-motion`.
- Animação mínima: entrada suave de cada página (opacidade e 12 px de deslocamento) e a barra de progresso. Nada de efeito que atrapalhe a leitura.
- Meta tags de compartilhamento (Open Graph) com título e uma imagem de capa em 1200 x 630, para o link ficar bonito no WhatsApp.
- PDF: uma página por tela, 1080 x 1920 px, fontes embutidas, sumário com links.

## 11. Critérios de aceite

- [ ] O livro abre e funciona no celular (390 x 844) sem rolagem horizontal.
- [ ] Todas as notas e posições vêm do CSV, e a soma das sub-notas bate com `nota_assinatura`.
- [ ] A contagem vai do 150º ao 1º, sem pular posição. Os 16 eliminados só aparecem na página "Quem ficou de fora" e nos grupos.
- [ ] As 15 pausas fotográficas existem, cada uma com apresentação, "o nome" e quadro de notas.
- [ ] O Top 10 usa meia página por atleta, e o LuaLua tem página inteira.
- [ ] Todos os 7 grupos têm página de abertura com os destaques da seção 4.
- [ ] Zero travessão nos textos e nenhuma estrutura "não é X, é Y".
- [ ] Cada fato de carreira tem fonte em `fontes.md`; o que não tem fonte está marcado.
- [ ] O livro funciona sem foto, e com foto fica melhor, com crédito visível.
- [ ] Paleta contida: âmbar só como detalhe, nunca como fundo grande.
- [ ] `[DADO A CONFIRMAR]` listado ao final para o autor.

## 12. Se algo não estiver claro

Decida pelo caminho mais simples, registre a decisão no `README.md` e siga. Só interrompa o trabalho para perguntar nos casos abaixo:

1. O CSV tirar o LuaLua do 1º lugar.
2. Faltar mais de 20% dos dados de país ou esporte necessários às fichas.
3. Alguma exigência de direitos de imagem impedir o uso de uma foto já fornecida pelo autor.
