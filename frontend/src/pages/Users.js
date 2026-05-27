import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Users = () => {
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Funksioni për të marrë listën
    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users', { headers });
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (error) { 
            console.error("Gabim te lista e përdoruesve", error); 
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    // 2. FUNKSIONI PËR NDRYSHIMIN E ROLIT
    const handleUpdateRole = async (userId, currentRole) => {
        const newRole = currentRole.toLowerCase() === 'admin' ? 'user' : 'admin';
        try {
            await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role: newRole }, { headers });
            fetchUsers(); // Rifresko listën menjëherë
        } catch (error) {
            alert("Gabim gjatë ndryshimit të rolit!");
        }
    };

    // 3. FUNKSIONI PËR FSHIRJEN
    const handleDelete = async (userId) => {
        if (window.confirm("A je i sigurt që dëshiron ta fshish këtë përdorues?")) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${userId}`, { headers });
                fetchUsers(); // Rifresko listën menjëherë
            } catch (error) {
                alert("Gabim gjatë fshirjes!");
            }
        }
    };

    return (
        <div className="page-container animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div>
                    <h4 className="fw-bold m-0 text-uppercase" style={{ color: 'var(--text-main)', letterSpacing: '1px' }}>
                        Menaxhimi i Përdoruesve 
                    </h4>
                    <p className="small m-0 mt-1" style={{ color: 'var(--text-light)' }}>Kontrollo rolet dhe qasjen e anëtarëve në sistem</p>
                </div>
            </div>

            <div className="premium-card">
                <div className="table-responsive p-3">
                    <table className="table table-hover mb-0 align-middle">
                        <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <tr className="small text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                                <th className="py-3 ps-3 border-0">Emri</th>
                                <th className="py-3 border-0">Email Adresa</th>
                                <th className="py-3 text-center border-0">Roli</th>
                                <th className="py-3 text-end pe-3 border-0">Veprimet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td className="py-3 ps-3 border-0">
                                        <div className="d-flex align-items-center">
                                            <div className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-2" style={{ width: '30px', height: '30px', fontSize: '12px', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="fw-bold" style={{ color: 'var(--text-main)' }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 small border-0" style={{ color: 'var(--text-light)' }}>{u.email}</td>
                                    <td className="py-3 text-center border-0">
                                        <span className={`badge px-3 py-2 ${u.role.toLowerCase() === 'admin' ? '' : 'border'}`} style={{ fontSize: '10px', borderRadius: '8px', background: u.role.toLowerCase() === 'admin' ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'var(--text-light)', borderColor: 'rgba(255,255,255,0.1)' }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-3 text-end pe-3 border-0">
                                        {/* SHTUAM onClick KETU */}
                                        <button 
                                            className="btn btn-sm border-0 fw-bold me-2" 
                                            style={{fontSize: '10px', color: 'var(--text-accent)'}}
                                            onClick={() => handleUpdateRole(u.id, u.role)}
                                        >
                                            NDRYSHO ROLIN
                                        </button>
                                        
                                        {/* SHTUAM onClick KETU */}
                                        <button 
                                            className="btn btn-sm text-danger border-0 fw-bold" 
                                            style={{fontSize: '10px'}}
                                            onClick={() => handleDelete(u.id)}
                                        >
                                            FSHIJ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
