import defaultTheme from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", ...defaultTheme.fontFamily.sans],
      satoshi: ["var(--font-satoshi)"],
      "work-sans": ["var(--font-work-sans)"],
    },
    extend: {
      fontSize: {
        "2xs": ["0.52rem", { lineHeight: "1rem" }], // 20% smaller than 0.75rem
        xs: ["0.6rem", { lineHeight: "1rem" }], // 20% smaller than 0.75rem
        sm: ["0.7rem", { lineHeight: "1.25rem" }], // 20% smaller than 0.875rem
        base: ["0.8rem", { lineHeight: "1.5rem" }], // 20% smaller than 1rem
        lg: ["0.9rem", { lineHeight: "1.75rem" }], // 20% smaller than 1.125rem
        xl: ["1rem", { lineHeight: "1.75rem" }], // 20% smaller than 1.25rem
        "2xl": ["1.2rem", { lineHeight: "2rem" }], // 20% smaller than 1.5rem
        "3xl": ["1.5rem", { lineHeight: "2.25rem" }], // 20% smaller than 1.875rem
        "4xl": ["1.8rem", { lineHeight: "2.5rem" }], // 20% smaller than 2.25rem
        "5xl": ["2.4rem", { lineHeight: "1" }], // 20% smaller than 3rem
        "6xl": ["3rem", { lineHeight: "1" }], // 20% smaller than 3.75rem
        "7xl": ["3.6rem", { lineHeight: "1" }], // 20% smaller than 4.5rem
        "8xl": ["4.8rem", { lineHeight: "1" }], // 20% smaller than 6rem
        "9xl": ["6.4rem", { lineHeight: "1" }], // 20% smaller than 8rem
      },
      textColor: {
        dark: "rgb(var(--color-text-dark))",
      },
      borderColor: {
        DEFAULT: "rgb(var(--color-border))",
        muted: "rgb(var(--color-border-muted))",
        "muted-bis": "rgb(var(--color-muted))",
      },
      boxShadow: {
        "popup-shadow": "0px 4px 25px 5px rgba(11, 2, 1, 1)",
        "big-button":
          "0px -3px 10px 0px #12030180 inset, 0px 0px 50px 0px #F5970A4D",
        badge: "0px 0px 30px 0px #582D2433",
        "primary-glow":
          "0px 0px 38px 0px #FF940140, 24px 13px 16.8px 0px #0606164D",
        "primary-glow-strong":
          "0px 0px 48px 0px #FF9401, 0px 0px 24px 0px #FF9401, 0px 0px 12px 0px #FF940180",
      },
      backgroundImage: {
        "error-gradient":
          "linear-gradient(232.68deg, #FFEB3B -100.94%, #E65100 90.28%)",
        "background-popup":
          "linear-gradient(96.95deg, rgba(12, 2, 0, 0.6) 9.21%, rgba(19, 6, 3, 0.6) 48.78%, rgba(12, 2, 0, 0.6) 92.49%)",
        "primary-gradient":
          "linear-gradient(232.68deg, rgb(var(--color-primary-light)) -9.94%, rgb(var(--color-primary)) 90.28%)",
        "bw-gradient":
          "linear-gradient(329.6deg, rgb(var(--color-light)) 58.89%, #0D191B 117.62%)",
        "dark-gradient":
          "linear-gradient(161.69deg, #24130C 10.05%, #0B0100 91.13%)",
        "transparent-card-gradient":
          "linear-gradient(96.95deg, rgba(12, 2, 0, 0.8) 9.21%, rgba(19, 6, 3, 0.8) 48.78%, rgba(12, 2, 0, 0.8) 92.49%)",
      },
      colors: {
        danger: "rgba(var(--color-danger), <alpha-value>)",
        "popup-border": "rgba(43, 35, 34, 1)",
        "background-ellipse-500": "#FF940126",
        "border-muted": "rgba(var(--color-border-muted), <alpha-value>)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "rgba(var(--color-border), <alpha-value>)",
        "primary-light": "rgba(var(--color-primary-light), <alpha-value>)",
        primary: "rgba(var(--color-primary), <alpha-value>)",
        light: "rgba(var(--color-light), <alpha-value>)",
        dark: "rgba(var(--color-dark), <alpha-value>)",
        darker: "rgba(var(--color-darker), <alpha-value>)",
        darkest: "rgba(var(--color-darkest), <alpha-value>)",
        muted: "rgba(var(--color-muted, <alpha-value>))",
        "muted-dark": "rgba(var(--color-muted-dark), <alpha-value>)",
        "card-dark": "rgba(var(--color-card-dark), <alpha-value>)",
        "text-dark": "rgba(var(--color-text-dark), <alpha-value>)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
