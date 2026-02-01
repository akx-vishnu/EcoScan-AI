import React from 'react';
import { Globe, Package, TreeDeciduous } from 'lucide-react';

const EnvironmentalPanel = ({ ecoData }) => {
    // ecoData: { carbon_footprint, packaging, palm_oil, etc. }

    // Mocks if data missing
    const packaging = ecoData?.packaging || "Unknown";
    const palmOil = ecoData?.palm_oil || "Unknown";
    const footprint = ecoData?.carbon_footprint || "Medium";

    return (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={20} color="var(--color-safe)" />
                Eco Impact
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                        <Package size={16} /> Packaging
                    </div>
                    <div style={{ fontWeight: '500' }}>{packaging}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                        <TreeDeciduous size={16} /> Palm Oil
                    </div>
                    <div style={{ fontWeight: '500' }}>{palmOil}</div>
                </div>
            </div>

            <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: '0.9rem' }}>Carbon Footprint</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-safe)' }}>{footprint}</span>
                </div>
                {ecoData?.eco_score_reasoning && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '5px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '5px' }}>
                        "{ecoData.eco_score_reasoning}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnvironmentalPanel;
