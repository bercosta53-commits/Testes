"""Mapas de profundidade por IA para o parallax 2.5D do filme.

Usa o Depth Anything V2 Small (licença Apache-2.0; as versões Base/Large são CC-BY-NC e
não servem para mídia paga). Para cada foto grava assets/photos/depth/<nome>.png, em tons
de cinza: branco = perto, preto = longe. O film.js lê esses mapas e, num shader WebGL,
desloca cada pixel conforme a profundidade enquanto a câmera se move.

Pós-processamento, para o deslocamento não rasgar as bordas:
  - normalização por percentis (2–98), para todas as fotos usarem a faixa inteira;
  - dilatação do primeiro plano (filtro de máximo), para que o "esticamento" das áreas que
    a câmera revela fique no fundo e não crie um halo na silhueta das pessoas;
  - desfoque leve, para o deslocamento variar suavemente.

    pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
    pip install transformers pillow numpy scipy
    python3 profundidade.py             # todas as fotos usadas no filme
    python3 profundidade.py --only deck # filtra pelo nome
"""
import argparse
import glob
import os

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
DST = os.path.join(HERE, "assets/photos/depth")
SOURCES = sorted(glob.glob(os.path.join(HERE, "assets/photos/novas/*.jpg"))) + [
    os.path.join(HERE, "assets/photos", f)
    for f in ("ap-piscina.jpg", "moinhos-piscina.jpg", "petropole-tenis.jpg", "ilha-aerea.jpg")
]
MODEL = "depth-anything/Depth-Anything-V2-Small-hf"
LONG_SIDE = 1024          # resolução do mapa gravado (o shader interpola)
INFER = 770               # lado menor na inferência (múltiplo de 14): mais detalhe que o padrão 518


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    a = ap.parse_args()

    import torch
    from transformers import AutoImageProcessor, AutoModelForDepthEstimation
    proc = AutoImageProcessor.from_pretrained(MODEL)
    net = AutoModelForDepthEstimation.from_pretrained(MODEL).eval()
    os.makedirs(DST, exist_ok=True)

    for path in SOURCES:
        name = os.path.splitext(os.path.basename(path))[0]
        if a.only not in name:
            continue
        im = Image.open(path).convert("RGB")
        inp = proc(images=im, return_tensors="pt", size={"height": INFER, "width": INFER},
                   keep_aspect_ratio=True, ensure_multiple_of=14, do_resize=True)
        with torch.inference_mode():
            d = net(**inp).predicted_depth[0]                      # disparidade relativa: maior = mais perto
        s = LONG_SIDE / max(im.size)
        ow, oh = round(im.width * s), round(im.height * s)
        d = torch.nn.functional.interpolate(d[None, None], size=(oh, ow), mode="bicubic", align_corners=False)[0, 0].numpy()

        lo, hi = np.percentile(d, 2), np.percentile(d, 98)
        d = np.clip((d - lo) / max(hi - lo, 1e-6), 0, 1)
        r = max(2, round(ow * 0.006))
        d = ndimage.grey_dilation(d, footprint=disk(r))
        d = ndimage.gaussian_filter(d, sigma=ow * 0.003)
        Image.fromarray(np.round(d * 255).astype(np.uint8), "L").save(os.path.join(DST, name + ".png"), optimize=True)
        print(f"{name}  {im.size} -> {ow}×{oh}", flush=True)


def disk(r):
    y, x = np.mgrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


if __name__ == "__main__":
    main()
