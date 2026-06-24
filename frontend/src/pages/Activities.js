import React, { useEffect, useState } from 'react';
import api from '../api';
import moment from 'moment';
import 'moment/locale/sq'; // Per gjuhen shqipe

moment.locale('sq');

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await api.get('/api/activities/user');
                setActivities(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Gabim te historiku:", error);
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

    // Ikonat bazuar në veprimin e kryer
    const getIconForAction = (action) => {
        const lowerAction = action?.toLowerCase() || '';
        if (lowerAction.includes('shtoi') || lowerAction.includes('krijoi')) return '➕';
        if (lowerAction.includes('fshiu')) return '🗑️';
        if (lowerAction.includes('ndryshoi') || lowerAction.includes('përditësoi')) return '✏️';
        return '📌';
    };

    if (loading) return (
        <div className="page-container d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 48, height: 48, border: '3px solid rgba(99,102,241,0.2)',
                    borderTop: '3px solid #6366f1', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
                }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Duke u ngarkuar...</span>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="page-container animate__animated animate__fadeIn">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div>
                    <h4 className="fw-bold m-0 text-uppercase" style={{ color: 'var(--text-main)', letterSpacing: '2px' }}>
                        🕵️‍♂️ Historiku i Aktiviteteve (Audit Log)
                    </h4>
                    <p className="small m-0 mt-1" style={{ color: 'var(--text-light)' }}>
                        Monitoroni të gjitha veprimet e fundit në projektet tuaja
                    </p>
                </div>
            </div>

            <div className="premium-card p-4 mx-auto" style={{ maxWidth: '800px', position: 'relative' }}>
                
                {activities.length === 0 ? (
                    <div className="text-center py-5">
                        <span style={{ fontSize: 40, opacity: 0.5 }}>📭</span>
                        <h6 className="mt-3 text-muted">Nuk ka asnjë aktivitet të regjistruar ende.</h6>
                    </div>
                ) : (
                    <div className="timeline-container">
                        {activities.map((act, index) => (
                            <div key={act.id || index} className="timeline-item d-flex mb-4" style={{ position: 'relative', animation: `fadeUp 0.4s ease forwards`, animationDelay: `${index * 0.05}s`, opacity: 0 }}>
                                
                                {/* Vija lidhëse e timeline-it */}
                                {index !== activities.length - 1 && (
                                    <div style={{
                                        position: 'absolute', left: '20px', top: '45px', bottom: '-25px', width: '2px',
                                        background: 'linear-gradient(to bottom, rgba(99,102,241,0.5), rgba(99,102,241,0.1))'
                                    }} />
                                )}

                                {/* Avatari dhe Ikona */}
                                <div className="me-3" style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '50%',
                                        background: '#1a1a2e', border: '2px solid #6366f1',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', boxShadow: '0 0 10px rgba(99,102,241,0.3)'
                                    }}>
                                        {act.avatar ? (
                                            <img src={`http://localhost:5001${act.avatar}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ color: '#a5b4fc', fontWeight: 'bold', fontSize: 14 }}>
                                                {act.user_name ? act.user_name.charAt(0).toUpperCase() : '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        position: 'absolute', bottom: -5, right: -5,
                                        background: '#23233b', borderRadius: '50%', padding: '2px',
                                        fontSize: 10, border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {getIconForAction(act.veprimi)}
                                    </div>
                                </div>

                                {/* Detajet e aktivitetit */}
                                <div className="flex-grow-1" style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '12px', padding: '16px', position: 'relative'
                                }}>
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <div>
                                            <strong style={{ color: '#fff' }}>{act.user_name}</strong>
                                            <span style={{ color: '#a5b4fc', fontSize: 13, marginLeft: 8 }} className="badge bg-primary bg-opacity-25">
                                                {act.veprimi}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            {moment(act.data).fromNow()}
                                        </span>
                                    </div>
                                    <p className="mb-0 mt-2" style={{ color: 'var(--text-light)', fontSize: 14 }}>
                                        {act.pershkrimi}
                                    </p>
                                    {act.project_name && (
                                        <div className="mt-2" style={{ fontSize: 11, color: 'rgba(99,102,241,0.8)' }}>
                                            📁 Projekti: {act.project_name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Activities;
