# Verão no União — filme de aquisição, 30 s (V3)

Grêmio Náutico União · 1920 × 1080 · 30 fps · H.264 + AAC · −14 LUFS · motion com fotografia, tipografia animada, locução e trilha.

**Assistir:** [`build/uniao-verao-30s.mp4`](build/uniao-verao-30s.mp4)

## Montagem

A trilha está a 117,5 BPM e todos os cortes caem numa batida (`b(n)` em `film.js`), dentro da janela do roteiro e antes da palavra correspondente na locução.

| Tempo | Cena | Fotos | Texto em tela |
|---|---|---|---|
| 0–3,55 | Gancho | Piscinas-lagoa com famílias e amigos | Já imaginou ser sócio do União? |
| 3,55–6,62 | Assinatura (paper + painel) | Pai e filha na borda da piscina | *O verão tem **encontro** marcado no União.* |
| 6,62–8,15 | Lazer | Pés na borda da piscina | Piscina. |
| 8,15–9,17 | Lazer, tríptico | Amigas no saibro · bolas · avô e neto | Tênis. |
| 9,17–11,22 | Lazer, díptico | Mulher na borda · raquete e drink | Dias ao sol. |
| 11,22–12,75 | Convivência (janela que se expande) | Amigos à mesa | Amigos por perto. |
| 12,75–15,30 | Convivência, a foto toma o quadro | Família mergulhando | Tempo em família. |
| 15,30–18,88 | Pertencimento (foto + faixa deep-ink) | Piquenique em família à sombra | Você também pode fazer parte. / Conheça o União. |
| 18,88–23,99 | Mosaico 2×2, uma sede por batida, todas em tela aos 20,9 s | AP · Moinhos · Petrópole · Ilha do Pavão (acervo do site) | 4 sedes. / Muitos jeitos de viver o União. |
| 23,99–30 | CTA | Piscinas-lagoa | *O próximo encontro pode ser o seu.* → **Seja sócio do União.** (26,03) → botão "Quero conhecer o União →" + escudo (27,56) |

## Áudio (`audio.py`)

- **Locução:** cortada frase a frase e encaixada na janela do roteiro (`build/locucao_timeline.json`).
- **Trilha:** no arranjo original, o acorde final caía em 24,5 s, logo no início do CTA, e a música morria embaixo do "Seja sócio do União". Repeti um compasso (20,41–22,45 s, quase idêntico ao vizinho), com emenda em crossfade sobre o tempo forte. Assim o acorde de resolução cai em 26,54 s, em cima de "sócio", e a cauda dele sustenta o fechamento. No acorde, a foto do CTA ganha um pouco de luz.
- **Mix:** ducking da trilha sob a voz, fade final de 0,6 s e normalização EBU R128 para −14 LUFS, com pico real ≤ −1,5 dBTP.
- **Trilha original:** `python3 audio.py --no-bar-repeat` gera a versão sem a repetição de compasso.

## Como gerar

```sh
python3 prep_photos.py           # assets/photos/novas -> assets/photos/hd (ampliação 2×)
python3 audio.py                 # build/mix.wav (numpy + ffmpeg)
node render.mjs                  # build/uniao-verao-30s.mp4 (Playwright + ffmpeg)
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
