import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    // Marrja e të dhënave të përdoruesit
    let user = { name: "Shehida", role: "Admin" };
    if (token) {
        try {
            const base64Url = token.split('.');
            const base64 = base64Url[1].replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(window.atob(base64));
            user = {
                name: decoded.name || localStorage.getItem('userName') || "Shehida",
                role: decoded.role || localStorage.getItem('role') || "Admin"
            };
        } catch (e) { console.error("Token error"); }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const navItems = [
        { path: '/', label: 'DASHBOARD', icon: '' },
        { path: '/users', label: 'ANËTARËT', icon: '' },
        { path: '/settings', label: 'KONFIGURIMET', icon: '' },
        { path: '/reports', label: 'RAPORTET', icon: '' },
    ];

    return (
        <div className="d-flex flex-column shadow-sm" style={{ 
            width: '260px', 
            height: '100vh', 
            backgroundColor: '#fbfbfb', // Hiri shumë e lehtë (Off-white)
            position: 'fixed', 
            left: 0, 
            top: 0, 
            zIndex: 1000,
            borderRight: '1px solid #eee'
        }}>
            {/* TITULLI PROFESIONAL */}
            <div className="p-4 mt-4 mb-5">
                <div className="d-flex align-items-center gap-2 px-2">
                    <div style={{ width: '8px', height: '25px', backgroundColor: '#1a1a1a', borderRadius: '2px' }}></div>
                    <h4 className="fw-bold m-0" style={{ letterSpacing: '2px', color: '#1a1a1a', fontSize: '20px' }}>
                         TASKFLOW
                    </h4>
                </div>
                <div className="small text-muted px-2 mt-1" style={{ fontSize: '9px', letterSpacing: '1px' }}>MANAGEMENT SYSTEM</div>
            </div>

            {/* NAVIGIMI I PASTËR */}
            <div className="nav flex-column px-3 flex-grow-1">
                {navItems.map((item) => (
                    <NavLink 
                        key={item.path}
                        to={item.path} 
                        className={({ isActive }) => `
                            nav-link mb-2 py-3 px-3 rounded-3 fw-bold d-flex align-items-center transition-all
                            ${isActive ? 'bg-white shadow-sm text-dark border-start border-dark border-4' : 'text-muted opacity-75'}
                        `}
                        style={{ textDecoration: 'none', transition: '0.2s', fontSize: '11px', letterSpacing: '0.5px' }}
                    >
                        <span className="me-3">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </div>

            {/* USER PROFILE INFO */}
            <div className="p-4 bg-white border-top">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '35px', height: '35px', fontSize: '12px' }}>
                        {user?.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div>
                        <div className="fw-bold text-dark" style={{ fontSize: '12px', lineHeight: '1' }}>
                            {(user?.name || "Shehida").toUpperCase()}
                        </div>
                        <div className="text-muted" style={{ fontSize: '9px', marginTop: '3px' }}>
                            {(user?.role || "ADMIN").toUpperCase()}
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={handleLogout} 
                    className="btn btn-dark w-100 rounded-pill fw-bold shadow-sm"
                    style={{ fontSize: '10px', padding: '10px', letterSpacing: '1px' }}
                >
                    LOGOUT
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
