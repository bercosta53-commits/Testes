import { useEffect } from "react";

export const usePageTitle = (titulo) => {
  useEffect(() => {
    document.title = titulo;
  }, [titulo]);
};

export const reduzirMovimento = () => {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};
