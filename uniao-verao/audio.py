"""Monta o áudio do filme de 30 s.

1. Recorta a locução (assets/audio/locucao-*.mp3, ver VOICES) frase a frase e
   reposiciona cada frase na janela de tempo do roteiro V3.
2. Se existir uma trilha em assets/audio/trilha.(wav|mp3|m4a|aif|aiff|flac),
   mistura a trilha por baixo da voz com ducking suave e fade final.

Saídas: build/locucao_30s.wav e build/mix.wav (48 kHz, estéreo).

    python3 audio.py [--music-gain-db -16] [--music-offset 0]
"""
import argparse
import glob
import json
import os
import subprocess

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
DUR = 30.0

# Frases da locução: (texto, início da fala no arquivo, fim da fala, onde a fala começa no filme).
# Tempos medidos com detecção de silêncio + transcrição com marcação de palavras.
VOICES = {
    # ElevenLabs "Ana Alice — Friendly, Clear" (voz atual)
    "ana": ("assets/audio/locucao-ana-alice.mp3", [
        ("Já imaginou ser sócio do União?",                     0.000,  2.077,  0.30),
        ("O verão tem encontro marcado no União.",              2.479,  4.800,  3.75),
        ("Tem dias de piscina, de tênis, de aproveitar o sol.", 5.200,  8.708,  6.90),
        ("Tem amigos por perto e tempo de qualidade em família.", 9.202, 12.378, 11.45),
        ("E você pode fazer parte de tudo isso.",               12.782, 15.466, 15.70),
        ("Quatro sedes. Muitos jeitos de viver o União.",       15.941, 19.176, 19.00),
        ("O próximo encontro pode ser o seu.",                  19.574, 21.652, 23.75),
        ("Seja sócio do União.",                                21.906, 23.497, 26.03),
        ("Clique e venha fazer parte!",                         23.827, 25.450, 27.80),
    ]),
    # ElevenLabs "Sofia — Natural, Expressive" (versão anterior)
    "sofia": ("assets/audio/locucao-sofia.mp3", [
        ("Já imaginou ser sócio do União?",                     0.000,  2.164,  0.30),
        ("O verão tem encontro marcado no União.",              3.025,  5.238,  3.75),
        ("Tem dias de piscina, de tênis, de aproveitar o sol.", 5.594,  8.892,  6.90),
        ("Tem amigos por perto e tempo de qualidade em família.", 9.224, 12.374, 11.45),
        ("E você pode fazer parte de tudo isso.",               12.622, 15.100, 15.70),
        ("Quatro sedes. Muitos jeitos de viver o União.",       15.454, 18.729, 19.00),
        ("O próximo encontro pode ser o seu.",                  19.013, 20.778, 24.05),
        ("Seja sócio do União.",                                21.045, 22.450, 26.03),
        ("Clique e venha fazer parte!",                         22.674, 24.610, 27.56),
    ]),
}

# Trilha (assets/audio/trilha.wav, 117,5 BPM). A grade de tempos é BEAT0 + n·BEAT.
# O arranjo original resolve no acorde final em 24,5 s, quando o CTA mal começou.
# Repetimos um compasso inteiro (compasso 11, muito semelhante ao vizinho) para que o
# acorde de resolução caia em 26,54 s, junto de "Seja sócio do União", e a cauda dele
# sustente o fechamento até 30 s.
BEAT, BEAT0 = 0.510839, -0.0232
REPEAT_BAR = (BEAT0 + 40 * BEAT, BEAT0 + 44 * BEAT)   # 20,41–22,45 s, inserido logo depois dele
SPLICE_XFADE = 0.02
PRE, POST = 0.06, 0.14   # respiro antes/depois de cada recorte (s)
EDGE_FADE = 0.012        # micro-fade nas bordas do recorte


def decode(path, channels):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", str(channels), "-ar", str(SR), "-"],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, channels).copy()


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", str(x.shape[1]), "-ar", str(SR), "-i", "-",
         "-c:a", "pcm_s24le", path], input=x.astype(np.float32).tobytes(), check=True)


def fade(n, kind):
    r = np.linspace(0, 1, n, dtype=np.float32)
    return r if kind == "in" else r[::-1]


def build_voice(voz):
    path, PHRASES = VOICES[voz]
    src = decode(os.path.join(HERE, path), 1)[:, 0]
    out = np.zeros(int(DUR * SR), np.float32)
    timeline = []
    for text, a, b, at in PHRASES:
        s0, s1 = max(0, a - PRE), min(len(src) / SR, b + POST)
        seg = src[int(s0 * SR):int(s1 * SR)].copy()
        nf = int(EDGE_FADE * SR)
        seg[:nf] *= fade(nf, "in")
        seg[-nf:] *= fade(nf, "out")
        start = int((at - (a - s0)) * SR)
        end = min(len(out), start + len(seg))
        out[start:end] += seg[:end - start]
        timeline.append({"text": text, "start": round(at, 3), "end": round(at + (b - a), 3)})
    with open(os.path.join(HERE, "build/locucao_timeline.json"), "w") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)
    return out


def envelope(x, attack=0.03, release=0.35):
    """Envelope de amplitude (seguidor de pico) para o ducking."""
    a, r = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    env = np.zeros_like(x)
    lvl = 0.0
    ax = np.abs(x)
    for i in range(0, len(x), 64):           # bloco de 64 amostras é suficiente
        v = ax[i:i + 64].max()
        lvl = a * lvl + (1 - a) * v if v > lvl else r * lvl + (1 - r) * v
        env[i:i + 64] = lvl
    return env


# Efeitos sonoros (ElevenLabs, assets/audio/sfx). Cada entrada:
# (arquivo, tempo no filme do ponto de sincronia, ganho dB, velocidade, pan inicial→final).
# O ponto de sincronia é o pico do som (whoosh/swell) ou o ataque (splash, raquete, clique).
B = lambda n: BEAT0 + n * BEAT
SFX_FILES = {  # arquivo, âncora (s dentro do arquivo), trecho útil (s)
    "whoosh": ("whoosh.mp3", 0.40, 1.15),
    "swell": ("zoom-verao.mp3", 0.34, 1.10),
    "piscina": ("piscina.mp3", 0.02, 1.90),
    "tenis": ("tenis.mp3", 0.07, 0.60),
    "clique": ("clique.mp3", 0.02, 0.95),
}
L2R, R2L, MID = (-0.7, 0.7), (0.7, -0.7), (0.0, 0.0)
SFX = [
    # whoosh só nos 4 momentos-chave, discreto; as demais transições ficam com música e voz
    ("whoosh", B(7), -19, 1.00, R2L),          # gancho → "verão"
    ("swell", 4.30, -6, 1.00, MID),            # zoom atravessando a letra
    ("piscina", B(15) - 0.02, -9, 1.00, MID),  # mergulho
    ("tenis", B(16) + 0.06, -8, 1.00, (0.25, 0.25)),  # tríptico do tênis
    ("whoosh", B(30), -20, 0.85, MID),         # → mural (janela)
    ("whoosh", B(37), -20, 1.00, R2L),         # → sedes (Alto Petrópolis)
    ("whoosh", B(51), -17, 0.95, MID),         # → hero "Seja sócio"
    ("clique", 28.10, -6, 1.00, (0.15, 0.15)), # cursor clica no botão
]


def build_sfx():
    out = np.zeros((int(DUR * SR), 2), np.float32)
    cache = {}
    for name, at, gain_db, speed, (p0, p1) in SFX:
        fname, anchor, length = SFX_FILES[name]
        if fname not in cache:
            x = decode(os.path.join(HERE, "assets/audio/sfx", fname), 2)
            cache[fname] = x / max(1e-6, np.abs(x).max())       # pico em 0 dBFS antes do ganho
        x = cache[fname][:int(length * SR)]
        if speed != 1.0:                                         # variação de altura/velocidade
            n = int(len(x) / speed)
            idx = np.linspace(0, len(x) - 1, n)
            x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1).astype(np.float32)
        nf = int(0.12 * SR)
        x[-nf:] *= np.linspace(1, 0, nf, dtype=np.float32)[:, None] ** 2
        pan = np.linspace(p0, p1, len(x), dtype=np.float32)      # varredura estéreo (pan de potência constante)
        ang = (pan + 1) * np.pi / 4
        x = x * np.stack([np.cos(ang), np.sin(ang)], 1) * np.sqrt(2)
        start = int((at - anchor / speed) * SR)
        a, b = max(0, start), min(len(out), start + len(x))
        out[a:b] += x[a - start:b - start] * 10 ** (gain_db / 20)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voz", choices=sorted(VOICES), default="ana", help="locução a usar")
    ap.add_argument("--music-gain-db", type=float, default=-11.0, help="nível da trilha sem voz")
    ap.add_argument("--duck-db", type=float, default=-6.0, help="redução extra da trilha sob a voz")
    ap.add_argument("--lufs", type=float, default=-14.0, help="loudness integrado do mix final")
    ap.add_argument("--no-sfx", action="store_true", help="mix sem efeitos sonoros")
    ap.add_argument("--sfx-db", type=float, default=0.0, help="ajuste geral dos efeitos (dB)")
    ap.add_argument("--no-bar-repeat", action="store_true", help="usa a trilha sem a repetição de compasso")
    ap.add_argument("--music-offset", type=float, default=0.0, help="segundos a pular no início da trilha")
    args = ap.parse_args()
    os.makedirs(os.path.join(HERE, "build"), exist_ok=True)

    voice = build_voice(args.voz)
    voice *= 10 ** (-1.0 / 20) / max(1e-6, np.abs(voice).max())        # pico da voz em -1 dBFS
    write_wav(os.path.join(HERE, "build/locucao_30s.wav"), np.stack([voice, voice], 1))

    tracks = [p for ext in ("wav", "mp3", "m4a", "aif", "aiff", "flac")
              for p in glob.glob(os.path.join(HERE, f"assets/audio/trilha*.{ext}"))]
    if not tracks:
        print("Sem trilha em assets/audio/trilha.* — mix.wav = só locução.")
        write_wav(os.path.join(HERE, "build/mix.wav"), np.stack([voice, voice], 1) * 0.9)
        return

    music = decode(tracks[0], 2)
    if not args.no_bar_repeat:
        a, b = (int(x * SR) for x in REPEAT_BAR)
        head, bar, rest = music[:b], music[a:b].copy(), music[b:]
        x = int(SPLICE_XFADE * SR)
        ramp = np.sqrt(np.linspace(0, 1, x, dtype=np.float32))[:, None]
        for left, right in ((head, bar), (bar, rest)):        # crossfade de potência constante nas emendas
            right[:x] = right[:x] * ramp + left[-x:] * ramp[::-1]
        music = np.concatenate([head[:-x], bar[:-x], rest])
    music = music[int(args.music_offset * SR):]
    n = int(DUR * SR)
    if len(music) < n:
        music = np.pad(music, ((0, n - len(music)), (0, 0)))
    music = music[:n]
    music /= max(1e-6, np.sqrt((music ** 2).mean()) / 0.25)        # normaliza RMS antes do ganho
    g = 10 ** (args.music_gain_db / 20)
    env = envelope(voice)
    duck = 10 ** (args.duck_db * np.clip(env / 0.08, 0, 1) / 20)
    tail = np.ones(n, np.float32)
    nf = int(0.6 * SR)
    tail[-nf:] = np.linspace(1, 0, nf) ** 1.5                         # fade final de 0,6 s
    mix = music * (g * duck * tail)[:, None] + voice[:, None] * 0.92
    if not args.no_sfx:
        mix = mix + build_sfx() * 10 ** (args.sfx_db / 20)
    raw = os.path.join(HERE, "build/mix_raw.wav")
    write_wav(raw, mix / max(1.0, np.abs(mix).max()))
    loudnorm(raw, os.path.join(HERE, "build/mix.wav"), args.lufs)
    print(f"Mix com trilha: {os.path.basename(tracks[0])}")


def loudnorm(src, dst, lufs):
    """Normalização EBU R128 em duas passagens (modo linear, sem compressão)."""
    f = f"loudnorm=I={lufs}:TP=-1.5:LRA=11"
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", f + ":print_format=json", "-f", "null", "-"],
                         capture_output=True, text=True, check=True).stderr
    m = json.loads(err[err.rindex("{"):err.rindex("}") + 1])
    f2 = (f + f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", f2, "-ar", str(SR), "-c:a", "pcm_s24le", dst], check=True)
    print(f"Loudness: {m['input_i']} LUFS -> {lufs} LUFS (pico real ≤ -1,5 dBTP)")


if __name__ == "__main__":
    main()
