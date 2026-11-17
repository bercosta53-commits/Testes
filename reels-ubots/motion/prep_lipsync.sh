#!/bin/sh
# extrai os quadros (30 fps, 1080x1920) dos lipsyncs do ElevenLabs para o render
cd "$(dirname "$0")/assets/lipsync" || exit 1
for n in hook cta; do
  rm -rf $n && mkdir $n
  ffmpeg -v error -y -i ${n}_raw.mp4 -an -vf "fps=30,crop=1080:1920,unsharp=5:5:0.4:5:5:0.0" -q:v 3 $n/f%03d.jpg
  echo "$n: $(ls $n | wc -l) quadros"
done
