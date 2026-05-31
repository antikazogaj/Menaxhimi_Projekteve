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
    const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || '');
    const [newPassword, setNewPassword] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchLabels = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/labels', { headers });
            setLabels(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error("Gabim gjatë marrjes së etiketave", e); }
    };

    useEffect(() => { fetchLabels(); }, []);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await axios.post('http://localhost:5001/api/users/avatar', formData, {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' }
            });
            const newAvatarUrl = res.data.avatar_url;
            setAvatar(newAvatarUrl);
            localStorage.setItem('avatar', newAvatarUrl);
            alert("Avatari u përditësua me sukses! (Rifresko faqen për ta parë kudo)");
            // Rifreskojmë faqen që Navbari ta marrë direkt
            window.location.reload();
        } catch (err) {
            alert("Gabim gjatë ngarkimit të avatarit!");
        }
    };

    const handleAddLabel = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/labels', { emertimi, ngjyra }, { headers });
            setEmertimi(''); setNgjyra('#000000'); fetchLabels();
        } catch (e) { alert("Gabim gjatë shtimit të etiketës!"); }
    };

    const handleDeleteLabel = async (id) => {
        if (!window.confirm("A jeni i sigurt që dëshironi ta fshini këtë etiketë?")) return;
        try {
            await axios.delete(`http://localhost:5001/api/labels/${id}`, { headers });
            fetchLabels();
        } catch (e) { 
            if (e.response && e.response.data && e.response.data.message) {
                alert(e.response.data.message);
            } else {
                alert("Gabim gjatë fshirjes!");
            }
        }
    };

    return (
        <div className="page-container animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div>
                    <h4 className="fw-bold m-0 text-uppercase" style={{ color: 'var(--text-main)', letterSpacing: '1px' }}>KONFIGURIMET</h4>
                    <p className="small m-0 mt-1" style={{ color: 'var(--text-light)' }}>Menaxho llogarinë dhe etiketat e sistemit</p>
                </div>
            </div>

            {/* SEKSIONI 1: PROFILI I PËRDORUESIT (LIGHT STYLE) */}
            <div className="premium-card p-4 mb-5">
                <div className="row align-items-center">
                    <div className="col-md-2 text-center">
                        <div className="position-relative d-inline-block">
                            {avatar && avatar !== 'null' ? (
                                <img src={`http://localhost:5001/uploads/${avatar}`} alt="Avatar" className="rounded-circle object-fit-cover shadow-sm" style={{ width: '80px', height: '80px', border: '3px solid var(--accent)' }} />
                            ) : (
                                <div className="text-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '80px', height: '80px', fontSize: '30px', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                                    {userName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label className="position-absolute bottom-0 end-0 bg-premium text-white rounded-circle d-flex align-items-center justify-content-center shadow cursor-pointer" style={{ width: '28px', height: '28px', border: '2px solid var(--sidebar-bg)' }} title="Ndërro foton">
                                <span style={{fontSize:'12px'}}>📷</span>
                                <input type="file" className="d-none" accept="image/*" onChange={handleAvatarUpload} />
                            </label>
                        </div>
                    </div>
                    <div className="col-md-6 border-start ps-4">
                        <h4 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>{userName}</h4>
                        <p className="mb-3" style={{ color: 'var(--text-light)' }}>Roli: <span className="badge border px-3" style={{fontSize: '10px', color: 'var(--text-main)', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)'}}>{userRole?.toUpperCase()}</span></p>
                        <div className="d-flex gap-4">
                            <div>
                                <small className="d-block text-uppercase fw-bold" style={{fontSize: '9px', color: 'var(--text-muted)'}}>Statusi</small>
                                <small className="text-success fw-bold">● AKTIV</small>
                            </div>
                            <div>
                                <small className="d-block text-uppercase fw-bold" style={{fontSize: '9px', color: 'var(--text-muted)'}}>Llogaria</small>
                                <small style={{ color: 'var(--text-light)' }}>Personal Access</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <form onSubmit={(e) => { e.preventDefault(); alert("U dërgua!"); setNewPassword(''); }}>
                            <label className="small fw-bold mb-2" style={{fontSize: '10px', color: 'var(--text-light)'}}>NDRYSHO FJALËKALIMIN</label>
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    className="form-control border-0 text-white" 
                                    placeholder="Fjalëkalimi i ri..."
                                    style={{ borderRadius: '10px 0 0 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button className="btn btn-premium px-4" style={{ borderRadius: '0 10px 10px 0', fontSize: '11px' }}>UPDATE</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* SEKSIONI 2: SHTO ETIKETË */}
                <div className="col-md-5">
                    <div className="premium-card p-4 h-100">
                        <h6 className="small text-uppercase fw-bold mb-4" style={{ color: 'var(--primary)', letterSpacing: '1px' }}>Shto Etiketë të Re</h6>
                        <form onSubmit={handleAddLabel}>
                            <div className="mb-3">
                                <label className="small fw-bold mb-1" style={{fontSize: '10px', color: 'var(--text-light)'}}>EMËRTIMI</label>
                                <input 
                                    type="text" 
                                    className="form-control border-0 text-white" 
                                    style={{ borderRadius: '10px', background: 'rgba(0,0,0,0.2)' }}
                                    value={emertimi} 
                                    onChange={(e) => setEmertimi(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label className="small fw-bold mb-1" style={{fontSize: '10px', color: 'var(--text-light)'}}>ZGJIDH NGJYRËN</label>
                                <div className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                    <input 
                                        type="color" 
                                        className="form-control form-control-color border-0 bg-transparent" 
                                        style={{ width: '45px', height: '35px' }}
                                        value={ngjyra} 
                                        onChange={(e) => setNgjyra(e.target.value)} 
                                    />
                                    <span className="small font-monospace" style={{ color: 'var(--text-main)' }}>{ngjyra.toUpperCase()}</span>
                                </div>
                            </div>
                            <button className="btn btn-dark w-100 fw-bold rounded-pill shadow-sm py-2" style={{fontSize: '11px'}}>RUAJ ETIKETËN</button>
                        </form>
                    </div>
                </div>

                {/* SEKSIONI 3: LISTA E ETIKETAVE */}
                <div className="col-md-7">
                    <div className="premium-card h-100">
                        <div className="p-4">
                            <h6 className="small text-uppercase fw-bold mb-4" style={{ color: 'var(--accent)', letterSpacing: '1px' }}>Menaxho Etiketat</h6>
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead>
                                        <tr className="small text-uppercase" style={{fontSize: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)'}}>
                                            <th className="py-3 border-0">Etiketa</th>
                                            <th className="py-3 text-center border-0">Mostra</th>
                                            <th className="py-3 text-end border-0">Veprimi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {labels.map(l => (
                                            <tr key={l.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
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
