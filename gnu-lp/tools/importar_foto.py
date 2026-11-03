#!/usr/bin/env python3
"""Coloca uma foto (gerada ou nova) num espaço da LP com um comando.

Uso:
  python3 tools/importar_foto.py --listar
  python3 tools/importar_foto.py F05 ~/Downloads/alto-petropolis.png
  python3 tools/importar_foto.py F03 beach-tennis.png --alt "Dupla joga beach tennis..." --foco 0.5,0.4
  python3 tools/importar_foto.py F01 hero.png --simular

O que faz:
  1. Recorta na proporção do espaço, quando ele exige uma (com ponto de foco opcional).
  2. Exporta os WebP nas larguras usadas pelo site, sem nunca ampliar a imagem.
  3. Atualiza o index.html: src, srcset, preload, width/height e o texto alternativo.
  4. Apaga as variantes antigas daquele espaço.

Requer Pillow: pip install pillow
"""
import argparse
import html as htmllib
import os
import re
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('Instale o Pillow primeiro: pip install pillow')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, 'assets', 'img')
HTML_PATH = os.path.join(ROOT, 'index.html')

# Espaço -> saídas (arquivo-base, larguras, proporção exigida ou None) + alt padrão
# O alt padrão descreve a cena do prompt sugerido em PROMPTS-FOTOGRAFIA.md.
SLOTS = {
    'F01': {
        'nome': 'Hero · piscina Alto Petrópolis',
        'saidas': [('hero-piscina-alto-petropolis', [640, 960, 1440, 2048], None)],
        'alt': 'Fim de tarde na piscina da sede Alto Petrópolis: famílias na borda, amigos nas espreguiçadeiras e a cidade ao fundo, além das árvores.',
    },
    'F02': {
        'nome': 'Bloco 02 · Verão em família (faixa larga)',
        'saidas': [('vida-familia-piscina', [640, 1024, 1600], None)],
        'alt': 'Pai brinca com os filhos na parte rasa da piscina do clube enquanto a mãe observa sentada na borda.',
    },
    'F03': {
        'nome': 'Bloco 02 · Tênis/beach tennis entre amigos (retrato)',
        'saidas': [('vida-tenis-petropole', [400, 560, 800], (4, 5))],
        'alt': 'Dois casais jogam tênis em quadra de saibro da sede União Petrópole, rindo entre um ponto e outro.',
    },
    'F04': {
        'nome': 'Bloco 02 · Mais tempo juntos (retrato)',
        'saidas': [('vida-convivencia', [480, 800], (4, 5))],
        'alt': 'Amigos conversam nas espreguiçadeiras à sombra de uma árvore, ao lado da piscina do clube.',
    },
    'F05': {
        'nome': 'Bloco 03 · Sede Alto Petrópolis (faixa)',
        'saidas': [('sede-alto-petropolis', [640, 960, 1440, 2048], None)],
        'alt': 'Área verde da sede Alto Petrópolis: gazebo de madeira sobre o lago, pontes, árvores antigas e pessoas passeando.',
    },
    'F06': {
        'nome': 'Bloco 03 · Sede Moinhos de Vento (faixa)',
        'saidas': [('sede-moinhos-de-vento', [640, 960, 1440, 2048], None)],
        'alt': 'Piscina da sede Moinhos de Vento em tarde de verão, com crianças no tobogã e famílias ao redor, entre prédios do bairro.',
    },
    'F07': {
        'nome': 'Bloco 03 · Sede União Petrópole (faixa)',
        'saidas': [('sede-uniao-petropole', [640, 960, 1440, 2048], None)],
        'alt': 'Quadras de saibro da sede União Petrópole com partidas em andamento e pessoas descansando à beira das quadras.',
    },
    'F08': {
        'nome': 'Bloco 03 · Sede Ilha do Pavão (faixa)',
        'saidas': [('sede-ilha-do-pavao', [640, 960, 1440, 2048], None)],
        'alt': 'Vista aérea da Ilha do Pavão no Guaíba ao entardecer: sede náutica, trapiche com barcos e mata nativa.',
    },
    'F09': {
        'nome': 'Bloco 04 · Novas histórias para contar em família (retrato)',
        'saidas': [('encontro-geracoes', [400, 560, 800], (4, 5))],
        'alt': 'Senhor ajoelhado na quadra de saibro ensina um menino a segurar a raquete, ao lado de um cesto de bolinhas.',
    },
    'F10': {
        'nome': 'Bloco 04 · Uma tarde inteira para estar junto (retrato)',
        'saidas': [('encontro-piscina-moinhos', [400, 560, 800], (4, 5))],
        'alt': 'Família passa a tarde sobre esteiras no gramado ao lado da piscina, com crianças voltando enroladas em toalhas.',
    },
    'F11': {
        'nome': 'Bloco 04 · Depois do jogo, a conversa continua (horizontal)',
        'saidas': [('encontro-espaco-cooks', [640, 960, 1440], (16, 9))],
        'alt': 'Amigos conversam em volta de uma mesa do clube depois do tênis, com raquetes apoiadas nas cadeiras.',
    },
    'F12': {
        'nome': 'Bloco 05 · História (3:2)',
        'saidas': [('historia-ilha-do-pavao', [560, 800, 1200], (3, 2))],
        'alt': 'Remadores carregam um barco pelo trapiche da sede náutica da Ilha do Pavão, de manhã cedo, às margens do Guaíba.',
    },
    'F13': {
        'nome': 'Bloco 06 · Associação (retrato)',
        'saidas': [('associacao-area-verde', [400, 560, 800], (4, 5))],
        'alt': 'Canto tranquilo à sombra junto ao lago da sede Alto Petrópolis, com o gazebo e pessoas ao fundo.',
    },
    'F14': {
        'nome': 'Bloco 07 · Fechamento (faixa + recorte do celular)',
        'saidas': [
            ('fechamento-guaiba', [640, 960, 1440, 2048], None),
            ('fechamento-guaiba-mobile', [800], (16, 9)),
        ],
        'alt': 'Amigos reunidos no trapiche da Ilha do Pavão ao pôr do sol, com o Guaíba dourado e um barco a remo ao fundo.',
    },
    # Detalhes decorativos: alt vazio de propósito (leitor de tela pula)
    'X5': {
        'nome': 'Bloco 06 · Detalhe sobreposto à foto da associação (desktop)',
        'saidas': [('associacao-detalhe', [280, 400, 560], (4, 5))],
        'alt': '',
    },
    'X7': {
        'nome': 'Bloco 02 · Detalhe sob o texto (desktop)',
        'saidas': [('vida-detalhe-borda', [400, 560, 800], (1, 1))],
        'alt': '',
    },
}


def crop_to(im, aspect, focus):
    if not aspect:
        return im
    aw, ah = aspect
    w, h = im.size
    target = aw / ah
    fx, fy = focus
    if w / h > target:  # larga demais: corta nas laterais
        nw = round(h * target)
        left = min(max(round(fx * w - nw / 2), 0), w - nw)
        return im.crop((left, 0, left + nw, h))
    nh = round(w / target)  # alta demais: corta em cima e embaixo
    top = min(max(round(fy * h - nh / 2), 0), h - nh)
    return im.crop((0, top, w, top + nh))


def export(im, base, widths, dry):
    files = []
    usable = [w for w in widths if w <= im.width]
    if not usable or (im.width > usable[-1] and len(usable) < len(widths)):
        usable.append(im.width)  # aproveita a resolução total sem ampliar
    for w in usable:
        h = round(im.height * w / im.width)
        name = f'{base}-{w}.webp'
        if not dry:
            im.resize((w, h), Image.LANCZOS).save(os.path.join(IMG_DIR, name), 'WEBP', quality=82, method=6)
        files.append((w, h, name))
    skipped = [w for w in widths if w > im.width]
    if skipped:
        print(f'  ! {base}: imagem com {im.width}px; larguras {skipped} omitidas (gere em 2K/4K para telas grandes).')
    return files


def rewrite_html(doc, base, files, alt):
    w_max, h_max, largest = files[-1]
    file_re = re.compile(r'assets/img/' + re.escape(base) + r'-\d+\.webp')

    def fix_srcset(m):
        attr, val = m.group(1), m.group(2)
        if not file_re.search(val):
            return m.group(0)
        if re.search(r'\s\d+w\b', val):
            new = ', '.join(f'assets/img/{name} {w}w' for w, _, name in files)
        else:
            new = f'assets/img/{largest}'
        return f'{attr}="{new}"'

    doc = re.sub(r'\b(srcset|imagesrcset)="([^"]*)"', fix_srcset, doc)
    doc = re.sub(r'\b(src|href)="assets/img/' + re.escape(base) + r'-\d+\.webp"',
                 lambda m: f'{m.group(1)}="assets/img/{largest}"', doc)

    def fix_tag(m):
        tag = m.group(0)
        if f'assets/img/{largest}' not in tag:
            return tag
        tag = re.sub(r'\bwidth="\d+"', f'width="{w_max}"', tag)
        tag = re.sub(r'\bheight="\d+"', f'height="{h_max}"', tag)
        if alt is not None and tag.startswith('<img'):
            tag = re.sub(r'\balt="[^"]*"', 'alt="' + htmllib.escape(alt, quote=True) + '"', tag)
        return tag

    return re.sub(r'<(?:img|source)\b[^>]*>', fix_tag, doc, flags=re.S)


def main():
    ap = argparse.ArgumentParser(description='Coloca uma foto num espaço (F01–F14) da LP.')
    ap.add_argument('espaco', nargs='?', help='ID do espaço, por exemplo F05')
    ap.add_argument('imagem', nargs='?', help='arquivo da imagem (PNG, JPG ou WebP)')
    ap.add_argument('--alt', help='texto alternativo; sem ele, usa o alt padrão do prompt sugerido')
    ap.add_argument('--foco', default='0.5,0.5', help='ponto de foco x,y entre 0 e 1 para recortes (padrão 0.5,0.5)')
    ap.add_argument('--simular', action='store_true', help='mostra o que faria, sem gravar nada')
    ap.add_argument('--listar', action='store_true', help='lista os espaços disponíveis')
    args = ap.parse_args()

    if args.listar or not args.espaco:
        for key, slot in SLOTS.items():
            outs = ', '.join(f"{b} ({'%d:%d' % a if a else 'proporção livre'})" for b, _, a in slot['saidas'])
            print(f'{key}  {slot["nome"]}\n      {outs}')
        return

    key = args.espaco.upper()
    if key not in SLOTS:
        sys.exit(f'Espaço {key} não existe. Use --listar.')
    if not args.imagem or not os.path.isfile(args.imagem):
        sys.exit('Informe o arquivo da imagem.')
    try:
        focus = tuple(float(v) for v in args.foco.split(','))
        assert len(focus) == 2 and all(0 <= v <= 1 for v in focus)
    except (ValueError, AssertionError):
        sys.exit('--foco precisa ser x,y entre 0 e 1, por exemplo 0.5,0.4')

    slot = SLOTS[key]
    src = ImageOps.exif_transpose(Image.open(args.imagem)).convert('RGB')
    print(f'{key} · {slot["nome"]} ← {os.path.basename(args.imagem)} ({src.width}×{src.height})')

    with open(HTML_PATH, encoding='utf-8') as fh:
        doc = fh.read()
    alt = args.alt if args.alt is not None else slot['alt']
    if args.alt is None:
        print('  alt padrão aplicado; se a imagem não for a cena do prompt sugerido, rode de novo com --alt "...".')

    for i, (base, widths, aspect) in enumerate(slot['saidas']):
        im = crop_to(src, aspect, focus)
        files = export(im, base, widths, args.simular)
        doc = rewrite_html(doc, base, files, alt if i == 0 else None)
        keep = {name for _, _, name in files}
        for old in sorted(os.listdir(IMG_DIR)):
            if re.fullmatch(re.escape(base) + r'-\d+\.webp', old) and old not in keep:
                print(f'  - remove {old}')
                if not args.simular:
                    os.remove(os.path.join(IMG_DIR, old))
        for w, h, name in files:
            print(f'  + {name} ({w}×{h})')

    if key == 'F01':
        w, h = src.size
        ch = min(h, round(w * 630 / 1200))
        top = min(max(round(focus[1] * h - ch / 2), 0), h - ch)
        og = src.crop((0, top, w, top + ch)).resize((1200, 630), Image.LANCZOS)
        if not args.simular:
            og.save(os.path.join(IMG_DIR, 'og-uniao-verao.jpg'), quality=84)
        print('  + og-uniao-verao.jpg (1200×630)')

    if args.simular:
        print('Simulação: nada foi gravado.')
        return
    with open(HTML_PATH, 'w', encoding='utf-8') as fh:
        fh.write(doc)
    print('index.html atualizado.')


if __name__ == '__main__':
    main()
