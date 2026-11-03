# Verão no União — filme de aquisição, 30 s (V3)

Grêmio Náutico União · 1920 × 1080 · 30 fps · H.264 + AAC · −14 LUFS · motion com fotografia, tipografia animada, locução e trilha.

**Assistir:** [`build/uniao-verao-30s.mp4`](build/uniao-verao-30s.mp4)

## Montagem (v3: motion)

O motor (`film.js`) monta uma linha do tempo de **planos**, cada um com câmera própria, ligados por **transições compostas**. A **tipografia cinética** é uma camada independente por cima. Cada quadro final é a média de 6 amostras dentro do obturador de 180°, o que dá desfoque de movimento real nos chicotes e zooms. Nas transições sobem para 12 amostras com obturador de 270°. O acabamento é um grão leve. Todos os cortes caem numa batida da trilha (117,5 BPM).

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
python3 prep_photos.py           # assets/photos/novas -> assets/photos/hd (ampliação 2×)
python3 audio.py                 # build/mix.wav (numpy + ffmpeg)
node render.mjs                  # build/uniao-verao-30s.mp4 (Playwright + ffmpeg, ~5 min)
node render.mjs --stills 1,10,27 # quadros soltos para conferência
```

Para pré-visualizar com áudio, abra `film.html` num servidor local, por exemplo `python3 -m http.server`.

## Pendências

- **Resolução das fotos novas:** chegaram com cerca de 1024 px. As verticais entram em dípticos e trípticos e ficam quase na resolução nativa. As horizontais em tela cheia (gancho, CTA, família mergulhando) foram ampliadas cerca de 1,9 a 2,5×. Para trocar pelas originais, basta repor os arquivos em `assets/photos/novas/` com os mesmos nomes.
- **Imagens ilustrativas:** as fotos novas parecem ilustrativas e não registros das sedes. A diretriz da LP pede "fotografia verdadeira do clube", então vale validar o uso em mídia paga. O mosaico das sedes usa as fotos reais do acervo do site, identificadas na LP.
- **Fotos não usadas:** beach tennis (a modalidade não está confirmada no roteiro), escolinha de tênis, casal nas espreguiçadeiras, mesa (detalhe), deck e orla do Guaíba, remo.
- **Caixa alta:** o CTA ("Quero conhecer o União →") e o reforço ("Você também pode fazer parte.") estão em frase normal, seguindo a regra da LP.
- **Escudo:** recortado do PDF vetorial em alta resolução; na versão final, usar o arquivo oficial.
- **Licença da trilha:** confirmar a licença para mídia paga.
- **Variante sem locução:** ainda não foi feita.

Fontes: Instrument Sans e Instrument Serif (SIL OFL), as mesmas da LP.
