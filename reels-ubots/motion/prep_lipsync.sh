#!/bin/sh
# extrai os quadros (30 fps, 1080x1920) dos lipsyncs do ElevenLabs para o render
cd "$(dirname "$0")/assets/lipsync" || exit 1
for n in hook cta; do
  rm -rf $n && mkdir $n
  ffmpeg -v error -y -i ${n}_raw.mp4 -an -vf "fps=30,crop=1080:1920,unsharp=5:5:0.4:5:5:0.0" -q:v 3 $n/f%03d.jpg
  echo "$n: $(ls $n | wc -l) quadros"
done
# câmera B: 3,48 s úteis, acelerados 15% para caber em "Que, por sinal…"
rm -rf camb && mkdir camb
ffmpeg -v error -y -t 3.48 -i camb_raw.mp4 -an -vf "setpts=PTS/1.15,fps=30,crop=1080:1920,unsharp=5:5:0.4:5:5:0.0" -q:v 3 camb/f%03d.jpg
echo "camb: $(ls camb | wc -l) quadros"
# fechamento (Aurora, 704x1280 -> 1080x1920): "Acesse o site da Ubots"
rm -rf site && mkdir site
ffmpeg -v error -y -i site_raw.mp4 -an -vf "fps=30,scale=1080:1920:flags=lanczos,unsharp=5:5:0.5:5:5:0.0" -q:v 3 site/f%03d.jpg
echo "site: $(ls site | wc -l) quadros"
