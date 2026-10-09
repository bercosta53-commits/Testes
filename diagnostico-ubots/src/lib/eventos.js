// Avisa a página hospedeira (LP da Ubots) sobre o que acontece no diagnóstico.
// Quem integra pode ouvir `ubots-diagnostico` no window ou ler o dataLayer (GTM).
export function emitir(nome, detalhe = {}) {
  try {
    window.dispatchEvent(new CustomEvent("ubots-diagnostico", { detail: { evento: nome, ...detalhe } }));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: `diagnostico_${nome}`, ...detalhe });
  } catch {
    /* sem window ou dataLayer: ignora */
  }
}
