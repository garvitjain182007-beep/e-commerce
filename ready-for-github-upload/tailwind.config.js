/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAF8F5",
        surface: "#FFFFFF",
        charcoal: {
          50: "#F6F5F4",
          100: "#E7E5E4",
          200: "#D6D3D1",
          500: "#78716C",
          800: "#292524",
          900: "#1C1917",
        },
        brand: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          500: "#E05638",
          600: "#C84326",
          700: "#9A3412",
        },
      },
      borderRadius: {
        '2xl': '1.25rem', // 20px
        'xl': '0.875rem', // 14px
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(28, 25, 23, 0.05)',
        'hover': '0 12px 30px -4px rgba(28, 25, 23, 0.10)',
        'drawer': '-10px 0 30px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out forwards',
        slideInRight: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};
