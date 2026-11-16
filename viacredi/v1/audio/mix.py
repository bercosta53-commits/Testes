"""Mixagem do V1: locução (com respiros) + trilha com ducking + efeitos sonoros no quadro.

Fontes geradas no ElevenLabs (flow "Viacredi V1 · locução, trilha e efeitos"):
  src/vo_take1.mp3   locução, voz Mateus, eleven_v4
  src/music_b.mp3    trilha, eleven_music_v2_5, 33 s instrumental
  src/sfx/*.mp3      efeitos, eleven_text_to_sound_v2

Uso: python3 mix.py  ->  mix.wav (48 kHz estéreo, -14 LUFS, pico -1 dBTP)
"""
import json, os, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DUR = 32.0
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
SEG = TL['segments']  # [origem_ini, origem_fim, posição no vídeo]

# Onde o som "acontece" dentro do arquivo (ataque), para alinhar o ataque ao evento visual.
ONSET = {'whoosh': .45, 'tap': .13, 'pop': 0, 'knock': .17, 'swell': .31, 'slide': .16, 'chime': 0, 'type': 0, 'page': .23}
FILE = {'whoosh': 'whoosh_b', 'tap': 'tap_a', 'pop': 'pop_b', 'knock': 'knock_b', 'swell': 'swell_b',
        'slide': 'slide_a', 'chime': 'chime_b', 'type': 'type_a', 'page': 'page_b'}

# (tempo no vídeo, som, ganho dB) — cada um ligado a um evento visual das cenas
CUES = [
    (0.15, 'slide', -12),   # fila de tickets entra
    (0.94, 'tap', -4),      # moldura seleciona a Ana
    (2.80, 'whoosh', -7),   # disparo
    (3.42, 'pop', -5),      # "Enviada para a Ana"
    (4.70, 'type', -20),    # bot "digitando…"
    (6.46, 'knock', -5),    # "Não entendi."
    (8.92, 'knock', -11),   # eco do loop
    (9.12, 'swell', -5),    # forma da marca cobre o quadro
    (12.43, 'slide', -9),   # pílula amarela cresce
    (12.57, 'tap', -9),     # "contexto."
    (14.00, 'slide', -9),   # janela do Agent Builder
    (15.05, 'type', -16),   # digita "Papel do agente"
    (16.45, 'slide', -15), (16.57, 'type', -19),  # objetivo
    (17.21, 'slide', -15), (17.33, 'type', -19),  # público
    (17.93, 'slide', -15), (18.05, 'type', -19),  # oferta
    (18.77, 'slide', -15), (18.89, 'type', -19),  # tom
    (19.20, 'chime', -11),  # papel salvo
    (19.50, 'pop', -7),     # bolha da Ana
    (20.35, 'whoosh', -17), # etiqueta "reforma da cozinha" voa
    (20.85, 'tap', -10),    # etiqueta encaixa no cartão da Ana
    (20.95, 'pop', -7),     # oferta personalizada
    (22.25, 'pop', -7),     # "Quero!"
    (22.70, 'chime', -5),   # crédito contratado
    (23.30, 'whoosh', -11), # corte para o número
    (23.94, 'slide', -15),  # sublinhado
    (26.34, 'pop', -9),     # "Ainda na fase de testes"
    (28.45, 'page', -6),    # capa do playbook
    (30.26, 'tap', -4),     # clique no botão
]


SR = 48000


def load(path):
    """Decodifica para float32 estéreo 48 kHz."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
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
    # 1) locução em blocos, com respiros (fades de 20/40 ms nas emendas)
    vo_src = load(os.path.join(src, 'vo_take1.mp3'))
    vo = np.zeros((N, 2), np.float32)
    for a, b, p in SEG:
        seg = vo_src[int(a * SR):int(b * SR)].copy()
        fi, fo = int(0.02 * SR), int(0.04 * SR)
        seg[:fi] *= np.linspace(0, 1, fi)[:, None]
        seg[-fo:] *= np.linspace(1, 0, fo)[:, None]
        place(vo, seg, p)
    # 2) efeitos no quadro (ataque alinhado ao evento visual)
    fx = np.zeros((N, 2), np.float32)
    cache = {}
    for t, s, g in CUES:
        n = FILE[s]
        if n not in cache:
            cache[n] = load(os.path.join(src, 'sfx', n + '.mp3'))
        place(fx, cache[n], t - ONSET[s], g)
    tmp = os.path.join(HERE, '.tmp'); os.makedirs(tmp, exist_ok=True)
    save(os.path.join(tmp, 'vo.wav'), vo)
    save(os.path.join(tmp, 'fx.wav'), fx)
    # 3) trilha abaixa sob a voz (sidechain), soma tudo e normaliza para -14 LUFS
    out = os.path.join(HERE, 'mix.wav')
    graph = (f'[0:a]highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2dB,asplit[vo][key];'
             f'[1:a]aformat=sample_rates={SR}:channel_layouts=stereo,volume=-6dB,atrim=0:{DUR},afade=t=out:st={DUR - 1.2}:d=1.2[m0];'
             f'[m0][key]sidechaincompress=threshold=0.025:ratio=5:attack=25:release=420:makeup=1[mus];'
             f'[vo][mus][2:a]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-14:TP=-1:LRA=9,aresample={SR}[out]')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(tmp, 'vo.wav'), '-i', os.path.join(src, 'music_b.mp3'),
                    '-i', os.path.join(tmp, 'fx.wav'), '-filter_complex', graph, '-map', '[out]', '-ar', str(SR), '-ac', '2', out], check=True)
    print(out)


if __name__ == '__main__':
    run()
