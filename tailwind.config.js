/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
    theme: {
      screens: {
        sm: { min: "320px", max: "767px" },
        md: { min: "768px", max: "1023px" },
        lg: { min: "1024px", max: "1279px" },
        xl: { min: "1280px", max: "1535px" },
        "2xl": { min: "1536px" },
      },
      extend: {
        colors: {
            text: "#dae1fb",
            background: "#040825",
            primary: "#292e49",
            secondary: "#0b278e",
            accent: "#0229b6",
            muted: "#303f59",
            surface: "#121c2a",
            neutral: "#8f99c0",
            error: "#e74c3c",
            success: "#2ecc71",
            info: "#3498db",
            response: "#414673",         
        },
        fontSize: {
          sm: '0.750rem',
          base: '1rem',
          xl: '1.333rem',
          '2xl': '1.777rem',
          '3xl': '2.369rem',
          '4xl': '3.158rem',
          '5xl': '4.210rem',
        },
        fontFamily: {
          heading: 'Noto Sans Buginese',
          body: 'Noto Sans Buginese',
        },
        fontWeight: {
          normal: '400',
          bold: '700',
        },
      },
    },
    plugins: [],
  };