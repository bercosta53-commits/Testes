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
TEMPO = 1.05  # locução 5% mais rápida, tom preservado (atempo)

W = [("Crédito",0.147,0.48),("pré-aprovado.",0.56,1.48),("Oferta",1.6,2.08),("disparada",2.24,2.88),("no",2.96,3),("WhatsApp.",3.04,3.72),
("Só",3.92,4),("que",4.04,4.08),("agente",4.16,4.48),("de",4.52,4.56),("IA",4.64,4.96),("cheio",5.04,5.36),("de",5.44,5.48),("regra",5.52,5.92),("fala",6,6.24),("como",6.32,6.4),("robô.",6.48,7.2),
("Na",7.24,7.28),("Viacredi",7.36,7.893),("a",7.92,8),("saída",8.08,8.32),("foi",8.36,8.56),("menos",8.68,8.88),("regra",8.96,9.36),("e",9.4,9.44),("mais",9.52,9.68),("contexto.",9.76,10.587),
("Eles",10.613,10.8),("escreveram",10.88,11.36),("o",11.4,11.44),("papel",11.52,11.76),("do",11.8,11.84),("agente:",11.92,12.56),("objetivo,",12.8,13.44),("público,",13.52,14),("oferta,",14.12,14.8),("tom.",14.96,15.44),
("E",15.467,15.493),("a",15.52,15.56),("conversa",15.6,16.08),("passou",16.16,16.373),("a",16.427,16.48),("seguir",16.56,16.8),("o",16.84,16.88),("cooperado.",16.92,17.68),
("Resultado:",17.96,18.56),("mais",18.6,18.8),("de",18.92,19.04),("150",19.16,19.76),("mil",20,20.16),("reais",20.24,20.48),("em",20.56,20.64),("crédito,",20.72,21.28),("ainda",21.4,21.6),("na",21.68,21.76),("fase",21.84,22),("de",22.08,22.16),("testes.",22.28,22.907)]

# assinatura: palavras distribuídas nos trechos de fala medidos
SIG1 = "O método está no Playbook Ubots Agentes de IA.".split()
SIG2 = "Baixe grátis.".split()
def spread(words, a, b):
    tot = sum(len(w) + 1 for w in words); acc = 0; out = []
    for w in words:
        out.append((w, a + (b - a) * acc / tot, None)); acc += len(w) + 1
    return out
SIGW = spread(SIG1, 0.03, 2.98) + spread(SIG2, 3.27, 4.09)

# blocos: (arquivo, ini, fim na origem, respiro antes no vídeo)
BLOCKS = [
    ('vo2_mateus_a.mp3', 0.02, 3.815, 0.30),   # Crédito pré-aprovado. Oferta disparada no WhatsApp.
    ('vo2_mateus_a.mp3', 3.815, 7.145, 0.20),  # Só que agente de IA cheio de regra fala como robô.
    ('vo2_mateus_a.mp3', 7.145, 10.545, 0.35), # Na Viacredi a saída foi menos regra e mais contexto.
    ('vo2_mateus_a.mp3', 10.545, 15.385, 0.60),# Eles escreveram o papel do agente: objetivo, público, oferta, tom.
    ('vo2_mateus_a.mp3', 15.385, 17.955, 0.70),# E a conversa passou a seguir o cooperado.
    ('vo2_mateus_a.mp3', 17.955, 22.89, 2.00), # Resultado: mais de 150 mil reais em crédito, ainda na fase de testes.
    ('sig_a.mp3', 0.0, 4.15, 0.90),            # O método está no Playbook Ubots Agentes de IA. Baixe grátis.
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

words = [(w, place('vo2_mateus_a.mp3', a)) for w, a, _ in W] + [(w, place('sig_a.mp3', a)) for w, a, _ in SIGW]

# blocos de legenda: (primeira, última palavra, oculta?)
CH = [(0,1,False),(2,5,False),(6,16,False),(17,21,False),(22,26,True),(27,32,False),(33,36,True),(37,44,False),(45,52,True),(53,57,True),(58,66,True),(67,68,True)]
chunks = []
for a, b, hide in CH:
    ws = words[a:b + 1]
    chunks.append({'t0': ws[0][1], 't1': round(ws[-1][1] + 0.45, 3), 'text': ' '.join(w for w, _ in ws),
                   'words': [x for _, x in ws], 'hide': hide})

MUSIC_SLAM = 7.35  # volta cheia da trilha v2 (music2_b) — alinhada ao "Na Viacredi"
music_at = round(segs[2]['at'] - MUSIC_SLAM, 3)
DUR = 32.0

json.dump({'tempo': TEMPO, 'dur': DUR, 'end_vo': round(END_VO, 3), 'music': {'file': 'music2_b.mp3', 'at': music_at},
           'segments': segs, 'chunks': chunks}, open(os.path.join(HERE, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, '..', 'vo.js'), 'w').write(
    "// Gerado por audio/build_timeline.py (transcrição ElevenLabs Scribe + respiros). Não editar à mão.\n"
    "const VO = " + json.dumps([[c['t0'], c['t1'], c['text'], {'hide': c['hide'], 'words': c['words']}] for c in chunks], ensure_ascii=False) + ";\n"
    f"const DUR = {DUR};\n")
for i, c in enumerate(chunks):
    print(i, f"{c['t0']:6.2f}-{c['t1']:6.2f}", ('(oculto) ' if c['hide'] else '') + c['text'], [round(x, 2) for x in c['words']])
print('blocos:', [(g['at'], round(g['at'] + (g['src1'] - g['src0']) / TEMPO, 2)) for g in segs], 'fim voz', round(END_VO, 2), 'trilha começa em', music_at)
