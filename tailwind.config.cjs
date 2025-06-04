module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        main: 'var(--main)',
        primary: {
          DEFAULT: 'var(--primary)',
          50: 'color-mix(in srgb, var(--primary), white 90%)', // Nhạt nhất
          100: 'color-mix(in srgb, var(--primary), white 80%)',
          200: 'color-mix(in srgb, var(--primary), white 60%)',
          300: 'color-mix(in srgb, var(--primary), white 40%)',
          400: 'color-mix(in srgb, var(--primary), white 20%)',
          500: 'var(--primary)', // Màu gốc
          600: 'color-mix(in srgb, var(--primary), black 20%)',
          700: 'color-mix(in srgb, var(--primary), black 40%)',
          800: 'color-mix(in srgb, var(--primary), black 60%)',
          900: 'color-mix(in srgb, var(--primary), black 80%)' // Tối nhất
        },
        secondary: 'var(--secondary)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        successGreen: 'var(--successGreen)',
        darkGreen: 'var(--darkGreen)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        lightBlue: 'var(--lightBlue)',
        skyBlue: 'var(--skyBlue)',
        lightGreen: 'var(--lightGreen)',
        lightMint: 'var(--lightMint)',
        lightGray: 'var(--lightGray)',
        mintGreen: 'var(--mintGreen)',
        lightOrange: 'var(--lightOrange)',
        mintOrange: 'var(--mintOrange)',
        mintMist: 'var(--mintMist)',
        softPink: 'var(--softPink)',
        peachBlush: 'var(--peachBlush)',
        darkGray: 'var(--darkGray)',
        mediumGray: 'var(--mediumGray)',
        darkestGray: 'var(--darkestGray)',
        lightBlueGray: 'var(--lightBlueGray)',
        primaryWithAlpha: 'var(--primaryWithAlpha)',
        paleSkyBlue: 'var(--paleSkyBlue)',
        sunflowerYellow: 'var(--sunflowerYellow)',
        sunsetEmber: 'var(--sunsetEmber)',
        blushMist: 'var(--blushMist)',
        firestormRed: 'var(--firestormRed)',
        skyFrost: 'var(--skyFrost)',
        darkBlue: 'var(--darkBlue)'
      },
      boxShadow: {
        base: '0 0px 15px 0px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif']
      }
    },
    screens: {
      mbsm: '420px', // custom breakpoint
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
  },
  plugins: []
};
