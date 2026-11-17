"""Monta o áudio do "monstro" do Reels Ubots: trilha temporária + efeitos
sincronizados com a locução real (locucao_v1.wav, 45,4 s).

    python3 build_audio.py
      -> trilha_temp.wav   (só a trilha)
      -> sfx.wav           (só os efeitos)
      -> mix_monstro.wav   (locução + trilha com ducking + efeitos)

Tudo é sintetizado aqui (numpy/scipy), sem custo de créditos. A trilha é
provisória: a final pode sair do ElevenLabs Music quando houver saldo.
"""
import json
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(45)


# ------------------------------------------------------------------ io
def read_wav(path):
    with wave.open(path, 'rb') as w:
        n, ch = w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), '<i2').astype(np.float64) / 32768
    return x.reshape(-1, ch).mean(1) if ch > 1 else x


def write_wav(path, stereo):
    peak = np.abs(stereo).max()
    if peak > 0.98:
        stereo = stereo * (0.98 / peak)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype('<i2').tobytes())


VO = read_wav('locucao_v1.wav')
DUR = len(VO) / SR + 0.6           # pequena cauda depois da última palavra
N = int(DUR * SR)


# ------------------------------------------------------------------ dsp
def t_(sec):
    return np.arange(int(sec * SR)) / SR


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output='sos'), x)


def noise(sec):
    return rng.uniform(-1, 1, int(sec * SR))


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


class Bus:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, sig, sec, gain=1.0, pan=0.0):
        i = int(sec * SR)
        if i >= N or i < 0:
            return
        sig = sig[: N - i] * gain
        lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.L[i:i + len(sig)] += sig * lg * 1.414
        self.R[i:i + len(sig)] += sig * rg * 1.414

    def stereo(self):
        return np.stack([self.L, self.R], 1)


# ------------------------------------------------------------------ instrumentos
def rhodes(m, sec):
    t = t_(sec)
    f = note(m)
    s = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3)
         + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 6))
    trem = 1 + 0.18 * np.sin(2 * np.pi * 4.2 * t)
    return s * trem * np.minimum(1, t / 0.006) * np.exp(-t * 0.9)


def chord(ms, sec):
    return sum(rhodes(m, sec) for m in ms) / len(ms)


def kick(soft=1.0):
    t = t_(0.4)
    f = 48 + 90 * np.exp(-t * 30)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 1.3) * soft


def snap():
    n = filt(noise(0.18), 'bandpass', [1500, 4200]) * np.exp(-t_(0.18) * 45)
    return n * 1.4


def shaker(sec=0.09):
    return filt(noise(sec), 'highpass', 6500) * np.sin(np.pi * t_(sec) / sec) ** 2


def bass(m, sec):
    t = t_(sec)
    s = np.sin(2 * np.pi * note(m) * t) + 0.25 * np.sin(2 * np.pi * 2 * note(m) * t)
    return np.tanh(s * 1.4) * np.minimum(1, t / 0.01) * np.exp(-t * 1.6)


def pluck(m, sec=0.35):
    t = t_(sec)
    tri = 2 * np.abs(2 * ((note(m) * t) % 1) - 1) - 1
    return filt(tri, 'lowpass', 3500) * np.exp(-t * 11) * np.minimum(1, t / 0.003)


# ------------------------------------------------------------------ efeitos
def whoosh(sec, up=True):
    n = noise(sec)
    out = np.zeros_like(n)
    chunks = 40
    for c in range(chunks):
        a, b = c * len(n) // chunks, (c + 1) * len(n) // chunks
        p = c / chunks if up else 1 - c / chunks
        fc = 250 * (30 ** p)
        out[a:b] = filt(n[max(0, a - 2000):b], 'bandpass', [fc * 0.7, min(fc * 1.5, 20000)])[-(b - a):]
    t = t_(sec)
    env = np.sin(np.pi * np.minimum(1, t / sec)) ** 1.5 if up else np.exp(-t * 6)
    return out * env


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


def strike():                     # caneta riscando
    sec = 0.28
    n = filt(noise(sec), 'bandpass', [2000, 6000])
    t = t_(sec)
    return n * np.sin(np.pi * t / sec) * (1 + 0.5 * np.sin(2 * np.pi * 38 * t))


def check():
    a = pop(1200, 1800, 0.06)
    b = np.concatenate([np.zeros(int(0.05 * SR)), pop(1800, 2400, 0.08)])
    a = np.pad(a, (0, len(b) - len(a)))
    return a + b


def chime(ms=(81, 86, 90), gap=0.06):
    out = np.zeros(int(1.6 * SR))
    for k, m in enumerate(ms):
        t = t_(1.4)
        s = (np.sin(2 * np.pi * note(m) * t) + 0.3 * np.sin(2 * np.pi * 2.76 * note(m) * t) * np.exp(-t * 5)) * np.exp(-t * 2.5)
        i = int(k * gap * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    return out / 2


def thunk():                      # carimbo
    t = t_(0.35)
    body = np.sin(2 * np.pi * np.cumsum(90 + 120 * np.exp(-t * 40)) / SR) * np.exp(-t * 18)
    return np.tanh((body + filt(noise(0.35), 'lowpass', 1200) * np.exp(-t * 30) * 0.6) * 1.5)


def impact():
    t = t_(1.6)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 8)) / SR) * np.exp(-t * 2.2)
    air = filt(noise(1.6), 'highpass', 2500) * np.exp(-t * 3) * 0.25
    return np.tanh((boom + air) * 1.2)


def page_flip():
    sec = 0.22
    t = t_(sec)
    return filt(noise(sec), 'bandpass', [800, 5000]) * np.sin(np.pi * t / sec) ** 3 * 0.8


def typing(sec=1.2):
    out = np.zeros(int(sec * SR))
    tt = 0.0
    while tt < sec - 0.05:
        c = filt(noise(0.03), 'bandpass', [1800, 5000]) * np.exp(-t_(0.03) * 160)
        i = int(tt * SR)
        out[i:i + len(c)] += c[: len(out) - i] * rng.uniform(0.5, 1)
        tt += rng.uniform(0.07, 0.16)
    return out


# ------------------------------------------------------------------ trilha
BPM = 104
BEAT = 60 / BPM
T0 = 6.1 - 8 * BEAT               # o groove entra cheio em 6,1 s (fim do gancho)
OPEN, LIFT, END = 6.1, T0 + 48 * BEAT, 44.85


def tb(beat):
    return T0 + beat * BEAT


PROG = [  # D maior, quente
    (38, [62, 66, 69, 73, 76]),   # Dmaj9
    (47, [59, 62, 66, 69, 73]),   # Bm9
    (43, [55, 59, 62, 66, 69]),   # Gmaj9
    (45, [57, 61, 64, 67, 71]),   # A13sus feel
]

music = Bus()
pad_layer = Bus()                 # camada filtrada só no gancho
b = -2
while tb(b) < END:
    t0 = tb(b)
    root, ch = PROG[int((b // 4) % 4)]
    if b % 4 == 0:
        target = pad_layer if t0 < OPEN - 0.05 else music
        target.add(chord(ch, 4 * BEAT + 0.6), t0, 0.55, 0.0)
    if t0 >= OPEN - 0.01:
        if b % 1 == 0:
            music.add(kick(0.9), t0, 0.7)
        if b % 2 == 1:
            music.add(snap(), t0, 0.32, 0.1)
        for s in (0.5,):
            music.add(shaker(), t0 + s * BEAT, 0.12, -0.3)
        music.add(shaker(), t0, 0.06, 0.3)
        if b % 4 in (0, 2):
            music.add(bass(root - 12 + 12, 1.2 * BEAT), t0, 0.5)
        if b % 4 == 3:
            music.add(bass(root - 12 + 12 + 7, 0.5 * BEAT), t0 + 0.5 * BEAT, 0.3)
        if t0 >= LIFT - 0.01:     # momento dos resultados: arpejo
            for k in range(2):
                m = ch[[1, 2, 3, 4][(int(b * 2) + k) % 4]] + 12
                music.add(pluck(m), t0 + k * 0.5 * BEAT, 0.12, -0.35 if k else 0.35)
    else:
        music.add(shaker(), t0 + 0.5 * BEAT, 0.05, -0.3)
    b += 1

# acorde final e respiro
music.add(chord(PROG[0][1], 2.5), END, 0.7)
music.add(bass(PROG[0][0], 2.0), END, 0.55)

# filtra a camada do gancho (abafada, deixa a voz respirar)
pad_layer.L = filt(pad_layer.L, 'lowpass', 900)
pad_layer.R = filt(pad_layer.R, 'lowpass', 900)
music.L += pad_layer.L
music.R += pad_layer.R

# swell que abre o groove no fim do gancho
music.add(whoosh(1.1), OPEN - 1.0, 0.25)

# ------------------------------------------------------------------ efeitos (tempos da locução real)
fx = Bus()
CUES = [
    # (segundo, som, ganho, pan, plano)
    (0.95, pop(1300, 2100, 0.12), 0.35, 0.3, '01 ✦ junto de "IA"'),
    (3.55, glitch(), 0.22, -0.2, '02 glitch em "robô"'),
    (6.05, whoosh(0.5, up=False), 0.3, 0.0, '03 corte para o celular'),
    (7.0, vibrate(), 0.55, 0.15, '03 celular vibra'),
    (8.05, whoosh(0.6), 0.45, 0.0, 'T1 mergulho na tela'),
    (8.75, pop(), 0.35, -0.3, '04 balão robô'),
    (9.55, pop(700, 1100), 0.3, 0.3, '04 balão cliente'),
    (10.35, pop(), 0.35, -0.3, '04 balão robô de novo'),
    (10.75, tick(), 0.4, -0.4, '04 etiqueta Bancos'),
    (11.05, tick(), 0.4, 0.4, '04 etiqueta Cooperativas'),
    (11.35, tick(), 0.4, -0.2, '04 etiqueta Fintechs'),
    (11.65, tick(), 0.4, 0.2, '04 etiqueta Financeiras'),
    (11.75, whoosh(0.5), 0.5, 0.0, 'T2 onda'),
    (12.3, chime(), 0.35, 0.0, '05 logo Ubots'),
    (14.7, whoosh(0.4, up=False), 0.25, 0.0, '06 corte para o gerente'),
    (14.9, typing(1.4), 0.18, 0.2, '06 gerente digitando'),
    (17.55, strike(), 0.35, -0.2, '07 regra riscada 1'),
    (18.1, strike(), 0.35, 0.0, '07 regra riscada 2'),
    (18.65, strike(), 0.35, 0.2, '07 regra riscada 3'),
    (19.2, whoosh(0.35), 0.35, 0.0, '07 REGRA vira CONTEXTO'),
    (19.95, check(), 0.3, -0.2, '08 check guardrails'),
    (20.4, check(), 0.3, 0.0, '08 check custos'),
    (20.85, check(), 0.3, 0.2, '08 check canal seguro'),
    (21.75, pop(500, 900, 0.14), 0.4, 0.0, '09 T3 bolha da persona'),
    (22.6, pop(), 0.3, 0.3, '09 balão do chat'),
    (24.1, pop(700, 1100), 0.3, -0.3, '09 balão do chat'),
    (25.5, tick(), 0.4, 0.0, '09 etiqueta Escuta'),
    (26.1, whoosh(0.4, up=False), 0.25, 0.0, '10 corte para a cozinha'),
    (28.45, whoosh(0.4, up=False), 0.25, 0.0, '11 volta para o chat'),
    (28.7, tick(), 0.4, -0.3, '11 etiqueta Contexto'),
    (29.1, tick(), 0.4, 0.0, '11 etiqueta Oferta com sentido'),
    (29.5, tick(), 0.4, 0.3, '11 etiqueta Decisão'),
    (29.85, check(), 0.4, 0.0, '11 selo Contratação'),
    (30.35, whoosh(0.3, up=False), 0.35, 0.0, '12 T4 corte seco'),
    (34.75, impact(), 0.45, 0.0, '12 contador fecha em +R$150 mil'),
    (35.65, pop(500, 900, 0.14), 0.35, 0.0, '12 bolha "por sinal"'),
    (37.7, thunk(), 0.5, 0.0, '12 carimbo EM TESTE'),
    (38.75, whoosh(0.5), 0.5, 0.0, 'T2 onda (2a)'),
    (39.4, page_flip(), 0.35, -0.3, '13 página'),
    (39.9, page_flip(), 0.35, 0.0, '13 página'),
    (40.4, page_flip(), 0.35, 0.3, '13 página'),
    (41.6, whoosh(0.4, up=False), 0.25, 0.0, '14 corte para a persona'),
    (42.6, pop(800, 1300, 0.12), 0.35, 0.0, '14 botão Baixar'),
    (44.85, chime((74, 78, 81, 86), 0.05), 0.4, 0.0, '14 assinatura final'),
]
# tique do contador rolando 31,4 → 34,7
tt = 31.4
step = 0.11
while tt < 34.6:
    CUES.append((tt, tick(), 0.22, rng.uniform(-0.3, 0.3), None))
    step = max(0.045, step * 0.93)
    tt += step

for sec, sig, g, pan, _ in CUES:
    fx.add(sig, sec, g, pan)

# ------------------------------------------------------------------ mix
vo = np.zeros(N)
vo[: len(VO)] = VO
vo /= np.abs(vo).max() / 0.7

# ducking: a trilha abaixa ~8 dB quando há voz
env = np.abs(vo)
env = filt(env, 'lowpass', 6)
env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
duck = 1 - 0.6 * env
mus = music.stereo() * 0.11 * duck[:, None]
sfx = fx.stereo() * 0.4

mix = mus + sfx + np.stack([vo, vo], 1)
mix = filt(mix.T, 'highpass', 30).T
fade = int(0.4 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

write_wav('trilha_temp.wav', music.stereo() * 0.5)
write_wav('sfx.wav', sfx)
write_wav('mix_monstro.wav', mix)

with open('cues.json', 'w') as f:
    json.dump([{'t': round(c[0], 2), 'cue': c[4]} for c in CUES if c[4]], f, ensure_ascii=False, indent=1)

print(f'duração {DUR:.2f}s | trilha {BPM} BPM, groove abre em {OPEN}s, lift em {LIFT:.2f}s | {len(CUES)} efeitos')
