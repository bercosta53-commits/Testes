import { offer } from "./offer";

// Trechos em frames (30 fps, 1170 no total = 39 s)
export const seg = {
  s1: { from: 0, dur: 150 },
  s2: { from: 150, dur: 150 },
  s3: { from: 300, dur: 300 },
  s3a: { from: 300, dur: 150 },
  s3b: { from: 450, dur: 150 },
  s4: { from: 600, dur: 150 },
  s5: { from: 750, dur: 180 },
  s6: { from: 930, dur: 90 },
  s7: { from: 1020, dur: 150 },
} as const;

// Voz: Juliana Moreira (ElevenLabs, eleven_v4), uma tomada por fala.
// start é global. rate acelera de leve só onde a fala passa do trecho.
export type Voice = {
  id: string;
  file: string;
  start: number;
  secs: number; // duração do arquivo
  rate: number;
};

export const voices: Voice[] = [
  { id: "s1", file: "assets/audio/voz-s1.mp3", start: 3, secs: 4.99, rate: 1.04 },
  { id: "s2", file: "assets/audio/voz-s2.mp3", start: 156, secs: 4.28, rate: 1 },
  { id: "s3", file: "assets/audio/voz-s3.mp3", start: 302, secs: 9.95, rate: 1.03 },
  { id: "s4", file: "assets/audio/voz-s4.mp3", start: 603, secs: 5.33, rate: 1.1 },
  { id: "s5", file: "assets/audio/voz-s5.mp3", start: 754, secs: 5.56, rate: 1 },
  { id: "s6", file: "assets/audio/voz-s6.mp3", start: 931, secs: 3.0, rate: 1.04 },
  { id: "s7", file: "assets/audio/voz-s7.mp3", start: 1023, secs: 4.75, rate: 1 },
];

export const voiceEnd = (v: Voice) =>
  v.start + Math.ceil((v.secs / v.rate) * 30);

// Legendas: texto em tela (com numerais) em cima da fala.
// Os tempos são repartidos pelo tamanho do texto dentro da janela da fala.
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
  let cursor = v.start;
  return def.lines.map((l, i) => {
    const len = Math.round((l.text.length / total) * span);
    const from = cursor;
    cursor += len;
    const last = i === def.lines.length - 1;
    return { from, to: last ? voiceEnd(v) + 6 : cursor, text: l.text, hl: l.hl };
  });
});

// Efeitos sonoros (frame global, arquivo, volume, loop opcional)
export type Sfx = {
  at: number;
  file: string;
  vol: number;
  loopFrames?: number; // duração em frames para repetir o arquivo
};

const s = (f: string) => `assets/audio/sfx/${f}.mp3`;

export const sfx: Sfx[] = [
  // transições
  ...[148, 298, 448, 598, 748, 928, 1018].map((at) => ({
    at,
    file: s("whoosh"),
    vol: 0.35,
  })),
  // S1
  { at: 6, file: s("pop"), vol: 0.5 },
  { at: 52, file: s("risco-caneta"), vol: 0.6 },
  { at: 70, file: s("ding-preco"), vol: 0.55 },
  { at: 100, file: s("pop"), vol: 0.5 },
  // S2
  { at: 195, file: s("led-recarga"), vol: 0.5 },
  { at: 228, file: s("pop"), vol: 0.5 },
  { at: 252, file: s("pop"), vol: 0.5 },
  { at: 274, file: s("pop"), vol: 0.5 },
  // S3: ambientes
  { at: 300, file: s("ambiente-mesa"), vol: 0.22, loopFrames: 150 },
  { at: 450, file: s("ambiente-sala-risada"), vol: 0.28, loopFrames: 150 },
  { at: 478, file: s("pop"), vol: 0.5 },
  { at: 512, file: s("pop"), vol: 0.5 },
  { at: 546, file: s("pop"), vol: 0.5 },
  // S4
  { at: 612, file: s("led-recarga"), vol: 0.5 },
  { at: 664, file: s("som-limpo"), vol: 0.6 },
  { at: 726, file: s("bluetooth"), vol: 0.55 },
  // S5
  { at: 762, file: s("risco-caneta"), vol: 0.6 },
  { at: 780, file: s("ding-preco"), vol: 0.55 },
  { at: 806, file: s("pop"), vol: 0.5 },
  { at: 836, file: s("pop"), vol: 0.5 },
  // S6 / S7
  { at: 962, file: s("clique"), vol: 0.5 },
  { at: 1062, file: s("clique"), vol: 0.5 },
];
