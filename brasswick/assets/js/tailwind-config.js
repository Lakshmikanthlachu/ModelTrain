/* Brasswick — Tailwind CDN configuration
   Colors map to CSS variables in assets/css/style.css so light/dark themes
   switch by toggling the `dark` class on <html>. */
tailwind.config = {
  darkMode: 'class',
  theme: {
    container: { center: true, padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem' }, screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        paper:   'rgb(var(--paper) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        card:    'rgb(var(--card) / <alpha-value>)',
        ink:     'rgb(var(--ink) / <alpha-value>)',
        muted:   'rgb(var(--muted) / <alpha-value>)',
        line:    'rgb(var(--line) / <alpha-value>)',
        forest:  'rgb(var(--forest) / <alpha-value>)',
        brass:   'rgb(var(--brass) / <alpha-value>)',
        signal:  'rgb(var(--signal) / <alpha-value>)',
        cream:   '#F3EDE1',
        night:   '#0C110E'
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: {
        lift: '0 1px 0 rgb(var(--line) / .06), 0 18px 40px -18px rgb(0 0 0 / .35)',
        brass: '0 10px 30px -10px rgb(var(--brass) / .55)'
      }
    }
  }
};
