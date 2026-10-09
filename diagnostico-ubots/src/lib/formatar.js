const NBSP = " ";
const SEMANAS_POR_MES = 52 / 12;

export const numero = (n) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Math.round(n));

export const faixaNumero = (a, b, fmt = numero) =>
  fmt(a) === fmt(b) ? fmt(a) : `${fmt(a)} a ${fmt(b)}`;

/** Arredonda para 2 algarismos significativos. */
const arredondar = (n) => {
  if (!(n > 0)) return 0;
  const passo = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / passo) * passo;
};

export const numeroAprox = (n) => numero(arredondar(n));

const abreviar = (n) => {
  const v = arredondar(n);
  if (v < 1e4) return [numero(v), ""];
  if (v < 1e6) return [numero(v / 1e3), " mil"];
  return [numero(v / 1e6), " mi"];
};

export const moeda = (n) => {
  const [v, sufixo] = abreviar(n);
  return `R$${NBSP}${v}${sufixo.replace(" ", NBSP)}`;
};

export const faixaMoeda = ([a, b]) => {
  const [na, sa] = abreviar(a);
  const [nb, sb] = abreviar(b);
  if (na === nb && sa === sb) return moeda(a);
  if (sa === sb) return `R$${NBSP}${na} a ${nb}${sb.replace(" ", NBSP)}`;
  return `${moeda(a)} a ${moeda(b)}`;
};

const duracao = (meses) => {
  if (meses > 60) return "mais de 5 anos";
  if (Math.round(meses) >= 24) return `${Math.round(meses / 12)} anos`;
  if (meses >= 2) return `${Math.round(meses)} meses`;
  const semanas = Math.round(meses * SEMANAS_POR_MES);
  if (semanas < 1) return "menos de 1 semana";
  return `${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
};

export const faixaDuracao = ([a, b]) => {
  const [da, db] = [duracao(a), duracao(b)];
  if (da === db) return da;
  if (db === "mais de 5 anos") return `${da} ou mais`;
  if (da === "menos de 1 semana") return `até ${db}`;
  const unidade = (s) => s.replace(/^\d+ /, "").replace(/^semana$/, "semanas");
  return unidade(da) === unidade(db) ? `${da.split(" ")[0]} a ${db}` : `${da} a ${db}`;
};

export { duracao };

export const dataHora = (iso) => {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return "";
  }
};

export const formatarFone = (digitos = "") =>
  digitos.length === 11
    ? `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
    : digitos.length === 10
      ? `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
      : digitos;

/** Máscara do campo de WhatsApp: (51) 99999-9999. */
export const mascaraFone = (valor) => {
  let d = valor.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const decimal = (n) =>
  n == null ? "" : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
