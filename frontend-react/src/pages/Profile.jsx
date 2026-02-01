import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api/client';
import AnimatedCard from '../components/AnimatedCard';
import Loader from '../components/Loader';
import { User, Heart, AlertTriangle, Utensils, Ban } from 'lucide-react';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [formData, setFormData] = useState({
        healthConditions: '',
        allergies: '',
        dietType: 'general',
        ingredientsToAvoid: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const data = await getProfile();
            if (data) {
                // Determine if data is wrapped in a 'data' property or returned directly
                // The API might return { username: ..., healthConditions: ... } directly
                // or { success: true, data: { ... } } depending on implementation consistency.
                // Based on app.py: return jsonify({ username: ..., healthConditions: ... })
                // So data is the object itself.
                setFormData(data);
                if (data.username) {
                    setUsername(data.username);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await updateProfile(formData);
        setLoading(false);
        setMessage(result.message);

        setTimeout(() => setMessage(''), 3000);
    };

    if (loading && !formData.healthConditions) return <Loader text="Loading Profile..." />;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-icon">
                    <User size={32} />
                </div>
                <div>
                    <h1>Hello, {username || 'User'}</h1>
                    <p>Manage your health preferences for personalized scans.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {message && (
                    <AnimatedCard className="slide-in">
                        <div className="success-message">{message}</div>
                    </AnimatedCard>
                )}

                <div className="profile-grid">
                    <AnimatedCard delay={0.1} title="Health Conditions">
                        <div className="field-icon">
                            <Heart size={20} />
                            <label>Conditions</label>
                        </div>
                        <textarea
                            name="healthConditions"
                            className="input-field"
                            value={formData.healthConditions}
                            onChange={handleChange}
                            placeholder="e.g., diabetes, hypertension"
                            rows={3}
                        />
                    </AnimatedCard>

                    <AnimatedCard delay={0.2} title="Allergies">
                        <div className="field-icon">
                            <AlertTriangle size={20} />
                            <label>Allergens</label>
                        </div>
                        <input
                            type="text"
                            name="allergies"
                            className="input-field"
                            value={formData.allergies}
                            onChange={handleChange}
                            placeholder="e.g., nuts, dairy"
                        />
                    </AnimatedCard>

                    <AnimatedCard delay={0.3} title="Dietary Preferences">
                        <div className="field-icon">
                            <Utensils size={20} />
                            <label>Diet Type</label>
                        </div>
                        <select
                            name="dietType"
                            className="input-field"
                            value={formData.dietType}
                            onChange={handleChange}
                        >
                            <option value="general">General</option>
                            <option value="vegan">Vegan</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="keto">Keto</option>
                        </select>
                    </AnimatedCard>

                    <AnimatedCard delay={0.4} title="Avoidance List">
                        <div className="field-icon">
                            <Ban size={20} />
                            <label>Ingredients to Avoid</label>
                        </div>
                        <input
                            type="text"
                            name="ingredientsToAvoid"
                            className="input-field"
                            value={formData.ingredientsToAvoid}
                            onChange={handleChange}
                            placeholder="e.g., sugar, gluten"
                        />
                    </AnimatedCard>
                </div>

                <div className="profile-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;