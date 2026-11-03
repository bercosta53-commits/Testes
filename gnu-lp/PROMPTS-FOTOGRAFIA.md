# Pauta de imagens · GNU "O verão tem encontro marcado"

Esta é a série de prompts para gerar as imagens da LP no Nano Banana (Gemini). Cada prompt corresponde a um espaço de foto da página (F01–F14, os mesmos do modo `?pauta`). Há ainda um banco de cenas extras para testes, redes e substituições.

**Direção em uma frase:** o clima de um editorial de *country club* e *tennis club*, com um toque leve de campanha clássica de sportswear francês. Pessoas de verdade, estrutura de verdade e encontros acontecendo. Nada de editorial de moda.

- **"Golf club"** entra como atmosfera: gramado cuidado, ritmo sem pressa, gente que se conhece. **Golfe não aparece**, porque o clube não tem campo (o briefing veta golfistas e carrinhos).
- **"Lacoste muito leve"** entra como naturalidade esportiva: piquê, linho, saia de tênis pregueada, cores lavadas. Os prompts **não citam a marca**, para o modelo não desenhar logotipo nem crocodilo.
- **Os prompts estão em inglês**, porque o modelo responde com mais precisão a luz, lente e composição. As anotações estão em português.

---

## Como usar

1. **Ferramenta:** Nano Banana Pro no Gemini, em 2K ou 4K. Escolha a proporção indicada em cada prompt.
2. **Anexe a foto real do lugar** (recomendado). É o que garante que piscina, quadras, prédios e paisagem sejam do União, como o briefing exige. Sem foto melhor à mão, servem as do acervo em `assets/img/` (indicadas em cada prompt), mas fotos originais em resolução maior funcionam melhor.
3. **Monte o prompt nesta ordem:** `PREFIXO DE REFERÊNCIA` (só se anexou foto) + `CENA` + `ASSINATURA FOTOGRÁFICA`.
4. **Mantenha a série coesa:** quando aprovar a primeira imagem (sugestão: o hero), anexe-a como **segunda referência** nas próximas e acrescente ao fim:
   `Match the color grade, light quality and photographic style of the second attached image.`
5. **Coloque no site** com o comando abaixo. Ele recorta, gera os tamanhos, atualiza o `index.html` e aplica o texto alternativo:
   ```bash
   python3 tools/importar_foto.py F05 ~/Downloads/alto-petropolis.png
   python3 tools/importar_foto.py F03 beach.png --alt "Descrição da cena real" --foco 0.5,0.4
   python3 tools/importar_foto.py --listar
   ```
   Sem `--alt`, entra o alt padrão da cena sugerida. Se a imagem for outra cena (do banco extra, por exemplo), passe `--alt`. Depois, abra a página com `?pauta` e confira.

---

## Assinatura fotográfica (cole ao final de TODOS os prompts)

```
STYLE — GNU summer series. Candid editorial lifestyle photography for a traditional social and sports club in Porto Alegre, southern Brazil, shot like a feature story in a country-club and tennis-club magazine, with a very light nod to classic French tennis sportswear campaigns. Real-looking people, never models: Brazilian families and friends of mixed ages, body types and skin tones, natural expressions, caught mid-moment, nobody looking at the camera. Wardrobe: understated summer sportswear and leisurewear — piqué polo shirts, cotton tees, linen shirts, pleated tennis skirts, tailored shorts, simple swimsuits, canvas sneakers; palette of white, cream, navy, sage and bottle green with a rare touch of faded red; no visible logos or brand marks. Light: real southern-Brazil summer light, late morning or golden late afternoon, long soft shadows, dappled shade under old trees. Camera: full-frame digital, 35mm or 50mm prime, f/2.8–f/4, observational framing with deliberate negative space; foreground elements (a racket, a towel, a branch, a fence) sometimes soft and out of focus to add depth. Color: warm whites, true natural greens, balanced blues — pool water clear turquoise-blue, never neon cyan — medium contrast, detailed shadows, natural unretouched skin, very subtle fine grain. Avoid: golf, golf carts, resort or luxury-hotel look, champagne toasts, posed smiles at the camera, matching all-white outfits, visible logos, text, signage, watermarks, HDR look, oversaturation, vintage filters, distorted hands, rackets or nets, invented buildings.
```

## Prefixo de referência (quando anexar a foto real do lugar)

```
Use the attached photo as the exact location. Keep the architecture, pool outlines, courts, vegetation, buildings and horizon exactly as they are — do not add, remove or redesign any structure. Change only the light, the moment and the people, as described below.
```

---

## Mapa da série

| Prompt | Espaço | Bloco no site | Cena | Proporção |
|---|---|---|---|---|
| P01 | F01 | 01 · Hero | Piscina Alto Petrópolis no fim de tarde, cheia de vida | 16:9 |
| P02 | F02 | 02 · Verão em família | Banho de piscina: pai e filhos brincando | 21:9 |
| P03 | F03 | 02 · Tênis entre amigos | Duplas no saibro, rindo entre os pontos | 4:5 |
| P04 | F04 | 02 · Mais tempo juntos | Jovens conversando nas espreguiçadeiras | 4:5 |
| P05 | F05 | 03 · Alto Petrópolis | Área verde, lago e gazebo com gente passeando | 21:9 |
| P06 | F06 | 03 · Moinhos de Vento | Piscina e tobogã numa tarde de verão no bairro | 21:9 |
| P07 | F07 | 03 · União Petrópole | Quadras de saibro em uso | 21:9 |
| P08 | F08 | 03 · Ilha do Pavão | Aérea da ilha no Guaíba ao entardecer | 21:9 |
| P09 | F11 | 04 · Depois do jogo, a conversa continua | Mesa de amigos depois do tênis | 16:9 |
| P10 | F10 | 04 · Uma tarde inteira para estar junto | Famílias nas esteiras do gramado | 4:5 |
| P11 | F12 | 05 · História | Remo e herança náutica, hoje | 3:2 |
| P12 | F13 | 06 · Associação | Canto tranquilo junto ao lago | 4:5 |
| P13 | F14 | 07 · Fechamento | Amigos ao pôr do sol na Ilha do Pavão | 21:9 |
| X1–X8 | — | Banco extra | Beach tennis, salto na piscina, escolinha, hero alternativo, detalhes | variadas |

**Sobre os recortes:**
- **Faixas 21:9 (sedes e fechamento):** o site corta para 4:3 no celular, e no desktop as faixas recolhidas mostram só a faixa central. Por isso os prompts pedem a ação na **faixa central**.
- **Hero:** o texto fica no **terço esquerdo** no desktop, e no celular a foto é cortada ao centro.

---

## Prompts por bloco

### P01 · Hero: "O verão tem encontro marcado no União." (F01)
**16:9, 4K** · Referência: foto real da piscina Alto Petrópolis (ou `assets/img/hero-piscina-alto-petropolis-1100.webp`)

```
Wide establishing photograph of the large lagoon-shaped outdoor pool at the Alto Petrópolis club in Porto Alegre on a summer late afternoon, around 5 pm: curved pool edges with a warm stone deck, long rows of white sun loungers, a lawn, tall old trees and the city skyline beyond the treetops. The place is lively but calm: a family with two kids at the shallow edge, a mother sitting on the rim with her feet in the water; three friends in their twenties chatting on loungers under the trees; a grandfather walking along the deck with a towel over his shoulder; a few swimmers crossing the pool. People are small in the frame so the true scale of the pool reads clearly. Camera slightly elevated, about three meters high, 35mm lens. Keep the left third of the frame visually calm — open water, lawn and sky — for a headline; the main group of people sits just right of center.
```

### P02 · Verão em família: banho de piscina (F02)
**21:9** · Referência: piscina Alto Petrópolis ou Moinhos de Vento

```
Wide horizontal photograph with the camera just above the water surface in the club pool on a bright summer afternoon: a father standing waist-deep catches his six-year-old son mid-jump from the pool edge, water droplets frozen in the air, while his nine-year-old daughter laughs and splashes beside them; the mother sits on the edge with her legs in the water, partly in frame. Sunlit turquoise water with sparkling highlights, white loungers and trees softly out of focus behind. Fast shutter, 35mm, faces partly turned, mid-laugh, unstaged joy. Keep calm water at the far left and right of the frame, because the image will be cropped tighter on phones.
```

### P03 · Tênis entre amigos (F03)
**4:5** · Referência: quadras da União Petrópole (`assets/img/sede-uniao-petropole-1440.webp`)

```
Vertical photograph of a social doubles match on a red clay court at the União Petrópole club in Porto Alegre, late morning: two couples in their thirties and forties between points — one woman walks toward the net laughing at a missed shot while her partner bounces a ball on his racket; the other pair talks at the baseline. Dark-green windscreens, crisp white lines on orange clay, floodlight poles, trees and apartment buildings around the club. Shot from just outside the corner of the court, with the green fence softly out of focus in the foreground. Clay dust on sneakers, relaxed body language — a friendly game, not competition.
```

### P04 · Mais tempo juntos: jovens nas espreguiçadeiras (F04)
**4:5** · Referência: deck e espreguiçadeiras de uma das piscinas

```
Vertical photograph of four friends in their early twenties talking and laughing on white sun loungers in the shade of a large tree beside the club pool: one sits sideways wearing a straw hat, another leans back with sunglasses pushed up on her head, a third shows the group something funny, a tennis racket and a canvas tote rest on the grass. Dappled sunlight through the leaves, glimpses of turquoise water and other members in the background. 50mm lens at eye level, as if the photographer were sitting on the next lounger. Unposed; everyone engaged with each other, nobody aware of the camera.
```

### P05 · Sede Alto Petrópolis (F05)
**21:9, 4K** · Referência: `assets/img/sede-alto-petropolis-1440.webp` (lago e gazebo). Para mostrar as piscinas-lago, use a foto da piscina como referência.

```
Panoramic photograph of the green heart of the Alto Petrópolis club: the wooden gazebo standing on the lake, the wooden footbridges, calm water reflecting the canopy, wide lawns and very tall old trees. Summer morning light filtering through the leaves. A few people give scale and life: a couple crossing a footbridge, a grandmother and granddaughter watching the fish at the water's edge, two friends walking back from the pool with towels over their shoulders. Wide 28mm lens at eye level, horizon and main subjects kept in the central horizontal band so the image survives tight crops. Peaceful, generous, green.
```

### P06 · Sede Moinhos de Vento (F06)
**21:9, 4K** · Referência: `assets/img/sede-moinhos-de-vento-1440.webp`

```
Panoramic photograph of a summer afternoon at the Moinhos de Vento club pool, an urban oasis framed by apartment buildings and large trees in one of Porto Alegre's most traditional neighborhoods: the rounded pool with deep-blue tiles, the blue water slide with a child mid-slide, parents watching from the edge, a teenager about to dive, a grandmother reading under an umbrella, white loungers along the fence. Wide 28mm lens from a slightly elevated position; the surrounding buildings are visible, but the pool life dominates. Keep the main action in the central horizontal band.
```

### P07 · Sede União Petrópole (F07)
**21:9, 4K** · Referência: `assets/img/sede-uniao-petropole-1440.webp`

```
Panoramic photograph of the red clay tennis courts at the União Petrópole club on a bright late morning, all courts in use: a mixed doubles game, a coach feeding balls to two kids, two friends rallying, players small in the frame. Crisp white lines on orange clay, dark-green windscreens, floodlight poles, blue-and-white umbrellas over the sideline benches where people rest and chat, the white arched-roof gym and apartment buildings behind. Eye level from the end of the courts, 35mm, deep focus. Keep the action in the central horizontal band.
```

### P08 · Sede Ilha do Pavão (F08)
**21:9, 4K** · Referência: `assets/img/sede-ilha-do-pavao-1600.webp`. Antes de usar, **confirme que a foto de referência é posterior à reconstrução**.

```
High aerial photograph, drone at about sixty meters, of Ilha do Pavão in the Guaíba river at golden hour: the wooded island, the nautical clubhouse with brick walls and a dark roof, the wooden pier with the club boats moored, the small pool among the trees with a handful of people, a double rowing shell gliding past. A wide silver-brown river and low green islands stretch to the horizon under a soft summer sky. Calm, vast and natural — a different atmosphere inside the city. Keep the clubhouse and the pier in the central third.
```

### P09 · "Depois do jogo, a conversa continua." (F11)
**16:9** · Referência: **foto real do bar, café ou terraço do clube** (Espaço União Cooks ou equivalente). Descreva só o que existe no lugar.

```
Photograph of five friends in their thirties to fifties gathered around a table at the club café after their tennis match, late afternoon: rackets leaning against the chairs, a towel over one shoulder, glasses of iced lemonade and sparkling water, a small plate of snacks; one man tells a story with his hands while the others laugh, a woman pushes her hair back still flushed from the game. Through the windows or beyond the terrace, the club in soft focus. Shot from a neighboring table with a 50mm lens, shallow depth of field, a glass and a racket handle out of focus in the foreground. Warm, convivial, unhurried.
```

### P10 · "Uma tarde inteira para estar junto." Famílias nas esteiras (F10)
**4:5** · Referência: gramado próximo a uma das piscinas

```
Vertical photograph of families spending the whole afternoon on the lawn beside the club pool: straw beach mats and striped towels spread under a tree, a young father lying on his side making a toddler laugh, two older kids running back from the pool wrapped in towels, a grandmother handing out cut fruit from a container, a frisbee and small flip-flops scattered on the grass. Golden late-afternoon light, long shadows across the lawn, the pool and loungers soft in the background. 35mm lens from a kneeling position at the edge of the mats. Tender, ordinary, real.
```

### P11 · História: o remo, hoje (F12)
**3:2** · Referência: sede náutica da Ilha do Pavão (`assets/img/historia-ilha-do-pavao-800.webp`)

```
Documentary photograph of the club's rowing heritage today: early morning at the Ilha do Pavão nautical clubhouse, a mixed crew of four carrying a white rowing shell from the brick boathouse down the wooden pier toward the Guaíba, while a veteran coach in his seventies talks with a young rower beside them. Mist lifting over the river, soft pink-gold light, the brick walls and the pier clearly readable. 35mm lens, observational framing. Timeless but contemporary: no sepia, no vintage filter, no nostalgia props.
```

### P12 · Associação: um lugar para conversar (F13)
**4:5** · Referência: `assets/img/associacao-area-verde-560.webp` (lago e gazebo)

```
Vertical photograph of a quiet corner of the Alto Petrópolis grounds: a shaded lawn by the lake with the wooden gazebo and footbridge, an empty wooden bench under old trees in the foreground; in the background, softly out of focus, a couple walks across the bridge and a family sits on the grass. Soft mid-afternoon light, deep greens, calm reflections on the water. 50mm lens, generous open foreground — an inviting, peaceful place to sit and talk.
```

### P13 · Fechamento: amigos ao pôr do sol na Ilha do Pavão (F14)
**21:9, 4K** · Referência: Ilha do Pavão (trapiche e margem)

```
Panoramic golden-hour photograph at Ilha do Pavão: a group of six friends in their twenties to forties on the wooden pier and the lawn at the water's edge, some sitting with their feet dangling over the Guaíba, one passing a chimarrão gourd, two standing with their arms around each other; the sun low over the river, a rowing boat crossing the path of light, low islands in silhouette. Shot from slightly behind and to the side, the figures partly backlit and small within the vast landscape. Warm, quiet, emotional — the end of a good day. Keep the group in the central horizontal band; sky and water fill the rest of the frame.
```

---

## Banco extra (testes, redes e substituições)

### X1 · Beach tennis, jovens adultos
**3:2 ou 4:5** · Pode entrar no lugar do F03 ou do F04. **Confirme em qual sede há quadra de areia e anexe a foto real.**

```
Photograph of a mixed doubles beach tennis game on a sand court at the club in the late afternoon: four friends in their twenties, one mid-jump hitting an overhead with a solid paddle racket, the others reacting with laughter, sand spraying, the net taut, trees and club buildings soft behind, floodlights not yet on. Low angle from the sand near the net post, 35mm, fast shutter. Energetic but social — a game between friends.
```

### X2 · Salto na piscina
**3:2** · Alternativa para o F02

```
Photograph of a ten-year-old boy frozen mid-air in a cannonball jump into the club pool, knees tucked, while two friends cheer from the edge and his father, already in the water, laughs with arms open. Bright summer midday light, a big splash beginning to rise, loungers and trees in the background. 35mm, fast shutter, eye level from the pool edge.
```

### X3 · Escolinha de tênis
**3:2**

```
Photograph of a kids' tennis class on clay at the end of the afternoon: a coach kneeling to adjust a seven-year-old's grip, a row of children with junior rackets waiting their turn, yellow balls scattered across the orange clay, parents watching from shaded benches behind the fence. Warm low sun, long shadows, 50mm, eye level of the children.
```

### X4 · Hero alternativo: "piscina e família" (teste 1 do briefing)
**16:9, 4K** · Mesma referência do P01

```
Closer, warmer variant of the pool hero: the same lagoon-shaped pool at golden hour, a family of four in the right foreground — the father lifting a child out of the water onto the edge, the mother wrapping the other child in a striped towel — with the full pool and its rows of loungers stretching behind them under tall trees. 35mm lens at eye level. Keep the left third calm for the headline.
```

### X5–X8 · Detalhes ("momentos íntimos" do briefing)
**4:5** · Para detalhes sobrepostos, redes e respiros entre seções

```
X5 — Close detail: a tennis racket, a folded white towel and a cap resting on a white sun lounger in dappled tree shade, turquoise pool water out of focus behind. 50mm, f/2.8.
```
```
X6 — Close detail at the café table after a match, seen at 45 degrees from above: hands around sweating glasses of iced lemonade, a can of tennis balls, a racket grip, clay dust on a sneaker under the table. 50mm.
```
```
X7 — Small flip-flops and a pair of swimming goggles at the pool edge, wet footprints drying on warm stone, a child's legs running out of frame. 35mm, midday light.
```
```
X8 — A chimarrão gourd and thermos resting on the wooden pier at Ilha do Pavão at sunset, the Guaíba glowing behind, two people's feet dangling over the water at the edge of the frame. 50mm.
```

### Modelo para outras áreas (academia, restaurante, quadras, playground…)
**Anexe sempre a foto real da área.**

```
Photograph of [ÁREA REAL, ex.: the club gym / the restaurant terrace / the multi-sport court] at [SEDE] in Porto Alegre, [MOMENTO DO DIA]. [O QUE ACONTECE: 2–4 pessoas ou grupos, idades variadas, uma ação concreta cada]. [ENQUADRAMENTO: lente, altura da câmera, primeiro plano]. Keep the real space recognizable and its scale readable.
```

---

## Checklist antes de colocar no site

- [ ] **Arquitetura fiel:** piscina, quadras, prédios e vegetação batem com o lugar real. Nada foi inventado.
- [ ] **Pessoas:** naturais, de idades variadas, ninguém olhando para a câmera e ninguém posando.
- [ ] **Sem defeitos de IA:** mãos, raquetes (cordas e cabos), redes, reflexos na água, toalhas e rostos ao fundo estão corretos.
- [ ] **Sem texto, placas, logotipos ou marca d'água** na imagem.
- [ ] **Cor coerente com a série:** água turquesa natural (não ciano neon), verdes reais e pele sem retoque.
- [ ] **Composição:** a ação está na faixa central (sedes e fechamento) e o terço esquerdo está calmo (hero).
- [ ] **Alt atualizado:** usou `--alt` sempre que a cena for diferente da sugerida.

## Antes de publicar (do briefing)

- Imagem gerada **não pode ser apresentada como associado real** nem como instalação que não existe. Defina com o clube como sinalizar conteúdo gerado ou alterado por IA.
- Para a versão final, o ideal continua sendo a **produção fotográfica real**, usando estes prompts como roteiro de cena. Fotos de crianças e associados identificáveis exigem autorização de uso de imagem.
