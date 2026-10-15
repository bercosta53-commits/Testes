# Proposta Sara Meireles

Proposta de Estratégia e Gestão de Aquisição Digital para Sara Meireles, Consultoria de Estilo e Imagem.

- **PDF para envio:** [`proposta-sara-meireles.pdf`](proposta-sara-meireles.pdf) (apresentação 16:9, 16 slides, honorários de R$ 3.500, mídia de € 800/mês com funil ilustrativo)
- **Fonte:** `proposta.html`, uma página Artifact (sem o esqueleto `<html>`/`<head>`, que é adicionado na publicação). Slides 16:9 em mosaico de cards; botão Apresentar abre em tela cheia (← → navegam); no celular os cards viram uma coluna.
- **Fotos:** `img/`, recortes em preto e branco das fotos enviadas pelo cliente. Para trocar uma foto, substitua o arquivo mantendo o nome.

Para gerar o PDF de novo depois de editar o texto:

```sh
node render-pdf.mjs                   # -> proposta-sara-meireles.pdf
node render-pdf.mjs --shots ./shots   # também salva capturas de desktop e celular
```

O script usa o Playwright com Chromium, gera um slide 1920×1080 por página, avisa se algum card estourar e baixa as fontes (Host Grotesk, IBM Plex Mono, Instrument Serif) do Google Fonts.
