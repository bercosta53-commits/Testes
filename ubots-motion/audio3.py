"""Trilha + SFX da v3 (20 s, 120 BPM). Lê events3.json e grava audio3.wav (-14 LUFS, pico <= -1 dBTP).
Seções (1 compasso = 2 s): intro 0-4 | groove 4-8 | +hook 8-12 | auge 12-16 (break em 15,5) | final 16-20 (resolve em C).
"""
import json, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
from scipy.io import wavfile
import pyloudnorm as pyln

SR = 44100; DUR = 20.0; N = int(SR * DUR); BEAT = 0.5; BAR = 2.0
rng = np.random.default_rng(3)
T = lambda n: np.arange(n) / SR
def note(m): return 440.0 * 2 ** ((m - 69) / 12)
def filt(x, f, kind='low', o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)

# ---------- band-limited wavetable oscillators ----------
TAB = {}
def table(kind, nh):
    k = (kind, nh)
    if k not in TAB:
        x = np.linspace(0, 1, 4096, endpoint=False); h = np.arange(1, nh + 1)
        if kind == 'saw': amp = 1 / h
        else: amp = np.where(h % 2 == 1, 1 / h, 0)  # square
        TAB[k] = (np.sin(2 * np.pi * np.outer(h, x)) * amp[:, None]).sum(0) * 0.6
    return TAB[k]
def osc(f, n, kind='saw', ph=None):
    f = np.broadcast_to(np.asarray(f, float), (n,))
    phase = (rng.random() if ph is None else ph) + np.cumsum(f) / SR
    nh = int(max(1, min(160, 17000 / f.max())))
    tab = table(kind, nh); idx = (phase % 1) * 4096; i0 = idx.astype(int); fr = idx - i0
    return tab[i0] * (1 - fr) + tab[(i0 + 1) % 4096] * fr
def sine(f, n, ph=0.0):
    f = np.broadcast_to(np.asarray(f, float), (n,)); return np.sin(2 * np.pi * (ph + np.cumsum(f) / SR))

# ---------- buses ----------
def bus(): return np.zeros((2, N))
drums, bass, music, lead, fx = bus(), bus(), bus(), bus(), bus()
send_rev, send_dly = bus(), bus()
def place(buf, sig, t0, g=1.0, pan=0.0, rev=0.0, dly=0.0):
    if sig.ndim == 1:
        a = (np.clip(pan, -1, 1) + 1) * np.pi / 4; sig = np.stack([sig * np.cos(a), sig * np.sin(a)]) * 1.414
    i = int(round(t0 * SR)); j = 0
    if i < 0: j = -i; i = 0
    if i >= N: return
    s = sig[:, j:j + N - i] * g; m = s.shape[1]
    buf[:, i:i + m] += s
    if rev: send_rev[:, i:i + m] += s * rev
    if dly: send_dly[:, i:i + m] += s * dly

# ---------- harmony ----------
CH = {'F': [53, 57, 60, 64], 'G': [55, 59, 62, 67], 'Em': [52, 55, 59, 62], 'Am': [57, 60, 64, 67], 'C': [48, 55, 62, 64]}
ROOT = {'F': 41, 'G': 43, 'Em': 40, 'Am': 45, 'C': 36}
PROG = ['F', 'G', 'Em', 'Am', 'F', 'G', 'Em', 'Am', 'F', 'C']   # one chord per bar

# ---------- instruments ----------
def kick(g=1.0):
    n = int(.42 * SR); t = T(n); f = 46 + 120 * np.exp(-t * 38)
    body = sine(f, n) * np.exp(-t * 7.5) * np.minimum(t / 0.0015, 1)
    click = filt(rng.standard_normal(n), 2500, 'high') * np.exp(-t * 350) * 0.25
    return np.tanh((body + click) * 1.6) * 0.9 * g
def clap(g=1.0):
    n = int(.35 * SR); t = T(n); x = filt(rng.standard_normal(n), [1100, 5200], 'band')
    e = np.exp(-t * 16) * (t > 0.021)
    for k in (0.0, 0.009, 0.018): e = e + np.exp(-np.maximum(t - k, 0) * 140) * (t >= k) * 0.8
    body = sine(185, n) * np.exp(-t * 30) * 0.25
    return (x * e * 0.5 + body) * g
METAL = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0]
def hat(g=1.0, dec=55):
    n = int((0.06 + 3 / dec) * SR); t = T(n)
    x = sum(np.sign(np.sin(2 * np.pi * f * 1.9 * t + rng.random() * 6)) for f in METAL)
    x = filt(filt(x, 7000, 'high', 4), 13000) + 0.4 * filt(rng.standard_normal(n), 8000, 'high')
    return x * np.exp(-t * dec) * 0.07 * g
def shaker(g=1.0):
    n = int(.09 * SR); t = T(n); x = filt(rng.standard_normal(n), [5500, 11000], 'band')
    return x * np.minimum(t / 0.008, 1) * np.exp(-t * 45) * 0.22 * g
def rim(g=1.0):
    n = int(.08 * SR); t = T(n)
    return (sine(1650, n) * np.exp(-t * 90) * 0.5 + filt(rng.standard_normal(n), 2500, 'high') * np.exp(-t * 300) * 0.3) * g
def pluck(m, d=0.3, bright=4200, dark=900, dec=9.0, g=1.0):
    n = int((d + 0.35) * SR); t = T(n); f = note(m)
    x = osc(f, n, 'saw') * 0.7 + osc(f * 1.003, n, 'square') * 0.35 + sine(f / 2, n) * 0.2
    eb = np.exp(-t * dec * 2.2)
    y = filt(x, bright) * eb + filt(x, dark) * (1 - eb)
    env = np.minimum(t / 0.003, 1) * np.exp(-t * dec) * np.clip((d + 0.35 - t) / 0.12, 0, 1)
    return y * env * g
def lead_note(m, d, g=1.0):
    n = int((d + 0.5) * SR); t = T(n); f = note(m)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.18) / 0.2, 0, 1)
    x = osc(f * vib, n, 'saw') * 0.55 + sine(f * vib, n) * 0.55 + sine(2 * f * vib, n) * 0.12
    eb = np.exp(-t * 7)
    y = filt(x, 5200) * (0.35 + 0.65 * eb) + filt(x, 1500) * 0.65 * (1 - eb)
    env = np.minimum(t / 0.006, 1) * (0.55 + 0.45 * np.exp(-t * 5)) * np.clip((d - t) / 0.08 + 1, 0, 1) * np.exp(-np.maximum(t - d, 0) * 9)
    return y * env * 0.5 * g
def pad(c, d, cut=1800, g=1.0, oct=0):
    n = int(d * SR); t = T(n); L = np.zeros(n); R = np.zeros(n)
    for m in CH[c]:
        for k, det in enumerate((-0.11, -0.05, 0.0, 0.06, 0.12)):
            s = osc(note(m + 12 * oct + det), n, 'saw')
            if k % 2: L += s
            else: R += s
            if k == 2: L += s * 0.7; R += s * 0.7
    env = np.minimum(t / 0.45, 1) * np.clip((d - t) / 0.5, 0, 1)
    return np.stack([filt(L, cut), filt(R, cut)]) * env / 14 * g
def bass_note(m, d, g=1.0, bright=1.0):
    n = int((d + 0.05) * SR); t = T(n); f = note(m)
    x = osc(f, n, 'saw'); eb = np.exp(-t * 18)
    y = filt(x, 300 + 700 * bright) * (1 - eb) + filt(x, 1400 * bright) * eb
    env = np.minimum(t / 0.004, 1) * np.clip((d + 0.05 - t) / 0.04, 0, 1)
    return (np.tanh(y * 1.4) * 0.7 + sine(f, n) * 0.6) * env * g
def bell(m, d=1.6, g=1.0):
    n = int(d * SR); t = T(n); f = note(m); s = 0
    for k, a, dd in ((1, 1, 1.0), (2.0, .35, .5), (3.0, .12, .3), (4.2, .08, .2)):
        s = s + a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / (dd * d * 0.5))
    return s * np.minimum(t / 0.002, 1) * 0.2 * g
def air(d, f0, f1, g=1.0, q=0.7):
    """soft filtered-noise whoosh with a sine-ish swell"""
    n = int(d * SR); t = T(n); x = rng.standard_normal(n); out = np.zeros(n); fs = np.geomspace(f0, f1, n); b = 1024
    for i in range(0, n, b):
        f = fs[i]; out[i:i + b] = filt(x[i:i + b], [max(f * (1 - q / 2), 60), min(f * (1 + q / 2), 18000)], 'band', 1)
    return out * np.sin(np.pi * t / d) ** 2 * g
def swell(d, g=1.0):
    n = int(d * SR); t = T(n); p = t / d
    x = filt(rng.standard_normal(n), 1800, 'high') * p ** 3
    return x * np.clip((d - t) / 0.03, 0, 1) * g
def tick(f=3400, g=1.0):
    n = int(.03 * SR); t = T(n)
    return (sine(f, n) * np.exp(-t * 260) + 0.35 * filt(rng.standard_normal(n), 5000, 'high') * np.exp(-t * 600)) * 0.25 * g
def pop(g=1.0):
    n = int(.12 * SR); t = T(n); f = 900 * (0.6 + 0.4 * np.exp(-t * 60))
    return sine(f, n) * np.exp(-t * 32) * 0.4 * g

# ---------- sidechain (kick-driven) ----------
sc = np.ones(N)
def duck(t0, depth=0.6, rel=0.13):
    i = int(t0 * SR); n = min(int(0.45 * SR), N - i)
    if n <= 0: return
    t = T(n); e = 1 - depth * np.exp(-t / rel) * np.minimum(t / 0.004 + 0.2, 1)
    sc[i:i + n] = np.minimum(sc[i:i + n], e)

# ================= ARRANGEMENT =================
beats = lambda b: b * BAR
# --- pad (whole piece)
for b, c in enumerate(PROG):
    t0 = beats(b); d = BAR + 0.5 if b < 9 else 2.2
    cut = (900 + 600 * b) if b < 2 else (2000 if b < 6 else 2800 if b < 8 else 2200)
    g = 0.8 if b < 2 else 0.5 if b < 6 else 0.6 if b < 8 else 0.55
    place(music, pad(c, d, cut), t0 - 0.05, g, rev=0.35)
# --- arp 16ths, filter opens through the intro
PAT = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 2]
for b, c in enumerate(PROG):
    notes = [m + 12 for m in CH[c]]
    for k in range(16):
        tt = beats(b) + k * 0.125
        if 15.5 <= tt < 16.0 or tt > 19.4: continue
        intro = min(tt / 4.0, 1.0)
        br = 700 + 3300 * intro ** 1.5 if b < 2 else (3600 if b < 8 else 3000)
        acc = 1.0 if k % 4 == 0 else 0.72
        g = (0.62 + 0.38 * intro) * acc * (0.85 if b >= 8 else 1.0) * (1 - 0.6 * max(0, (tt - 18.5) / 1.0))
        place(music, pluck(notes[PAT[k]], 0.11, bright=br, dark=600, dec=13), tt, 0.32 * g, pan=[-0.55, 0.55][k % 2], rev=0.18, dly=0.45)
# --- drums
for b in range(2, 10):
    for q in range(4):
        tt = beats(b) + q * BEAT
        if 15.5 <= tt < 16.0: continue
        last = b == 9
        if not last or q == 0:
            place(drums, kick(), tt, 0.95 if not last else 0.8); duck(tt, 0.62 if b < 8 else 0.5)
        if q % 2 == 1 and not last: place(drums, clap(), tt, 0.55, 0.0, rev=0.22)
        # offbeat hat
        if not (last and q > 2): place(drums, hat(dec=50), tt + 0.25, 0.75 if b < 6 else 0.9, 0.35)
        if b >= 6 and b < 8: place(drums, hat(dec=9), tt + 0.25, 0.32, -0.2, rev=0.1)  # open hat
        if b >= 4 and not last:
            for s in range(4):
                if s == 2: continue
                place(drums, shaker(), tt + s * 0.125 + (0.012 if s % 2 else 0), [0.9, 0.5, 0, 0.65][s], -0.35)
# intro rhythm hint (rim on beats 2-4 of bar 1) + pickup
for k, tt in enumerate([1.0, 1.75, 2.5, 3.0, 3.25, 3.5, 3.75]): place(drums, rim(), tt, 0.22 + 0.05 * k, [0.3, -0.3][k % 2], rev=0.3)
for k in range(4, 32):
    tt = k * 0.125
    if tt >= 2.0: place(drums, shaker(), tt, (0.35 if k % 2 == 0 else 0.2) * (tt / 4), 0.4)
# --- bass
for b in range(2, 10):
    c = PROG[b]; r = ROOT[c]
    if b == 9:
        n9 = bass_note(r, 1.9, bright=0.7); n9 *= np.exp(-T(len(n9)) * 1.4); place(bass, n9, beats(b), 0.7); continue
    step = 0.125 if b in (6, 7) else 0.25
    for k in range(int(BAR / step)):
        tt = beats(b) + k * step
        if 15.5 <= tt < 16.0: continue
        pos = (k * step) % 1.0
        m = r + (12 if (b >= 4 and abs(pos - 0.75) < 1e-6) else 0)
        place(bass, bass_note(m, step * 0.8, bright=1.2 if b in (6, 7) else 1.0), tt, 0.75)
# --- chord stabs at the peak
for b in (6, 7):
    for pos in (0.75, 1.75, 2.5, 3.25):
        tt = beats(b) + pos * BEAT
        for j, m in enumerate(CH[PROG[b]]): place(music, pluck(m + 12, 0.16, bright=2600, dark=700, dec=8), tt, 0.16, pan=[-0.6, 0.6, -0.3, 0.3][j], rev=0.3)
# --- lead hook (enters with the "connections" scene)
HOOK = {
    4: [(0, 76, .5), (.5, 79, .5), (1, 81, .75), (2, 79, .5), (2.5, 76, .5), (3, 74, 1)],
    5: [(0, 74, .5), (.5, 76, .5), (1, 79, .75), (2, 76, .5), (2.5, 74, .5), (3, 72, .9)],
    6: [(0, 79, .5), (.5, 81, .5), (1, 83, .75), (2, 81, .5), (2.5, 79, .5), (3, 76, 1)],
    7: [(0, 76, .5), (.5, 79, .5), (1, 81, 1.5), (2.75, 79, .25)],
    8: [(0, 84, .5), (.5, 83, .5), (1, 81, .75), (2, 79, .5), (2.5, 81, .5), (3, 76, 1)],
    9: [(0, 76, .75), (1, 79, .5), (1.5, 84, 2.4)],
}
for b, ph in HOOK.items():
    for pos, m, dur in ph:
        tt = beats(b) + pos * BEAT
        place(lead, lead_note(m, dur * BEAT * 0.92), tt, 0.62 if b != 9 else 0.55, pan=0.08, rev=0.28, dly=0.3)
        if b in (6, 7): place(lead, lead_note(m + 12, dur * BEAT * 0.9), tt, 0.12, pan=-0.25, rev=0.3)
# sub swell under the intro
n = int(4.2 * SR); t = T(n); place(bass, sine(note(29), n) * np.sin(np.pi * np.clip(t / 4.2, 0, 1)) ** 2 * 0.16, 0, 1)

# ================= SFX =================
ev = json.load(open('events3.json'))
place(fx, air(2.2, 300, 2400, 0.35), 0.0, 1, 0, rev=0.4)                       # breath-in as the bubble lights up
for i in range(3): place(fx, air(0.5, 2500, 5500, 0.18), 0.3 + i * 0.2, 1, [-0.3, 0.3, 0][i], rev=0.3)   # line reveals
for t0, p0 in ((3.35, -0.4), (7.35, 0.4), (11.35, -0.4), (15.15, 0.3)):        # scene transitions: soft air
    place(fx, air(0.9, 600, 4500, 0.45), t0, 1, p0, rev=0.35)
place(fx, swell(0.9, 0.22), 3.1, 1, 0, rev=0.3)                                 # into the groove
place(fx, swell(1.0, 0.25), 11.0, 1, 0, rev=0.3)                                # into the peak
place(fx, swell(0.5, 0.3), 15.5, 1, 0, rev=0.4)                                 # into the end card
last = -1
for e in ev['ticks']:                                                           # odometer
    if e['t'] - last < 0.028: continue
    last = e['t']; v = min(e['v'] / 30, 1)
    place(fx, tick(3000 + 900 * v), e['t'], 0.18 + 0.25 * (1 - v), rng.uniform(-.2, .2), rev=0.1)
for t0, m in zip(ev['links'], (88, 91, 93, 96)):                                 # connections land
    place(fx, bell(m, 1.4), t0, 0.55, [-0.5, 0.5, -0.5, 0.5][ev['links'].index(t0)], rev=0.45, dly=0.2)
for t0 in (5.3, 14.05):                                                          # odometer lands: glassy shimmer
    for k, m in enumerate((84, 88, 91, 96)): place(fx, bell(m, 2.2), t0 + k * 0.035, 0.42, (-1) ** k * 0.3, rev=0.55)
for k, m in enumerate((72, 76, 79, 84, 88)): place(fx, bell(m, 2.6), 16.25 + k * 0.05, 0.3, (-1) ** k * 0.4, rev=0.6)   # white reveal
place(fx, pop(), 17.3, 0.7, 0, rev=0.25)                                         # CTA arrives
for k, m in enumerate((91, 96)): place(fx, bell(m, 1.6), 18.38 + k * 0.06, 0.35, 0.2, rev=0.5)   # sheen
place(fx, tick(2400, 1.4), 19.2, 0.5, 0, rev=0.2)                                # CTA pulse

# ================= MIX =================
music *= sc; bass *= (0.25 + 0.75 * sc); lead *= (0.75 + 0.25 * sc)
# lift the intro (0-4 s) so the first seconds hook
ig = 1 + 0.65 * np.clip((4.0 - T(N)) / 0.25, 0, 1)
music *= ig; fx *= ig; drums[:, :int(4 * SR)] *= 1.5
# break: low-pass the music bus 15.5-16.0
i0, i1 = int(15.5 * SR), int(16.0 * SR)
for c in range(2):
    seg = music[c, i0 - 2048:i1 + 2048].copy(); dark = filt(seg, 700)
    w = np.ones(len(seg)); r = 2048; w[:r] = np.linspace(1, 0, r); w[-r:] = np.linspace(0, 1, r); w[r:-r] = 0
    music[c, i0 - 2048:i1 + 2048] = seg * w + dark * (1 - w)
# stereo ping-pong delay (dotted 8th)
D = int(0.375 * SR); dly = np.zeros((2, N)); src = filt(send_dly.sum(0) * 0.5, [300, 6000], 'band')
for k in range(1, 7):
    if k * D >= N: break
    dly[k % 2, k * D:] += src[:N - k * D] * (0.42 ** k)
# reverb
L = int(2.4 * SR); t = T(L); irs = []
for c in range(2):
    x = rng.standard_normal(L) * np.exp(-t * 2.6); x = filt(filt(x, 6500), 220, 'high')
    x[:int(0.018 * SR)] = 0; irs.append(x / np.sqrt(np.sum(x ** 2)))
rev = np.stack([fftconvolve(send_rev[c] + 0.4 * dly[c], irs[c])[:N] for c in range(2)])
mix = drums * 1.0 + bass * 0.55 + music * 0.95 + lead * 0.95 + fx * 0.8 + dly * 0.75 + rev * 0.7
mix = np.stack([filt(mix[c], 32, 'high') for c in range(2)])
# tonal balance: tame lows, add presence/air
mix = mix - 0.35 * np.stack([filt(mix[c], 110) for c in range(2)]) + 0.9 * np.stack([filt(mix[c], 3500, 'high') for c in range(2)]) + 0.5 * np.stack([filt(mix[c], 9000, 'high') for c in range(2)])
# widen: mid/side, side +45% above 300 Hz
mid = (mix[0] + mix[1]) / 2; side = (mix[0] - mix[1]) / 2; side = side + 0.45 * filt(side, 300, 'high')
mix = np.stack([mid + side, mid - side])
# gentle glue compression
env = np.sqrt(filt(np.mean(mix ** 2, 0), 6) + 1e-9); thr = np.percentile(env, 75)
g = np.minimum(1, (thr / env) ** (1 - 1 / 2.0)); mix *= filt(g, 12)
# fade in/out
f = np.ones(N); k = int(0.6 * SR); f[-k:] = np.linspace(1, 0, k) ** 1.6; f[:int(0.01 * SR)] = np.linspace(0, 1, int(0.01 * SR)); mix *= f

def limit(x, ceil):
    """lookahead peak limiter on the 4x-oversampled envelope (true-peak aware)"""
    up = np.abs(resample_poly(x, 4, 1, axis=1)).max(0).reshape(-1, 4).max(1)[:x.shape[1]]
    need = np.minimum(1, ceil / np.maximum(up, 1e-9))
    la = int(0.003 * SR); g = np.minimum.accumulate(np.lib.stride_tricks.sliding_window_view(np.pad(need, (0, la), constant_values=1), la + 1).min(1)[None, :], axis=0)[0]
    # release smoothing
    out = np.empty_like(g); cur = 1.0; rel = np.exp(-1 / (0.08 * SR))
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else g[i] + (cur - g[i]) * rel; out[i] = cur
    return x * out
meter = pyln.Meter(SR)
for _ in range(3):
    lufs = meter.integrated_loudness(mix.T); mix *= 10 ** ((-14.0 - lufs) / 20)
    mix = limit(mix, 10 ** (-1.2 / 20))
tp = 20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=1)).max())
print(f"LUFS {meter.integrated_loudness(mix.T):.2f}  true-peak {tp:.2f} dBTP")
wavfile.write('audio3.wav', SR, (np.clip(mix, -1, 1).T * 32767).astype(np.int16))
