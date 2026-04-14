/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:    { DEFAULT: '#0F766E', light: '#14B8A6', dark: '#0D6960' },
        cta:        { DEFAULT: '#0369A1', light: '#0EA5E9', dark: '#025F8E' },
        background: { DEFAULT: '#F0FDFA', paper: '#FFFFFF' },
        surface:    '#FFFFFF',
        border:     '#CCFBF1',
        text:       { DEFAULT: '#134E4A', muted: '#475569', light: '#94A3B8' },
        success:    '#16A34A',
        warning:    '#D97706',
        danger:     '#DC2626',
        status: {
          new:         '#6366F1',
          contacted:   '#0369A1',
          interested:  '#0F766E',
          negotiation: '#D97706',
          closed:      '#16A34A',
          lost:        '#DC2626',
        },
        type: {
          house:      '#0F766E',
          apartment:  '#0369A1',
          commercial: '#7C3AED',
          plot:       '#D97706',
        },
      },
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        body:    ['Josefin Sans', 'sans-serif'],
        sans:    ['Josefin Sans', 'sans-serif'],
      },
      boxShadow: {
        card:         '0 2px 8px rgba(15, 118, 110, 0.08)',
        'card-hover': '0 8px 24px rgba(15, 118, 110, 0.16)',
        sidebar:      '4px 0 24px rgba(15, 118, 110, 0.06)',
      },
      transitionDuration: { DEFAULT: '200ms' },
      borderRadius: { xl: '0.75rem', '2xl': '1rem' },
    },
  },
  plugins: [],
};
