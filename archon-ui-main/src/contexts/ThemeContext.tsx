import React, { useEffect, useState, createContext } from 'react';

export type Theme = 'dark' | 'light';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export { ThemeContext };
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to dark mode
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);
  useEffect(() => {
    // Apply theme class to document element
    const root = window.document.documentElement;
    // Remove both classes first
    root.classList.remove('dark', 'light');
    // Add the current theme class
    root.classList.add(theme);
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  return <ThemeContext.Provider value={{
    theme,
    setTheme
  }}>
      {children}
    </ThemeContext.Provider>;
};