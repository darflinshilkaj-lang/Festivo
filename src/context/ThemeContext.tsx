import React, {createContext, useContext, useState} from 'react';
import Colors from '../constants/Colors';

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  border: string;
  white: string;
  lavender: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: Colors.background, // #F7F5FF (light lavender)
  card: Colors.white, // #FFFFFF
  text: Colors.textDark, // #1F1B3D
  textSecondary: Colors.textGray, // #6F6891
  primary: Colors.primary, // #5B2BFF
  accent: Colors.accent, // #FF4FA3
  border: Colors.border, // #E5DAFF
  white: Colors.white,
  lavender: Colors.lavender, // #EFE8FF
};

const darkColors: ThemeColors = {
  background: '#120E2B', // Dark navy / dark purple
  card: '#1E1B38', // Dark purple / charcoal
  text: '#FFFFFF', // White
  textSecondary: '#A29DBE', // Light gray/lavender
  primary: Colors.secondary, // #8A4FFF
  accent: Colors.accent, // #FF4FA3
  border: '#312B54', // Dark border
  white: '#1E1B38',
  lavender: '#28234A', // Dark lavender
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{isDarkMode, toggleTheme, colors}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
