"""Trilha do Reels A (30 s, 120 BPM, 48 kHz, estéreo). Sintetizada: sem samples de terceiros."""
import sys, wave
import numpy as np
from scipy import signal

SR = 48000; DUR = 30.0; N = int(SR * DUR); BEAT = 0.5
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)

def t_(d): return np.arange(int(d * SR)) / SR
def add(x, at, gain=1.0, pan=0.0):
    i = int(at * SR); j = min(N, i + len(x)); x = x[: j - i] * gain
    L[i:j] += x * np.sqrt(0.5 * (1 - pan)) * 1.414; R[i:j] += x * np.sqrt(0.5 * (1 + pan)) * 1.414
def env(n, a=0.005, d=0.2, s=0.0, sustain=0.0, rel=0.05):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4))
    e = e * np.where(t < a, 1, s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    if rel: e *= np.clip((t[-1] - t) / rel, 0, 1)
    return e
def bp(x, lo, hi, order=2): return signal.sosfilt(signal.butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)
def hp(x, f): return signal.sosfilt(signal.butter(2, f, 'high', fs=SR, output='sos'), x)
def lp(x, f): return signal.sosfilt(signal.butter(2, f, 'low', fs=SR, output='sos'), x)
def note(f): return 440.0 * 2 ** ((f - 69) / 12)

def kick(g=1.0):
    t = t_(0.45); f = 48 + 110 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * g + hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 90) * 0.15 * g
def clap():
    t = t_(0.3); n = bp(rng.standard_normal(len(t)), 900, 5200)
    e = np.exp(-t * 18) + 0.6 * np.exp(-np.maximum(t - 0.012, 0) * 30) * (t > 0.012)
    return n * e * 0.55
def hat(open_=False):
    t = t_(0.25 if open_ else 0.06); return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (14 if open_ else 70)) * 0.25
def tick():
    t = t_(0.03); return bp(rng.standard_normal(len(t)), 2500, 6000) * np.exp(-t * 160) * 0.5
def whoosh(d=0.5, up=True):
    t = t_(d); n = rng.standard_normal(len(t)); e = np.sin(np.pi * t / d) ** 2
    lo = lp(n, 1200); hi = hp(n, 2500); mix = (t / d) if up else (1 - t / d)
    return (lo * (1 - mix) + hi * mix) * e * 0.5
def riser(d=1.0, f0=200, f1=1600):
    t = t_(d); f = f0 * (f1 / f0) ** (t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * 0.18 + hp(rng.standard_normal(len(t)), 1500) * 0.25) * (t / d) ** 2
def impact(g=1.0):
    t = t_(1.6); f = 38 + 60 * np.exp(-t * 9); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 3.2) + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 5) * 0.5) * g
def saw(f, d, h=10):
    t = t_(d); return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, h + 1))
def pluck(f, d=0.35, g=0.3):
    t = t_(d); x = saw(f, d, 8) * np.exp(-t * 9); return lp(x, 2400) * g
def pad(fs, d, g=0.12, detune=1.004):
    t = t_(d); x = sum(saw(f, d, 6) + saw(f * detune, d, 6) for f in fs)
    e = np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4); return lp(x, 1500) * e * g / len(fs)
def stutter():
    t = t_(0.18); x = np.sign(np.sin(2 * np.pi * 220 * t)) * (np.floor(t * 40) % 2) * 0.12
    return x * np.exp(-t * 6)

# --- 0 a 7 s: tensão
for b in range(14):
    at = b * BEAT; tt = t_(0.22); add(np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 14), at, 0.55)
    add(tick(), at + 0.25, 0.35, 0.3); add(tick(), at, 0.2, -0.3)
drone = pad([note(45), note(52), note(57), note(60)], 7.0, 0.22) * np.linspace(0.3, 1.0, int(7 * SR))
add(drone, 0, 1.0)
for i, at in enumerate([0.35 + k * 0.36 for k in range(5)]):  # quedas das regras
    add(pluck(note(69 - 2 * i), 0.25, 0.22), at, 1.0, -0.2 + 0.1 * i)
add(whoosh(0.45, True), 2.85, 0.9)          # whip pan
add(riser(1.4, 180, 1400), 5.6, 0.9)
add(stutter(), 6.3, 1.0)

# --- 7 s: drop e groove (Am F C G, 1 compasso = 2 s)
add(impact(0.9), 7.0)
prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (55, [55, 59, 62])]
def groove(a, b, drums=True):
    bar = int(a / 2.0)
    t = a
    while t < b - 1e-6:
        beat = int(round((t - 7.0) / BEAT))
        if drums:
            add(kick(0.9), t)
            if beat % 2 == 1: add(clap(), t, 0.9, 0.05)
            add(hat(), t + 0.25, 0.8, 0.25); add(hat(beat % 4 == 3), t + 0.25 if beat % 4 == 3 else t + 0.125, 0.4, -0.25)
        root = prog[int((t - 7.0) // 2.0) % 4][0]
        for k in range(2):
            add(pluck(note(root - 24), 0.22, 0.45), t + k * 0.25, 1.0)
        t += BEAT
    c = 7.0 + 2.0 * np.floor((a - 7.0) / 2.0)
    while c < b - 1e-6:
        ch = prog[int((c - 7.0) // 2.0) % 4][1]
        s0 = max(c, a); d = min(c + 2.0, b) - s0
        add(pad([note(n) for n in ch], d, 0.16), s0, 1.0, 0.0)
        for k in range(8):  # brilho em semicolcheias
            at = c + k * 0.25
            if s0 <= at < b: add(pluck(note(ch[k % 3] + 12), 0.18, 0.08), at, 1.0, 0.4 if k % 2 else -0.4)
        c += 2.0
groove(7.0, 16.9)
add(whoosh(0.4, True), 11.8, 0.8)
add(whoosh(0.45, False), 16.8, 0.8)
# --- 17 a 19 s: respiro para o número
add(pad([note(57), note(60), note(64), note(69)], 2.0, 0.18), 17.0)
for k in range(10):  # contagem
    add(pluck(note(64 + k), 0.12, 0.10), 17.5 + k * 0.14, 1.0, 0.2)
add(impact(0.45), 19.0)
groove(19.0, 25.0)
add(whoosh(0.4, True), 20.8, 0.7)
add(riser(1.0, 240, 1800), 25.0, 0.8)
# --- 26 s: CTA, acorde resolvido
add(impact(0.6), 26.0)
groove(26.0, 28.0)
cfin = [note(n) for n in [48, 55, 60, 64, 67, 72]]
add(pad(cfin, 4.0, 0.26), 28.0)
for k, n in enumerate([60, 64, 67, 72]):
    add(pluck(note(n + 12), 0.6, 0.12), 28.0 + k * 0.12, 1.0, -0.3 + 0.2 * k)

mix = np.stack([L, R], 1)
mix[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) * 0.9) * 1.3) / np.tanh(1.3) * 0.89
out = sys.argv[1]
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wav', out, mix.shape[0] / SR, 's')
