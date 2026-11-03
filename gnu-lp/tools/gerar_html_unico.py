#!/usr/bin/env python3
"""Gera um HTML único, autocontido, para compartilhar a LP (anexo, e-mail, WhatsApp).

Uso:
  python3 tools/gerar_html_unico.py
  python3 tools/gerar_html_unico.py --saida ~/Desktop/gnu-lp.html

O arquivo leva o CSS, o JS e as imagens embutidos (data URI), com uma resolução por
imagem: 1440–1600 px nas fotos de largura total e até 960 px nas demais. Só as fontes
(Google Fonts) vêm da internet; offline, a página usa as fontes do sistema.
Rode de novo sempre que a página mudar.
"""
import argparse
import base64
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_OUT = os.path.join(ROOT, 'compartilhar', 'gnu-uniao-lp-verao.html')
MIME = {'.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml'}


def data_uri(rel):
    path = os.path.join(ROOT, rel)
    with open(path, 'rb') as fh:
        b64 = base64.b64encode(fh.read()).decode('ascii')
    return f'data:{MIME[os.path.splitext(rel)[1].lower()]};base64,{b64}'


def candidates(srcset):
    out = []
    for part in srcset.split(','):
        bits = part.strip().split()
        if not bits:
            continue
        desc = bits[1] if len(bits) > 1 else '1x'
        out.append((bits[0], float(desc[:-1]), desc[-1]))
    return out


def pick(srcset, sizes):
    cands = candidates(srcset)
    if all(kind == 'x' for _, _, kind in cands):
        return max(cands, key=lambda c: c[1])[0]  # 2x para logos e ícones nítidos
    full = sizes.strip().endswith('100vw') or sizes.strip() == '100vw'
    target = 1600 if full else 960
    fitting = [c for c in cands if c[1] <= target]
    return (max(fitting, key=lambda c: c[1]) if fitting else min(cands, key=lambda c: c[1]))[0]


def inline_tag(tag):
    def attr(name):
        m = re.search(r'\b' + name + r'="([^"]*)"', tag)
        return m.group(1) if m else None

    srcset, sizes, src = attr('srcset'), attr('sizes') or '', attr('src')
    chosen = pick(srcset, sizes) if srcset else src
    if not chosen or chosen.startswith('data:'):
        return tag
    uri = data_uri(chosen)
    tag = re.sub(r'\s+sizes="[^"]*"', '', tag)
    if tag.startswith('<source'):
        return re.sub(r'\bsrcset="[^"]*"', f'srcset="{uri}"', tag)
    tag = re.sub(r'\s+srcset="[^"]*"', '', tag)
    return re.sub(r'\bsrc="[^"]*"', f'src="{uri}"', tag)


def main():
    ap = argparse.ArgumentParser(description='Gera um HTML único da LP para compartilhar.')
    ap.add_argument('--saida', default=DEFAULT_OUT, help='arquivo de saída')
    args = ap.parse_args()

    with open(os.path.join(ROOT, 'index.html'), encoding='utf-8') as fh:
        doc = fh.read()
    with open(os.path.join(ROOT, 'assets', 'css', 'styles.css'), encoding='utf-8') as fh:
        css = fh.read()
    with open(os.path.join(ROOT, 'assets', 'js', 'main.js'), encoding='utf-8') as fh:
        js = fh.read()

    # CSS embutido; JS embutido no fim do body (equivale ao defer)
    doc = doc.replace('<link rel="stylesheet" href="assets/css/styles.css">', '<style>\n' + css + '\n</style>')
    doc = doc.replace('<script src="assets/js/main.js" defer></script>\n', '')
    doc = doc.replace('</body>', '<script>\n' + js.replace('</script', '<\\/script') + '\n</script>\n</body>')

    # Sem preload de imagem nem og:image relativos (não fazem sentido num arquivo solto)
    doc = re.sub(r'\s*<!-- Imagem LCP \(hero\) -->\s*<link rel="preload"[^>]*>', '', doc, flags=re.S)
    doc = re.sub(r'\s*<meta property="og:image(:width|:height)?"[^>]*>', '', doc)
    doc = re.sub(r'\s*"logo": "assets/[^"]*",', '', doc)
    doc = re.sub(r'<link rel="icon"([^>]*)href="([^"]+)"', lambda m: f'<link rel="icon"{m.group(1)}href="{data_uri(m.group(2))}"', doc)

    # Imagens: uma resolução por <img>/<source>, embutida
    doc = re.sub(r'<(?:img|source)\b[^>]*>', lambda m: inline_tag(m.group(0)), doc, flags=re.S)

    leftovers = sorted(set(re.findall(r'assets/[\w./-]+', doc)))
    if leftovers:
        raise SystemExit('Referências não embutidas: ' + ', '.join(leftovers))

    os.makedirs(os.path.dirname(os.path.abspath(args.saida)), exist_ok=True)
    with open(args.saida, 'w', encoding='utf-8') as fh:
        fh.write(doc)
    print(f'{args.saida} · {os.path.getsize(args.saida) / 1024 / 1024:.1f} MB')


if __name__ == '__main__':
    main()
