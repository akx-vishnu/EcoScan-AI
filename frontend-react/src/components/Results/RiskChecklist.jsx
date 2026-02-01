import React from 'react';
import { Check, X } from 'lucide-react';

const RiskChecklist = ({ benefits, warnings }) => {
    // benefits: array of strings
    // warnings: array of strings

    // Combine limited number of items to show quick summary
    const checklist = [
        ...(benefits || []).map(b => ({ text: b, type: 'good' })),
        ...(warnings || []).map(w => ({ text: w, type: 'bad' }))
    ];

    if (checklist.length === 0) return null;

    return (
        <div style={{ marginBottom: '20px' }}>
            {checklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    {item.type === 'good' ?
                        <Check size={18} color="var(--color-safe)" style={{ marginTop: '2px' }} /> :
                        <X size={18} color="var(--color-danger)" style={{ marginTop: '2px' }} />
                    }
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{item.text}</span>
                </div>
            ))}
        </div>
    );
};

export default RiskChecklist;
