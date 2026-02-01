import React, { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../api/client';
import { Calendar, AlertCircle, Leaf, Activity, Trash2 } from 'lucide-react';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const result = await getHistory();
            if (result.success) {
                setHistory(result.data);
            }
            setLoading(false);
        };
        fetchHistory();
    }, []);

    const handleClearHistory = async () => {
        if (window.confirm('Are you sure you want to clear your entire scan history? This action cannot be undone.')) {
            const result = await clearHistory();
            if (result.success) {
                setHistory([]);
            } else {
                alert('Failed to clear history');
            }
        }
    };

    if (loading) {
        return <div className="app-loader">Loading History...</div>;
    }

    return (
        <div className="page-container fade-in">
            <div className="history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Scan History</h1>
                {history.length > 0 && (
                    <button
                        onClick={handleClearHistory}
                        className="btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        <Trash2 size={16} />
                        Clear History
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="glass-panel text-center p-8">
                    <p className="text-secondary mb-4">You haven't scanned any products yet.</p>
                </div>
            ) : (
                <div className="history-grid">
                    {history.map((item) => (
                        <div key={item.id} className="glass-panel history-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <div className="history-image-container" style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                <img
                                    src={item.image}
                                    alt={item.productName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => e.target.src = 'https://placehold.co/80x80?text=No+Image'}
                                />
                            </div>

                            <div className="history-details" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{item.productName}</h3>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} />
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Activity size={16} color={item.healthScore > 70 ? '#4ade80' : item.healthScore > 40 ? '#fbbf24' : '#f87171'} />
                                        <span style={{ fontWeight: 500 }}>Health: {item.healthScore}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Leaf size={16} color={item.ecoScore > 70 ? '#4ade80' : item.ecoScore > 40 ? '#fbbf24' : '#f87171'} />
                                        <span style={{ fontWeight: 500 }}>Eco: {item.ecoScore}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .history-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                .text-center { text-align: center; }
                .p-8 { padding: 2rem; }
                .text-secondary { color: rgba(255, 255, 255, 0.7); }
                .mb-4 { margin-bottom: 1rem; }
                .btn-secondary:hover {
                    background: rgba(239, 68, 68, 0.3) !important;
                }
            `}</style>
        </div>
    );
};

export default History;
