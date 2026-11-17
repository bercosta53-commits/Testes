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

W = [("Como",0.22,0.24),("vender",0.347,0.56),("crédito",0.64,1.04),("no",1.08,1.12),("WhatsApp",1.2,1.68),("com",1.76,1.84),("agentes",2.04,2.4),("de",2.48,2.56),("IA.",2.72,3.32),
("Chegou",3.806,4),("o",4.04,4.08),("Playbook",4.16,4.56),("Ubots.",4.64,5.36),
("Ele",5.728,5.76),("mostra",5.84,6.16),("como",6.24,6.4),("escrever",6.48,6.8),("o",6.84,6.88),("papel",6.92,7.2),("do",7.24,7.28),("agente,",7.36,7.92),("quais",7.96,8.16),("limites",8.24,8.72),("nunca",8.8,9.12),("mudam",9.2,9.6),("e",9.68,9.76),("como",9.84,10.08),("começar",10.2,10.56),("com",10.68,10.8),("poucos",10.853,11.12),("disparos.",11.24,11.96),
("E",12.352,12.4),("tudo",12.48,12.72),("saiu",12.8,13.04),("de",13.12,13.173),("um",13.227,13.28),("caso",13.36,13.52),("real.",13.6,14.24),
("Na",14.28,14.32),("Viacredi",14.4,14.92),("o",14.94,14.96),("agente",15.04,15.28),("trocou",15.36,15.68),("regra",15.8,16.08),("por",16.16,16.24),("contexto,",16.52,16.96),
("e",17,17.04),("a",17.067,17.093),("conversa",17.12,17.68),("passou",17.76,17.92),("a",17.96,18),("seguir",18.08,18.4),("o",18.44,18.48),("cooperado.",18.52,19.36),
("Resultado:",19.85,20.24),("mais",20.28,20.4),("de",20.48,20.64),("150",20.72,21.44),("mil",21.68,21.76),("reais",21.84,22.16),("em",22.24,22.32),("crédito,",22.4,22.96),("ainda",23.12,23.36),("na",23.44,23.52),("fase",23.56,23.76),("de",23.84,23.92),("testes.",24,24.8),
("Baixe",24.88,25.12),("grátis.",25.2,25.76)]
# vídeo 1B v3: tomada única voc_a ("IA" escrito "í-á": o "i" não se funde mais com o "de"), tempos Scribe acima
SIGW = []

# blocos: (arquivo, ini, fim na origem, respiro antes no vídeo)
BLOCKS = [
    ('voc_a.mp3', 0.0, 25.8, 1.30),   # 1,3 s de abertura só com imagem e trilha
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

words = [(w, place('voc_a.mp3', a)) for w, a, _ in W]

# blocos de legenda: (primeira, última palavra, oculta?)
CH = [(0,8,True),(9,12,True),(13,30,True),(31,37,False),(38,45,True),(46,53,False),(54,61,True),(62,66,True),(67,68,True)]
chunks = []
for a, b, hide in CH:
    ws = words[a:b + 1]
    chunks.append({'t0': ws[0][1], 't1': round(ws[-1][1] + 0.45, 3), 'text': ' '.join(w for w, _ in ws),
                   'words': [x for _, x in ws], 'hide': hide})

MUSIC_SLAM = 7.35  # volta cheia da trilha v2 (music2_b) — alinhada ao "Na Viacredi"
music_at = round(place('voc_a.mp3', 3.806) - 0.1 - MUSIC_SLAM, 3)   # volta cheia no "Chegou o Playbook Ubots"
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
