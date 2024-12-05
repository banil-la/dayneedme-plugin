// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        base: "14px", // 기본 글씨 크기 (Figma 플러그인에서는 14px이 적당)
        sm: "12px", // 작은 글씨
        lg: "16px", // 큰 글씨
      },
    },
  },
  plugins: [],
  darkMode: ["class", ".figma-dark"],
};
