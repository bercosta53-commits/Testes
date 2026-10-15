# Proposta Sara Meireles

Proposta de Estratégia e Gestão de Aquisição Digital para Sara Meireles, Consultoria de Estilo e Imagem.

- **PDF para envio:** [`proposta-sara-meireles.pdf`](proposta-sara-meireles.pdf) (A4, 10 páginas)
- **Fonte:** `proposta.html`, uma página Artifact (sem o esqueleto `<html>`/`<head>`, que é adicionado na publicação). Mosaico de cards em grafite, papel, pedra e laranja; funciona no celular.
- **Fotos:** `img/`, imagens de moodboard em preto e branco (Pexels, licença livre). Troque pelos arquivos reais mantendo os mesmos nomes.

Para gerar o PDF de novo depois de editar o texto:

```sh
node render-pdf.mjs                   # -> proposta-sara-meireles.pdf
node render-pdf.mjs --shots ./shots   # também salva capturas de desktop e celular
```

O script usa o Playwright com Chromium, diagrama cada página em uma folha A4 e baixa as fontes (Host Grotesk, IBM Plex Mono, Instrument Serif) do Google Fonts.
