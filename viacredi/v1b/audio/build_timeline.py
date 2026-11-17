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

W = [("Como",0.22,0.24),("vender",0.347,0.56),("crédito",0.64,1.04),("no",1.067,1.093),("WhatsApp",1.12,1.68),("com",1.72,1.76),("agentes",1.84,2.4),("de",2.44,2.48),("IA.",2.56,3.04),
("Chegou",3.36,3.6),("o",3.68,3.76),("Playbook",3.88,4.24),("Ubots.",4.32,5.08),
("Ele",5.488,5.52),("mostra",5.6,5.92),("como",6,6.16),("escrever",6.24,6.56),("o",6.6,6.64),("papel",6.68,6.96),("do",7,7.04),("agente,",7.12,7.68),("quais",7.72,7.92),("limites",8,8.48),("nunca",8.56,8.8),("mudam",8.88,9.36),("e",9.44,9.52),("como",9.6,9.76),("começar",9.88,10.24),("com",10.36,10.48),("poucos",10.533,10.8),("disparos.",10.92,11.76),
("E",11.96,12),("tudo",12.04,12.32),("saiu",12.373,12.56),("de",12.6,12.64),("um",12.68,12.72),("caso",12.84,13.04),("real.",13.24,13.84),
("Na",13.88,13.92),("Viacredi",14,14.56),("o",14.64,14.68),("agente",14.72,15.04),("trocou",15.12,15.44),("regra",15.52,15.92),("por",16,16.08),("contexto,",16.36,16.827),
("e",16.853,16.88),("a",16.92,16.96),("conversa",17.04,17.44),("passou",17.52,17.72),("a",17.76,17.84),("seguir",17.92,18.08),("o",18.12,18.16),("cooperado.",18.24,19.04),
("Resultado:",19.12,20),("mais",20.08,20.24),("de",20.32,20.48),("150",20.56,21.28),("mil",21.52,21.6),("reais",21.68,22),("em",22.08,22.16),("crédito,",22.24,22.907),("ainda",23.013,23.2),("na",23.28,23.36),("fase",23.44,23.6),("de",23.68,23.76),("testes.",23.88,24.56),
("Baixe",24.64,24.88),("grátis.",24.96,25.68)]
# vídeo 1B: tomada única (vob_b), transcrição Scribe acima
SIGW = []

# blocos: (arquivo, ini, fim na origem, respiro antes no vídeo)
BLOCKS = [
    ('vob_b.mp3', 0.0, 25.8, 1.30),   # 1,3 s de abertura só com imagem e trilha
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

words = [(w, place('vob_b.mp3', a)) for w, a, _ in W]

# blocos de legenda: (primeira, última palavra, oculta?)
CH = [(0,8,True),(9,12,True),(13,30,True),(31,37,False),(38,45,True),(46,53,False),(54,61,True),(62,66,True),(67,68,True)]
chunks = []
for a, b, hide in CH:
    ws = words[a:b + 1]
    chunks.append({'t0': ws[0][1], 't1': round(ws[-1][1] + 0.45, 3), 'text': ' '.join(w for w, _ in ws),
                   'words': [x for _, x in ws], 'hide': hide})

MUSIC_SLAM = 7.35  # volta cheia da trilha v2 (music2_b) — alinhada ao "Na Viacredi"
music_at = round(place('vob_b.mp3', 3.36) - 0.1 - MUSIC_SLAM, 3)   # volta cheia no "Chegou o Playbook Ubots"   # volta cheia no "Na Viacredi"
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
