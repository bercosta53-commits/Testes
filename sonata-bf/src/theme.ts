// KV suavizado (seção 5.0). Nunca azul-marinho sólido em tela cheia.
export const colors = {
  cream: "#FCF7EF",
  petroleum: "#0B3A5B",
  ink: "#082842",
  cyan: "#2BD9CE",
  champagne: "#D5A594",
  terracotta: "#B46242",
  slate: "#687C8C",
  white: "#FFFFFF",
  led: "#3DDC84",
};

export const fonts = {
  family: "Poppins, system-ui, sans-serif",
};

// Zonas seguras do Reels (px em 1080x1920)
export const safe = {
  top: 270,
  bottom: 385,
  side: 65,
  width: 1080,
  height: 1920,
};

// Faixas verticais usadas por todos os trechos
export const bands = {
  bodyTop: safe.top + 20, // 290
  bodyBottom: 1240, // fim do corpo
  seloTop: 1258, // selo fixo
  seloHeight: 62,
  captionTop: 1340, // legendas
  captionBottom: safe.height - safe.bottom, // 1535
};

// Tamanhos mínimos (seção 5.1)
export const sizes = {
  precoPor: 200,
  parcela: 180,
  apoio: 44,
  legal: 28,
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_FRAMES = 1170;
