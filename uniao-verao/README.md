# Verão no União — filme de aquisição, 30 s (V3)

Grêmio Náutico União · 1920 × 1080 · 30 fps · H.264 + AAC · motion com fotografia, tipografia animada e locução.

**Assistir:** [`build/uniao-verao-30s.mp4`](build/uniao-verao-30s.mp4). Por enquanto tem só a locução: a trilha ainda vai entrar.

## Montagem

| Tempo | Cena | Foto | Texto em tela |
|---|---|---|---|
| 0–3,5 | Gancho | Piscinas-lagoa, Alto Petrópolis | Já imaginou ser sócio do União? |
| 3,5–6,8 | Assinatura (paper + painel) | Piscina, Moinhos de Vento | *O verão tem **encontro** marcado no União.* (Instrument Serif) |
| 6,8–8,2 | Lazer | Piscina AP (água) | Piscina. |
| 8,2–9,3 | Lazer | Saibro, União Petrópole | Tênis. |
| 9,3–11,3 | Lazer | Lago e gazebo, AP | Dias ao sol. |
| 11,3–12,7 | Convivência (janela que se expande na horizontal) | Remo no Guaíba | Amigos por perto. |
| 12,7–15,5 | Convivência, a foto toma o quadro | Crianças na piscina | Tempo em família. |
| 15,5–18,8 | Pertencimento | Retrato | Você também pode fazer parte. / Conheça o União. |
| 18,8–24 | Mosaico 2×2, as quatro já estão em tela aos 20,5 s | AP · Moinhos · Petrópole · Ilha do Pavão | 4 sedes. / Muitos jeitos de viver o União. |
| 24–30 | CTA | Piscinas AP | *O próximo encontro pode ser o seu.* → **Seja sócio do União.** → botão "Quero conhecer o União →" + escudo |

A locução (ElevenLabs, Sofia) foi cortada frase a frase e cada frase foi encaixada na janela do roteiro (`audio.py`, `build/locucao_timeline.json`). Os cortes internos caem nas palavras: "piscina", "tênis", "aproveitar" e "e tempo".

## Trilha

1. Salve o arquivo como `assets/audio/trilha.wav` (ou `.mp3`, `.m4a`, `.flac`).
2. `python3 audio.py`: a trilha entra sob a voz, com ducking automático e fade de 0,6 s no fim. Os ajustes são `--music-gain-db`, `--duck-db` e `--music-offset`.
3. `node render.mjs`. Se precisar, os tempos de corte em `film.js` (`const T`) podem ser ajustados ao beat.

## Como gerar

```sh
python3 audio.py                 # build/mix.wav (numpy + ffmpeg)
node render.mjs                  # build/uniao-verao-30s.mp4 (Playwright + ffmpeg)
node render.mjs --stills 1,10,27 # quadros soltos para conferência
```

Para pré-visualizar com áudio, abra `film.html` num servidor local, por exemplo `python3 -m http.server`.

## Pendências de produção

- **As fotos são provisórias.** Saíram do PDF da Entrega A, que é o acervo do site em baixa resolução, e foram ampliadas para 1080p. O roteiro pede os arquivos originais. Para trocar, basta substituir os arquivos de `assets/photos/` mantendo os nomes.
- **Faltam fotos que o roteiro pede:** amigos jogando tênis (hoje a quadra aparece vazia), amigos à mesa e família na borda da piscina. A cena "Amigos por perto" usa o remo ao pôr do sol, que é mais dourado do que o tom solar do roteiro.
- O CTA vem em frase normal ("Quero conhecer o União →") e o reforço do meio também ("Você também pode fazer parte."), seguindo a regra da LP de não usar caixa alta espaçada. Com isso, os textos diferem da caixa alta do roteiro.
- O escudo foi recortado do PDF vetorial em alta resolução. Para a versão final, usar o arquivo oficial.
- A variante sem locução ainda não foi feita.

Fontes: Instrument Sans e Instrument Serif (SIL OFL), as mesmas da LP.
