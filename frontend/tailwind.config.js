/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#121214",        // primary background
        surface: "#1B1C1F",    // card / panel background
        surfaceRaised: "#232427",
        border: "#2E2F33",
        cream: "#EDEAE3",      // primary text
        muted: "#8B8B93",      // secondary text
        amber: {
          DEFAULT: "#E8A33D",  // signature accent - projector light
          dim: "#C7842A",
          soft: "#F4C878",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
