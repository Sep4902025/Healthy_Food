
import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import { LightContants } from "../constants/LightConstants";


const ThemeContext = createContext();


export const ThemeProvider = ({ children }) => {
  
  const [themeMode, setThemeMode] = useState(
    Appearance.getColorScheme() || "light"
  );

  
  const theme = LightContants[themeMode];

  
  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      return newMode;
    });
  };

  
  const setTheme = (mode) => {
    if (mode === "light" || mode === "dark") {
      setThemeMode(mode);
    }
  };

 
  const getThemeColor = (variableName, defaultValue = null) => {
    if (theme[variableName]) {
      return theme[variableName];
    }
    return defaultValue;
  };

  
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
