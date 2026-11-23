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

// Grade vertical (1080x1920). Texto nunca fica sobre pessoas: a mídia vive numa janela,
// o lettering vive abaixo dela e a legenda ancora no fim da zona segura.
export const grid = {
  seloTop: 282, // selo fixo, no topo da zona segura
  seloH: 56,
  top: 360, // início da janela de mídia / conteúdo
  bottom: 1330, // fim do conteúdo
  captionBottom: safe.height - safe.bottom - 5, // 1530
  w: safe.width - safe.side * 2, // 950
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
