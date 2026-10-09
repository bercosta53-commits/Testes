import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Artigo from "./pages/Artigo";
import Diagnostico from "./pages/Diagnostico";
import Home from "./pages/Home";
import Painel from "./pages/Painel";

/** A cada troca de rota: volta ao topo e move o foco para o início da página (acessibilidade). */
function RestauraNavegacao() {
  const { pathname } = useLocation();
  const ancora = useRef(null);
  const anterior = useRef(pathname);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (anterior.current !== pathname) {
      anterior.current = pathname;
      ancora.current?.focus({ preventScroll: true });
    }
  }, [pathname]);
  return <div ref={ancora} tabIndex={-1} className="outline-none" />;
}

export default function App() {
  return (
    <>
      <RestauraNavegacao />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artigo" element={<Artigo />} />
        <Route path="/diagnostico" element={<Diagnostico />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
