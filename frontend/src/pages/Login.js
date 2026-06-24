import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

// ============================================================================
// FAQJA E KYÇJES (Login Component - React)
// Për Profesorin: Kjo faqe trajton kyçjen e përdoruesit dhe ruajtjen e sesionit.
// Koncepti kryesor këtu është "State Management" (menaxhimi i gjendjes) me useState
// dhe "JWT Token Storage" (ruajtja e tokenit të sigurisë).
// ============================================================================

const Login = () => {
    // useState është një "kujtesë afatshkurtër" e komponentit.
    // Ruajmë emailin dhe fjalëkalimin sa herë që përdoruesi shtyp një shkronjë.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Ndihmon për të treguar një animacion gjatë pritjes
    const navigate = useNavigate(); // Funksion për të ndërruar faqet (psh. nga Login te Dashboard)

    // Funksioni që ekzekutohet kur shtypet "Kyçu Tani"
    const handleLogin = async (e) => {
        // Pse e.preventDefault()? Sepse formulari (form) normalisht i bën refresh gjithë faqes,
        // por ne duam të bëjmë një kërkesë të fshehtë (AJAX) në prapaskenë pa rimbushur faqen.
        e.preventDefault(); 
        setLoading(true);
        try {
            // Fshijmë çdo të dhënë të mbetur nga ndonjë përdorues tjetër më parë
            localStorage.clear(); 
            
            // Komunikojmë me Backend (API-në tonë në Node.js)
            const response = await api.post('/api/users/login', { email, password });
            
            // Nëse përgjigja përmban "token", do të thotë që u kyçëm me sukses!
            if (response.data.token) {
                // Për Profesorin: "localStorage" është një memorie e shfletuesit.
                // Ruajmë aty token-in që ta dërgojmë automatikisht te çdo kërkesë e ardhshme (psh. kur krijojmë detyrë).
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role); // Roli (Admin/Member) përdoret për të fshehur disa butona.
                localStorage.setItem('userName', response.data.name);
                localStorage.setItem('avatar', response.data.avatar);
                
                // Pasi çdo gjë është ruajtur, e dërgojmë përdoruesin në faqen kryesore '/'
                window.location.href = '/'; 
            } else {
                alert(" Gabim: Serveri nuk dërgoi të dhënat e sakta.");
            }
        } catch (error) {
            // Kapim gabimet që kthen Backend-i (p.sh. statusin 401 Unauthorized për fjalëkalim të gabuar)
            console.error("Detajet e gabimit:", error.response?.data);
            const msg = error.response?.data?.message || "Email ose fjalëkalim i gabuar!";
            alert("❌ " + msg);
        } finally {
            // "finally" ekzekutohet gjithmonë në fund, pavarësisht a patëm sukses apo gabim.
            // E heqim gjendjen e ngarkimit (loading).
            setLoading(false); 
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
