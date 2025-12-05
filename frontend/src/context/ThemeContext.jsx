import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Theme Context
 * Manages light/dark theme state across the application
 */
const ThemeContext = createContext();

/**
 * Custom hook to use theme context
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

/**
 * Theme Provider Component
 * Wraps the app and provides theme state and toggle function
 */
export const ThemeProvider = ({ children }) => {
    // Initialize theme from localStorage or default to 'dark'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('stock-dashboard-theme');
        return savedTheme || 'dark';
    });

    /**
     * Toggle between light and dark themes
     */
    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            return newTheme;
        });
    };

    /**
     * Update document class and localStorage when theme changes
     */
    useEffect(() => {
        // Update document root class for CSS
        document.documentElement.setAttribute('data-theme', theme);

        // Persist theme preference
        localStorage.setItem('stock-dashboard-theme', theme);
    }, [theme]);

    const value = {
        theme,
        toggleTheme,
        isDark: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
