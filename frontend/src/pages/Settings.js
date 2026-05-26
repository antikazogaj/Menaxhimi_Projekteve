import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Settings = () => {
    // States për Etiketat
    const [labels, setLabels] = useState([]);
    const [emertimi, setEmertimi] = useState('');
    const [ngjyra, setNgjyra] = useState('#000000');

    // States për Profilin
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('role');
    const [newPassword, setNewPassword] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchLabels = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/labels', { headers });
            setLabels(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error("Gabim gjatë marrjes së etiketave", e); }
    };

    useEffect(() => { fetchLabels(); }, []);

    const handleAddLabel = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/labels', { emertimi, ngjyra }, { headers });
            setEmertimi(''); setNgjyra('#000000'); fetchLabels();
        } catch (e) { alert("Gabim gjatë shtimit!"); }
    };

    const handleDeleteLabel = async (id) => {
        if (!window.confirm("A jeni i sigurt që dëshironi ta fshini këtë etiketë?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/labels/${id}`, { headers });
            fetchLabels();
        } catch (e) { alert("Etiketa është në përdorim!"); }
    };

    return (
        <div className="container mt-4 animate__animated animate__fadeIn pb-5">
            <div className="mb-5">
                <h2 className="fw-bold text-dark text-uppercase mb-1" style={{ letterSpacing: '1px' }}>Konfigurimet </h2>
                <p className="text-muted small">Menaxho llogarinë dhe etiketat e sistemit</p>
            </div>

            {/* SEKSIONI 1: PROFILI I PËRDORUESIT (LIGHT STYLE) */}
            <div className="card shadow-sm border-0 p-4 mb-5" style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                <div className="row align-items-center">
                    <div className="col-md-2 text-center">
                        <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '80px', height: '80px', fontSize: '30px' }}>
                            {userName?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="col-md-6 border-start ps-4">
                        <h4 className="text-dark fw-bold mb-1">{userName}</h4>
                        <p className="text-muted mb-3">Roli: <span className="badge bg-light text-dark border px-3" style={{fontSize: '10px'}}>{userRole?.toUpperCase()}</span></p>
                        <div className="d-flex gap-4">
                            <div>
                                <small className="d-block text-muted text-uppercase fw-bold" style={{fontSize: '9px'}}>Statusi</small>
                                <small className="text-success fw-bold">● AKTIV</small>
                            </div>
                            <div>
                                <small className="d-block text-muted text-uppercase fw-bold" style={{fontSize: '9px'}}>Llogaria</small>
                                <small className="text-dark">Personal Access</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <form onSubmit={(e) => { e.preventDefault(); alert("U dërgua!"); setNewPassword(''); }}>
                            <label className="text-muted small fw-bold mb-2" style={{fontSize: '10px'}}>NDRYSHO FJALËKALIMIN</label>
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    className="form-control bg-light border-0" 
                                    placeholder="Fjalëkalimi i ri..."
                                    style={{ borderRadius: '10px 0 0 10px', fontSize: '13px' }}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button className="btn btn-dark fw-bold px-3" style={{ borderRadius: '0 10px 10px 0', fontSize: '11px' }}>UPDATE</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* SEKSIONI 2: SHTO ETIKETË */}
                <div className="col-md-5">
                    <div className="card shadow-sm border-0 p-4 h-100" style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                        <h6 className="text-dark small text-uppercase fw-bold mb-4">Shto Etiketë të Re</h6>
                        <form onSubmit={handleAddLabel}>
                            <div className="mb-3">
                                <label className="text-muted small fw-bold mb-1" style={{fontSize: '10px'}}>EMËRTIMI</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0" 
                                    style={{ borderRadius: '10px' }}
                                    value={emertimi} 
                                    onChange={(e) => setEmertimi(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label className="text-muted small fw-bold mb-1" style={{fontSize: '10px'}}>ZGJIDH NGJYRËN</label>
                                <div className="d-flex align-items-center gap-3 bg-light p-2 rounded-3">
                                    <input 
                                        type="color" 
                                        className="form-control form-control-color border-0 bg-transparent" 
                                        style={{ width: '45px', height: '35px' }}
                                        value={ngjyra} 
                                        onChange={(e) => setNgjyra(e.target.value)} 
                                    />
                                    <span className="text-muted small font-monospace">{ngjyra.toUpperCase()}</span>
                                </div>
                            </div>
                            <button className="btn btn-dark w-100 fw-bold rounded-pill shadow-sm py-2" style={{fontSize: '11px'}}>RUHAJ ETIKETËN</button>
                        </form>
                    </div>
                </div>

                {/* SEKSIONI 3: LISTA E ETIKETAVE */}
                <div className="col-md-7">
                    <div className="card shadow-sm border-0 h-100" style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                        <div className="p-4">
                            <h6 className="text-dark small text-uppercase fw-bold mb-4">Menaxho Etiketat</h6>
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead>
                                        <tr className="text-muted small text-uppercase" style={{fontSize: '10px', borderBottom: '1px solid #f8f9fa'}}>
                                            <th className="py-3 border-0">Etiketa</th>
                                            <th className="py-3 text-center border-0">Mostra</th>
                                            <th className="py-3 text-end border-0">Veprimi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {labels.map(l => (
                                            <tr key={l.id} style={{borderBottom: '1px solid #fcfcfc'}}>
                                                <td className="py-3 border-0">
                                                    <span className="badge px-3 py-2" style={{ backgroundColor: l.ngjyra, color: '#fff', fontWeight: '700', fontSize: '10px', borderRadius: '6px' }}>
                                                        {l.emertimi.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="text-center border-0">
                                                    <div style={{ width: '10px', height: '10px', backgroundColor: l.ngjyra, borderRadius: '50%', display: 'inline-block', border: '1px solid #eee' }}></div>
                                                </td>
                                                <td className="text-end border-0">
                                                    <button className="btn btn-sm text-danger border-0 fw-bold" style={{fontSize: '10px'}} onClick={() => handleDeleteLabel(l.id)}>FSHIJ</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
