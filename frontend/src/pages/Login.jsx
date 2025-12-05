import { useState } from 'react';

/**
 * Login Component - Minimal & Clean
 */
function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('premium'); // Default to premium

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email && email.includes('@')) {
            onLogin(email, userType);
        } else {
            alert('Please enter a valid email');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo-container">
                    <img src="/logo.png" alt="Stock Dashboard Logo" className="app-logo" />
                </div>
                <h1>Stock Dashboard</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Account Type</label>
                        <div className="user-type-selector">
                            <label className={`user-type-option ${userType === 'basic' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="userType"
                                    value="basic"
                                    checked={userType === 'basic'}
                                    onChange={(e) => setUserType(e.target.value)}
                                />
                                <div className="user-type-content">
                                    <span className="user-type-title">📊 Basic</span>
                                    <span className="user-type-desc">3 stocks max</span>
                                </div>
                            </label>

                            <label className={`user-type-option ${userType === 'premium' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="userType"
                                    value="premium"
                                    checked={userType === 'premium'}
                                    onChange={(e) => setUserType(e.target.value)}
                                />
                                <div className="user-type-content">
                                    <span className="user-type-title">⭐ Premium</span>
                                    <span className="user-type-desc">Unlimited</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary">
                        Launch Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
