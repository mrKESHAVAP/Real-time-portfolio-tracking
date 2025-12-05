import { useTheme } from '../context/ThemeContext';

/**
 * Theme Toggle Button Component
 * Displays sun/moon icon and toggles between light/dark themes
 */
function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <span className="theme-icon">🌙</span>
            ) : (
                <span className="theme-icon">☀️</span>
            )}
        </button>
    );
}

export default ThemeToggle;
