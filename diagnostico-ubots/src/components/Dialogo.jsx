import { useLayoutEffect, useRef } from "react";

/** <dialog> nativo controlado: abre com showModal e fecha ao clicar no fundo. */
export default function Dialogo({ aberto, onFechar, className = "", children, ...props }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);
  return (
    <dialog
      ref={ref}
      onClose={onFechar}
      onClick={(e) => {
        if (e.target === ref.current) onFechar();
      }}
      className={className}
      {...props}
    >
      {aberto && children}
    </dialog>
  );
}
