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
ONSET = {'whoosh': .45, 'tap': .034, 'pop': 0, 'knock': .17, 'swell': .31, 'slide': .16, 'chime': 0, 'type': 0, 'page': .23}
FILE = {'whoosh': 'whoosh_b', 'tap': 'tap_a', 'pop': 'pop_b', 'knock': 'knock_b', 'swell': 'swell_b',
        'slide': 'slide_a', 'chime': 'chime_b', 'type': 'type_a', 'page': 'page_b'}

W = [c['words'] for c in TL['chunks']]          # W[bloco][palavra] = tempo no vídeo
wt = lambda k, j: W[k][j]
S = {'s2': 4.0, 's3': wt(3, 0) - 0.3, 's4': wt(5, 0) - 0.1, 's5': wt(7, 0) - 0.12, 's6': wt(8, 3) - 0.35, 's7': wt(10, 0) - 0.2}  # = scenes.js

K5 = min(1, (S['s6'] - S['s5']) / 3.9)   # conversa escala com a duração real da cena

# regras caindo sobre o agente (mesma fórmula de scenes.js)
t0, t1, NR = wt(2, 2), wt(2, 9), 8
RULES = [t0 + (t1 - t0) * (i / (NR - 1)) for i in range(NR)]

CUES = [
    (0.25, 'slide', -12),                 # fila de pré-aprovados entra
    (wt(0, 1), 'tap', -4),                # moldura escolhe a Ana
    (wt(1, 1) + 0.1, 'whoosh', -7),       # disparo
    (wt(1, 1) + 0.4, 'pop', -9),          # notificação do Carlos
    (wt(1, 1) + 0.54, 'pop', -9),         # da Juliana
    (wt(1, 1) + 0.68, 'pop', -5),         # da Ana (na frente)
    (S['s2'] + 0.05, 'pop', -9),          # agente aparece
    *[(t, 'slide', -14) for t in RULES[:5]],          # regras do ebook caem (só as 5 primeiras com som)
    (wt(2, 10), 'knock', -4),             # "robô": trava
    (S['s3'] - 0.25, 'swell', -5),        # forma da marca cobre o quadro
    *[(wt(4, 0) + i * 0.11 + 0.16, 'whoosh', -20) for i in range(5)],  # regras riscadas saem do editor
    (wt(4, 3), 'slide', -9),              # bloco de contexto cresce
    (wt(4, 4), 'tap', -9),                # "contexto." grifado
    (S['s4'] + 0.05, 'slide', -9),        # janela do Agent Builder
    (wt(5, 3), 'type', -16),              # digita "Papel do agente"
    *[x for i in range(4) for x in ((wt(6, i) + 0.02, 'slide', -15), (wt(6, i) + 0.12, 'type', -19))],
    (min(wt(6, 3) + 0.5, S['s5'] - 0.45), 'chime', -11),  # papel salvo
    (S['s5'] + 0.05, 'pop', -7),          # bolha da Ana
    (S['s5'] + 0.65 * K5, 'tap', -12),         # etiqueta salta da bolha
    (S['s5'] + 1.35 * K5, 'tap', -10),         # etiqueta encaixa no cartão da Ana
    (S['s5'] + 1.62 * K5, 'pop', -7),          # oferta personalizada
    (S['s5'] + 3.02 * K5, 'pop', -7),          # "Quero!"
    (S['s5'] + 3.38 * K5, 'chime', -5),        # crédito contratado
    (S['s6'], 'whoosh', -11),             # corte para o número
    (wt(8, 7) + 0.35, 'slide', -13),      # contagem fecha: marca-texto entra
    (wt(9, 0), 'pop', -9),                # "Ainda na fase de testes"
    (S['s7'] + 0.05, 'page', -6),         # capa do playbook
    (wt(10, 4) - 0.1, 'tap', -8),         # "Playbook Ubots · Agentes de IA"
    (wt(11, 1) + 0.78 - 0.75, 'pop', -9),  # botão aparece
    (wt(11, 1) + 0.78, 'tap', 0),          # clique em "Baixe grátis" (depois da fala, em espaço limpo)
    (wt(11, 1) + 0.78 + 0.12, 'chime', -4),  # sucesso: a seta vira ✓
]


def load(path, extra=None):
    """Decodifica para float32 estéreo 48 kHz (com filtros opcionais)."""
    cmd = ['ffmpeg', '-v', 'error', *(extra or []), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def save(path, x):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', path],
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
            # o "toque" gerado tem 8 batidas seguidas (soava como martelo): usa só a primeira
            trim = ['-ss', '0.10', '-to', '0.33'] if s == 'tap' else []
            cache[n] = load(None, [*trim, '-i', os.path.join(src, 'sfx', n + '.mp3'), '-af', 'afade=t=out:st=0.17:d=0.06' if trim else 'anull'])
        place(fx, cache[n], t - ONSET[s], gdb)
    # 3) trilha deslocada para a volta cheia cair no "Na Viacredi"; +2 compassos no fim para cobrir os 32 s
    # menos grave (o bumbo four-on-the-floor martelava sob a voz); a intro abafada perde ainda mais grave
    mpath = os.path.join(src, TL['music']['file'])
    m = load(None, ['-i', mpath, '-af', 'highpass=f=45,lowshelf=f=130:g=-5']) * (10 ** (-8 / 20))
    mi = load(None, ['-i', mpath, '-af', 'highpass=f=45,lowshelf=f=150:g=-11']) * (10 ** (-8 / 20))
    k0, k1 = int(6.9 * SR), int(7.35 * SR)                  # volta cheia da trilha em 7,35 s
    w = np.zeros(len(m), np.float32); w[:k0] = 1; w[k0:k1] = np.linspace(1, 0, k1 - k0)
    m = mi * w[:, None] + m * (1 - w[:, None])
    bar2 = int(round(8 * 60 / 123 * SR))           # 2 compassos a 123 BPM
    cut = int(28.55 * SR); xf = int(0.03 * SR)
    tail = m[cut - bar2 - xf:cut].copy()           # repete os 2 compassos anteriores ao corte
    tail[:xf] *= np.linspace(0, 1, xf)[:, None]
    head = m[:cut].copy(); head[-xf:] *= np.linspace(1, 0, xf)[:, None]
    m = np.concatenate([head[:-xf], head[-xf:] + tail[:xf], tail[xf:]])
    mus = np.zeros((N, 2), np.float32)
    place(mus, m, TL['music']['at'])
    fo = int(1.2 * SR); mus[-fo:] *= np.linspace(1, 0, fo)[:, None]
    tmp = os.path.join(HERE, '.tmp'); os.makedirs(tmp, exist_ok=True)
    for name, arr in (('vo', vo), ('fx', fx), ('mus', mus)):
        save(os.path.join(tmp, name + '.wav'), arr)
    # 4) trilha abaixa sob a voz com ducking suave; ganho fixo para -14 LUFS + limitador em -1,5 dBFS
    pre = os.path.join(tmp, 'premix.wav')
    graph = ('[0:a]highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2dB,asplit[vo][key];'
             '[1:a][key]sidechaincompress=threshold=0.04:ratio=3:attack=40:release=600:makeup=1[mus];'
             '[vo][mus][2:a]amix=inputs=3:normalize=0:duration=first[out]')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(tmp, 'vo.wav'), '-i', os.path.join(tmp, 'mus.wav'),
                    '-i', os.path.join(tmp, 'fx.wav'), '-filter_complex', graph, '-map', '[out]', '-c:a', 'pcm_f32le', pre], check=True)
    meas = subprocess.run(['ffmpeg', '-v', 'info', '-i', pre, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float([l for l in meas.splitlines() if l.strip().startswith('I:')][-1].split()[1])
    gain = -14.0 - I
    out = os.path.join(HERE, 'mix.wav')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', pre, '-af',
                    f'volume={gain:.2f}dB,alimiter=limit=0.84:attack=5:release=60:level=disabled',
                    '-c:a', 'pcm_s24le', '-ar', str(SR), out], check=True)
    print(f'loudness antes {I:.1f} LUFS, ganho {gain:+.1f} dB')
    print(out)


if __name__ == '__main__':
    run()
