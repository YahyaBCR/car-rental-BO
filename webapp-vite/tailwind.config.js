/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs principales FLIT (Expression de Besoin)
        primary: '#00A88B',        // Vert émeraude FLIT
        primaryDark: '#008A72',    // Variant hover
        secondary: '#2B2B2B',      // Gris ardoise
        secondaryDark: '#1A1A1A',  // Variant hover

        // Surfaces
        background: '#F3F3F3',     // Gris clair
        surface: '#FFFFFF',        // Blanc (contraste)
        surfaceVariant: '#E8E8E8',
        surfaceHover: '#FAFAFA',

        // Texte
        textPrimary: '#000000',    // Noir (titres premium)
        textSecondary: '#2B2B2B',  // Gris ardoise (texte fort)
        textDisabled: '#9B9B9B',   // Gris icons

        // États
        success: '#2ECC71',
        successLight: '#D5F4E6',
        error: '#E74C3C',
        errorLight: '#FDEDEC',
        info: '#2196F3',
        infoLight: '#E3F2FD',
        warning: '#FFA726',
        warningLight: '#FFF3E0',

        // Bordures
        border: '#E0E0E0',
        divider: '#F5F5F5',
        borderLight: '#F5F5F5',
        borderDark: '#BDC3C7',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Typographies FLIT - Ultra compact pour mobile et desktop
        'title-lg': ['18px', { lineHeight: '1.3', fontWeight: '600' }],  // Titre Semibold
        'title-md': ['16px', { lineHeight: '1.3', fontWeight: '600' }],
        'title-sm': ['14px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['14px', { lineHeight: '1.5', fontWeight: '400' }],   // Texte Regular
        'body-md': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'price': ['15px', { lineHeight: '1.3', fontWeight: '600' }],     // Prix Semibold
        'price-sm': ['13px', { lineHeight: '1.3', fontWeight: '600' }],
        'button': ['13px', { lineHeight: '1.3', fontWeight: '500' }],    // Boutons Medium
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        xxxl: '64px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',      // Boutons coins arrondis (radius 12)
        lg: '16px',
        xl: '24px',
        '2xl': '24px',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0,0,0,0.04)',
        md: '0 4px 8px rgba(0,0,0,0.06)',
        lg: '0 8px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
