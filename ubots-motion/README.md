# Motion 3D Ubots | Case Transpocred (v2)

Pipeline reproduzido a partir do briefing `ubots_motion_claude_code.md`.

```bash
npm i                                   # three@0.160.0
pip install playwright==1.56.0 numpy scipy
GL=swiftshader python3 render.py events
GL=swiftshader python3 render.py preview 1.8,3.9,5.6,7.7,9.8,13.6,14.8,18.6
GL=swiftshader python3 render.py full
python3 audio2.py
ffmpeg -y -framerate 30 -i frames2/f%04d.jpg -i audio2.wav \
  -vf "scale=1080:1350:flags=lanczos" -c:v libx264 -preset slow -crf 20 \
  -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart \
  out/ubots_case_transpocred_v2_4x5.mp4
```

Fontes: instale `assets/Poppins-*.ttf` e `assets/Nunito.ttf` no sistema (`~/.fonts` + `fc-cache -f`).

## Notas desta execução

- **`assets/ubots.png` é PROVISÓRIO** (wordmark "ubots." gerado em Poppins Bold). Substitua pelo logo oficial antes de publicar.
- `assets/transpocred.svg` continua pendente (tarefa 1 do backlog não aplicada).
- `Nunito.ttf` é a variável `wght 200–1000` (subset latin do @fontsource-variable/nunito convertido para TTF).
- Ajuste de enquadramento: `camE` mira em `y=1.25` (antes `0.75`) para a caixa descer ~60px e o "E-book gratuito" não sobrepor a aba da caixa.
- Playwright fixado em 1.56.0 para casar com o Chromium pré-instalado.
