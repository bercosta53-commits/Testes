# Sonata Black Friday 2026 (Remotion)

Reels e Stories, 9:16, 1080x1920, 30 fps, 39 s (1170 frames). Roteiro e direção na fonte da verdade
`sonata-black-friday-geral-FINAL.md`.

## Rodar

```bash
npm i
npm run dev              # Studio (escaneia public/assets antes)
npm run render:preview   # out/sonata-preview.mp4 (CRF 24, com placeholders)
npm run check:offer      # falha enquanto houver [A CONFIRMAR]
npm run render:final     # check:offer + MP4 H.264 CRF 19, AAC 192 kbps
```

Para conferir as zonas seguras no Studio, ligue a prop `showSafeZones`.

## Onde colocar os arquivos

Tudo em `public/assets/`. O `npm run assets` lista o que existe e a composição troca o placeholder pelo arquivo real.

| Arquivo | Uso |
|---|---|
| `img/s1-apresentadora.png` ou `video/s1-apresentadora.mp4` | S1 (vídeo com lip sync, 4 a 5 s) |
| `img/s6-apresentadora.png` ou `video/s6-apresentadora.mp4` | S6 |
| `video/s3a-mesa-fora.mp4` | S3 beat 1, usa 0 a 5 s, tom frio |
| `video/s3b-sala-sofa.mp4` | S3 beat 2, usa 4 a 9 s, tom quente |
| `img/s3b-sala-sofa.png` | fundo desfocado de S4 e S5 |
| `img/aparelho-par-carregador.png` | S2 e S4. Veio com 500x436 e fundo branco; recortei e ampliei 2x. Peça uma foto em alta ao fornecedor |
| `img/loja.jpg` (ou `video/s7-loja.mp4`) | S7 |
| `img/logo.png` (azul) e `logo-verde.png` | S7. Cores do logo: azul #143D66 e verde-água #03AEA9 |

Vídeos do Gemini (720x1280): são cobertos para 1080x1920 e o áudio original é descartado.

## Lip sync de S1 e S6 (falta rodar)

No flow do ElevenLabs (`https://elevenlabs.io/app/flows/WfpRrENm9xojapeF1XF3`) já existem dois nós OmniHuman ligados às falas:
"S1 lip sync" e "S6 lip sync". Falta soltar `s1-apresentadora.jpg` e `s6-apresentadora.jpg` na porta `image` de cada um e rodar.
Baixe os MP4 como `public/assets/video/s1-apresentadora.mp4` e `s6-apresentadora.mp4`. Com o vídeo presente, o projeto o usa no lugar da imagem.
Depois, em `src/data/timeline.ts`, ajuste a voz de S1 para `start: 0, rate: 1` e a de S6 para `start: 930, rate: 1`, porque o clipe já traz a fala sincronizada.

As imagens e os vídeos não ficam no Git (repositório público). Veja `.gitignore`.

## Áudio (ElevenLabs, já gerado)

- Voz: Juliana Moreira (`dxIMMSJYSsbUSMhioLNb`), `eleven_v4`, uma tomada por fala, em `public/assets/audio/voz-s1..s7.mp3`.
- Trilha `trilha.mp3` (40 s) e efeitos em `audio/sfx/`.
- Flow no ElevenLabs: `WfpRrENm9xojapeF1XF3`.
- S1 e S4 recebem aceleração leve (1,04x e 1,10x) para caber no trecho.
- Ducking de 12 dB da trilha sob a voz em `src/SonataBF.tsx`.

## Pendências com a Sonata (`src/data/offer.ts`)

`modelo`, `whatsapp`, `endereco`, `juros` (cerca de 1,1% a.m.), `textoLegal`. Logo, paleta e tipografia oficiais.
A veracidade do preço de referência (R$ 9.600) é responsabilidade da Sonata.

## Estrutura

```
src/data/offer.ts      dados da oferta (única fonte dos números)
src/data/timeline.ts   trechos, falas, legendas, efeitos
src/theme.ts           cores do KV suavizado, zonas seguras, tamanhos mínimos
src/segments/S1..S7    trechos
src/components/        PriceBadge, FeatureCallout, BenefitList, SoundWave, BluetoothLink,
                       WhatsAppButton, LegalFooter, SafeZoneGuide, Captions, Selo
scripts/               scan-assets, check-offer
```

## Loudness

O render sai em cerca de -15,7 LUFS. Depois do `render:final`, rode `npm run master` para normalizar em -14 LUFS (pico -1,5 dBTP) sem recodificar o vídeo.
