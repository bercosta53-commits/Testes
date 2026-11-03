"""Prepara as fotos novas (assets/photos/novas, ~1024 px) para o quadro 1920×1080.

Amplia 2× com Lanczos + nitidez leve e grava em assets/photos/hd/. As fotos verticais
entram em painéis (dípticos/trípticos), onde ficam praticamente na resolução original;
as horizontais vão para sangria total ou faixas.

    python3 prep_photos.py
"""
import glob
import os

from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "assets/photos/novas")
DST = os.path.join(HERE, "assets/photos/hd")
os.makedirs(DST, exist_ok=True)

for path in sorted(glob.glob(os.path.join(SRC, "*.jpg"))):
    im = Image.open(path).convert("RGB")
    up = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    up = up.filter(ImageFilter.UnsharpMask(radius=1.4, percent=45, threshold=2))
    out = os.path.join(DST, os.path.basename(path))
    up.save(out, quality=92)
    print(os.path.basename(path), im.size, "->", up.size)
