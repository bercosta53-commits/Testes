"""Mixagem do V1 (v2 do áudio): locução acelerada com respiros + trilha 123 BPM com ducking + efeitos.

Fontes geradas no ElevenLabs (flow "Viacredi V1 · locução, trilha e efeitos"):
  src/vo2_mateus_a.mp3  locução, voz Mateus, eleven_v4, [upbeat] [confident]
  src/sig_a.mp3         assinatura "O método está no Playbook Ubots Agentes de IA. Baixe grátis."
  src/music2_b.mp3      trilha, eleven_music_v2_5, ~123 BPM, instrumental
  src/sfx/*.mp3         efeitos orgânicos, eleven_text_to_sound_v2
A linha do tempo (blocos, velocidade, respiros, palavras) vem de timeline.json (build_timeline.py).

Uso: python3 build_timeline.py && python3 mix.py  ->  mix.wav (48 kHz estéreo, -14 LUFS, pico -1 dBTP)
"""
import json, os, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
DUR = TL['dur']
SR = 48000

# Onde o som "acontece" dentro do arquivo (ataque), para alinhar o ataque ao evento visual.
ONSET = {'whoosh': .45, 'tap': .13, 'pop': 0, 'knock': .17, 'swell': .31, 'slide': .16, 'chime': 0, 'type': 0, 'page': .23}
FILE = {'whoosh': 'whoosh_b', 'tap': 'tap_a', 'pop': 'pop_b', 'knock': 'knock_b', 'swell': 'swell_b',
        'slide': 'slide_a', 'chime': 'chime_b', 'type': 'type_a', 'page': 'page_b'}

W = [c['words'] for c in TL['chunks']]          # W[bloco][palavra] = tempo no vídeo
wt = lambda k, j: W[k][j]
S = {'s2': 3.95, 's3': 7.3, 's4': 11.1, 's5': 16.1, 's6': 19.6, 's7': 24.95}   # cortes (iguais a scenes.js)

# regras caindo sobre o agente (mesma fórmula de scenes.js)
t0, t1, NR = wt(2, 2), wt(2, 9), 14
RULES = [t0 + (t1 - t0) * (i / (NR - 1)) ** 0.8 for i in range(NR)]

CUES = [
    (0.10, 'slide', -12),                 # fila de pré-aprovados entra
    (wt(0, 1), 'tap', -4),                # moldura escolhe a Ana
    (wt(1, 1) + 0.1, 'whoosh', -7),       # disparo
    (wt(1, 1) + 0.6, 'pop', -5),          # "Enviada para a Ana"
    (S['s2'] + 0.05, 'pop', -9),          # agente aparece
    *[(t, 'slide', -13) for t in RULES[:5]],          # regras do ebook caem
    *[(t, 'tap', -17) for t in RULES[5:]],            # e continuam se acumulando
    (wt(2, 10), 'knock', -4),             # "robô": trava
    (S['s3'] - 0.2, 'swell', -5),         # forma da marca cobre o quadro
    (wt(4, 3) + 0.05, 'slide', -9),       # pílula amarela cresce
    (wt(4, 4), 'tap', -9),                # "contexto."
    (S['s4'] + 0.05, 'slide', -9),        # janela do Agent Builder
    (wt(5, 3), 'type', -16),              # digita "Papel do agente"
    *[x for i in range(4) for x in ((wt(6, i) + 0.02, 'slide', -15), (wt(6, i) + 0.12, 'type', -19))],
    (wt(6, 3) + 0.45, 'chime', -11),      # papel salvo
    (S['s5'] + 0.05, 'pop', -7),          # bolha da Ana
    (S['s5'] + 0.55, 'tap', -12),         # etiqueta salta da bolha
    (S['s5'] + 1.25, 'tap', -10),         # etiqueta encaixa no cartão da Ana
    (S['s5'] + 1.30, 'pop', -7),          # oferta personalizada
    (S['s5'] + 2.64, 'pop', -7),          # "Quero!"
    (S['s5'] + 3.00, 'chime', -5),        # crédito contratado
    (S['s6'], 'whoosh', -11),             # corte para o número
    (wt(8, 3) + 0.12, 'slide', -15),      # sublinhado
    (wt(9, 0), 'pop', -9),                # "Ainda na fase de testes"
    (S['s7'] + 0.05, 'page', -6),         # capa do playbook
    (wt(10, 4) - 0.1, 'tap', -8),         # "Playbook Ubots · Agentes de IA"
    (wt(11, 0) - 0.6, 'pop', -9),         # botão aparece
    (wt(11, 0), 'tap', -4),               # clique em "Baixe grátis"
]


def load(path, extra=None):
    """Decodifica para float32 estéreo 48 kHz (com filtros opcionais)."""
    cmd = ['ffmpeg', '-v', 'error', *(extra or []), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def save(path, x):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', path],
                   input=x.astype(np.float32).tobytes(), check=True)


def place(bed, clip, t, gain_db=0.0):
    i = int(round(t * SR))
    if i < 0:
        clip, i = clip[-i:], 0
    n = min(len(clip), len(bed) - i)
    if n > 0:
        bed[i:i + n] += clip[:n] * (10 ** (gain_db / 20))


def run():
    src = os.path.join(HERE, 'src')
    N = int(DUR * SR)
    # 1) locução: cada bloco acelerado (atempo preserva o tom) e posicionado com respiro
    vo = np.zeros((N, 2), np.float32)
    for g in TL['segments']:
        seg = load(None, ['-ss', str(g['src0']), '-to', str(g['src1']), '-i', os.path.join(src, g['file']), '-af', f"atempo={TL['tempo']}"])
        fi, fo = int(0.01 * SR), int(0.03 * SR)
        seg[:fi] *= np.linspace(0, 1, fi)[:, None]
        seg[-fo:] *= np.linspace(1, 0, fo)[:, None]
        place(vo, seg, g['at'])
    # 2) efeitos no quadro (ataque alinhado ao evento visual)
    fx = np.zeros((N, 2), np.float32)
    cache = {}
    for t, s, gdb in CUES:
        n = FILE[s]
        if n not in cache:
            cache[n] = load(None, ['-i', os.path.join(src, 'sfx', n + '.mp3')])
        place(fx, cache[n], t - ONSET[s], gdb)
    # 3) trilha deslocada para a volta cheia cair no "Na Viacredi"
    mus = np.zeros((N, 2), np.float32)
    place(mus, load(None, ['-i', os.path.join(src, TL['music']['file'])]), TL['music']['at'])
    fo = int(1.0 * SR); mus[-fo:] *= np.linspace(1, 0, fo)[:, None]
    tmp = os.path.join(HERE, '.tmp'); os.makedirs(tmp, exist_ok=True)
    for name, arr in (('vo', vo), ('fx', fx), ('mus', mus)):
        save(os.path.join(tmp, name + '.wav'), arr)
    # 4) trilha abaixa sob a voz (sidechain), soma tudo e normaliza para -14 LUFS
    out = os.path.join(HERE, 'mix.wav')
    graph = (f'[0:a]highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2dB,asplit[vo][key];'
             f'[1:a]volume=-6dB[m0];'
             f'[m0][key]sidechaincompress=threshold=0.025:ratio=5:attack=20:release=300:makeup=1[mus];'
             f'[vo][mus][2:a]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-14:TP=-1:LRA=9,aresample={SR}[out]')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(tmp, 'vo.wav'), '-i', os.path.join(tmp, 'mus.wav'),
                    '-i', os.path.join(tmp, 'fx.wav'), '-filter_complex', graph, '-map', '[out]', '-ar', str(SR), '-ac', '2', out], check=True)
    print(out)


if __name__ == '__main__':
    run()
