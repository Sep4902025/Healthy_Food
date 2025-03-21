// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import { LightContants } from "../constants/LightConstants";

// Create the context
const ThemeContext = createContext();

// Create a provider component
export const ThemeProvider = ({ children }) => {
  // Initialize with system theme or default to 'light'
  const [themeMode, setThemeMode] = useState(
    Appearance.getColorScheme() || "light"
  );

  // Get the current theme object based on mode
  const theme = LightContants[themeMode];

  // Toggle between light and dark
  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      return newMode;
    });
  };

  // Set specific theme
  const setTheme = (mode) => {
    if (mode === "light" || mode === "dark") {
      setThemeMode(mode);
    }
  };

  // Get color based on variable name
  const getThemeColor = (variableName, defaultValue = null) => {
    if (theme[variableName]) {
      return theme[variableName];
    }
    return defaultValue;
  };

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setThemeMode(colorScheme);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        toggleTheme,
        setTheme,
        getThemeColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const getThemedColor = (variableName, defaultValue = null) => {
  const { theme } = useTheme();
  return theme[variableName] || defaultValue;
};
