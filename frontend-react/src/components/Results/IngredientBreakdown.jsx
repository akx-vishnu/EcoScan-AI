import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Check } from 'lucide-react';

const IngredientBreakdown = ({ ingredients }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Normalize ingredients input
    // ingredients might be array of strings or objects {name, percentage}
    const ingredientList = Array.isArray(ingredients) ? ingredients : [];

    // Quick risk check (mock logic for demo, ideally comes from backend)
    const getRisk = (ingName) => {
        const lower = typeof ingName === 'string' ? ingName.toLowerCase() : ingName?.name?.toLowerCase() || "";
        if (lower.includes('sugar') || lower.includes('syrup')) return 'moderate';
        if (lower.includes('oil') && !lower.includes('olive')) return 'moderate';
        if (lower.includes('red') || lower.includes('blue') || lower.includes('yellow')) return 'high'; // Artificial colors
        return 'low';
    };

    const count = ingredientList.length;
    const riskyCount = ingredientList.filter(i => getRisk(i) === 'high').length;

    return (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
            <div
                className="flex-between"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Ingredients</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        {count} ingredients identified
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {riskyCount > 0 && (
                        <span style={{
                            backgroundColor: 'rgba(255, 82, 82, 0.2)',
                            color: 'var(--color-danger)',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <AlertCircle size={14} /> {riskyCount} risky
                        </span>
                    )}
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {isExpanded && (
                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                    {ingredientList.length === 0 ? (
                        <p style={{ color: 'var(--color-text-secondary)' }}>No ingredients data available.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {ingredientList.map((ing, idx) => {
                                const name = typeof ing === 'string' ? ing : ing.name;
                                const pct = typeof ing === 'object' && ing.percentage ? ing.percentage : null;
                                const risk = getRisk(name);
                                const riskColor = risk === 'high' ? 'var(--color-danger)' : risk === 'moderate' ? 'var(--color-warning)' : 'var(--color-text-secondary)';

                                return (
                                    <li key={idx} style={{
                                        marginBottom: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.02)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{name}</div>
                                            {pct && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{pct}</div>}
                                        </div>
                                        <div style={{ color: riskColor, fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                                            {risk === 'low' ? <Check size={16} color="var(--color-safe)" /> : risk}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default IngredientBreakdown;
