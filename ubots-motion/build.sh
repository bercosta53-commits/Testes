#!/usr/bin/env bash
# Pipeline completo da v3: eventos -> áudio -> quadros (3 formatos) -> MP4 + capas em out/
set -euo pipefail
cd "$(dirname "$0")"
export GL=${GL:-swiftshader}
FORMATS=${FORMATS:-"4x5 9x16 1x1"}
python3 render3.py events
python3 audio3.py
if [ "${SKIP_RENDER:-0}" != 1 ]; then
  for f in $FORMATS; do python3 render3.py full "$f" > "render3_$f.log" 2>&1 & done; wait
fi
mkdir -p out
for f in $FORMATS; do
  ffmpeg -loglevel error -y -framerate 30 -i "frames3_$f/f%04d.jpg" -i audio3.wav \
    -c:v libx264 -profile:v high -preset slow -crf 18 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart \
    "out/ubots_case_transpocred_v3_$f.mp4"
  ffmpeg -loglevel error -y -i "frames3_$f/f0570.jpg" "out/capa_${f}_final.png"
  ffmpeg -loglevel error -y -i "frames3_$f/f0090.jpg" "out/capa_${f}_abertura.png"
done
ls -lh out
