"""Monta a linha do tempo da locução v2: blocos, velocidade, respiros e tempo de cada palavra.

Fontes (ElevenLabs):
  src/vo2_mateus_a.mp3  locução principal, voz Mateus, eleven_v4, [upbeat] [confident]
  src/sig_a.mp3         assinatura "O método está no Playbook Ubots Agentes de IA. Baixe grátis."
Tempos das palavras: transcrição Scribe da locução principal; na assinatura, distribuídos
dentro dos trechos de fala medidos (as legendas do CTA ficam ocultas).
Saída: timeline.json (usado por mix.py) e ../vo.js (usado pelas cenas).
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPO = 1.0  # velocidade natural (acelerar prejudicava a leitura)

W = [("Como",0.147,0.16),("ofertar",0.24,0.56),("crédito",0.64,1.04),("no",1.12,1.16),("WhatsApp",1.2,1.76),("com",1.84,1.92),("agentes",2.12,2.48),("de",2.56,2.72),("IA.",2.8,3.16),("Chegou",3.84,4.08),("o",4.16,4.24),("Playbook",4.36,4.64),("Ubots.",4.72,5.52),("Ele",5.888,5.92),("mostra",6,6.32),("como",6.48,6.64),("escrever",6.72,7.04),("o",7.08,7.12),("papel",7.16,7.44),("do",7.48,7.52),("agente,",7.6,8.16),("quais",8.2,8.4),("limites",8.48,8.96),("nunca",9.04,9.28),("mudam",9.44,9.76),("e",9.92,10),("como",10.08,10.24),("começar",10.32,10.72),("com",10.8,10.88),("poucos",11.04,11.36),("disparos.",11.48,12.16),("E",12.384,12.4),("tudo",12.64,12.88),("saiu",12.96,13.2),("de",13.24,13.28),("um",13.32,13.36),("caso",13.44,13.64),("real.",13.68,14.24),("Na",14.4,14.48),("Viacredi",14.56,15.12),("o",15.2,15.28),("agente",15.36,15.6),("trocou",15.68,16),("regra",16.08,16.32),("por",16.4,16.48),("contexto,",16.56,17.2),("e",17.36,17.44),("a",17.48,17.52),("conversa",17.6,18),("passou",18.08,18.32),("a",18.36,18.4),("seguir",18.48,18.72),("o",18.8,18.84),("cooperado.",18.88,19.44),("Resultado:",20.16,20.56),("mais",20.6,20.72),("de",20.8,20.96),("150",21.04,21.76),("mil",22,22.16),("reais",22.24,22.56),("em",22.64,22.72),("crédito,",22.8,23.36),("ainda",23.52,23.76),("na",23.8,23.84),("fase",23.92,24.16),("de",24.2,24.24),("testes.",24.32,24.96),("Baixe",25.26,25.44),("grátis.",25.52,26.32)]
# vídeo 1B v4: "Como ofertar..." · tomada única vod_b (sem v3: voc_a) ("IA" escrito "í-á": o "i" não se funde mais com o "de"), tempos Scribe acima
SIGW = []

# blocos: (arquivo, ini, fim na origem, respiro antes no vídeo)
BLOCKS = [
    ('vod_b.mp3', 0.0, 26.4, 1.10),   # 1,3 s de abertura só com imagem e trilha
]

segs = []
t = 0.0
for f, a, b, gap in BLOCKS:
    t += gap
    segs.append({'file': f, 'src0': a, 'src1': b, 'at': round(t, 3)})
    t += (b - a) / TEMPO
END_VO = t

def place(f, s):
    for g in segs:
        if g['file'] == f and g['src0'] <= s < g['src1'] + 1e-6:
            return round(g['at'] + (s - g['src0']) / TEMPO, 3)
    raise ValueError((f, s))

words = [(w, place('vod_b.mp3', a)) for w, a, _ in W]

# blocos de legenda: (primeira, última palavra, oculta?)
CH = [(0,8,True),(9,12,True),(13,30,True),(31,37,False),(38,45,True),(46,53,False),(54,61,True),(62,66,True),(67,68,True)]
chunks = []
for a, b, hide in CH:
    ws = words[a:b + 1]
    chunks.append({'t0': ws[0][1], 't1': round(ws[-1][1] + 0.45, 3), 'text': ' '.join(w for w, _ in ws),
                   'words': [x for _, x in ws], 'hide': hide})

MUSIC_SLAM = 7.35  # volta cheia da trilha v2 (music2_b) — alinhada ao "Na Viacredi"
music_at = round(place('vod_b.mp3', 3.84) - 0.1 - MUSIC_SLAM, 3)   # volta cheia no "Chegou o Playbook Ubots"
DUR = 30.4

json.dump({'tempo': TEMPO, 'dur': DUR, 'end_vo': round(END_VO, 3), 'music': {'file': 'music2_b.mp3', 'at': music_at},
           'segments': segs, 'chunks': chunks}, open(os.path.join(HERE, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, '..', 'vo.js'), 'w').write(
    "// Gerado por audio/build_timeline.py (transcrição ElevenLabs Scribe + respiros). Não editar à mão.\n"
    "const VO = " + json.dumps([[c['t0'], c['t1'], c['text'], {'hide': c['hide'], 'words': c['words']}] for c in chunks], ensure_ascii=False) + ";\n"
    f"const DUR = {DUR};\n")
for i, c in enumerate(chunks):
    print(i, f"{c['t0']:6.2f}-{c['t1']:6.2f}", ('(oculto) ' if c['hide'] else '') + c['text'], [round(x, 2) for x in c['words']])
print('blocos:', [(g['at'], round(g['at'] + (g['src1'] - g['src0']) / TEMPO, 2)) for g in segs], 'fim voz', round(END_VO, 2), 'trilha começa em', music_at)
