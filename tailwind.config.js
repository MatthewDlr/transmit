/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  plugins: [require("@tailwindcss/forms")],
  theme: {
    extend: {},
    colors: {
      transparent: "transparent",
      white: "#ffffff",
      black: "#09090b",
      gray: {
        50: "#fafafa",
        80: "#f2f2f2",
        100: "#f4f4f5",
        200: "#e4e4e7",
        300: "#d4d4d8",
        400: "#a1a1aa",
        500: "#71717a",
        600: "#52525b",
        700: "#3f3f46",
        800: "#27272a",
        900: "#18181b",
        950: "#09090b",
      },
      primary: {
        50: "#f7f9ff",
        100: "#e9edfe",
        200: "#d5deff",
        300: "#b4c0fe",
        400: "#8997fc",
        500: "#5963f9",
        600: "#3636f1",
        700: "#2825dc",
        800: "#211eb9",
        900: "#1d1b97",
        950: "#121481",
      },
      secondary: {
        50: "#fffaf7",
        100: "#ffeae3",
        200: "#fed7cd",
        300: "#fdb6a4",
        400: "#fb8a71",
        500: "#f45b3f",
        600: "#e1321d",
        700: "#be2012",
        800: "#9f1912",
        900: "#881513",
        950: "#4c0805",
      },
      red: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d",
        950: "#450a0a",
      },
      green: {
        50: "#ecfdf5",
        100: "#d1fae5",
        200: "#a7f3d0",
        300: "#6ee7b7",
        400: "#34d399",
        500: "#10b981",
        600: "#059669",
        700: "#047857",
        800: "#065f46",
        900: "#064e3b",
        950: "#022c22",
      },
    },
  },
};
