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

W = [("Crédito",0.147,0.48),("pré-aprovado.",0.56,1.48),("Oferta",1.6,2),("disparada",2.16,2.88),("no",2.92,2.96),("WhatsApp.",3.24,3.72),
("Só",4,4.08),("que",4.16,4.2),("agente",4.24,4.64),("de",4.72,4.8),("IA",4.88,5.04),("cheio",5.28,5.52),("de",5.6,5.68),("regra",5.76,6.08),("fala",6.16,6.32),("como",6.4,6.56),("robô.",6.68,7.28),
("Na",7.664,7.68),("Viacredi",7.76,8.3),("a",8.32,8.36),("saída",8.4,8.72),("foi",8.76,8.96),("menos",9.08,9.28),("regra",9.36,9.76),("e",9.8,9.84),("mais",9.92,10.08),("contexto.",10.16,10.96),
("Eles",11.264,11.44),("escreveram",11.52,12),("o",12.04,12.08),("papel",12.16,12.4),("do",12.44,12.48),("agente:",12.56,13.2),("objetivo,",13.44,14.08),("público,",14.12,14.64),("oferta,",14.76,15.52),("tom.",15.64,15.84),
("E",16.309,16.32),("a",16.373,16.427),("conversa",16.48,16.96),("passou",17.04,17.28),("a",17.307,17.333),("seguir",17.36,17.68),("o",17.72,17.76),("cooperado.",17.84,18.4),
("Resultado:",19.2,19.6),("mais",19.64,19.76),("de",19.84,20),("150",20.08,20.8),("mil",20.96,21.12),("reais",21.2,21.44),("em",21.52,21.6),("crédito,",21.68,22.24),("ainda",22.4,22.64),("na",22.72,22.8),("fase",22.84,23.04),("de",23.12,23.2),("testes.",23.28,23.96),
("O",24.224,24.24),("método",24.28,24.64),("está",24.72,24.84),("no",24.88,24.96),("Playbook",25.08,25.44),("Ubots",25.6,26.08),("Agentes",26.16,26.64),("de",26.72,26.8),("IA.",26.88,27.04),("Baixe",27.36,27.6),("grátis.",27.68,28.32)]
# (v3) tomada única do ElevenLabs com as pausas na própria interpretação; transcrição Scribe acima
SIGW = []

# blocos: (arquivo, ini, fim na origem, respiro antes no vídeo)
BLOCKS = [
    # locução v3: uma tomada só, velocidade natural, pausas geradas na interpretação (sem emendas)
    ('vo3_b.mp3', 0.0, 28.42, 0.30),
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

words = [(w, place('vo3_b.mp3', a)) for w, a, _ in W]

# blocos de legenda: (primeira, última palavra, oculta?)
CH = [(0,1,False),(2,5,False),(6,16,False),(17,21,False),(22,26,True),(27,32,False),(33,36,True),(37,44,False),(45,52,True),(53,57,True),(58,66,True),(67,68,True)]
chunks = []
for a, b, hide in CH:
    ws = words[a:b + 1]
    chunks.append({'t0': ws[0][1], 't1': round(ws[-1][1] + 0.45, 3), 'text': ' '.join(w for w, _ in ws),
                   'words': [x for _, x in ws], 'hide': hide})

MUSIC_SLAM = 7.35  # volta cheia da trilha v2 (music2_b) — alinhada ao "Na Viacredi"
music_at = round(place('vo3_b.mp3', 7.664) - 0.12 - MUSIC_SLAM, 3)   # volta cheia no "Na Viacredi"
DUR = round(END_VO + 2.0, 1)   # 30-31 s, com tempo de leitura no CTA

json.dump({'tempo': TEMPO, 'dur': DUR, 'end_vo': round(END_VO, 3), 'music': {'file': 'music2_b.mp3', 'at': music_at},
           'segments': segs, 'chunks': chunks}, open(os.path.join(HERE, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, '..', 'vo.js'), 'w').write(
    "// Gerado por audio/build_timeline.py (transcrição ElevenLabs Scribe + respiros). Não editar à mão.\n"
    "const VO = " + json.dumps([[c['t0'], c['t1'], c['text'], {'hide': c['hide'], 'words': c['words']}] for c in chunks], ensure_ascii=False) + ";\n"
    f"const DUR = {DUR};\n")
for i, c in enumerate(chunks):
    print(i, f"{c['t0']:6.2f}-{c['t1']:6.2f}", ('(oculto) ' if c['hide'] else '') + c['text'], [round(x, 2) for x in c['words']])
print('blocos:', [(g['at'], round(g['at'] + (g['src1'] - g['src0']) / TEMPO, 2)) for g in segs], 'fim voz', round(END_VO, 2), 'trilha começa em', music_at)
