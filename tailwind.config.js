/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e14',
        surface: '#131820',
        card: '#1a2232',
        border: '#1e2d42',
        text: '#e2e8f0',
        muted: '#64748b',
        accent: '#f59e0b',
        cyan: '#06b6d4',
        bull: '#10b981',
        bear: '#ef4444',
        'topic-defi': '#818cf8',
        'topic-ai': '#a78bfa',
        'topic-robotics': '#34d399',
        'topic-rwa': '#60a5fa',
        'topic-prediction': '#f472b6',
        'topic-infra': '#38bdf8',
        'topic-semi': '#fb923c',
        'topic-macro': '#facc15',
        'topic-security': '#f87171',
        'topic-regulation': '#a3a3a3',
        'topic-raises': '#4ade80',
        'topic-launches': '#e879f9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
}
