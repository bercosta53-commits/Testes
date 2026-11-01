# Tratamento de fotos (briefing de design §8): P&B, contraste suave, grão leve.
# Uso: python scripts/tratar-fotos.py <pasta-com-originais-<id>.jpg> src/assets/img   (requer Pillow)
# escuro: mais escuro (seções Ink). claro: tom levemente quente (seções Bone).
import sys, json, random
from PIL import Image, ImageEnhance, ImageOps, ImageChops
orig, destino = sys.argv[1], sys.argv[2]
FOTOS = {
  # nome: (id, recorte x0,y0,x1,y1 em fração, proporção final, tratamento, larguras)
  'hero':        ('18999479', (0.27, 0.21, 1.00, 1.00), None,    'escuro', [700, 1400]),
  'onde-trava':  ('7433869',  (0.00, 0.00, 1.00, 1.00), (3, 2),  'claro',  [800, 1600]),
  'como':        ('5439478',  (0.00, 0.04, 1.00, 0.96), (16, 9), 'claro',  [900, 1800]),
  'icp-tec':     ('16323454', (0.00, 0.10, 1.00, 1.00), (16, 9), 'claro',  [800, 1600]),
  'agendar':     ('5668492',  (0.02, 0.00, 0.62, 1.00), (4, 5),  'escuro', [600, 1200]),
}
def recortar(im, caixa, prop):
    w, h = im.size
    x0, y0, x1, y1 = [int(v) for v in (caixa[0]*w, caixa[1]*h, caixa[2]*w, caixa[3]*h)]
    im = im.crop((x0, y0, x1, y1))
    if prop:
        a = prop[0] / prop[1]; w, h = im.size
        if w / h > a: nw = int(h * a); im = im.crop(((w - nw)//2, 0, (w - nw)//2 + nw, h))
        else: nh = int(w / a); im = im.crop((0, (h - nh)//2, w, (h - nh)//2 + nh))
    return im
def grao(im, forca):
    random.seed(7)
    ruido = Image.effect_noise(im.size, 48).point(lambda v: 128 + (v - 128) * forca)
    return ImageChops.add(im, ruido, scale=1.0, offset=-128)
meta = {}
for nome, (pid, caixa, prop, trat, larguras) in FOTOS.items():
    im = Image.open(f'{orig}/{pid}.jpg').convert('RGB')
    im = recortar(im, caixa, prop)
    if nome == 'hero': im = ImageOps.mirror(im)
    g = ImageOps.grayscale(im)
    if trat == 'escuro':
        g = ImageEnhance.Contrast(g).enhance(1.12); g = ImageEnhance.Brightness(g).enhance(0.78)
    else:
        g = ImageEnhance.Contrast(g).enhance(0.94); g = ImageEnhance.Brightness(g).enhance(1.02)
    for L in larguras:
        a = g.resize((L, round(L * g.height / g.width)), Image.LANCZOS)
        a = grao(a, 0.10 if L > 1000 else 0.07)
        if trat == 'claro':
            rgb = Image.merge('RGB', (a, a.point(lambda v: v * 0.985), a.point(lambda v: v * 0.95)))
        else:
            rgb = Image.merge('RGB', (a, a, a.point(lambda v: v * 1.0)))
        rgb.save(f'{destino}/{nome}-{L}.webp', 'WEBP', quality=74, method=6)
    meta[nome] = {'id': pid, 'larguras': larguras, 'proporcao': [g.width, g.height]}
print(json.dumps(meta, indent=1))
