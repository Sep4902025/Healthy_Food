/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "custom-green": "#40B491", // Màu hệ thống,
        "custom-green-hover": "#359c7a", // Màu hệ thống hover,
      },
    },
  },
  plugins: [],
};
