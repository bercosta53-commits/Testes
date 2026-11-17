"""Áudio do monstro v2: trilha do animatic de referência (v1b) estendida para
46 s com emenda no compasso + locução + efeitos pontuais nos tempos do motion v2.

    python3 build_audio_v2.py
      -> trilha_v1b_46s.wav     (trilha estendida)
      -> mix_monstro_v2.wav     (locução + trilha com ducking + efeitos)
      -> mix_monstro_v2_-14LUFS.wav (via ffmpeg loudnorm, ver o final)

A trilha de referência já vem mixada com os efeitos dela; aqui ela entra
inteira como cama, e os efeitos próprios ficam mais baixos e só nos momentos-chave.
"""
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(46)


def read(path):
    with wave.open(path, 'rb') as w:
        ch = w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float64) / 32768
    x = x.reshape(-1, ch)
    return x if ch == 2 else np.repeat(x, 2, 1)


def write(path, x):
    peak = np.abs(x).max()
    if peak > 0.98:
        x = x * (0.98 / peak)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output='sos'), x)


# ------------------------------------------------------------------ trilha estendida
ref = read('ref_trilha_v1b.wav')
BPM = 122.4
JUMP = 32 * 60 / BPM                     # volta 8 compassos (32 tempos ≈ 15,69 s)
mono = ref.mean(1)


# envelopes por banda (10 ms): comparam batida e timbre, não a fase da onda
HOP = SR // 100
BANDS = [(40, 160), (160, 600), (600, 2500), (2500, 9000)]
envs = []
for lo, hi in BANDS:
    s = filt(mono, 'bandpass', [lo, hi], 4)
    e = np.sqrt(np.convolve(s ** 2, np.ones(HOP) / HOP, 'same')[::HOP])
    envs.append(np.log(e + 1e-4))
E = np.stack(envs)                         # bandas × quadros de 10 ms


def sim(fa, fb, half=150):                 # janela de ±1,5 s em volta de cada ponto
    a, b = E[:, fa - half:fa + half], E[:, fb - half:fb + half]
    a = a - a.mean(1, keepdims=True); b = b - b.mean(1, keepdims=True)
    return (a * b).sum() / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9)


best = None
jf = int(round(JUMP * 100))
for fa in range(int(19 * 100), int(27 * 100)):
    for d in range(-3, 4):                 # deixa o salto variar ±30 ms (BPM estimado)
        fb = fa - jf + d
        c = sim(fa, fb)
        if best is None or c > best[0]:
            best = (c, fa, fb)
corr, fa, fb = best
A, B = fa / 100, fb / 100
# ajuste fino da fase por amostra (±5 ms)
ia, ib = int(A * SR), int(B * SR)
seg = mono[ia - 1200:ia + 1200]
lag = max(range(-240, 241, 2), key=lambda L: np.dot(seg, mono[ib + L - 1200:ib + L + 1200]))
ib += lag
XF = int(0.08 * SR)
fade = np.sin(np.linspace(0, np.pi / 2, XF))[:, None]
head = ref[:ia]
tail = ref[ib:]
splice = head[-XF:] * np.cos(np.linspace(0, np.pi / 2, XF))[:, None] + tail[:XF] * fade
bed = np.concatenate([head[:-XF], splice, tail[XF:]])
print(f'emenda: {A:.2f}s -> volta para {B + lag / SR:.2f}s (correlação {corr:.2f}) | trilha {len(bed) / SR:.2f}s')
write('trilha_v1b_46s.wav', bed)

# ------------------------------------------------------------------ efeitos pontuais
def t_(sec):
    return np.arange(int(sec * SR)) / SR


def noise(sec):
    return rng.uniform(-1, 1, int(sec * SR))


def pop(f0=900, f1=1500, sec=0.09):
    t = t_(sec)
    f = f0 * (f1 / f0) ** (t / sec)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40) * np.minimum(1, t / 0.002)


def tick():
    t = t_(0.025)
    return np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 260)


def vibrate(sec=0.45):
    t = t_(sec)
    buzz = np.sign(np.sin(2 * np.pi * 150 * t)) * 0.5 + np.sin(2 * np.pi * 300 * t) * 0.3
    gate = (np.sin(2 * np.pi * 9 * t) > -0.2).astype(float)
    return filt(buzz * gate, 'lowpass', 900) * np.minimum(1, t / 0.01)


def glitch():
    out = np.zeros(int(0.22 * SR))
    for k in range(6):
        f = 180 * 2 ** rng.integers(0, 5)
        s = np.sign(np.sin(2 * np.pi * f * t_(0.03))) * 0.5
        i = int(k * 0.036 * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    return out


def strike():
    sec = 0.28
    t = t_(sec)
    return filt(noise(sec), 'bandpass', [2000, 6000]) * np.sin(np.pi * t / sec) * (1 + 0.5 * np.sin(2 * np.pi * 38 * t))


def check():
    a = pop(1200, 1800, 0.06)
    b = np.concatenate([np.zeros(int(0.05 * SR)), pop(1800, 2400, 0.08)])
    return np.pad(a, (0, len(b) - len(a))) + b


def shimmer(sec=0.6):              # a luz entrando (íris)
    t = t_(sec)
    s = sum(np.sin(2 * np.pi * f * t + k) for k, f in enumerate([1318, 1760, 2093, 2637]))
    return s / 4 * np.sin(np.pi * t / sec) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))


def lowdrop(sec=0.5):             # entrando no escuro
    t = t_(sec)
    return np.sin(2 * np.pi * np.cumsum(120 * np.exp(-t * 3)) / SR) * np.exp(-t * 6)


def error():                      # o robô não entendeu
    t = t_(0.22)
    return (np.sign(np.sin(2 * np.pi * 220 * t)) * 0.4) * (t < 0.09) + (np.sign(np.sin(2 * np.pi * 180 * t)) * 0.4) * (t > 0.12)


def impact():
    t = t_(1.4)
    boom = np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t * 8)) / SR) * np.exp(-t * 2.4)
    return np.tanh(boom * 1.2)


CUES = [
    (0.95, pop(1300, 2100, 0.12), 0.5), (3.55, glitch(), 0.3), (7.0, vibrate(), 0.7),
    (8.1, lowdrop(), 0.6),                                  # mergulho no escuro do robô
    (8.75, pop(), 0.45), (9.55, pop(700, 1100), 0.4), (10.35, error(), 0.25),
    (10.75, tick(), 0.5), (11.05, tick(), 0.5), (11.35, tick(), 0.5), (11.65, tick(), 0.5),
    (12.0, shimmer(), 0.45), (12.6, pop(800, 1600, 0.12), 0.45),   # a luz entra / logo
    (17.55, strike(), 0.45), (18.1, strike(), 0.45), (18.65, strike(), 0.45),
    (19.95, check(), 0.4), (20.4, check(), 0.4), (20.85, check(), 0.4), (21.0, pop(600, 1000, 0.12), 0.4),
    (22.6, pop(), 0.4), (24.1, pop(700, 1100), 0.4), (25.5, tick(), 0.5),
    (28.5, pop(), 0.4), (28.7, tick(), 0.5), (28.95, pop(700, 1100), 0.4), (29.1, tick(), 0.5),
    (29.45, pop(), 0.4), (29.5, tick(), 0.5), (29.85, check(), 0.5),
    (30.45, pop(600, 1000, 0.12), 0.4), (31.25, pop(1000, 1700, 0.1), 0.45),
    (34.75, impact(), 0.5), (37.7, pop(700, 1400, 0.14), 0.5),
    (39.4, pop(600, 1000, 0.12), 0.4), (42.6, pop(800, 1300, 0.12), 0.45), (44.85, check(), 0.45),
]
tt, step = 32.6, 0.11
while tt < 34.6:                   # contador rolando
    CUES.append((tt, tick(), 0.3)); step = max(0.045, step * 0.93); tt += step
# a virada do "contexto" (mesmo cálculo do reel.js: tempo da palavra dentro do trecho)
CUES.append((19.05, shimmer(0.5), 0.4))

vo_m = read('locucao_v1.wav').mean(1)
N = int(46.2 * SR)
fx = np.zeros(N)
for sec, sig, g in CUES:
    i = int(sec * SR)
    fx[i:i + len(sig)] += sig[: N - i] * g

vo = np.zeros(N); vo[: len(vo_m)] = vo_m; vo /= np.abs(vo).max() / 0.7
b2 = np.zeros((N, 2)); b2[: min(N, len(bed))] = bed[:N]
env = filt(np.abs(vo), 'lowpass', 6)
env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
duck = 1 - 0.55 * env
mix = b2 * 0.24 * duck[:, None] + np.stack([fx, fx], 1) * 0.3 + np.stack([vo, vo], 1)
mix = filt(mix.T, 'highpass', 30).T
f = int(0.5 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
write('mix_monstro_v2.wav', mix)

# níveis por trecho (voz x trilha), para conferir o equilíbrio
def db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
for a, b, label in [(7, 11.6, 'robô'), (21.9, 25.8, 'chat'), (31, 35.4, 'resultado')]:
    i, j = int(a * SR), int(b * SR)
    print(f'{label:10s} voz {db(vo[i:j]):6.1f} dB | trilha {db((b2[i:j] * 0.24 * duck[i:j, None]).mean(1)):6.1f} dB')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'mix_monstro_v2.wav', '-af', 'loudnorm=I=-14:TP=-1:LRA=7',
                '-ar', '48000', 'mix_monstro_v2_-14LUFS.wav'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'mix_monstro_v2_-14LUFS.wav', '-c:a', 'aac', '-b:a', '256k', 'mix_monstro_v2.m4a'], check=True)
print('ok')
