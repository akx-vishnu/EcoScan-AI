import React from 'react';

const ProductHeader = ({ product, structureData }) => {
    // Fallback for product image if not present or blob URL no longer valid?
    // In a real app we might store the image URL in state. 
    // Assuming 'product.image' or something similar passed down or handled by parent.

    // structureData usually has product_name, brand, category
    const name = structureData?.product_name || "Unknown Product";
    const brand = structureData?.brand || structureData?.other_info?.brand || "Unknown Brand";
    const category = structureData?.category || "General Food";

    return (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Image Placeholder or Actual Image */}
            <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.05)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {product?.image ? (
                    <img
                        src={product.image}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onLoad={() => console.log("Image loaded successfully:", product.image)}
                        onError={(e) => {
                            console.error("Image failed to load:", product.image);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                ) : null}

                {/* Fallback Initial - Hidden if image loads successfully */}
                <span style={{ fontSize: '2rem', color: 'var(--color-text-secondary)', display: product?.image ? 'none' : 'block' }}>
                    {name.charAt(0)}
                </span>
            </div>

            <div style={{ flex: 1 }}>
                <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    color: 'var(--color-primary)',
                    fontSize: '0.8rem',
                    marginBottom: '8px',
                    fontWeight: 600
                }}>
                    {category}
                </span>
                <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', lineHeight: 1.2 }}>{name}</h1>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{brand}</p>
            </div>
        </div>
    );
};

export default ProductHeader;
