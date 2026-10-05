import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MarcaUbots from "../components/MarcaUbots.jsx";
import useTitulo from "../components/useTitulo.js";

const CARTOES = [
  {
    rota: "/artigo",
    titulo: "No artigo",
    texto: "Como o diagnóstico entra no conteúdo e em quais momentos o leitor é convidado a avançar.",
  },
  {
    rota: "/diagnostico?demo=1",
    titulo: "A experiência",
    texto: "O que o gestor responde, visualiza e recebe ao longo do diagnóstico.",
  },
  {
    rota: "/painel",
    titulo: "O lead no comercial",
    texto: "Quais informações chegam ao time de vendas e como elas podem apoiar a abordagem.",
  },
];

export default function Hub() {
  useTitulo("Diagnóstico de recuperação com IA");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 bg-amarelo opacity-90 sm:-right-16 sm:-top-16 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
        style={{ borderRadius: "50% 50% 50% 0" }} />

      <header className="relative mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8 sm:pt-8">
        <MarcaUbots />
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="max-w-3xl text-[2.2rem] font-bold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
          Diagnóstico de recuperação{" "}
          <span className="whitespace-nowrap bg-[linear-gradient(transparent_62%,#FFC800_62%,#FFC800_92%,transparent_92%)]">com IA</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-apagado sm:text-xl">
          Uma proposta da On Nest para transformar o case Sicoob Crediauc em uma experiência capaz de gerar conversas comerciais mais qualificadas para a Ubots.
        </p>

        <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {CARTOES.map((c, i) => (
            <li key={c.rota} className="flex">
              <Link
                to={c.rota}
                className="group flex w-full flex-col rounded-2xl border border-linha bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-tinta hover:shadow-[0_12px_32px_-16px_rgba(20,20,20,0.35)] focus-visible:border-tinta"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amarelo text-sm font-bold">{i + 1}</span>
                <span className="mt-5 text-xl font-bold tracking-tight">{c.titulo}</span>
                <span className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-apagado">{c.texto}</span>
                <span className="mt-6 flex items-center justify-between border-t border-linha pt-4">
                  <span className="font-mono text-xs text-apagado">{c.rota.split("?")[0]}</span>
                  <ArrowRight size={18} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </main>

      <footer className="relative mx-auto w-full max-w-6xl px-5 pb-8 sm:px-8">
        <p className="border-t border-linha pt-5 text-sm text-apagado">Protótipo On Nest. Dados de demonstração.</p>
      </footer>
    </div>
  );
}
