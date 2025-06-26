/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Add Inter as the default sans font
        sans: ['var(--font-inter)', 'sans-serif'],
        // Keep your existing font families
        dmSans: ['DM Sans', 'sans-serif'],
        cormorantGaramond: ['Cormorant Garamond', 'serif'],
        specialGothic: ['Special Gothic Expanded One', 'sans-serif'],
        sofiaSans: ['Sofia Sans Semi Condensed', 'sans-serif'],
        // Add Inter as an explicitly named font if you want to use it directly
        inter: ['var(--font-inter)', 'sans-serif'],
        // Update ABCDaitype to use Inter
        ABCDaitype: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ctaButton: 'var(--color-ctaButton)',
        darkGreen: 'var(--color-darkGreen)',
        gradientDarkGreen: 'var(--color-gradientDarkGreen)',
        gradientLightGreen: 'var(--color-gradientLightGreen)',
        ash: 'var(--color-ash)',
        lightAsh: 'var(--color-lightAsh)',
      },
    },
  },
  plugins: [],
}