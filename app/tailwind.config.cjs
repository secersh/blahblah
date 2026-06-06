const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  daisyui: {
    themes: [
      {
        shiplog: {
          primary: '#2563eb',
          secondary: '#14b8a6',
          accent: '#f59e0b',
          neutral: '#1f2937',
          'base-100': '#ffffff',
          'base-200': '#f4f6f8',
          'base-300': '#d9e0e8',
          info: '#0ea5e9',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626'
        }
      },
      'light'
    ]
  },
  plugins: [require('daisyui')]
};

module.exports = config;
