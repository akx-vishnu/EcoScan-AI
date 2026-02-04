import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Factory, Calendar, FileText, CheckCircle, AlertTriangle, AlertCircle, Copy, Phone, Mail, Globe } from 'lucide-react';

const CompliancePanel = ({ data }) => {
    // data is expected to be structureData.other_info
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const manufacturer = data?.manufacturer_details || null;
    const contact = data?.manufacturer_contact || {};
    const fssai = data?.fssai_or_license_numbers || [];
    const expiry = data?.expiry_or_best_before || null;
    const mfgDate = data?.manufacturing_date || null;
    const mrp = data?.mrp_price || null;
    const netQty = data?.net_quantity || null;

    // Badges logic
    const hasManuf = !!manufacturer;
    const hasExpiry = !!expiry;
    const hasFssai = fssai && fssai.length > 0;

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper for collapsed badges
    const Badge = ({ icon: Icon, active, activeColor = "var(--color-safe)", label }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: active ? 1 : 0.4,
            fontSize: '0.8rem',
            color: active ? activeColor : 'var(--color-text-secondary)'
        }}>
            <Icon size={14} />
            {active ? <CheckCircle size={10} color={activeColor} style={{ marginLeft: '-4px', marginTop: '-8px' }} /> : null}
            {/* Short label for collapsed view only if needed, but requirements say "Key badges (icons only)" mostly or minimal */}
        </div>
    );

    return (
        <div className="glass-panel" style={{ marginBottom: '20px', overflow: 'hidden' }}>
            {/* Collapsed Header */}
            <div
                onClick={toggleExpand}
                style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>Manufacturer & Compliance</div>
                    <div style={{ display: 'flex', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
                        <Badge icon={Factory} active={hasManuf} label="Mfg" />
                        <Badge icon={Calendar} active={hasExpiry} label="Exp" />
                        <Badge icon={FileText} active={hasFssai} label="Lic" />
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={20} color="var(--color-text-secondary)" /> : <ChevronDown size={20} color="var(--color-text-secondary)" />}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

                    {/* A. Manufacturer Details */}
                    <div className="mb-4">
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Manufacturer Details</h4>
                        {manufacturer ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                                <Factory size={18} style={{ marginTop: '2px', color: 'var(--color-primary)' }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{manufacturer}</p>
                                    <div
                                        onClick={() => copyToClipboard(manufacturer)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-primary)', cursor: 'pointer', marginTop: '4px' }}
                                    >
                                        <Copy size={12} /> {copied ? 'Copied' : 'Copy Address'}
                                    </div>

                                    {/* Contact Details Section */}
                                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {contact.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                                <Phone size={14} color="var(--color-text-secondary)" />
                                                <a href={`tel:${contact.phone}`} style={{ color: 'var(--color-text-main)', textDecoration: 'none' }}>{contact.phone}</a>
                                            </div>
                                        )}
                                        {contact.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                                <Mail size={14} color="var(--color-text-secondary)" />
                                                <a href={`mailto:${contact.email}`} style={{ color: 'var(--color-text-main)', textDecoration: 'none' }}>{contact.email}</a>
                                            </div>
                                        )}
                                        {contact.website && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                                <Globe size={14} color="var(--color-text-secondary)" />
                                                <a href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                                                    {contact.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>Not found on label</div>
                        )}
                    </div>

                    {/* B. Regulatory & Legal */}
                    <div className="mb-4">
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Regulatory Info</h4>
                        {hasFssai ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {fssai.map((num, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                                        <FileText size={16} color="var(--color-text-main)" />
                                        <span style={{ fontFamily: 'monospace', flex: 1 }}>{num}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', border: '1px solid var(--color-text-secondary)', padding: '2px 4px', borderRadius: '4px' }}>FSSAI</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>License number not detected</div>
                        )}
                    </div>

                    {/* C. Shelf Life & Dates */}
                    <div className="mb-4">
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Shelf Life & Dates</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Manufactured</div>
                                <div style={{ fontWeight: 500 }}>{mfgDate || '--'}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: !expiry ? '1px dashed var(--color-danger)' : 'none' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Expiry / Best Before</div>
                                <div style={{ fontWeight: 500, color: !expiry ? 'var(--color-danger)' : 'white' }}>{expiry || 'Not detected'}</div>
                            </div>
                        </div>
                        {!expiry && (
                            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-warning)' }}>
                                <AlertTriangle size={14} />
                                <span>Check physical label for expiry date</span>
                            </div>
                        )}
                    </div>

                    {/* D. Pricing */}
                    <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pricing & Quantity</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(76, 175, 80, 0.05)', padding: '12px', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>MRP (Inclusive of taxes)</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-safe)' }}>{mrp || 'N/A'}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Net Qty</div>
                                <div style={{ fontWeight: 500 }}>{netQty || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default CompliancePanel;
