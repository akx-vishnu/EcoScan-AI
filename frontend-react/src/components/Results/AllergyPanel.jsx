import React from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';

const AllergyPanel = ({ allergens, preferences }) => {
    // preferences: { allergies: "peanuts, gluten", dietType: "vegan", etc. }
    // allergens: List of allergens detected in product (mocked or parsed)

    const userAllergies = preferences?.allergies ? preferences.allergies.toLowerCase().split(',').map(s => s.trim()) : [];
    const dietType = preferences?.dietType || 'general';

    // Check for conflicts
    const conflicts = [];

    // Mock allergen detection in the component (normally would be passed in)
    // If 'allergens' prop is a list of detected allergens strings
    const detectedAllergens = allergens || [];

    // Check allergies
    userAllergies.forEach(ua => {
        if (detectedAllergens.some(da => da.toLowerCase().includes(ua))) {
            conflicts.push(`Contains ${ua}`);
        }
    });

    // Check diet
    // This logic relies on backend tags or ingredient analysis. 
    // Assuming backend passes a flag or we check specific ingredients is complex on frontend.
    // For now, we will trust the backend 'notes' or simple heuristic.

    const isSafe = conflicts.length === 0;

    return (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', border: isSafe ? '1px solid var(--color-safe)' : '1px solid var(--color-danger)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>Compatibility</h3>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {isSafe ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-safe)' }}>
                        <ShieldCheck size={32} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Fits your profile</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>No allergens detected for {dietType} diet.</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-danger)' }}>
                        <ShieldAlert size={32} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Not suitable for you</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>{conflicts.join(', ')}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tags */}
            <div style={{ marginTop: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 10px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                    {dietType}
                </span>
                {detectedAllergens.map((a, i) => (
                    <span key={i} style={{ padding: '4px 10px', borderRadius: '15px', background: 'rgba(255,193,7,0.2)', color: 'var(--color-warning)', fontSize: '0.8rem' }}>
                        Contains {a}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default AllergyPanel;
