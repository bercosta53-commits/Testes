# Momon

Um amigo gatinho para crianças de 3 a 5 anos. O Momon é emburradinho, mas muito carinhoso: o carinho e a atenção vão deixando ele feliz e pertinho.

É um app web estático (PWA), sem build e sem dependências. Funciona sem internet depois da primeira abertura, não tem anúncios, links externos nem coleta de dados, e não exige leitura: tudo é toque, som e animação.

## Rodar

**Para testar no computador**, abra `index.html` direto no navegador, ou sirva a pasta:

```sh
npx serve momon
# http://localhost:3000
```

**Para instalar no tablet ou no celular**, o app precisa estar num endereço **https**. O modo offline e a instalação só funcionam assim. Duas opções gratuitas:

- **GitHub Pages:** publique a pasta `momon/` e abra `https://<usuário>.github.io/<repositório>/momon/`.
- **Netlify Drop** (app.netlify.com/drop): arraste a pasta `momon/` e use o endereço que ele der.

## Instalar na tela inicial

- **Android (Chrome):** abra o endereço, toque no menu ⋮ e escolha **Instalar app** (ou **Adicionar à tela inicial**).
- **iPad / iPhone (Safari):** toque em **Compartilhar** e escolha **Adicionar à Tela de Início**.

Depois de aberto uma vez com internet, ele funciona offline e em tela cheia. Precisa de iOS/iPadOS 15 ou mais novo, ou de um Android com o Chrome atualizado.

## Como brincar (para os adultos)

- **Primeira vez:** toque no ovinho de estrela; ele choca e o Momon nasce. Nas outras vezes, ele está dormindo; um toque acorda.
- **Carinho:** arraste o dedo em cima dele. Ele fecha os olhos e ronrona, e o celular vibra de leve onde há suporte. Carinho longo faz brotar flores, estrelinhas e vaga-lumes e acende a lua da testa.
- **Cutucar:** um toque rápido nele dá um miadinho e uma piscada. Tocar fora dele solta um brilhinho.
- **Do emburrado ao feliz:** ele acorda emburradinho. Carinho, cutucadas e brincadeiras vão amolecendo o Momon (emburrado → desconfiado → amolecendo → contente → feliz). Cada dia em que ele chega no feliz aumenta a amizade, e nas próximas vezes ele amolece mais rápido.
- **Amassar pãozinho (botão rosa da cobertinha):** a cobertinha aparece embaixo dele. Toque na metade esquerda e na metade direita da tela, alternando: a patinha do lado tocado amassa no compasso. Quanto mais ritmado, mais alto ele ronrona, mais devagar pisca e mais a lua brilha. Não existe erro: fora do ritmo ele só acompanha. No fim, ele se enrosca em cima da cobertinha. Toque nele para ele levantar, ou no botão rosa para sair.
- **Dormir (botão azul da lua):** o quarto escurece e aparecem estrelas. Arraste a mantinha para cima dele (só tocar nela também cobre). Ele se enrosca e dorme, e toca uma cantiga. Os botões de lua, estrela e nuvem trocam entre as três cantigas. Depois de uns segundos, a tela fica bem escura (dormir junto). A cantiga toca três vezes e vai sumindo.
- **Sair do dormir:** segure o sol (canto de cima) por **2 segundos**. Um toque rápido não sai, para a criança não acordar o Momon sem querer.
- **Sessões curtas:** depois de uns 8 minutos, o botão da lua começa a brilhar, chamando para dormir. Se ninguém tocar por cerca de 50 segundos, ele cochila sentado.

## Privacidade

Nada sai do aparelho. O app guarda no próprio navegador (`localStorage`) só se o Momon já nasceu, a amizade, o número de visitas, o tempo de carinho e a última cantiga. Para apagar tudo, limpe os dados do site nas configurações do navegador.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html`, `style.css` | A tela: camadas da cena, palco do Momon, botões, zonas de amassar e tela inicial. |
| `app.js` | Os modos (início, livre, amassar, dormir), o carinho, o jeito emburrado → feliz, as partículas e as dicas. |
| `assets/momon.svg.js` | O desenho do Momon: 16 partes em `<g id>` separados, as poses sentado e enroscado e as cobertas. |
| `assets/momon.css` | Os humores (`data-humor`), as poses (`data-pose`), a respiração e o rabo. |
| `assets/cena.svg.js` | O quarto: o cômodo, as luzes (janela, lua, estrelas, varal) e a almofada. |
| `assets/icones.svg.js` | Botões, partículas (flor, estrela, vaga-lume, coração, Z), patinha, mãozinha e o ovinho. |
| `audio/sons.js` | Miadinho, "mrrp", sininhos, amassada, bocejo, pop e vento, todos em Web Audio. |
| `audio/purr.js` | O ronronar e o ronco de sono. |
| `audio/lullaby.js` | As três cantigas de ninar originais (Lua, Estrela e Nuvem). |
| `manifest.json`, `sw.js`, `assets/icones/` | O PWA: instalação, offline e ícones com o rosto do Momon. |
| `teste-expressoes.html` | Folha de expressões, para conferir o desenho. |

Ao mudar qualquer arquivo, aumente `VERSAO` em `sw.js`. Assim os aparelhos que já instalaram baixam a versão nova na próxima vez que abrirem com internet.

Esquerda e direita (`pata-esq`, `orelha-dir` etc.) são as da tela, não as do gato.

## Testes automáticos

São para quem for mexer no código e precisam de Node:

```sh
cd momon/testes
npm install
npx playwright install chromium
npm test                 # fluxo completo (tablet e celular), "criança apertando tudo" e PWA
FOTOS=1 node fluxo.cjs   # guarda uma foto de cada etapa em testes/fotos/
```
