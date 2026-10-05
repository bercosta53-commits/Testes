/* Assinatura visual da Ubots (a mesma do componente do diagnóstico). */
export default function MarcaUbots({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className="inline-block h-3 w-3 bg-amarelo" style={{ borderRadius: "50% 50% 50% 0" }} />
      <span className="text-lg font-bold tracking-tight text-tinta">ubots</span>
    </span>
  );
}
