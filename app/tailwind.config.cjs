const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(245,158,11,0.25), 0 8px 30px -12px rgba(245,158,11,0.45)'
      }
    }
  },
  daisyui: {
    themes: [
      {
        shiplog: {
          'color-scheme': 'dark',
          primary: '#f59e0b',
          'primary-content': '#1a1206',
          secondary: '#fb923c',
          'secondary-content': '#1a0d04',
          accent: '#fbbf24',
          'accent-content': '#1a1206',
          neutral: '#e6edf3',
          'neutral-content': '#0d1117',
          'base-100': '#151a23',
          'base-200': '#0d1117',
          'base-300': '#262d3a',
          'base-content': '#dbe2ee',
          info: '#38bdf8',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          '--rounded-box': '0.75rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '0.375rem',
          '--border-btn': '1px',
          '--tab-radius': '0.5rem'
        }
      }
    ]
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')]
};

module.exports = config;
