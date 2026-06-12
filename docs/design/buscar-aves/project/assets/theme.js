/* theme.js — configuración compartida de Tailwind (paleta + tipografía + sombras)
   Cargar DESPUÉS del CDN de Tailwind y ANTES de renderizar. */
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#15824c', deep: '#0c5a36', soft: '#2f9d6a' },
        pine:   { DEFAULT: '#073d24', deep: '#052e1b' },
        mint:   { DEFAULT: '#8ed8c0', soft: '#cdeedd', deep: '#46b08c', wash: '#e4f3ec' },
        paper:  { DEFAULT: '#eef5ef', card: '#ffffff', deep: '#e1eee5' },
        ink:    { DEFAULT: '#143226', soft: '#3a5547' },
        ochre:  '#b08a2e',
        terra:  '#b5543a',
        teal:   '#2f8d77',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(7,61,36,.04), 0 8px 24px -12px rgba(7,61,36,.22)',
        soft: '0 1px 2px rgba(7,61,36,.06)',
      },
    },
  },
};
