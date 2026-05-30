import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Pastrojmë memorien para një hyrjeje të re
            localStorage.clear();

            const response = await axios.post('http://localhost:5001/api/users/login', { email, password });
            
            if (response.data.token) {
                // RUAJTJA E TË DHËNAVE NË LOCALSTORAGE
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role); // Ruan 'Admin' ose 'User'
                localStorage.setItem('userName', response.data.name); // Ruan emrin (p.sh. Antika)

                alert(` Mirë se vini ${response.data.name}!`);
                
                // Përdorim window.location në vend të navigate që të rifreskohet Sidebar-i menjëherë
                window.location.href = '/'; 
            } else {
                alert(" Gabim: Serveri nuk dërgoi të dhënat e sakta.");
            }
        } catch (error) {
            console.error("Detajet e gabimit:", error.response?.data);
            const msg = error.response?.data?.message || "Email ose fjalëkalim i gabuar!";
            alert("❌ " + msg);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card shadow border-0 mt-5">
                        <div className="card-body p-4 text-center">
                            <h2 className="fw-bold mb-2">TASK PRO </h2>
                            <p className="text-muted mb-4">Kyçu në llogarinë tënde</p>
                            
                            <form onSubmit={handleLogin} className="text-start">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Email Adresa</label>
                                    <input 
                                        type="email" 
                                        className="form-control form-control-lg" 
                                        placeholder="shembull@email.com"
                                        style={{fontSize: '14px'}}
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Fjalëkalimi</label>
                                    <input 
                                        type="password" 
                                        className="form-control form-control-lg" 
                                        placeholder="******"
                                        style={{fontSize: '14px'}}
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm mt-3 fw-bold">
                                    Identifikohu
                                </button>
                            </form>
                            
                            <div className="mt-4 small">
                                Nuk keni llogari? <a href="/register" className="text-decoration-none fw-bold">Regjistrohuni</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
