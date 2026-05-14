/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via a 'dark' class on the html/body element
  theme: {
    extend: {
      colors: {
        // Map Tailwind colors to our CSS variables
        primary: "var(--main-accent)",
        background: "var(--main-bg)",
        surface: "var(--surface-bg)",
        border: "var(--border-color)",
        text: "var(--text-color)",
        textMuted: "var(--text-muted)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-main': 'linear-gradient(160deg, var(--main-bg) 0%, var(--surface-bg) 100%)',
      }
    },
  },
  plugins: [],
}
