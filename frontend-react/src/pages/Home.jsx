import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedCard from '../components/AnimatedCard';
import { motion } from 'framer-motion';
import { ScanLine, Leaf, Activity } from 'lucide-react';

const Home = ({ isAuthenticated }) => {
    return (
        <div className="home-container">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="hero-section"
            >
                <h1 className="hero-title">
                    Scan for a Greener Future
                </h1>
                <p className="hero-subtitle">
                    EcoScan AI analyzes product labels to provide instant health and environmental impact scores tailored to you.
                </p>

                {isAuthenticated ? (
                    <Link to="/scan" className="btn-primary pulse-anim">
                        Start Scanning
                    </Link>
                ) : (
                    <Link to="/login" className="btn-primary">
                        Get Started
                    </Link>
                )}
            </motion.div>

            <div className="features-grid">
                <AnimatedCard delay={0.2}>
                    <div className="feature-icon"><Leaf size={40} /></div>
                    <h3>Eco Score</h3>
                    <p>Understand the environmental footprint of your purchases with our AI-powered sustainability rating.</p>
                </AnimatedCard>

                <AnimatedCard delay={0.4}>
                    <div className="feature-icon"><Activity size={40} /></div>
                    <h3>Health & Nutrition</h3>
                    <p>Personalized health insights based on your dietary preferences, allergies, and health conditions.</p>
                </AnimatedCard>

                <AnimatedCard delay={0.6}>
                    <div className="feature-icon"><ScanLine size={40} /></div>
                    <h3>Instant OCR</h3>
                    <p>Simply snap a photo of any product label to instantly decode ingredients and nutritional facts.</p>
                </AnimatedCard>
            </div>
        </div>
    );
};

export default Home;