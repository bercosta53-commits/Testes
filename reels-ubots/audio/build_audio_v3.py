"""Mixagem do Reels Ubots (monstro v3) com a trilha e os efeitos do projeto
Viacredi v1b (branch claude/intelligent-hamilton-clrvcq, viacredi/v1/audio/src):

  src/music2_b.mp3   trilha ElevenLabs Music, ~123 BPM, instrumental
  src/sfx/*.mp3      efeitos ElevenLabs (whoosh, tap, pop, knock, swell, slide, chime, type, page)

Mesmo tratamento do v1b: trilha com menos grave e intro abafada, ducking por
sidechain sob a voz, efeitos com o ataque alinhado ao evento visual, -14 LUFS.
Os tempos dos efeitos seguem o motion v3 (reel.js).

    python3 build_audio_v3.py  ->  mix_monstro_v3_-14LUFS.wav, mix_monstro_v3.m4a
"""
import os
import subprocess

VARIANT = os.environ.get('VARIANT', '')          # '' = versão completa (48,1 s) | 'site' = final com "Acesse o site" (45,6 s)
SITE = VARIANT == 'site'

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
SR = 48000
DUR = 45.6 if SITE else 48.1
BPM = 123

# onde o som "acontece" dentro do arquivo (igual ao v1b)
ONSET = {'whoosh': .45, 'tap': .034, 'pop': 0, 'knock': .17, 'swell': .31, 'slide': .16, 'chime': 0, 'type': 0, 'page': .23}
FILE = {'whoosh': 'whoosh_b', 'tap': 'tap_a', 'pop': 'pop_b', 'knock': 'knock_b', 'swell': 'swell_b',
        'slide': 'slide_a', 'chime': 'chime_b', 'type': 'type_a', 'page': 'page_b'}
T_CTX = 18.99                                # palavra "contexto" (mesmo cálculo de reel.js)

CUES = [
    (0.95, 'pop', 3),                       # ✦ no "IA" (o "plin": fora da calibração)
    (3.5, 'knock', -8), (3.5, 'whoosh', -17), (3.64, 'knock', -13),   # "robô": glitch (impacto sem agressividade)
    (6.1, 'whoosh', -12),                    # corte para o celular
    (7.0, 'pop', -7),                        # notificação no celular
    (8.1, 'whoosh', -6),                     # mergulho na tela → escuro (sem calibração: precisa de força)
    (8.75, 'pop', -9), (9.55, 'pop', -9),    # mensagens do robô / cliente
    (10.35, 'knock', -5),                    # "Não entendi": trava
    *[(t, 'tap', -11) for t in (10.75, 11.05, 11.35, 11.65)],   # Bancos, Cooperativas, Fintechs, Financeiras
    (12.0, 'swell', -15),                    # a luz entra com a Ubots (suave)
    (13.2, 'pop', -3), (13.95, 'pop', -1), (14.7, 'pop', -3),   # fluxo: cooperado, agente, time
    (16.0, 'whoosh', -12), (16.2, 'type', -17),                 # gerente digitando
    *[(t, 'whoosh', -20) for t in (17.55, 18.1, 18.65)],        # regras riscadas
    (T_CTX + 0.05, 'swell', -6),             # "contexto": a luz entra de novo
    (19.25, 'tap', -9),                      # 8 regras → 3 limites
    *[(t, 'slide', -15) for t in (19.95, 20.4, 20.85)],         # limites entram
    (21.0, 'pop', -9), (21.35, 'chime', -12),                   # card "Limites que nunca mudam"
    (21.85, 'slide', -10),                   # chat entra
    (22.6, 'pop', -7), (24.1, 'pop', -7), (25.5, 'tap', -10),   # Ana / agente / Escuta
    (26.2, 'whoosh', -12),                   # corte para a cozinha
    (28.45, 'whoosh', -13),                  # volta ao chat
    (28.5, 'pop', -7), (28.62, 'tap', -12), (28.7, 'tap', -10),  # "reformando a cozinha" / etiqueta / Contexto
    (28.95, 'pop', -7), (29.1, 'tap', -10),                     # oferta / Oferta
    (29.45, 'pop', -7), (29.5, 'tap', -10),                     # "Quero!" / Decisão
    (29.85, 'chime', -5),                    # crédito contratado
    (30.4, 'slide', -9), (31.25, 'tap', -7),                    # card Viacredi / "Caso real"
    (32.35, 'whoosh', -11), (33.2, 'pop', -9),                  # para o número / "Ainda na fase de testes"
    (34.65, 'slide', -13),                   # contagem fecha: marca-texto entra
    (35.7, 'whoosh', -13), (37.65, 'pop', -7),                  # câmera B / selo
    (38.9, 'whoosh', -11), (39.15, 'page', -6),                 # playbook / capa chega
    *[(t, 'page', -10) for t in (39.4, 39.9, 40.4)],            # páginas entram atrás da capa
    (41.6, 'whoosh', -13),                                      # CTA com a persona
    (45.1, 'slide', -9), (45.35, 'pop', -9), (45.65, 'chime', -4),  # tela final / botão ✓
]


# calibragem por tipo (dB), aplicada sobre o ganho de cada cue: os arquivos brutos têm níveis muito
# diferentes (tap e swell chegam a +2 dBFS; whoosh é ruído de banda larga). Trocas de cena e
# confirmações de tópico ficam bem mais discretas; o glitch do "robô" (3,5-3,8 s) fica de fora.
TRIM = {'whoosh': -9, 'tap': -9, 'pop': -3, 'chime': -3, 'slide': -4, 'type': -3, 'page': -3, 'knock': -2, 'swell': -3}
GLITCH = (3.4, 3.9)            # cues nesta janela e o mergulho (8,1 s) não levam calibração
DIVE = 8.1
PLIN = 0.95

if SITE:   # sem CTA da persona: o final é locução sobre a tela final
    CUES = [c for c in CUES if c[0] < 41.55] + [
        (41.6, 'slide', -9),             # tela final entra
        (42.05, 'pop', -9),              # selo do site aparece
        (43.55, 'chime', -5),            # assinatura ao dizer "Ubots"
    ]


def load(extra):
    cmd = ['ffmpeg', '-v', 'error', *extra, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
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
    N = int(DUR * SR)
    # 1) locução (tomada única, nos tempos originais)
    vo = load(['-i', os.path.join(HERE, 'locucao_site.mp3' if SITE else 'locucao_v4.mp3')])
    vo_bed = np.zeros((N, 2), np.float32); place(vo_bed, vo, 0)
    # 2) efeitos
    fx = np.zeros((N, 2), np.float32)
    cache = {}
    for t, s, gdb in CUES:
        n = FILE[s]
        if n not in cache:
            trim = ['-ss', '0.10', '-to', '0.33'] if s == 'tap' else []   # o "toque" tem 8 batidas: usa só a primeira
            af = 'afade=t=out:st=0.17:d=0.06' if trim else ('lowpass=f=5500,highpass=f=120' if s == 'whoosh' else 'anull')
            cache[n] = load([*trim, '-i', os.path.join(SRC, 'sfx', n + '.mp3'), '-af', af])
        trim = 0 if (GLITCH[0] <= t <= GLITCH[1] or abs(t - DIVE) < 0.05 or abs(t - PLIN) < 0.05) else TRIM[s]
        place(fx, cache[n], t - ONSET[s], gdb + trim)
    # queda grave que acompanha o mergulho na tela do celular (8,1 -> 8,6 s)
    n = int(0.55 * SR); tt = np.arange(n) / SR
    drop = np.sin(2 * np.pi * np.cumsum(150 * np.exp(-tt * 5) + 38) / SR) * np.exp(-tt * 4.5) * np.minimum(1, tt / 0.03)
    place(fx, np.stack([drop, drop], 1).astype(np.float32), DIVE + 0.1, -9)
    # 3) trilha: intro abafada sob o gancho; a volta cheia (7,35 s no arquivo) cai no fim do gancho (6,1 s)
    mpath = os.path.join(SRC, 'music2_b.mp3')
    m = load(['-i', mpath, '-af', 'highpass=f=45,lowshelf=f=130:g=-5']) * (10 ** (-8 / 20))
    mi = load(['-i', mpath, '-af', 'highpass=f=45,lowshelf=f=150:g=-11']) * (10 ** (-8 / 20))
    k0, k1 = int(6.9 * SR), int(7.35 * SR)
    w = np.zeros(len(m), np.float32); w[:k0] = 1; w[k0:k1] = np.linspace(1, 0, k1 - k0)
    m = mi * w[:, None] + m * (1 - w[:, None])
    AT = 6.1 - 7.35
    bar = 4 * 60 / BPM
    cut, xf = int(28.55 * SR), int(0.03 * SR)
    need = int((DUR - AT + 1.5) * SR)
    out = m[:cut].copy()
    loops = [m[cut - int(round(8 * bar * SR)):cut]]             # primeiro repete 8 compassos (menos repetitivo)
    while len(out) < need:
        seg = (loops.pop(0) if loops else m[cut - int(round(2 * bar * SR)):cut]).copy()
        seg[:xf] *= np.linspace(0, 1, xf)[:, None]
        out[-xf:] *= np.linspace(1, 0, xf)[:, None]; out[-xf:] += seg[:xf]
        out = np.concatenate([out, seg[xf:]])
    mus = np.zeros((N, 2), np.float32)
    place(mus, out, AT)
    # intimidade: trilha bem baixa no gancho e, depois, sempre discreta (~10 dB abaixo da voz).
    # a subida é lenta (6,3 -> 11,5 s, curva suave) para não "saltar" no zoom do celular;
    # um leve realce (+3 dB) só no fechamento, na tela final.
    t = np.arange(N) / SR
    db = np.full(N, -16.0, np.float32)
    k = np.clip((t - 6.3) / (11.5 - 6.3), 0, 1)
    db += (-8.0 - (-16.0)) * (0.5 - 0.5 * np.cos(np.pi * k))
    db += 3.0 * np.clip((t - (DUR - 3.7)) / 0.8, 0, 1)
    lvl = (10 ** (db / 20)).astype(np.float32)
    mus *= lvl[:, None]
    fo = int(1.2 * SR); mus[-fo:] *= np.linspace(1, 0, fo)[:, None]
    tmp = os.path.join(HERE, '.tmp'); os.makedirs(tmp, exist_ok=True)
    for name, arr in (('vo', vo_bed), ('fx', fx), ('mus', mus)):
        save(os.path.join(tmp, name + '.wav'), arr)
    # 4) ducking por sidechain + -14 LUFS + limitador (igual ao v1b)
    pre = os.path.join(tmp, 'premix.wav')
    graph = ('[0:a]highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2dB,asplit[vo][key];'
             '[1:a][key]sidechaincompress=threshold=0.04:ratio=3:attack=40:release=600:makeup=1[mus];'
             '[vo][mus][2:a]amix=inputs=3:normalize=0:duration=first[out]')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(tmp, 'vo.wav'), '-i', os.path.join(tmp, 'mus.wav'),
                    '-i', os.path.join(tmp, 'fx.wav'), '-filter_complex', graph, '-map', '[out]', '-c:a', 'pcm_f32le', pre], check=True)
    meas = subprocess.run(['ffmpeg', '-v', 'info', '-i', pre, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float([l for l in meas.splitlines() if l.strip().startswith('I:')][-1].split()[1])
    gain = -14.0 - I
    tag = '_site' if SITE else '_v3'
    final = os.path.join(HERE, f'mix_monstro{tag}_-14LUFS.wav')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', pre, '-af',
                    f'volume={gain:.2f}dB,alimiter=limit=0.84:attack=5:release=60:level=disabled',
                    '-c:a', 'pcm_s16le', '-ar', str(SR), final], check=True)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', final, '-c:a', 'aac', '-b:a', '256k', os.path.join(HERE, f'mix_monstro{tag}.m4a')], check=True)
    print(f'trilha {len(out) / SR:.1f}s a partir de {AT:+.2f}s | loudness antes {I:.1f} LUFS, ganho {gain:+.1f} dB')


if __name__ == '__main__':
    run()
