import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

const AdditivesRadar = ({ ingredients }) => {
    // Mock logic to extract additives from ingredients list
    // In a real scenario, the backend would parse E-numbers or additive names
    const additives = [];

    // Simplistic check for demo purposes
    if (Array.isArray(ingredients)) {
        ingredients.forEach(ing => {
            const name = typeof ing === 'string' ? ing : ing.name;
            if (name && (name.includes('E') && /\d{3}/.test(name) || name.toLowerCase().includes('preservative') || name.toLowerCase().includes('color'))) {
                additives.push({ name: name, risk: 'Moderate', desc: 'Processed additive' });
            }
        });
    }

    if (additives.length === 0) return null; // Don't show if empty

    return (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid var(--color-warning)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="var(--color-warning)" />
                Additives & Chemicals
            </h3>

            <div style={{ display: 'grid', gap: '10px' }}>
                {additives.map((add, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        borderRadius: '8px'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, color: '#ffecb3' }}>{add.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{add.desc}</div>
                        </div>
                        <div style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            fontSize: '0.75rem',
                            color: 'var(--color-warning)'
                        }}>
                            {add.risk}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '15px', color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'flex', gap: '6px' }}>
                <Info size={14} style={{ marginTop: '2px' }} />
                <span>Processed additives can affect health.</span>
            </div>
        </div>
    );
};

export default AdditivesRadar;
