import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductHeader from '../components/Results/ProductHeader';
import Verdict from '../components/Results/Verdict';
import RiskChecklist from '../components/Results/RiskChecklist';
import IngredientBreakdown from '../components/Results/IngredientBreakdown';
import AdditivesRadar from '../components/Results/AdditivesRadar';
import NutritionSnapshot from '../components/Results/NutritionSnapshot';
import AllergyPanel from '../components/Results/AllergyPanel';
import EnvironmentalPanel from '../components/Results/EnvironmentalPanel';
import ChatbotWidget from '../components/Results/ChatbotWidget';
import CompliancePanel from '../components/Results/CompliancePanel';
import Footer from '../components/Footer';

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result } = location.state || {};

    useEffect(() => {
        if (!result) {
            console.warn("No result data found in location.state");
        }
        if (result) {
            console.log("Full Result Data:", result);
            console.log("Product Image URL:", result.productImage);
        }
    }, [result, navigate]);

    if (!result) {
        return (
            <div className="results-container text-center" style={{ marginTop: '100px' }}>
                <h2>No Data Found</h2>
                <p>Please scan a product first.</p>
                <Link to="/scan" className="btn-primary" style={{ textDecoration: 'none', marginTop: '20px', display: 'inline-block' }}>
                    Go to Scan
                </Link>
            </div>
        );
    }

    const {
        healthScore,
        ecoScore,
        structureData,
        benefits,
        notes,
        context,
        userPreferences,
        detectedAllergens,
        productImage
    } = result;

    return (
        <div className="results-container" style={{ paddingBottom: '100px' }}>
            <Link to="/scan" className="back-btn" style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <ArrowLeft size={20} /> Back to Scan
            </Link>

            <ProductHeader product={{ image: productImage }} structureData={structureData} />

            <Verdict
                ecoScore={ecoScore}
                healthScore={healthScore}
                notes={notes}
            />

            <RiskChecklist benefits={benefits} warnings={notes} />

            <IngredientBreakdown ingredients={structureData?.ingredients} />

            <AdditivesRadar ingredients={structureData?.ingredients} />

            <NutritionSnapshot nutrition={structureData?.nutritional_facts} />

            <AllergyPanel
                allergens={detectedAllergens || []}
                preferences={userPreferences || {}}
            />

            <CompliancePanel data={structureData?.other_info || {}} />

            <EnvironmentalPanel ecoData={structureData} />

            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', opacity: 0.7 }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Better Alternatives</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Coming soon: AI-powered recommendations for healthier swaps.</p>
            </div>

            <div className="text-center" style={{ marginTop: '40px', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                <p>Data extracted by AI. Verify with physical label.</p>
                <p>EcoScan AI Beta</p>
            </div>

            <ChatbotWidget context={context} />
        </div>
    );
};

export default Results;
