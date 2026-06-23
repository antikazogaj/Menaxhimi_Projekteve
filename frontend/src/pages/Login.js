import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    // Ruajmë emailin dhe fjalëkalimin që shkruan përdoruesi
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Për të treguar gjendjen "Duke u kyçur..."
    const navigate = useNavigate();

    // Ky funksion thirret kur shtypet butoni 'Kyçu Tani'
    const handleLogin = async (e) => {
        e.preventDefault(); // Ndalon rifreskimin e faqes kur bëjmë Submit
        setLoading(true);
        try {
            localStorage.clear(); // Pastrojmë të dhënat e vjetra (nëse ka mbetur ndonjë sesion i vjetër)
            
            // Dërgojmë kërkesën tek Backend (Express) për verifikim
            const response = await api.post('/api/users/login', { email, password });
            
            // Nëse kredencialet janë të sakta, serveri kthen një Token (pasaportë dixhitale)
            if (response.data.token) {
                // E ruajmë token-in lokalisht që mos t'ia kërkojmë prapë përdoruesit
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role); // Roli (P.sh. Admin ose User)
                localStorage.setItem('userName', response.data.name);
                localStorage.setItem('avatar', response.data.avatar);
                
                // Pas kyçjes së suksesshme, e kalojmë tek Dashboard (faqja kryesore)
                window.location.href = '/'; 
            } else {
                alert(" Gabim: Serveri nuk dërgoi të dhënat e sakta.");
            }
        } catch (error) {
            // Nëse marrim 401 (Unauthorized) ose ndonjë gabim tjetër
            console.error("Detajet e gabimit:", error.response?.data);
            const msg = error.response?.data?.message || "Email ose fjalëkalim i gabuar!";
            alert("❌ " + msg);
        } finally {
            setLoading(false); // Ndalim rrotullimin (loading) pavarësisht rezultatit
        }
    };

    return (
        <div className="page-container d-flex align-items-center justify-content-center animate__animated animate__fadeIn" style={{ minHeight: '100vh', padding: '20px' }}>
            <div className="premium-card p-5" style={{ maxWidth: '420px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                
                {/* Sfond dekorativ */}
                <div style={{
                    position: 'absolute', top: -50, right: -50,
                    width: 150, height: 150, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(129,140,248,0.05))',
                        border: '1px solid rgba(99,102,241,0.3)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }}>
                        <span style={{ fontSize: '24px' }}>🚀</span>
                    </div>
                    <h3 className="fw-bold m-0" style={{ color: '#fff', letterSpacing: '1px' }}>Mirë se vjen përsëri</h3>
                    <p className="small mt-2" style={{ color: 'var(--text-light)' }}>Kyçu për të vazhduar te TaskPro</p>
                </div>
                
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#a5b4fc', letterSpacing: '1px', fontSize: '11px' }}>Email Adresa</label>
                        <input 
                            type="email" 
                            className="form-control premium-input" 
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
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#a5b4fc', letterSpacing: '1px', fontSize: '11px' }}>Fjalëkalimi</label>
                        <input 
                            type="password" 
                            className="form-control premium-input" 
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
                    
                    <button type="submit" className="btn btn-premium w-100 py-3 fw-bold shadow-sm" disabled={loading} style={{ fontSize: '14px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {loading ? 'Duke u kyçur...' : 'Kyçu Tani'}
                    </button>
                </form>
                
                <div className="mt-5 text-center small" style={{ color: 'var(--text-muted)' }}>
                    Nuk keni llogari? <Link to="/register" className="fw-bold ms-1" style={{ color: '#a5b4fc', textDecoration: 'none' }}>Krijo llogari</Link>
                </div>
            </div>
            
            <style>{`
                .premium-input:focus {
                    background-color: rgba(0,0,0,0.3) !important;
                    border-color: rgba(99,102,241,0.5) !important;
                    box-shadow: 0 0 0 4px rgba(99,102,241,0.1) !important;
                    color: #fff !important;
                }
                .premium-input::placeholder {
                    color: rgba(255,255,255,0.2) !important;
                }
            `}</style>
        </div>
    );
};

export default Login;
