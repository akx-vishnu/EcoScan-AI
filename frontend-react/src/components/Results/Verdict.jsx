import React, { useEffect, useState } from 'react';
import { Leaf, Heart, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const CircularScore = ({ score, color, icon: Icon, label }) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const [offset, setOffset] = useState(circumference);

    useEffect(() => {
        // Simple animation delay
        const timer = setTimeout(() => {
            const progress = Math.min(Math.max(score, 0), 100) / 100;
            setOffset(circumference - (progress * circumference));
        }, 100);
        return () => clearTimeout(timer);
    }, [score, circumference]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                {/* Background Circle */}
                <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                </svg>
                {/* Inner Content */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: '800', lineHeight: 1 }}>{score}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>/100</span>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                <Icon size={14} /> {label}
            </div>
        </div>
    );
};

const Verdict = ({ ecoScore, healthScore, notes }) => {
    const getScoreColor = (score) => {
        const val = parseFloat(score);
        if (val >= 70) return 'var(--color-safe)'; // Green
        if (val >= 40) return 'var(--color-warning)'; // Yellow
        return 'var(--color-danger)'; // Red
    };

    const getRiskLevel = (hScore, eScore) => {
        // Verdict should be based primarily on health impact.
        // Eco score is important for awareness but doesn't make food "unsafe".
        const score = parseFloat(hScore);

        if (score >= 70) return {
            text: "Safe to Consume",
            color: "var(--color-safe)",
            bg: "rgba(76, 175, 80, 0.15)",
            border: "rgba(76, 175, 80, 0.3)",
            glow: "0 0 20px rgba(76, 175, 80, 0.4)",
            icon: <CheckCircle size={28} />
        };
        if (score >= 40) return {
            text: "Consume with Caution",
            color: "var(--color-warning)",
            bg: "rgba(255, 152, 0, 0.15)",
            border: "rgba(255, 152, 0, 0.3)",
            glow: "0 0 20px rgba(255, 152, 0, 0.4)",
            icon: <AlertTriangle size={28} />
        };
        return {
            text: "Avoid / Limit",
            color: "var(--color-danger)",
            bg: "rgba(244, 67, 54, 0.15)",
            border: "rgba(244, 67, 54, 0.3)",
            glow: "0 0 20px rgba(244, 67, 54, 0.4)",
            icon: <AlertTriangle size={28} />
        };
    };

    const risk = getRiskLevel(healthScore, ecoScore);

    return (
        <div className="glass-panel" style={{
            padding: '30px',
            marginBottom: '25px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(30,30,30,0.8) 0%, rgba(20,20,20,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient background glow based on risk */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translate(-50%, 0)',
                width: '80%',
                height: '80%',
                background: risk.color,
                opacity: 0.1,
                filter: 'blur(80px)',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Risk Banner - Bigger & Glowing */}
                <div style={{ marginBottom: '35px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '12px 30px',
                        borderRadius: '50px',
                        backgroundColor: risk.bg,
                        border: `1px solid ${risk.border}`,
                        color: risk.color,
                        boxShadow: risk.glow,
                        transition: 'all 0.3s ease'
                    }}>
                        {risk.icon}
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            {risk.text}
                        </span>
                    </div>
                </div>

                {/* Circular Scores */}
                <div className="verdict-scores">
                    <CircularScore
                        score={healthScore}
                        color={getScoreColor(healthScore)}
                        icon={Heart}
                        label="Health Score"
                    />

                    {/* Divider for desktop */}
                    <div className="verdict-divider"></div>

                    <CircularScore
                        score={ecoScore}
                        color={getScoreColor(ecoScore)}
                        icon={Leaf}
                        label="Eco Score"
                    />
                </div>

                {/* AI Summary / Notes */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '16px',
                    margin: '0 auto',
                    maxWidth: '90%',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'start', textAlign: 'left' }}>
                        <Info size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.95rem', color: 'var(--color-text-main)', lineHeight: '1.5' }}>
                            {notes && notes.length > 0 ? (
                                <p style={{ margin: 0 }}>{notes[0]}</p>
                            ) : (
                                <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>No specific warnings detected.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verdict;
