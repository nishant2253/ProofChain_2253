import React from "react";
import { Moon, Sun } from "lucide-react";
import useTheme from "../../hooks/useTheme";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle fade-in"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Moon className="w-5 h-5" style={{ color: "var(--accent-blue)" }} />
      ) : (
        <Sun className="w-5 h-5" style={{ color: "var(--accent-blue)" }} />
      )}
    </button>
  );
};

export default ThemeToggle;
