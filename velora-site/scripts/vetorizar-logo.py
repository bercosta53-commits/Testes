# Vetoriza o logo da Velora a partir do PNG oficial (versão escura, fundo transparente).
# Gera src/conteudo/logo-velora.mjs com o emblema (uma forma por listra, para animar), a palavra "velora",
# o ponto e a assinatura "Growth & Beyond".
# Uso: python scripts/vetorizar-logo.py <logo.png> src/conteudo/logo-velora.mjs   (requer numpy, Pillow e potracer)
# O PNG original fica fora do repositório.
import sys, json, re
import numpy as np
from PIL import Image
import potrace

origem, destino = sys.argv[1], sys.argv[2]
im = np.array(Image.open(origem).convert('RGBA')).astype(int)
R, G, B, A = im[..., 0], im[..., 1], im[..., 2], im[..., 3]
ponto = (A > 128) & (G > 200) & (B < 120) & (R > 150)
forma = (A > 128) & ~ponto
H, W = forma.shape

PAD = 12  # o potrace perde componentes encostados na borda da imagem
inteiro = lambda v: str(round(v))


def tracar(mask):
    curvas = []
    for curva in potrace.Bitmap(np.pad(mask, PAD)).trace(turdsize=4, alphamax=1.0, opticurve=True, opttolerance=0.2):
        p = lambda q: inteiro(q.x - PAD) + ' ' + inteiro(q.y - PAD)
        d, xs, ys = 'M' + p(curva.start_point), [curva.start_point.x - PAD], [curva.start_point.y - PAD]
        for s in curva.segments:
            if s.is_corner:
                d += 'L' + p(s.c) + 'L' + p(s.end_point)
            else:
                d += 'C' + p(s.c1) + ' ' + p(s.c2) + ' ' + p(s.end_point)
            xs.append(s.end_point.x - PAD); ys.append(s.end_point.y - PAD)
        curvas.append({'d': d + 'Z', 'x0': min(xs), 'x1': max(xs), 'y0': min(ys), 'y1': max(ys)})
    return [c for c in curvas if c['x0'] > -1]


curvas = tracar(forma)
emblema = sorted([c for c in curvas if c['x1'] < W * 0.3], key=lambda c: c['y0'])
palavra = [c for c in curvas if c['x0'] >= W * 0.3 and c['y0'] <= H * 0.8]
assinatura = [c for c in curvas if c['x0'] >= W * 0.3 and c['y0'] > H * 0.8]
yy, xx = np.nonzero(ponto)
cor = lambda m: '#%02X%02X%02X' % tuple(int(v) for v in np.median(im[m][:, :3], axis=0))
dados = {
    'largura': W, 'altura': H,
    'cor': cor(forma), 'corPonto': cor(ponto),
    'emblema': [c['d'] for c in emblema],
    'palavra': ''.join(c['d'] for c in palavra),
    'assinatura': ''.join(c['d'] for c in assinatura),
    'ponto': {'cx': round(float(xx.mean())), 'cy': round(float(yy.mean())), 'r': round(float(np.sqrt(ponto.sum() / np.pi)))},
}
with open(destino, 'w') as f:
    f.write('// Gerado por scripts/vetorizar-logo.py a partir do logo oficial da Velora (PNG, 04/11/2026). Não editar à mão.\n')
    f.write('export const LOGO = ' + json.dumps(dados, ensure_ascii=False, indent=1) + ';\n')
print(f'{len(emblema)} listras, palavra com {len(palavra)} contornos, assinatura com {len(assinatura)}; ponto {dados["ponto"]}; cores {dados["cor"]} {dados["corPonto"]}')
