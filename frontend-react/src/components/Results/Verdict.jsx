import React from 'react';
import { Leaf, Heart, AlertTriangle, CheckCircle } from 'lucide-react';

const Verdict = ({ ecoScore, healthScore, notes }) => {
    const getScoreColor = (score) => {
        const val = parseFloat(score);
        if (val >= 70) return 'var(--color-safe)'; // Green
        if (val >= 40) return 'var(--color-warning)'; // Yellow
        return 'var(--color-danger)'; // Red
    };

    const getRiskLevel = (hScore, eScore) => {
        const avg = (parseFloat(hScore) + parseFloat(eScore)) / 2;
        if (avg >= 70) return { text: "Safe to Consume", color: "var(--color-safe)", icon: <CheckCircle /> };
        if (avg >= 40) return { text: "Consume with Caution", color: "var(--color-warning)", icon: <AlertTriangle /> };
        return { text: "Avoid or Limit", color: "var(--color-danger)", icon: <AlertTriangle /> };
    };

    const risk = getRiskLevel(healthScore, ecoScore);

    return (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', textAlign: 'center', background: 'linear-gradient(180deg, rgba(30,30,30,0.8) 0%, rgba(20,20,20,0.95) 100%)' }}>

            {/* Risk Banner */}
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '30px',
                backgroundColor: `${risk.color}20`,
                border: `1px solid ${risk.color}`,
                color: risk.color,
                marginBottom: '20px',
                fontWeight: 'bold'
            }}>
                {risk.icon}
                {risk.text}
            </div>

            {/* Scores */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '20px' }}>
                <div className="text-center">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                        <Heart size={16} /> Health
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: getScoreColor(healthScore) }}>
                        {healthScore}<span style={{ fontSize: '1rem', opacity: 0.7 }}>/100</span>
                    </div>
                </div>

                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

                <div className="text-center">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                        <Leaf size={16} /> Eco
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: getScoreColor(ecoScore) }}>
                        {ecoScore}<span style={{ fontSize: '1rem', opacity: 0.7 }}>/100</span>
                    </div>
                </div>
            </div>

            {/* AI Summary / Notes */}
            <div style={{ fontSize: '0.95rem', color: 'var(--color-text-main)', lineHeight: '1.5' }}>
                {notes && notes.length > 0 ? (
                    <p style={{ margin: 0 }}>{notes[0]}</p>
                ) : (
                    <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>No specific warnings detected.</p>
                )}
            </div>
        </div>
    );
};

export default Verdict;
