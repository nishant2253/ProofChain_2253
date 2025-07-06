import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark theme

  // Initialize theme based on user preference or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.body.setAttribute("data-theme", "dark");
    } else if (savedTheme === "light") {
      setIsDarkMode(false);
      document.body.setAttribute("data-theme", "light");
    } else {
      // Default to dark theme like the design
      setIsDarkMode(true);
      document.body.setAttribute("data-theme", "dark");
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
