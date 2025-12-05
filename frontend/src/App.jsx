import { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

/**
 * Main App Component
 * Manages user authentication state and routing
 */
function App() {
    // Store logged-in user's email and type
    const [userEmail, setUserEmail] = useState(null);
    const [userType, setUserType] = useState('basic'); // 'basic' or 'premium'

    /**
     * Handle user login
     * In a real app, this would validate against a backend
     * For this demo, we just accept any email and user type
     */
    const handleLogin = (email, type) => {
        setUserEmail(email);
        setUserType(type);
    };

    /**
     * Handle user logout
     */
    const handleLogout = () => {
        setUserEmail(null);
        setUserType('basic');
    };

    return (
        <ThemeProvider>
            <div className="app">
                {/* Conditional rendering based on login state */}
                {!userEmail ? (
                    <Login onLogin={handleLogin} />
                ) : (
                    <Dashboard
                        userEmail={userEmail}
                        userType={userType}
                        onLogout={handleLogout}
                    />
                )}
            </div>
        </ThemeProvider>
    );
}

export default App

