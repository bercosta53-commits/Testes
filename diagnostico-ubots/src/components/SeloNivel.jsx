const ESTILOS = {
  "Preparar a base": { fundo: "#FDE7DF", texto: "#8A2E12", ponto: "#E5673D" },
  "Pronta para piloto": { fundo: "#FFF4C7", texto: "#6A4D00", ponto: "#FFC800" },
  "Pronta para escalar": { fundo: "#DDF2E3", texto: "#17603A", ponto: "#2E9E5B" },
};

export default function SeloNivel({ nivel }) {
  const e = ESTILOS[nivel] || ESTILOS["Pronta para piloto"];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: e.fundo, color: e.texto }}>
      <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: e.ponto }} />
      {nivel}
    </span>
  );
}
