/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F6F2",
        surface: "#FFFFFF",
        ink: "#1C2321",
        "ink-soft": "#5B6660",
        line: "#E1E4DD",
        added: "#2B4570",
        due: "#E8A33D",
        overdue: "#C0533C",
        done: "#6B8F71",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
