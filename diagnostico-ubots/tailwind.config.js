/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        creme: "#FFFBEF",
        tinta: "#141414",
        apagado: "#6B6558",
        linha: "#ECE4CF",
        amarelo: { DEFAULT: "#FFC800", suave: "#FFF4C7", forte: "#E0A800" },
      },
    },
  },
  plugins: [],
};
