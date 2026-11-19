# Nomes que rolam na boca

E-book mobile (9:16) com 150 nomes de esportistas rankeados pelo som do nome. Todo o texto está em português do Brasil.

## Como usar

```bash
npm install            # fontes, bandeiras (e, opcionalmente, sharp para converter fotos em webp)
npm run build          # gera dist/index.html (CSS e JS embutidos), dist/assets/*, fontes.md e assets/fotos/manifest.json
npm run pdf            # gera dist/nomes-que-rolam-na-boca.pdf (55 páginas de 1080 x 1920 px, via Playwright)
npm run serve          # servidor local de dist/ em http://127.0.0.1:4173
SITE_URL=https://seu-dominio npm run build   # grava as tags Open Graph com URL absoluta (WhatsApp exige)
```

O PDF e a imagem Open Graph (`dist/assets/og.png`, 1200 x 630) usam o Playwright. O `npm run build` gera a imagem se o Playwright estiver disponível e avisa quando não estiver. Requer Node 20 ou mais novo.

## O que há na pasta

| Caminho | Conteúdo |
|---|---|
| `dados_ranking.csv` | Fonte da verdade (166 nomes). Nenhuma nota ou posição é digitada à mão no código. |
| `content/textos.json` | Abertura, metodologia, introduções dos grupos, linhas dos eliminados, nota final. |
| `content/fichas/*.md` | 25 fichas (15 pausas, 9 do Top 10 e o campeão), com frontmatter, texto e lista de fatos com fonte. |
| `data/esportes.json` | Esporte de cada nome (o CSV não traz). Veja "Decisões". |
| `src/style.css`, `src/book.js` | Design system e navegação. `scripts/` tem o gerador, o PDF, a imagem OG e o servidor. |
| `fontes.md` | Fatos de cada ficha com a URL da fonte, gerado a cada build. |
| `assets/fotos/` | Onde entram as fotos, mais o `manifest.json`. |
| `dist/` | Saída: `index.html`, `assets/` e o PDF. |

## Fotos

O livro roda completo sem nenhuma foto: cada espaço cai no modo tipográfico (iniciais gigantes em areia sobre tinta, com a bandeira). Eu não baixei nenhuma imagem da internet.

1. Salve a foto em `assets/fotos/{slug}.jpg`, vertical, com pelo menos 1200 px de largura.
2. Preencha a linha correspondente em `assets/fotos/manifest.json` (`credito`, `licenca`, `url_origem`, e `object_position`, por exemplo `"50% 15%"`, para a cabeça não ser cortada).
3. Rode `npm run build` e `npm run pdf` de novo. A legenda de crédito aparece sobre a foto e na página final. Com `sharp` instalado, o build converte as fotos para webp.

Fontes sugeridas: Wikimedia Commons (conferir licença e dar o crédito exigido) ou agência com licença contratada. Nenhum atleta com menos de 18 anos entra com foto.

### As 25 fotos necessárias (15 pausas + 10 do Top 10 e campeão)

| Pos. | Atleta | Uso | Arquivo | Busca |
|:-:|---|---|---|---|
| 1º | Lomana LuaLua | Campeão (página inteira) | `assets/fotos/lomana-lualua.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Lomana+LuaLua&ns6=1&ns0=1) |
| 2º | Zinedine Zidane | Top 10 (meia página) | `assets/fotos/zinedine-zidane.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Zinedine+Zidane&ns6=1&ns0=1) |
| 3º | Papa Bouba Diop | Top 10 (meia página) | `assets/fotos/papa-bouba-diop.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Papa+Bouba+Diop&ns6=1&ns0=1) |
| 4º | Djemba-Djemba | Top 10 (meia página) | `assets/fotos/djemba-djemba.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Djemba-Djemba&ns6=1&ns0=1) |
| 5º | Shaquille O'Neal | Top 10 (meia página) | `assets/fotos/shaquille-oneal.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Shaquille+O%27Neal&ns6=1&ns0=1) |
| 6º | Dikembe Mutombo | Top 10 (meia página) | `assets/fotos/dikembe-mutombo.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Dikembe+Mutombo&ns6=1&ns0=1) |
| 7º | Bixente Lizarazu | Top 10 (meia página) | `assets/fotos/bixente-lizarazu.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Bixente+Lizarazu&ns6=1&ns0=1) |
| 8º | Maurren Higa Maggi | Top 10 (meia página) | `assets/fotos/maurren-higa-maggi.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Maurren+Higa+Maggi&ns6=1&ns0=1) |
| 9º | Jay-Jay Okocha | Top 10 (meia página) | `assets/fotos/jay-jay-okocha.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Jay-Jay+Okocha&ns6=1&ns0=1) |
| 10º | Romelu Lukaku | Top 10 (meia página) | `assets/fotos/romelu-lukaku.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Romelu+Lukaku&ns6=1&ns0=1) |
| 12º | Loris Capirossi | Pausa fotográfica | `assets/fotos/loris-capirossi.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Loris+Capirossi&ns6=1&ns0=1) |
| 14º | Duje Ćaleta-Car | Pausa fotográfica | `assets/fotos/duje-caleta-car.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Duje+%C4%86aleta-Car&ns6=1&ns0=1) |
| 15º | Ole Gunnar Solskjær | Pausa fotográfica | `assets/fotos/ole-gunnar-solskjaer.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Ole+Gunnar+Solskj%C3%A6r&ns6=1&ns0=1) |
| 18º | Giannis Antetokounmpo | Pausa fotográfica | `assets/fotos/giannis-antetokounmpo.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Giannis+Antetokounmpo&ns6=1&ns0=1) |
| 19º | Tore André Flo | Pausa fotográfica | `assets/fotos/tore-andre-flo.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Tore+Andr%C3%A9+Flo&ns6=1&ns0=1) |
| 25º | Kareem Abdul-Jabbar | Pausa fotográfica | `assets/fotos/kareem-abdul-jabbar.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Kareem+Abdul-Jabbar&ns6=1&ns0=1) |
| 28º | Siphiwe Tshabalala | Pausa fotográfica | `assets/fotos/siphiwe-tshabalala.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Siphiwe+Tshabalala&ns6=1&ns0=1) |
| 30º | Khvicha Kvaratskhelia | Pausa fotográfica | `assets/fotos/khvicha-kvaratskhelia.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Khvicha+Kvaratskhelia&ns6=1&ns0=1) |
| 35º | Malo Gusto | Pausa fotográfica | `assets/fotos/malo-gusto.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Malo+Gusto&ns6=1&ns0=1) |
| 41º | Muhammad Ali | Pausa fotográfica | `assets/fotos/muhammad-ali.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Muhammad+Ali&ns6=1&ns0=1) |
| 61º | Bastian Schweinsteiger | Pausa fotográfica | `assets/fotos/bastian-schweinsteiger.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Bastian+Schweinsteiger&ns6=1&ns0=1) |
| 67º | Danny Drinkwater | Pausa fotográfica | `assets/fotos/danny-drinkwater.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Danny+Drinkwater&ns6=1&ns0=1) |
| 85º | Anatoliy Tymoshchuk | Pausa fotográfica | `assets/fotos/anatoliy-tymoshchuk.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Anatoliy+Tymoshchuk&ns6=1&ns0=1) |
| 121º | Jakub Błaszczykowski | Pausa fotográfica | `assets/fotos/jakub-blaszczykowski.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Jakub+B%C5%82aszczykowski&ns6=1&ns0=1) |
| 131º | Eiður Guðjohnsen | Pausa fotográfica | `assets/fotos/eidur-gudjohnsen.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Ei%C3%B0ur+Gu%C3%B0johnsen&ns6=1&ns0=1) |

Fotos opcionais, usadas nos círculos de destaque das páginas de grupo (sem foto, entram as iniciais):

| Atleta | Arquivo | Busca |
|---|---|---|
| Dennis Rodman | `assets/fotos/dennis-rodman.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Dennis+Rodman&ns6=1&ns0=1) |
| Djalminha | `assets/fotos/djalminha.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Djalminha&ns6=1&ns0=1) |
| Eden Hazard | `assets/fotos/eden-hazard.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Eden+Hazard&ns6=1&ns0=1) |
| Gerhard Berger | `assets/fotos/gerhard-berger.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Gerhard+Berger&ns6=1&ns0=1) |
| Jarno Trulli | `assets/fotos/jarno-trulli.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Jarno+Trulli&ns6=1&ns0=1) |
| Kylian Mbappé | `assets/fotos/kylian-mbappe.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Kylian+Mbapp%C3%A9&ns6=1&ns0=1) |
| Matuzalém | `assets/fotos/matuzalem.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Matuzal%C3%A9m&ns6=1&ns0=1) |
| Paul Pogba | `assets/fotos/paul-pogba.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Paul+Pogba&ns6=1&ns0=1) |
| Thierry Henry | `assets/fotos/thierry-henry.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Thierry+Henry&ns6=1&ns0=1) |
| Valentino Rossi | `assets/fotos/valentino-rossi.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Valentino+Rossi&ns6=1&ns0=1) |
| Vitinha | `assets/fotos/vitinha.jpg` | [Commons](https://commons.wikimedia.org/w/index.php?search=Vitinha&ns6=1&ns0=1) |

A capa aceita uma foto escura de arquibancada ou estádio vazio de banco livre em `assets/fotos/capa.jpg`.

## Decisões tomadas (brief, seção 12)

- **Notas.** As camadas mostradas nas fichas são calculadas das sub-notas do CSV: Sonoridade = média de F, P, M; Estranheza = média de D, X; Assinatura = média de eco, bloco; Estrutura = média de C, E. A nota final exibida é sempre a coluna `nota_assinatura`.
- **A soma não bate exatamente.** Recalculando com a fórmula do brief (fama de 1 a 5 convertida para 0 a 10), a diferença para `nota_assinatura` chega a 0,205 (média de 0,078). Parece efeito de arredondamento das sub-notas inteiras. Mantive o CSV como verdade. O critério de aceite "a soma das sub-notas bate" fica cumprido só dentro dessa tolerância.
- **total_sonoro.** Confere com F+P+M+D+C+E em 160 das 166 linhas. As 6 que divergem são os nomes com desconto de apelido (Okocha, Marciano, Chulapa, Vitinha, Djalminha, Gervinho): o total já traz menos 2 pontos. Por isso o texto do livro diz que a versão sonora ignora impacto, eco, bloco e fama (o brief citava só eco, bloco e fama).
- **Esporte.** O CSV não traz esporte. Classifiquei os 166 nomes em `data/esportes.json` por conhecimento próprio, sem fonte externa: 9 esportes entre os 150 (futebol, basquete, atletismo, tênis, automobilismo, motociclismo, boxe, vôlei, vela). A abertura usa essa contagem. **Confirme.**
- **País.** Vem da bandeira do CSV. A bandeira 🇬🇧 vira "Reino Unido" por padrão, e Drinkwater está marcado como Inglaterra (bandeira da Inglaterra). Ryan Giggs (galês) só aparece na lista dos eliminados, sem bandeira.
- **Pausas.** Cada pausa entra logo depois da página de linhas que contém o atleta, em ordem decrescente. Onde duas ou mais caem na mesma página de linhas (67 e 61; 30, 28 e 25; 19, 18, 15, 14 e 12), elas vêm em sequência. O atleta continua aparecendo na lista, marcado com um triângulo âmbar.
- **Círculos dos grupos.** Cada grupo mostra os 2 destaques do brief mais o nome mais bem colocado do grupo que não seja destaque (o brief fala em 3 círculos e em 1 ou 2 destaques).
- **Total de páginas.** 55: capa, sumário, 2 de abertura, 3 de metodologia, 1 de introdução e 7 de grupos, 1 divisor, 14 de linhas, 15 pausas, 1 divisor, 5 do Top 10, campeão, eliminados e 2 finais.
- **Cinza.** `--cinza` não passa em 4,5:1 sobre papel nem sobre tinta, então ficou fora dos textos. Legendas usam tinta (ou osso) com opacidade.
- **Tamanho dos textos.** Em 390 px de largura, linhas de 60 a 70 caracteres com corpo de 17 px não cabem. O corpo é 17 px nas páginas de leitura e 12 a 15 px nas fichas densas.
- **Unidade.** Todos os tamanhos escalam com a largura da página, então o PDF (1080 px) é o mesmo layout do celular (390 px) ampliado.
- **Arquivos não fornecidos.** `ranking_fonetico_assinatura.md` e `grupos_nomes.md` não vieram com o pedido. Usei só o CSV.
- **Menores de 18 anos.** Nenhum atleta com ficha ou foto obrigatória tem menos de 18 anos em 19/11/2026 (Zaïre-Emery, Irankunda, Cubarsí e Lindblad aparecem só em listas, sem foto). Confirme as datas de nascimento antes de colocar fotos de qualquer um deles.

## Lista para o autor: `[DADO A CONFIRMAR]`

1. Coluna de esporte (`data/esportes.json`) e, por consequência, o "9 esportes" da abertura.
2. Pontos linguísticos sem fonte pública conferida: significado de "Guð" (deus, em islandês), transcrições aproximadas de pronúncia (Błaszczykowski, Schweinsteiger, Solskjær, Ćaleta-Car), "-chuk" como sufixo ucraniano comum, "Bixente" como forma basca de Vicente, "capiroto" como termo popular para o diabo. Estão marcados em `fontes.md`.
3. Kareem Abdul-Jabbar: o texto diz que o nome "destoava" dos nomes da liga nos anos 1970. A afirmação mais forte do brief (praticamente não existiam nomes assim na NBA) ficou sem fonte e não entrou.
4. Agradecimentos: o texto é genérico. Se quiser nomes, edite `content/textos.json`.
5. Fotos e créditos: nenhuma foto foi incluída. Veja a seção "Fotos".
6. Dois ajustes de ângulo editorial do brief, por exatidão: Eiður Guðjohnsen tem uma letra que o português não tem (ð), que aparece duas vezes, e não duas letras; em Kvaratskhelia, as quatro consoantes seguidas ficam no meio do sobrenome (tskh), com mais três no começo do primeiro nome (Khv).
7. Fatos de 2026 (Kvaratskhelia no PSG, Giannis no Miami Heat, Malo Gusto na Copa de 2026, Capirossi como lenda da MotoGP) vêm de páginas oficiais e da Wikipédia consultadas em 19/11/2026. Reconfira antes de publicar, porque envelhecem rápido.
