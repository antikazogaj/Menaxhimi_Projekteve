import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/api/users/register', { name, email, password });

            if (response.status === 201 || response.status === 200) {
                alert("✅ Sukses: U regjistruat në databazë! Tani mund të kyçeni.");
                navigate('/login');
            }
        } catch (error) {
            console.error("Detajet e gabimit:", error);
            let mesazhi = "Gabim gjatë regjistrimit.";
            
            if (error.response) {
                mesazhi = error.response.data.message || "Gabim i panjohur nga serveri";
            }
            alert("❌ " + mesazhi);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container d-flex align-items-center justify-content-center animate__animated animate__fadeIn" style={{ minHeight: '100vh', padding: '20px' }}>
            <div className="premium-card p-5" style={{ maxWidth: '420px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                
                {/* Sfond dekorativ */}
                <div style={{
                    position: 'absolute', bottom: -50, left: -50,
                    width: 150, height: 150, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.05))',
                        border: '1px solid rgba(16,185,129,0.3)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }}>
                        <span style={{ fontSize: '24px' }}>✨</span>
                    </div>
                    <h3 className="fw-bold m-0" style={{ color: '#fff', letterSpacing: '1px' }}>Krijo Llogari</h3>
                    <p className="small mt-2" style={{ color: 'var(--text-light)' }}>Bëhu pjesë e TaskPro</p>
                </div>
                
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#34d399', letterSpacing: '1px', fontSize: '11px' }}>Emri i Plotë</label>
                        <input 
                            type="text" 
                            className="form-control premium-input-success" 
                            placeholder="Emri juaj"
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            style={{ 
                                backgroundColor: 'rgba(0,0,0,0.2)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                color: '#fff',
                                padding: '12px 16px',
                                borderRadius: '10px'
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#34d399', letterSpacing: '1px', fontSize: '11px' }}>Email Adresa</label>
                        <input 
                            type="email" 
                            className="form-control premium-input-success" 
                            placeholder="shembull@email.com"
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            style={{ 
                                backgroundColor: 'rgba(0,0,0,0.2)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                color: '#fff',
                                padding: '12px 16px',
                                borderRadius: '10px'
                            }}
                        />
                    </div>
                    <div className="mb-5">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#34d399', letterSpacing: '1px', fontSize: '11px' }}>Fjalëkalimi</label>
                        <input 
                            type="password" 
                            className="form-control premium-input-success" 
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            style={{ 
                                backgroundColor: 'rgba(0,0,0,0.2)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                color: '#fff',
                                padding: '12px 16px',
                                borderRadius: '10px'
                            }}
                        />
                    </div>
                    
                    <button type="submit" className="btn w-100 py-3 fw-bold shadow-sm" disabled={loading} style={{ 
                        fontSize: '14px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '1px',
                        background: 'linear-gradient(90deg, #10b981, #34d399)', color: '#fff', border: 'none'
                    }}>
                        {loading ? 'Duke u regjistruar...' : 'Regjistrohu'}
                    </button>
                </form>
                
                <div className="mt-5 text-center small" style={{ color: 'var(--text-muted)' }}>
                    Keni llogari? <Link to="/login" className="fw-bold ms-1" style={{ color: '#34d399', textDecoration: 'none' }}>Kyçu këtu</Link>
                </div>
            </div>
            
            <style>{`
                .premium-input-success:focus {
                    background-color: rgba(0,0,0,0.3) !important;
                    border-color: rgba(16,185,129,0.5) !important;
                    box-shadow: 0 0 0 4px rgba(16,185,129,0.1) !important;
                    color: #fff !important;
                }
                .premium-input-success::placeholder {
                    color: rgba(255,255,255,0.2) !important;
                }
            `}</style>
        </div>
    );
};

export default Register;
