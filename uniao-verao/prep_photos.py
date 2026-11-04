"""Prepara as fotos novas (assets/photos/novas, ~1024 px) para o quadro 1920×1080.

Amplia com IA (Real-ESRGAN, licença BSD-3) e grava em assets/photos/hd/:
  - ×2 (RealESRGAN_x2plus) para a maioria;
  - ×4 (RealESRGAN_x4plus) para as panorâmicas (434 px de altura), que entram em tela cheia
    e precisariam de ~2,5× só para cobrir 1080 px.
A saída da rede é misturada a uma ampliação Lanczos (MIX) e recebe um grão finíssimo, para que
pele e água não fiquem com aspecto "pintado"; a nitidez das bordas vem da rede.

    pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
    pip install spandrel pillow numpy
    python3 prep_photos.py              # IA (~1 min por foto em CPU)
    python3 prep_photos.py --lanczos    # sem IA: Lanczos 2× + nitidez (comportamento antigo)
    python3 prep_photos.py --only deck  # só os arquivos cujo nome contém "deck"
    python3 prep_photos.py --missing    # só as que ainda não estão em hd/

Os pesos baixam uma vez para build/models/.
"""
import argparse
import glob
import os
import time
import urllib.request
import zlib

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "assets/photos/novas")
DST = os.path.join(HERE, "assets/photos/hd")
MODELS = os.path.join(HERE, "build/models")
WEIGHTS = {
    2: ("RealESRGAN_x2plus.pth", "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth"),
    4: ("RealESRGAN_x4plus.pth", "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"),
}
MIX = 0.78      # peso da rede na mistura com o Lanczos
GRAIN = 1.6     # desvio do grão (níveis de 0–255) aplicado só à saída da IA


def scale_for(im):
    """×4 quando ×2 não cobre o quadro 1920×1080 com folga para o zoom da câmera.
    As verticais só entram em painéis (≤ 960 px de largura), então ×2 basta."""
    if im.height > im.width:
        return 2
    need = max(1920 / im.width, 1080 / im.height) * 1.12
    return 4 if need > 2 else 2


_models = {}


def model(scale):
    if scale not in _models:
        import torch
        from spandrel import ModelLoader
        name, url = WEIGHTS[scale]
        path = os.path.join(MODELS, name)
        if not os.path.exists(path):
            os.makedirs(MODELS, exist_ok=True)
            print("baixando", name)
            urllib.request.urlretrieve(url, path)
        torch.set_num_threads(os.cpu_count() or 4)
        _models[scale] = ModelLoader().load_from_file(path).eval()
    return _models[scale]


def upscale_ai(im, scale, tile=384, pad=24):
    import torch
    net = model(scale).model
    x = torch.from_numpy(np.asarray(im, dtype=np.float32) / 255).permute(2, 0, 1)[None]
    _, _, h, w = x.shape
    out = torch.zeros(1, 3, h * scale, w * scale)
    with torch.inference_mode():
        for y0 in range(0, h, tile):
            for x0 in range(0, w, tile):
                y1, x1 = min(y0 + tile, h), min(x0 + tile, w)
                ya, xa, yb, xb = max(y0 - pad, 0), max(x0 - pad, 0), min(y1 + pad, h), min(x1 + pad, w)
                o = net(x[:, :, ya:yb, xa:xb])
                out[:, :, y0 * scale:y1 * scale, x0 * scale:x1 * scale] = \
                    o[:, :, (y0 - ya) * scale:(y1 - ya) * scale, (x0 - xa) * scale:(x1 - xa) * scale]
    ai = out[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255
    lz = np.asarray(im.resize((w * scale, h * scale), Image.LANCZOS), dtype=np.float32)
    rng = np.random.default_rng(zlib.crc32(im.tobytes()[:4096]))
    mixed = MIX * ai + (1 - MIX) * lz + rng.normal(0, GRAIN, ai.shape[:2])[..., None]
    return Image.fromarray(np.clip(mixed + 0.5, 0, 255).astype(np.uint8))


def upscale_lanczos(im):
    up = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    return up.filter(ImageFilter.UnsharpMask(radius=1.4, percent=45, threshold=2))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lanczos", action="store_true", help="sem IA")
    ap.add_argument("--only", default="", help="filtra pelo nome do arquivo")
    ap.add_argument("--missing", action="store_true", help="pula as que já existem em hd/")
    a = ap.parse_args()
    os.makedirs(DST, exist_ok=True)
    for path in sorted(glob.glob(os.path.join(SRC, "*.jpg"))):
        if a.only not in os.path.basename(path):
            continue
        if a.missing and os.path.exists(os.path.join(DST, os.path.basename(path))):
            continue
        t0 = time.time()
        im = Image.open(path).convert("RGB")
        if a.lanczos:
            up, how = upscale_lanczos(im), "lanczos ×2"
        else:
            s = scale_for(im)
            up, how = upscale_ai(im, s), f"Real-ESRGAN ×{s}"
        up.save(os.path.join(DST, os.path.basename(path)), quality=93, subsampling=0)
        print(f"{os.path.basename(path)} {im.size} -> {up.size}  {how}  {time.time() - t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()
