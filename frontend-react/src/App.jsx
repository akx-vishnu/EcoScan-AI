import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Scan from './pages/Scan';
import Results from './pages/Results';
import Profile from './pages/Profile';
import History from './pages/History';
import ProtectedRoute from './components/ProtectedRoute';
import { checkAuthStatus } from './api/client';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const isAuth = await checkAuthStatus();
                setIsAuthenticated(isAuth);
                console.log('Initial auth check:', isAuth);
            } catch (e) {
                console.error('Initial auth check error:', e);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        verifyAuth();
    }, []);

    // Handler for login (can be called from Login component)
    const handleLogin = async (username, password) => {
        // This assumes you have loginUser imported; if not, import it
        const { loginUser } = await import('./api/client');
        const result = await loginUser(username, password);
        if (result.success) {
            // Immediately verify auth after login to refresh state
            const isAuth = await checkAuthStatus();
            setIsAuthenticated(isAuth);
            console.log('Post-login auth check:', isAuth);
            return { success: true };
        } else {
            return { success: false, message: result.message };
        }
    };

    if (loading) {
        return <div className="app-loader">Loading...</div>;
    }

    return (
        <ThemeProvider>
            <Router>
                <div className="app-container">
                    <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
                            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} handleLogin={handleLogin} />} />
                            <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />

                            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                                <Route path="/scan" element={<Scan />} />
                                <Route path="/results" element={<Results />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/history" element={<History />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;