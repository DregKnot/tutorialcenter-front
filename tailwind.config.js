/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        sencondary: "var(--secondary-color)",
        ascent: "var(--ascent-color)",
        mainRed: "#E83831",
        darkMode: "#181818",
        lightGrey: "#E6E9EC",
        mainGrey: "#8695A0",
        mainYellow: "#F8BD00",
        mainBlue: "#09314F",
        mainLightBlue: "#A9C1D3",
        mainWhite: "#FFFDFD",
        whiteFade: "#FFFFFF1A",
        mainBlack: "#121D24",
        lightGreen: "#7FD093",
      },
      transitionProperty: {
        width: "width",
        height: "height",
      },
      transitionTimingFunction: {
        custom: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      boxShadow: {
        "custom-1": "0px 1px 2px 0px #00000040",
        "custom-2": "1px 0px 2px 0px #00000040",
        "custom-3": "0px -1px 2px 0px #00000040",
        "custom-4": "-1px 0px 2px 0px #00000040",
      },
      borderRadius: {
        custom: "4px",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
