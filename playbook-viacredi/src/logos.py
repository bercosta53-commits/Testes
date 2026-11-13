import sys
from PIL import Image
import numpy as np
src = sys.argv[1]; out = sys.argv[2]
def c2a(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(float)
    d = 255 - a
    alpha = np.clip(d.max(axis=2) / 255.0 * 3.0, 0, 1)
    alpha = np.where(alpha < 0.08, 0, alpha)
    safe = np.where(alpha == 0, 1, alpha)
    rgb = 255 - d / safe[..., None]
    rgba = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    return im.crop(im.getbbox())
u = c2a(f'{src}/2.png'); u.save(f'{out}/logo-ubots.png')
a = np.asarray(u).copy()
r,g,b = a[...,0].astype(int), a[...,1].astype(int), a[...,2].astype(int)
dark = (np.maximum(np.maximum(r,g),b) - np.minimum(np.minimum(r,g),b) < 40) & (r < 120)
a[dark,0:3] = [255,253,249]
Image.fromarray(a,'RGBA').save(f'{out}/logo-ubots-dark.png')
v = c2a(f'{src}/3.png')
from PIL import ImageDraw
a = np.asarray(v).copy()
H, W = a.shape[:2]
mask = Image.fromarray(np.where(a[...,3] < 128, 255, 0).astype(np.uint8), 'L').copy()
for x in range(W):
    for y in (0, H-1):
        if mask.getpixel((x,y)) == 255: ImageDraw.floodfill(mask, (x,y), 100)
for y in range(H):
    for x in (0, W-1):
        if mask.getpixel((x,y)) == 255: ImageDraw.floodfill(mask, (x,y), 100)
m = np.asarray(mask) == 255
m[:, int(W*0.255):] = False
a[m] = [255,255,255,255]
v = Image.fromarray(a,'RGBA'); v.save(f'{out}/logo-viacredi.png')
a = np.asarray(v).copy(); w = a.shape[1]
# texto (VIACREDI / COOPERATIVA AILOS) fica a direita do simbolo
x0 = int(w * 0.255)
a[:, x0:, 0:3] = [255,253,249]
Image.fromarray(a,'RGBA').save(f'{out}/logo-viacredi-dark.png')
print(u.size, v.size)
