/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "custom-red": "#ef4444",
        "custom-blue": "#3b82f6",
        "custom-yellow": "#facc15",
      },
    },
  },
  plugins: [],
};
