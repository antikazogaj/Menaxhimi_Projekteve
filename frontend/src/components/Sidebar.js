import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    // Theme State
    const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');
    
    React.useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };
    
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
        <div className="d-flex flex-column glass-panel" style={{ 
            width: '260px', 
            height: '100vh', 
            position: 'fixed', 
            left: 0, 
            top: 0, 
            zIndex: 1000,
            borderRight: '1px solid rgba(255,255,255,0.1)'
        }}>
            {/* TITULLI PROFESIONAL */}
            <div className="p-4 mt-4 mb-5">
                <div className="d-flex align-items-center gap-2 px-2">
                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>T</span>
                    </div>
                    <h4 className="fw-bold m-0" style={{ letterSpacing: '1px', color: 'var(--text-main)', fontSize: '20px' }}>
                         TaskFlow
                    </h4>
                </div>
                <div className="small px-2 mt-1" style={{ fontSize: '10px', letterSpacing: '1px', color: 'var(--text-light)', fontWeight: '500' }}>MANAGEMENT SYSTEM</div>
            </div>

            {/* NAVIGIMI I PASTËR */}
            <div className="nav flex-column px-3 flex-grow-1">
                {navItems.map((item) => (
                    <NavLink 
                        key={item.path}
                        to={item.path} 
                        className={({ isActive }) => `
                            nav-link mb-2 py-3 px-3 sidebar-link d-flex align-items-center
                            ${isActive ? 'active' : ''}
                        `}
                        style={{ textDecoration: 'none', fontSize: '12px', letterSpacing: '0.5px' }}
                    >
                        <span className="me-3">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </div>

            {/* USER PROFILE INFO */}
            <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', fontSize: '14px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', boxShadow: 'var(--shadow-sm)' }}>
                        {user?.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div>
                        <div className="fw-bold" style={{ fontSize: '13px', lineHeight: '1', color: 'var(--text-main)' }}>
                            {(user?.name || "Shehida")}
                        </div>
                        <div style={{ fontSize: '10px', marginTop: '4px', color: 'var(--primary)', fontWeight: '600' }}>
                            {(user?.role || "ADMIN").toUpperCase()}
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={handleLogout} 
                    className="btn btn-premium w-100"
                    style={{ fontSize: '11px', padding: '12px', letterSpacing: '1px' }}
                >
                    LOGOUT
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
