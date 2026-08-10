/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1526",       // near-black navy - dark surfaces
        paper: "#F6F5F0",     // warm off-white app background
        signal: {
          DEFAULT: "#2F5FED", // electric cobalt - primary actions
          dark: "#1E3FA8",
        },
        ember: "#F0A93E",     // warm amber - scores / highlights
        coral: "#E85D4C",     // weak areas / errors
        sage: "#3FA672",      // strengths / success
        slate: {
          950: "#0E1526",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,21,38,0.06), 0 8px 24px rgba(14,21,38,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
