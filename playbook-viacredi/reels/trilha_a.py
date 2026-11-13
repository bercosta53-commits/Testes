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

def blip(f=880, g=0.16, pan=0.0):
    t = t_(0.12); return np.sin(2 * np.pi * f * t) * np.exp(-t * 38) * g
def click(g=0.5):
    t = t_(0.04); return hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 220) * g

def buzz(g=0.25):
    t = t_(0.28); x = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5 + np.sign(np.sin(2 * np.pi * 116 * t)) * 0.5
    return lp(x, 900) * np.exp(-t * 6) * g
D0 = 1.95  # início do groove
prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (55, [55, 59, 62])]
def groove(a, b, drums=True, kickon=True):
    t = a
    while t < b - 1e-6:
        beat = int(round((t - D0) / BEAT))
        if drums:
            if kickon: add(kick(0.9), t)
            if beat % 2 == 1: add(clap(), t, 0.8, 0.05)
            add(hat(), t + 0.25, 0.75, 0.25); add(hat(beat % 4 == 3), t + 0.125, 0.3, -0.25)
        root = prog[int((t - D0) // 2.0) % 4][0]
        for k in range(2): add(pluck(note(root - 24), 0.22, 0.42), t + k * 0.25, 1.0)
        t += BEAT
    c = D0 + 2.0 * np.floor((a - D0) / 2.0)
    while c < b - 1e-6:
        ch = prog[int((c - D0) // 2.0) % 4][1]
        s0 = max(c, a); d = min(c + 2.0, b) - s0
        if d > 0.05: add(pad([note(n) for n in ch], d, 0.14), s0, 1.0)
        for k in range(8):
            at = c + k * 0.25
            if s0 <= at < b: add(pluck(note(ch[k % 3] + 12), 0.18, 0.07), at, 1.0, 0.4 if k % 2 else -0.4)
        c += 2.0

# gancho 0–1.95: queda do balão e suspense
add(impact(0.55), 0.0); add(blip(988, 0.2), 0.05)
add(pad([note(45), note(52), note(57)], 1.95, 0.2), 0)
for k in range(3): add(tick(), 0.9 + k * 0.33, 0.35)
add(riser(0.9, 300, 1500), 1.05, 0.7)
add(whoosh(0.4, True), 1.75, 0.9)
# comparação 1.95–8: groove leve, mensagens nos dois lados
groove(D0, 8.0, drums=True, kickon=False)
for t0, f, pan in [(2.35, 784, -0.5), (2.45, 784, 0.5), (3.55, 1047, 0.5), (3.75, 523, -0.5), (4.9, 988, 0.5), (5.6, 659, -0.5), (5.9, 1175, 0.5), (6.6, 1319, 0.5)]: add(blip(f, 0.15), t0, 1.0, pan)
add(buzz(0.3), 6.4, 1.0, -0.6)
add(riser(1.2, 200, 1600), 6.9, 0.75)
# dois finais 8–11.3
add(impact(0.8), 8.0)
groove(8.0, 11.3)
add(buzz(0.22), 8.35, 1.0, -0.6)
add(click(0.8), 8.75)
add(blip(1319, 0.18), 9.15, 1.0, 0.5); add(blip(1568, 0.16), 9.6, 1.0, 0.5)
for k in range(12): add(pluck(note(76 + (k * 5) % 12), 0.2, 0.08), 9.55 + k * 0.05, 1.0, (-1) ** k * 0.5)
# wipe + virada
add(whoosh(0.6, True), 11.15, 1.0)
add(impact(0.9), 11.7)
groove(11.7, 15.45)
add(whoosh(0.45, False), 12.7, 0.7)
for k in range(3): add(click(0.6), 14.35 + k * 0.25); add(blip(1320, 0.12), 14.38 + k * 0.25, 1.0, 0.3)
add(whoosh(0.35, True), 15.2, 0.7)
# prova
add(pad([note(57), note(60), note(64), note(69)], 1.6, 0.17), 15.45)
for k in range(9): add(pluck(note(64 + k), 0.12, 0.10), 15.9 + k * 0.14, 1.0, 0.2)
add(impact(0.45), 17.2); add(blip(1568, 0.16), 17.4)
groove(17.45, 19.4)
add(whoosh(0.4, True), 19.3, 0.8)
# método
groove(19.45, 25.0)
for t0 in [19.5, 19.8, 20.1]: add(whoosh(0.3, False), t0, 0.45)
for k in range(4): add(click(0.6), 21.2 + k * 0.45); add(blip(880 + 220 * k, 0.13), 21.22 + k * 0.45)
add(riser(1.2, 240, 1800), 23.8, 0.8)
# CTA
add(impact(0.65), 25.0)
groove(25.0, 27.45)
add(click(0.9), 27.45)
cfin = [note(n) for n in [48, 55, 60, 64, 67, 72]]
add(pad(cfin, 2.55, 0.26), 27.45)
for k, n in enumerate([60, 64, 67, 72]): add(pluck(note(n + 12), 0.6, 0.12), 27.5 + k * 0.12, 1.0, -0.3 + 0.2 * k)

mix = np.stack([L, R], 1)
mix[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) * 0.9) * 1.3) / np.tanh(1.3) * 0.89
out = sys.argv[1]
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wav', out, mix.shape[0] / SR, 's')
