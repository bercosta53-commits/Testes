# Tratamento das fotos do site (briefing de design §8): P&B, contraste suave.
# escuro: um pouco mais escuro (seções Ink e a foto do formulário). claro: tom levemente quente (seções Bone).
# Uso: python scripts/tratar-fotos.py <pasta-com-os-originais> src/assets/img   (requer Pillow)
# Originais (fornecidos pela Velora em 01/11/2026) ficam fora do repositório.
import sys
from PIL import Image, ImageEnhance, ImageOps

orig, destino = sys.argv[1], sys.argv[2]

ORIGINAIS = {
    'oculos': 'oculos.jpg',      # mulher de blazer segurando os óculos
    'conversa': 'conversa.jpg',  # conversa vista de cima, notebook e cafés
    'mesa': 'mesa.jpg',          # três pessoas analisando papéis numa mesa de concreto
    'notebook': 'notebook.jpg',  # homem com notebook conversando com o time
    'feixe': 'feixe.jpg',        # feixe de luz em vão de concreto (tem moldura branca)
}

# nome do arquivo final: (original, recorte x0,y0,x1,y1 em fração, proporção final ou None, tratamento, larguras)
FOTOS = {
    'hero':       ('oculos',   (0.00, 0.00, 1.00, 1.00),     None,    'escuro', [700, 1400]),
    'onde-trava': ('mesa',     (0.00, 0.00, 1.00, 1.00),     (3, 2),  'claro',  [800, 1600]),
    'como':       ('conversa', (0.00, 0.15, 1.00, 0.715),    (16, 9), 'escuro', [900, 1800]),
    'icp-tec':    ('notebook', (0.00, 0.10, 1.00, 0.72),     (3, 2),  'claro',  [800, 1600]),
    'agendar':    ('feixe',    (0.025, 0.020, 0.975, 0.982), None,    'escuro', [700, 1400]),
}


def recortar(im, caixa, prop):
    w, h = im.size
    im = im.crop((round(caixa[0] * w), round(caixa[1] * h), round(caixa[2] * w), round(caixa[3] * h)))
    if prop:
        a = prop[0] / prop[1]
        w, h = im.size
        if w / h > a:
            nw = round(h * a); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = round(w / a); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return im


for nome, (fonte, caixa, prop, trat, larguras) in FOTOS.items():
    im = Image.open(f'{orig}/{ORIGINAIS[fonte]}').convert('RGB')
    g = ImageOps.grayscale(recortar(im, caixa, prop))
    if trat == 'escuro':
        g = ImageEnhance.Brightness(ImageEnhance.Contrast(g).enhance(1.06)).enhance(0.84)
    else:
        g = ImageEnhance.Brightness(ImageEnhance.Contrast(g).enhance(0.96)).enhance(1.02)
    for L in larguras:
        a = g.resize((L, round(L * g.height / g.width)), Image.LANCZOS)
        if trat == 'claro':
            rgb = Image.merge('RGB', (a, a.point(lambda v: v * 0.985), a.point(lambda v: v * 0.95)))
        else:
            rgb = Image.merge('RGB', (a, a, a))
        rgb.save(f'{destino}/{nome}-{L}.webp', 'WEBP', quality=72, method=6)
    print(nome, fonte, g.size)
