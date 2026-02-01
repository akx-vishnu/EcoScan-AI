import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/client';
import { Menu, X, User, LogOut, ScanLine } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUser();
        setIsAuthenticated(false);
        navigate('/');
    };

    return (
        <nav className="glass-panel navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">
                    <img src="/logo.png" alt="EcoScan" />
                    <span>EcoScan AI</span>
                </Link>

                <div className="navbar-menu">
                    <ThemeToggle />
                    {isAuthenticated ? (
                        <>
                            <Link to="/scan" className="btn-primary">
                                <ScanLine size={18} /> Scan
                            </Link>
                            <Link to="/profile" className="btn-secondary">
                                <User size={18} /> Profile
                            </Link>
                            <Link to="/history" className="btn-secondary">
                                <span style={{ fontSize: '18px' }}>📜</span> History
                            </Link>
                            <button onClick={handleLogout} className="btn-secondary logout-btn">
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-secondary">Login</Link>
                            <Link to="/signup" className="btn-primary">Signup</Link>
                        </>
                    )}
                </div>

                <button
                    className="mobile-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {isOpen && (
                <div className="mobile-menu glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <ThemeToggle />
                    </div>
                    {isAuthenticated ? (
                        <>
                            <Link to="/scan" onClick={() => setIsOpen(false)}>Scan Product</Link>
                            <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
                            <button onClick={() => { handleLogout(); setIsOpen(false); }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                            <Link to="/signup" onClick={() => setIsOpen(false)}>Signup</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;