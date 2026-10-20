/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12203A', // deep navy — header, nav, primary text
        parchment: '#F6F2E7', // warm paper background
        signal: '#FFA630', // amber — "lost" pins, warnings
        found: '#2A9D8F', // teal — "found" pins, success
        alert: '#E63946', // coral red — emergency accent
        slate: '#4B5A6A', // secondary text
        line: '#DAD3C0', // hairline borders on parchment
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        pin: '9999px 9999px 9999px 0',
      },
    },
  },
  plugins: [],
};
