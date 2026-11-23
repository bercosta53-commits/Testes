import { offer } from "./offer";

// Trechos em frames (30 fps). A duração total sai da soma dos trechos.
// S1 inclui 1 s de abertura de marca (30 frames) antes de a voz começar.
const D = {
  s1: 186,
  s2: 140,
  s3a: 148,
  s3b: 148,
  s4: 150,
  s5: 172,
  s6: 90,
  s7: 152,
};

let cursor = 0;
const mk = (dur: number) => {
  const o = { from: cursor, dur };
  cursor += dur;
  return o;
};

export const seg = {
  s1: mk(D.s1),
  s2: mk(D.s2),
  s3a: mk(D.s3a),
  s3b: mk(D.s3b),
  s4: mk(D.s4),
  s5: mk(D.s5),
  s6: mk(D.s6),
  s7: mk(D.s7),
};
export const TOTAL_FRAMES = cursor;

// Frame (local ao S1) em que a voz entra e o conteúdo aparece, depois da abertura
export const S1_T0 = 30;

// Voz (ElevenLabs, eleven_v4), uma tomada por fala. start é global.
export type Voice = {
  id: string;
  file: string;
  start: number;
  secs: number;
  rate: number;
};

export const voices: Voice[] = [
  { id: "s1", file: "assets/audio/voz-s1.mp3", start: seg.s1.from + S1_T0, secs: 4.99, rate: 1 },
  { id: "s2", file: "assets/audio/voz-s2.mp3", start: seg.s2.from + 4, secs: 4.28, rate: 1 },
  { id: "s3", file: "assets/audio/voz-s3.mp3", start: seg.s3a.from + 2, secs: 9.95, rate: 1.03 },
  { id: "s4", file: "assets/audio/voz-s4.mp3", start: seg.s4.from + 3, secs: 5.33, rate: 1.1 },
  { id: "s5", file: "assets/audio/voz-s5.mp3", start: seg.s5.from + 4, secs: 5.56, rate: 1 },
  { id: "s6", file: "assets/audio/voz-s6.mp3", start: seg.s6.from, secs: 3.0, rate: 1 },
  { id: "s7", file: "assets/audio/voz-s7.mp3", start: seg.s7.from + 3, secs: 4.75, rate: 1 },
];

export const voiceEnd = (v: Voice) =>
  v.start + Math.ceil((v.secs / v.rate) * 30);

// Legendas: texto em tela (com numerais) em cima da fala.
type CaptionDef = { voice: string; lines: { text: string; hl: string[] }[] };

const captionDefs: CaptionDef[] = [
  {
    voice: "s1",
    lines: [
      { text: "Recarregável: o par com carregador", hl: ["Recarregável"] },
      { text: `por ${offer.precoPorTxt}.`, hl: [offer.precoPorTxt] },
    ],
  },
  {
    voice: "s2",
    lines: [
      { text: "O par já vem com carregador.", hl: ["carregador"] },
      { text: "É só encaixar e recarregar.", hl: ["recarregar"] },
    ],
  },
  {
    voice: "s3",
    lines: [
      { text: "Sua mãe acena que entendeu,", hl: [] },
      { text: "mas vai ficando de fora da conversa.", hl: ["de fora da conversa"] },
      { text: "Com o aparelho, ela volta:", hl: ["ela volta"] },
      { text: "responde o neto, atende o telefone, entende a mesa.", hl: [] },
    ],
  },
  {
    voice: "s4",
    lines: [
      { text: "Recarrega no estojo.", hl: ["Recarrega"] },
      { text: "Som natural, sem chiado.", hl: ["Som natural"] },
      { text: "E conecta no celular.", hl: ["conecta"] },
    ],
  },
  {
    voice: "s5",
    lines: [
      { text: `Por ${offer.precoPorTxt},`, hl: [offer.precoPorTxt] },
      { text: `ou ${offer.parcelaTxt}.`, hl: [offer.parcelaTxt] },
    ],
  },
  {
    voice: "s6",
    lines: [
      { text: "Agende gratuitamente seu teste na Sonata.", hl: ["gratuitamente"] },
    ],
  },
  {
    voice: "s7",
    lines: [
      { text: "A oferta vai até durar o estoque.", hl: ["estoque"] },
      { text: "Clique no link e fale com nossa equipe.", hl: ["Clique no link"] },
    ],
  },
];

export type Caption = { from: number; to: number; text: string; hl: string[] };

export const captions: Caption[] = captionDefs.flatMap((def) => {
  const v = voices.find((x) => x.id === def.voice)!;
  const total = def.lines.reduce((a, l) => a + l.text.length, 0);
  const span = voiceEnd(v) - v.start;
  let c = v.start;
  return def.lines.map((l, i) => {
    const len = Math.round((l.text.length / total) * span);
    const from = c;
    c += len;
    const last = i === def.lines.length - 1;
    return { from, to: last ? voiceEnd(v) + 4 : c, text: l.text, hl: l.hl };
  });
});

// Cortes com onda: o centro da onda cai no frame do corte
export const wipes = [seg.s2, seg.s3a, seg.s3b, seg.s4, seg.s5, seg.s6, seg.s7].map(
  (s) => s.from,
);

// Efeitos sonoros: poucos, curtos, amarrados a um gesto visual.
// Arquivos tratados (sem silêncio, com fade) em assets/audio/sfx/proc.
export type Sfx = { at: number; file: string; vol: number };
const P = (f: string) => `assets/audio/sfx/proc/${f}.mp3`;

export const sfx: Sfx[] = [
  // Abertura: entrada do logo
  { at: 10, file: P("whoosh"), vol: 0.4 },
  // Cortes (começa 7 frames antes do centro da onda)
  ...wipes.map((w) => ({ at: w - 7, file: P("whoosh"), vol: 0.32 })),
  // S1: título, risco no preço antigo, preço novo
  { at: seg.s1.from + S1_T0 + 6, file: P("pop"), vol: 0.35 },
  { at: seg.s1.from + S1_T0 + 46, file: P("risco-caneta"), vol: 0.55 },
  { at: seg.s1.from + S1_T0 + 88, file: P("ding-preco"), vol: 0.5 },
  { at: seg.s1.from + S1_T0 + 120, file: P("pop"), vol: 0.3 },
  // S2: LED e etiquetas
  { at: seg.s2.from + 44, file: P("led-recarga"), vol: 0.45 },
  { at: seg.s2.from + 80, file: P("pop"), vol: 0.28 },
  { at: seg.s2.from + 104, file: P("pop"), vol: 0.28 },
  { at: seg.s2.from + 128, file: P("pop"), vol: 0.28 },
  // S3 beat 2: três benefícios
  { at: seg.s3b.from + 26, file: P("pop"), vol: 0.3 },
  { at: seg.s3b.from + 62, file: P("pop"), vol: 0.3 },
  { at: seg.s3b.from + 98, file: P("pop"), vol: 0.3 },
  // S4: recarga, som limpo, pareamento
  { at: seg.s4.from + 22, file: P("led-recarga"), vol: 0.45 },
  { at: seg.s4.from + 62, file: P("som-limpo"), vol: 0.5 },
  { at: seg.s4.from + 122, file: P("bluetooth"), vol: 0.5 },
  // S5: preço antigo riscado, novo, desconto, parcela
  { at: seg.s5.from + 14, file: P("risco-caneta"), vol: 0.55 },
  { at: seg.s5.from + 32, file: P("ding-preco"), vol: 0.5 },
  { at: seg.s5.from + 58, file: P("pop"), vol: 0.3 },
  { at: seg.s5.from + 90, file: P("pop"), vol: 0.3 },
  // S6 e S7: botões
  { at: seg.s6.from + 32, file: P("clique"), vol: 0.45 },
  { at: seg.s7.from + 36, file: P("clique"), vol: 0.45 },
];
