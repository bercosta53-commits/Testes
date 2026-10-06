import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Hub from "./pages/Hub.jsx";
import Artigo from "./pages/Artigo.jsx";
import Diagnostico from "./pages/Diagnostico.jsx";
import Painel from "./pages/Painel.jsx";

/* Ao trocar de rota: volta ao topo e reinicia a ordem de foco no início da página. */
function AoNavegar() {
  const { pathname } = useLocation();
  const inicio = useRef(null);
  const anterior = useRef(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (anterior.current === pathname) return; // carregamento inicial (e a segunda execução do StrictMode)
    anterior.current = pathname;
    inicio.current?.focus({ preventScroll: true });
  }, [pathname]);

  return <div ref={inicio} tabIndex={-1} className="outline-none" />;
}

export default function App() {
  return (
    <>
      <AoNavegar />
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/artigo" element={<Artigo />} />
        <Route path="/diagnostico" element={<Diagnostico />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
