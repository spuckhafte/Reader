/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            primary: "#0c161e",
            secondary: "#052f77",
            tertiary: "#0a1d3c",
        }
    },
  },
  plugins: [],
}

