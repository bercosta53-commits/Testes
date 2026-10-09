/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        tinta: "#141414",
        amarelo: { DEFAULT: "#FFC800", suave: "#FFF4C7" },
        linha: "#ECE4CF",
        apagado: "#6B6558",
        creme: "#FFFBEF",
      },
      fontFamily: {
        sans: ["Sora", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
