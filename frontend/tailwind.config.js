module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#050d1a',
          panel: '#0d1f35',
          accent: '#00d8ff',
          screen: '100vh',
          text: '#f9f9f9',
        },
      },
    },
  },
  plugins: [],
}
