# Playbook Viacredi × Ubots (versão ajustada)

- `playbook-viacredi-ubots-ajustado.pdf` — PDF final (13 páginas, 1920×1080, campos preenchíveis nas págs. 10–13).
- `src/` — fonte do playbook (HTML/CSS) para novas edições.
  - `slides.cjs`: conteúdo dos slides · `style.css`: estilos · `build.cjs`: HTML → PDF (Chromium) · `finish.cjs`: adiciona campos de formulário.
  - Rodar: `cd src && npm i && npm run build` (gera `base.pdf` e `final.pdf`).
