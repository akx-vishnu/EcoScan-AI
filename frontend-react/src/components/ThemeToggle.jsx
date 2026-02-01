import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className={`icon-container ${theme === 'light' ? 'light' : 'dark'}`}>
                {theme === 'light' ? (
                    <Sun className="icon sun" size={20} />
                ) : (
                    <Moon className="icon moon" size={20} />
                )}
            </div>
        </button>
    );
};

export default ThemeToggle;
