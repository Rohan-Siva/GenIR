import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../config';
import './ProfilePage.css';

interface Preferences {
    domain: string;
    response_style: string;
    information_sources: {
        web: boolean;
        academic: boolean;
        social: boolean;
    };
}

const ProfilePage: React.FC = () => {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState<Preferences>({
        domain: 'Healthcare',
        response_style: 'Comparative Report',
        information_sources: {
            web: false,
            academic: false,
            social: false
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/preferences`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPreferences(data);
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        setMessage('');

        try {
            const response = await fetch(`${BACKEND_URL}/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(preferences)
            });

            if (response.ok) {
                setMessage('Preferences saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Failed to save preferences');
            }
        } catch (error) {
            setMessage('Error saving preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="profile-loading">Loading...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>User Profile</h1>
                    <button onClick={() => navigate('/')} className="back-button">
                        ← Back to Chat
                    </button>
                </div>

                <div className="profile-content">
                    <div className="profile-card">
                        <h2>Account Information</h2>
                        <div className="info-row">
                            <span className="info-label">Username:</span>
                            <span className="info-value">{user?.username}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{user?.email}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Member Since:</span>
                            <span className="info-value">
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="profile-card">
                        <h2>Default Preferences</h2>

                        {message && (
                            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                                {message}
                            </div>
                        )}

                        <div className="preference-group">
                            <label>Target Domain</label>
                            <select
                                value={preferences.domain}
                                onChange={(e) => setPreferences({ ...preferences, domain: e.target.value })}
                            >
                                <option>Healthcare</option>
                                <option>Technology</option>
                                <option>Finance</option>
                                <option>Education</option>
                                <option>Science</option>
                                <option>General</option>
                            </select>
                        </div>

                        <div className="preference-group">
                            <label>Response Style</label>
                            <select
                                value={preferences.response_style}
                                onChange={(e) => setPreferences({ ...preferences, response_style: e.target.value })}
                            >
                                <option>Comparative Report</option>
                                <option>Detailed Analysis</option>
                                <option>Brief Summary</option>
                                <option>Step-by-Step Guide</option>
                                <option>Q&A Format</option>
                            </select>
                        </div>

                        <div className="preference-group">
                            <label>Information Sources</label>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={preferences.information_sources.web}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            information_sources: {
                                                ...preferences.information_sources,
                                                web: e.target.checked
                                            }
                                        })}
                                    />
                                    Web Sources
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={preferences.information_sources.academic}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            information_sources: {
                                                ...preferences.information_sources,
                                                academic: e.target.checked
                                            }
                                        })}
                                    />
                                    Academic Papers
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={preferences.information_sources.social}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            information_sources: {
                                                ...preferences.information_sources,
                                                social: e.target.checked
                                            }
                                        })}
                                    />
                                    Social Media
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handleSavePreferences}
                            className="save-button"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </button>
                    </div>

                    <div className="profile-card logout-card">
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
