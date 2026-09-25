"""Synthesizes the showreel soundtrack, locked to the same 128 BPM grid as the
visuals (beat 0..32 = 0..15 s). Every hit, whoosh and blip lands on a cut.

    python3 audio.py  ->  showreel.wav
"""
import numpy as np
from scipy.signal import butter, sosfilt
import wave

SR = 48000
BPM = 128
BEAT = 60 / BPM
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(2026)

L = np.zeros(N)
R = np.zeros(N)
DL = np.zeros(N)  # bus that gets sidechained to the kick (pads, bass, arps)
DR = np.zeros(N)
sidechain_hits = []


def t_(sec):
    return np.arange(int(sec * SR)) / SR


def at(beat):
    return int(round(beat * BEAT * SR))


def add(sig, beat, gain=1.0, pan=0.0, duck=False):
    i = at(beat)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    l, r = (DL, DR) if duck else (L, R)
    l[i:i + len(sig)] += sig * lg * 1.414
    r[i:i + len(sig)] += sig * rg * 1.414


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output='sos')
    return sosfilt(sos, x)


def noise(sec):
    return rng.uniform(-1, 1, int(sec * SR))


def note(n):  # midi -> hz
    return 440 * 2 ** ((n - 69) / 12)


def saw(freq, sec, detune=0.0):
    t = t_(sec)
    ph = np.cumsum(np.full_like(t, freq * (1 + detune))) / SR if np.isscalar(freq) else np.cumsum(freq) / SR
    return 2 * (ph % 1) - 1


def env_ad(sec, a, d):
    t = t_(sec)
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


# ------------------------------------------------------------------ drums
def kick(big=1.0):
    t = t_(0.5)
    f = 42 + 150 * np.exp(-t * 38)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (7 / big))
    s += filt(noise(0.5), 'highpass', 3000) * np.exp(-t * 200) * 0.25
    return np.tanh(s * 1.6)


def clap():
    s = np.zeros(int(0.35 * SR))
    for k, off in enumerate([0, 0.011, 0.023]):
        n = filt(noise(0.35), 'bandpass', [900, 2600]) * np.exp(-t_(0.35) * (60 if k < 2 else 14))
        i = int(off * SR)
        s[i:] += n[: len(s) - i]
    return s * 0.9


def hat(open_=False):
    n = filt(noise(0.25), 'highpass', 7500)
    return n * np.exp(-t_(0.25) * (14 if open_ else 60))


def impact(size=1.0):
    t = t_(2.5)
    boom = np.sin(2 * np.pi * np.cumsum(34 + 70 * np.exp(-t * 9)) / SR) * np.exp(-t * 1.6)
    crash = filt(noise(2.5), 'highpass', 1800) * np.exp(-t * 2.4) * 0.35
    body = filt(noise(2.5), 'lowpass', 400) * np.exp(-t * 6) * 0.8
    return np.tanh((boom * 1.2 + crash + body) * size)


def whoosh(beats, up=True):
    sec = beats * BEAT
    t = t_(sec)
    n = noise(sec)
    # sweep a bandpass by chunked filtering
    out = np.zeros_like(n)
    chunks = 48
    for c in range(chunks):
        a, b = c * len(n) // chunks, (c + 1) * len(n) // chunks
        p = c / chunks if up else 1 - c / chunks
        fc = 300 * (40 ** p)
        out[a:b] = filt(n[max(0, a - 2000):b], 'bandpass', [fc * 0.7, min(fc * 1.4, 20000)])[-(b - a):]
    e = (t / sec) ** 2.2 if up else np.exp(-t * 5)
    return out * e


def blip(f0, f1, sec=0.18):
    t = t_(sec)
    f = f0 * (f1 / f0) ** (t / sec)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(sec, 0.002, sec / 4)


def bell(freq, sec=1.6):
    t = t_(sec)
    s = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t * d)
            for m, a, d in [(1, 1, 2.2), (2.76, 0.4, 4), (5.4, 0.2, 7), (8.9, 0.1, 11)])
    return s * env_ad(sec, 0.002, 10)


# ------------------------------------------------------------------ harmony
BARS = [  # root, chord (midi) per bar
    (45, [57, 60, 64, 67]),   # Am7
    (45, [57, 60, 64, 71]),   # Am(add9)
    (41, [53, 57, 60, 64]),   # Fmaj7
    (48, [55, 60, 64, 67]),   # C
    (43, [55, 59, 62, 66]),   # G(#11)
    (41, [53, 57, 60, 64]),   # Fmaj7
    (40, [52, 56, 59, 62]),   # E7
    (45, [57, 60, 64, 71]),   # Am9
]


def pad(chord, beats):
    sec = beats * BEAT
    s = np.zeros(int(sec * SR))
    for n in chord:
        for d in (-0.004, 0.0, 0.005):
            s += saw(note(n), sec, d)
    s = filt(s, 'lowpass', 1400) / (len(chord) * 3)
    t = t_(sec)
    return s * np.minimum(1, t / 0.3) * np.minimum(1, (sec - t) / 0.2)


def bass_note(n, sec):
    t = t_(sec)
    s = saw(note(n), sec) * 0.7 + np.sin(2 * np.pi * note(n) * t) * 0.8
    cutoff = 200 + 1400 * np.exp(-t * 18)
    out = np.zeros_like(s)
    for c in range(8):  # stepped filter envelope
        a, b = c * len(s) // 8, (c + 1) * len(s) // 8
        out[a:b] = filt(s, 'lowpass', float(cutoff[a]))[a:b]
    return np.tanh(out * 1.5) * env_ad(sec, 0.003, sec * 0.8)


def pluck(n, sec=0.3):
    t = t_(sec)
    s = (saw(note(n), sec) + saw(note(n + 12), sec, 0.003) * 0.5)
    return filt(s, 'lowpass', 3200) * np.exp(-t * 14)


# ================================================================== arrangement
# bar 1 — ignition: dot pops, pulses on every beat, rises into the cut
add(bell(note(81)), 0, 0.25, 0.2)
for k in range(1, 4):
    add(kick(0.7), k, 0.55)
    sidechain_hits.append(k)
add(pad(BARS[0][1], 4), 0, 0.35, duck=True)
add(whoosh(2), 2, 0.5)
for k in range(12):  # type-on ticks
    add(blip(3000, 2600, 0.02), 0.4 + k * 0.083, 0.08, 0.5)

# bars 2-7 — groove
for b in range(4, 28):
    add(kick(), b, 0.9)
    sidechain_hits.append(b)
for b in range(5, 28, 2):
    add(clap(), b, 0.55, 0.05)
for b in np.arange(8.5, 24, 1):
    add(hat(), b, 0.22, 0.3)
for b in np.arange(8.25, 24, 0.5):
    add(hat(), b, 0.09, -0.3)
for b in np.arange(24, 28, 0.25):
    add(hat(open_=(b % 1 == 0.5)), b, 0.16, 0.35 if (b * 4) % 2 else -0.35)

for bar in range(1, 7):
    root, chord = BARS[bar]
    add(pad(chord, 4), bar * 4, 0.3, duck=True)
    for s in range(8):
        bb = bar * 4 + s * 0.5
        n = root - 12 + (12 if s in (3, 7) else 0)
        add(bass_note(n, BEAT * 0.45), bb, 0.5, duck=True)

# arps through shapes / particles / 3D
for bar in (2, 3, 4):
    chord = BARS[bar][1]
    for s in range(16):
        n = chord[[0, 1, 2, 3, 2, 1, 3, 2][s % 8]] + 12
        add(pluck(n), bar * 4 + s * 0.25, 0.12, -0.4 if s % 2 else 0.4, duck=True)

# transitions & hits
add(impact(1.0), 4, 0.8)
for b, beats in [(6, 2), (10, 2), (14, 2), (18, 2), (22, 2)]:
    add(whoosh(beats), b, 0.35)
add(whoosh(0.5), 7.5, 0.5)                      # split reveal
for k, b in enumerate([9, 10, 11, 11.5]):       # shape morphs
    add(blip(note(76 + k * 3), note(88 + k * 3), 0.16), b, 0.28, [-0.5, 0.5, -0.3, 0.3][k])
add(blip(1800, 90, 0.25), 11.72, 0.4)           # collapse
add(impact(1.2), 12, 0.7)
for k in range(24):                             # particle sparkles
    b = 12.3 + rng.uniform(0, 2.6)
    add(blip(note(rng.choice([84, 88, 91, 93, 96])), note(96), 0.08), b, 0.06, rng.uniform(-0.8, 0.8))
add(whoosh(1.0), 14, 0.4)
add(impact(1.4), 15, 0.8)
add(impact(1.0), 16, 0.6)
for k, b in enumerate([17, 18, 19]):            # 3D morphs
    add(whoosh(0.6, up=False), b, 0.3, [-0.6, 0.6, 0][k])
    add(blip(note(64), note(52), 0.3), b, 0.2)
for k in range(7):                              # glitch stutter
    b = 19.55 + k * 0.0625
    f = 200 * 2 ** rng.integers(0, 5)
    s = np.sign(np.sin(2 * np.pi * f * t_(0.03))) * 0.5
    add(s, b, 0.25, rng.uniform(-0.7, 0.7))
for b in (20, 21, 22, 23, 23.5):                # grid waves
    add(whoosh(0.5, up=False), b, 0.18, 0.4)
add(impact(0.8), 20, 0.4)
# montage stabs
for k, b in enumerate([24, 24.5, 25, 25.5]):
    add(pad(BARS[6][1] if k % 2 else BARS[5][1], 0.4), b, 0.8)
add(impact(1.1), 25.15, 0.55)                   # WEIGHT lands
# build into the drop
add(whoosh(4), 24, 0.6)
t = t_(2 * BEAT)
riser = saw(220 * 2 ** (2 * t / t[-1]), 2 * BEAT) + saw(221 * 2 ** (2 * t / t[-1]), 2 * BEAT)
add(filt(riser, 'lowpass', 2500) * (t / t[-1]) ** 2, 26, 0.12)
for k in range(16):                             # snare roll
    add(clap(), 27 + k / 16, 0.18 + 0.25 * k / 16)

# bar 8 — sign-off
add(impact(1.6), 28, 0.9)
add(kick(1.4), 28, 1.0)
sidechain_hits.append(28)
add(pad(BARS[7][1], 3.5), 28, 0.45, duck=True)
add(bass_note(33, BEAT * 3), 28, 0.5, duck=True)
for k, n in enumerate([81, 84, 88, 91, 93, 96, 91, 88]):   # one bell per spoke
    add(bell(note(n), 1.2), 28 + k * 0.04, 0.12, (k / 3.5) - 1)
for b in (29, 30, 31):
    add(kick(0.8), b, 0.5)
    add(blip(2400, 2200, 0.03), b, 0.15)       # rotation tick
    sidechain_hits.append(b)
for k in range(28):
    add(blip(3000, 2600, 0.02), 29.9 + k * 0.035, 0.05, 0.4)
add(whoosh(0.45, up=False), 31.4, 0.4)
add(blip(900, 60, 0.25), 31.45, 0.25)
add(blip(note(93), note(105), 0.1), 31.85, 0.3)             # final pop

# ------------------------------------------------------------------ sidechain + master
duck = np.ones(N)
for b in sidechain_hits:
    i = at(b)
    tt = t_(0.35)
    d = 1 - 0.6 * np.exp(-tt * 12)
    duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d[: N - i])
L += DL * duck
R += DR * duck

mix = np.stack([L, R], 1)
mix = filt(mix.T, 'highpass', 25).T
mix = np.tanh(mix * 1.3)
mix /= np.abs(mix).max() / 0.89
fade = int(0.02 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

with wave.open('showreel.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print(f'wrote showreel.wav  {DUR:.2f}s  peak {np.abs(mix).max():.2f}')
