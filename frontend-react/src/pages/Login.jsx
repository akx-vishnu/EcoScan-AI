import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AnimatedCard from '../components/AnimatedCard';

const Login = ({ setIsAuthenticated, handleLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Use the handleLogin prop from App.jsx, which includes auth verification
        const result = await handleLogin(username, password);
        setLoading(false);

        if (result.success) {
            setIsAuthenticated(true);
            console.log('Login successful, navigating to home');
            navigate('/');
        } else {
            setError(result.message);
            console.error('Login failed:', result.message);
        }
    };

    return (
        <div className="auth-container">
            <AnimatedCard title="Welcome Back">
                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary full-width" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </AnimatedCard>
        </div>
    );
};

export default Login;