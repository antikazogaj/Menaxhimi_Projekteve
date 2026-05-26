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
        <div className="container mt-4 animate__animated animate__fadeIn">
            <div className="mb-4">
                <h2 className="fw-bold text-dark text-uppercase mb-1" style={{ letterSpacing: '1px' }}>
                    Menaxhimi i Përdoruesve 
                </h2>
                <p className="text-muted small">Kontrollo rolet dhe qasjen e anëtarëve në sistem</p>
            </div>

            <div className="card shadow-sm border-0" style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                <div className="table-responsive p-3">
                    <table className="table table-hover mb-0 align-middle">
                        <thead style={{ borderBottom: '1px solid #f8f9fa' }}>
                            <tr className="text-muted small text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                <th className="py-3 ps-3 border-0">Emri</th>
                                <th className="py-3 border-0">Email Adresa</th>
                                <th className="py-3 text-center border-0">Roli</th>
                                <th className="py-3 text-end pe-3 border-0">Veprimet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #fcfcfc' }}>
                                    <td className="py-3 ps-3">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-2" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-dark fw-bold">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-secondary small">{u.email}</td>
                                    <td className="py-3 text-center">
                                        <span className={`badge px-3 py-2 ${u.role.toLowerCase() === 'admin' ? 'bg-dark text-white' : 'bg-light text-muted border'}`} style={{ fontSize: '10px', borderRadius: '8px' }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-3 text-end pe-3">
                                        {/* SHTUAM onClick KETU */}
                                        <button 
                                            className="btn btn-sm btn-outline-secondary border-0 fw-bold me-2" 
                                            style={{fontSize: '10px'}}
                                            onClick={() => handleUpdateRole(u.id, u.role)}
                                        >
                                            NDRYSHO ROLIN
                                        </button>
                                        
                                        {/* SHTUAM onClick KETU */}
                                        <button 
                                            className="btn btn-sm btn-outline-danger border-0 fw-bold" 
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
