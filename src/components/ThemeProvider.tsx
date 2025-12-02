import React, { createContext, useContext, useEffect } from 'react';
import { ThemeName } from '../types';
import { applyTheme } from '../utils/themes';

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'warm-amber',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  theme: ThemeName;
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ currentTheme: theme, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
