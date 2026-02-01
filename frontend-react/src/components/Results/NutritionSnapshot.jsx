import React from 'react';

const NutritionSnapshot = ({ nutrition }) => {
    // nutrition object from backend: { calories, protein, carbs, fat, etc. }
    // If undefined or empty, show "Data not available"
    if (!nutrition || Object.keys(nutrition).length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Nutrition</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>Nutrition data not available on label.</p>
            </div>
        );
    }

    const { calories, sugar, fat, protein } = nutrition;

    // Helper to determine color based on quantity (very rough heuristic)
    const trafficLight = (val, type) => {
        const v = parseFloat(val);
        if (isNaN(v)) return 'var(--color-text-secondary)';

        if (type === 'sugar') return v > 10 ? 'var(--color-danger)' : v > 5 ? 'var(--color-warning)' : 'var(--color-safe)';
        if (type === 'fat') return v > 15 ? 'var(--color-danger)' : v > 5 ? 'var(--color-warning)' : 'var(--color-safe)';
        if (type === 'protein') return v > 10 ? 'var(--color-safe)' : 'var(--color-text-main)';
        return 'var(--color-text-main)';
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>Nutrition Snapshot</h3>

            {calories && (
                <div style={{ marginBottom: '15px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {calories} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>kcal</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div className="text-center" style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Sugar</div>
                    <div style={{ color: trafficLight(sugar, 'sugar'), fontWeight: 'bold' }}>{sugar || '-'}</div>
                </div>
                <div className="text-center" style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Fat</div>
                    <div style={{ color: trafficLight(fat, 'fat'), fontWeight: 'bold' }}>{fat || '-'}</div>
                </div>
                <div className="text-center" style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Protein</div>
                    <div style={{ color: trafficLight(protein, 'protein'), fontWeight: 'bold' }}>{protein || '-'}</div>
                </div>
            </div>
        </div>
    );
};

export default NutritionSnapshot;
