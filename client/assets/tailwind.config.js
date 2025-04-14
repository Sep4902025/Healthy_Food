/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        white: "#ffffff",
        "custom-red": "#ef4444",
        "custom-blue": "#3b82f6",
        "custom-yellow": "#facc15",
        "custom-green": "#40B491", // Màu hệ thống
        // Màu MealPlan
        surface: "#ffffff",
        "dark-surface": "#1f2937",
        text: "#111827",
        "dark-text": "#f3f4f6",
        "text-secondary": "#6b7280",
        "dark-text-secondary": "#9ca3af",
        primary: "#40B491", // Thay #16a34a bằng custom-green
        "dark-primary": "#40B491", // Thay #22c55e bằng custom-green
        error: "#ef4444",
        success: "#40B491", // Thay #16a34a bằng custom-green
        warning: "#eab308",
        protein: "#ef4444",
        carbs: "#3b82f6",
        fat: "#facc15",
      },
    },
  },
  plugins: [],
};
