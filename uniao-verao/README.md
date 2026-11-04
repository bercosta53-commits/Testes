# Verão no União — filme de aquisição, 30 s (V3)

Grêmio Náutico União · 1920 × 1080 · 30 fps · H.264 + AAC · −14 LUFS · motion com fotografia, tipografia animada, locução e trilha.

**Assistir:** [`build/uniao-verao-30s.mp4`](build/uniao-verao-30s.mp4)

## Montagem (v3: motion)

O motor (`film.js`) monta uma linha do tempo de **planos**, cada um com câmera própria, ligados por **transições compostas**. A **tipografia cinética** é uma camada independente por cima. Cada quadro final é a média de 6 amostras dentro do obturador de 180°, o que dá desfoque de movimento real nos chicotes e zooms. Nas transições sobem para 12 amostras com obturador de 270°. O acabamento é um grão leve. Todos os cortes caem numa batida da trilha (117,5 BPM).

### Camada de IA: fotos ampliadas e parallax 2.5D

- **Ampliação por IA** (`prep_photos.py`): as fotos novas chegaram com cerca de 1024 px. O Real-ESRGAN amplia ×2 as verticais e ×4 as horizontais, que entram em tela cheia. A saída é misturada a 22% de Lanczos e recebe um grão finíssimo, para pele e água não ficarem com cara de pintura. O ganho aparece no gancho, no deck, no mergulho e na orla: o detalhe é recuperado e os artefatos de JPEG somem.
- **Profundidade por IA** (`profundidade.py`): o Depth Anything V2 Small estima um mapa de profundidade para cada foto, inclusive as 4 fotos reais das sedes, e o grava em `assets/photos/depth/`. O primeiro plano é dilatado e o mapa é suavizado, para o deslocamento não rasgar a silhueta das pessoas.
- **Parallax 2.5D** (`film.js`, módulo `GL`): um shader WebGL desloca cada pixel conforme a profundidade enquanto a câmera do plano se move. O que está perto anda mais e o que está longe anda menos, como numa câmera de verdade, e o primeiro plano encobre o fundo (parallax occlusion mapping com bisseção). Cada plano tem o próprio movimento (`par`): travelling lateral no deck, na orla e no mergulho, dolly no gancho e nas sedes, e deslocamento vertical nos dípticos e trípticos. O movimento 2D antigo continua valendo para o plano de foco, e o parallax soma por cima.
  - `node render.mjs --par 0` gera o filme sem parallax, para comparar antes e depois; `--par 3` exagera o efeito, para caçar artefatos.
  - O parallax não inventa conteúdo: só move a câmera sobre a própria foto. Por isso pode ser usado nas fotos reais das sedes.
  - Licenças: Real-ESRGAN (BSD-3) e Depth Anything V2 **Small** (Apache-2.0). As versões Base e Large do Depth Anything são CC-BY-NC e não servem para mídia paga.

| Tempo | Plano | Movimento / transição | Texto |
|---|---|---|---|
| 0–3,55 | Piscinas-lagoa | Câmera "chega" (zoom 1,32→1,07 com giro), sem quadro parado | Já imaginou ser *sócio* do União? (palavras sobem da máscara) |
| 3,55–4,52 | "verão" gigante preenchido com a foto do deck | Chicote lateral; letras sobem uma a uma; zoom atravessa a letra | (o VO diz "O verão tem…") |
| 4,52–6,62 | Deck no Guaíba | Continuidade do zoom | *O verão tem encontro marcado no União.* + traço ciano em "encontro" |
| 6,62–7,64 | Pés na borda | Transição em faixas (slats) | **Piscina.** |
| 7,64–8,15 | Família mergulhando | Chicote vertical | |
| 8,15–9,17 | Tríptico: amigas · bolas · avô e neto | Painéis deslizam em sentidos opostos | **Tênis.** |
| 9,17–10,19 | Díptico: mulher · raquete → casal | Chicote; troca vertical no beat | **Dias ao sol.** |
| 10,19–11,22 | Escolinha | Chicote | |
| 11,22–12,75 | Amigos à mesa + cartão sobreposto em profundidade | Janela que se expande empurrando a cena anterior para trás | Amigos por perto. |
| 12,75–14,28 | Díptico: pai e filha · piquenique | Painéis verticais | Tempo em família. |
| 14,28–15,30 | Família na orla | Chicote + travelling | |
| 15,30–18,88 | Mural infinito de 7 colunas rolando | Zoom-out de 5,25× até o mural, que gira levemente | Você também pode fazer parte. / Conheça o União. |
| 18,88–23,99 | As 4 sedes, ~1,3 s cada, em formato de stories (barra de progresso no topo) | Chicotes alternados | "4 sedes." → "Muitos jeitos de viver o União." (com o VO) + nome e descrição de cada sede |
| 23,99–26,03 | Mural de fotos de volta, girando para o outro lado | Janela; zoom-out e rolagem mais rápida | *O próximo encontro pode ser o seu.* |
| 26,03–30 | Hero de site: fundo deep-ink com carrosséis de fotos em cima e embaixo | Chicote vertical; "Seja sócio" entra gigante e encolhe no acorde (26,54) | **Seja sócio do União.** + escudo; em "Clique" um cursor clica no botão "Quero conhecer o União →" (onda do clique, carrosséis aceleram) |

## Áudio (`audio.py`)

- **Locução:** voz ElevenLabs "Ana Alice" (`assets/audio/locucao-ana-alice.mp3`), cortada frase a frase e encaixada na janela do roteiro (`build/locucao_timeline.json`). A versão anterior, com a voz Sofia, sai com `python3 audio.py --voz sofia`.
- **Trilha:** no arranjo original, o acorde final caía em 24,5 s, logo no início do CTA, e a música morria embaixo do "Seja sócio do União". Repeti um compasso (20,41–22,45 s, quase idêntico ao vizinho), com emenda em crossfade sobre o tempo forte. Assim o acorde de resolução cai em 26,54 s, em cima de "sócio", e a cauda dele sustenta o fechamento. No acorde, a foto do CTA ganha um pouco de luz.
- **Efeitos sonoros:** 5 efeitos do ElevenLabs (`assets/audio/sfx/`) sincronizados em `audio.py` (lista `SFX`):
  - um whoosh discreto só em 4 momentos-chave (gancho → "verão", entrada do mural, início das sedes e entrada do "Seja sócio"), com o pico no meio da transição;
  - o swell no zoom que atravessa "verão";
  - o splash no corte para o mergulho;
  - a raquetada na entrada do tênis;
  - o clique no instante em que o cursor clica.

  Os efeitos ficam abaixo do resto da mistura; o whoosh, bem abaixo. Para ajustar, use `--sfx-db` (por exemplo, `--sfx-db 3`); para tirar, use `--no-sfx`. Quando só o áudio muda, `node render.mjs --encode-only` remonta o vídeo em segundos.
- **Mix:** ducking da trilha sob a voz, fade final de 0,6 s e normalização EBU R128 para −14 LUFS, com pico real ≤ −1,5 dBTP.
- **Trilha original:** `python3 audio.py --no-bar-repeat` gera a versão sem a repetição de compasso.

## Como gerar

```sh
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install spandrel transformers pillow numpy scipy

python3 prep_photos.py           # assets/photos/novas -> assets/photos/hd (Real-ESRGAN, ~1–4 min por foto em CPU)
python3 prep_photos.py --lanczos # alternativa rápida, sem IA
python3 profundidade.py          # assets/photos/depth/*.png (já versionados; só rode se trocar fotos)
python3 audio.py                 # build/mix.wav (numpy + ffmpeg)
node render.mjs                  # build/uniao-verao-30s.mp4 (Playwright + ffmpeg; o parallax deixa ~8× mais lento)
node render.mjs --stills 1,10,27 # quadros soltos para conferência
node render.mjs --par 0 --out build/sem-parallax.mp4   # antes/depois
```

Os pesos dos modelos são baixados uma vez (Real-ESRGAN em `build/models/`, Depth Anything no cache do Hugging Face). As fotos ampliadas (`assets/photos/hd/`) não são versionadas; os mapas de profundidade são.

Para pré-visualizar com áudio, abra `film.html` num servidor local, por exemplo `python3 -m http.server`.

## Pendências

- **Resolução das fotos novas:** chegaram com cerca de 1024 px. A ampliação por IA resolve bem o uso em 1080p, mas as originais em alta continuam sendo melhores. Para trocá-las, reponha os arquivos em `assets/photos/novas/` com os mesmos nomes e rode `prep_photos.py` e `profundidade.py`.
- **Imagens ilustrativas:** as fotos novas parecem ilustrativas e não registros das sedes. A diretriz da LP pede "fotografia verdadeira do clube", então vale validar o uso em mídia paga. O mosaico das sedes usa as fotos reais do acervo do site, identificadas na LP.
- **Fotos não usadas:** beach tennis (a modalidade não está confirmada no roteiro), escolinha de tênis, casal nas espreguiçadeiras, mesa (detalhe), deck e orla do Guaíba, remo.
- **Caixa alta:** o CTA ("Quero conhecer o União →") e o reforço ("Você também pode fazer parte.") estão em frase normal, seguindo a regra da LP.
- **Escudo:** recortado do PDF vetorial em alta resolução; na versão final, usar o arquivo oficial.
- **Licença da trilha:** confirmar a licença para mídia paga.
- **Variante sem locução:** ainda não foi feita.

Fontes: Instrument Sans e Instrument Serif (SIL OFL), as mesmas da LP.
