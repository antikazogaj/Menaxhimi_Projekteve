import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

    // --- NOTIFICATIONS LOGIC ---
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:5001/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Përditëso njoftimet çdo 30 sekonda
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const markAsRead = async (id, link) => {
        try {
            await axios.put(`http://localhost:5001/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
            if (link) {
                navigate(link);
                setShowNotifications(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async (e) => {
        e.stopPropagation();
        try {
            await axios.put('http://localhost:5001/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;
    // ---------------------------

    const navItems = [
        { path: '/', label: 'DASHBOARD', icon: '📊' },
        { path: '/activities', label: 'HISTORIKU', icon: '🕵️‍♂️' },
        { path: '/users', label: 'ANËTARËT', icon: '👥' },
        { path: '/settings', label: 'KONFIGURIMET', icon: '⚙️' },
        { path: '/reports', label: 'RAPORTET', icon: '📈' },
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

            {/* USER PROFILE INFO & NOTIFICATIONS */}
            <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-3">
                        {localStorage.getItem('avatar') && localStorage.getItem('avatar') !== 'null' ? (
                            <img src={`http://localhost:5001/uploads/${localStorage.getItem('avatar')}`} alt="Avatar" className="rounded-circle object-fit-cover shadow-sm" style={{ width: '40px', height: '40px', border: '2px solid var(--accent)' }} />
                        ) : (
                            <div className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', fontSize: '14px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', boxShadow: 'var(--shadow-sm)' }}>
                                {user?.name?.charAt(0).toUpperCase() || "S"}
                            </div>
                        )}
                        <div>
                            <div className="fw-bold" style={{ fontSize: '13px', lineHeight: '1', color: 'var(--text-main)' }}>
                                {(user?.name || "Shehida")}
                            </div>
                            <div style={{ fontSize: '10px', marginTop: '4px', color: 'var(--primary)', fontWeight: '600' }}>
                                {(user?.role || "ADMIN").toUpperCase()}
                            </div>
                        </div>
                    </div>
                    
                    {/* BELL ICON */}
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
                        <span style={{ fontSize: '18px', filter: unreadCount > 0 ? 'drop-shadow(0 0 8px rgba(99,102,241,0.8))' : 'none' }}>🔔</span>
                        {unreadCount > 0 && (
                            <span className="badge bg-danger rounded-pill" style={{ position: 'absolute', top: '-5px', right: '-8px', fontSize: '9px', padding: '3px 5px', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* NOTIFICATIONS DROPDOWN */}
                {showNotifications && (
                    <div className="notifications-dropdown animate__animated animate__fadeInUp animate__faster" style={{
                        position: 'absolute', bottom: '100%', right: '10px', left: '10px',
                        background: 'rgba(20,20,35,0.98)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '12px', padding: '14px', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
                        zIndex: 1001, maxHeight: '350px', overflowY: 'auto', backdropFilter: 'blur(10px)',
                        marginBottom: '10px'
                    }}>
                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                            <h6 className="fw-bold m-0" style={{ fontSize: '12px', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Njoftimet
                            </h6>
                            {unreadCount > 0 && (
                                <span className="badge" onClick={markAllAsRead} style={{cursor: 'pointer', fontSize: '9px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)'}}>
                                    Lexo të gjitha
                                </span>
                            )}
                        </div>
                        {notifications.length === 0 ? (
                            <div className="text-center p-3" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                                Nuk keni njoftime të reja.
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {notifications.map(n => (
                                    <div key={n.id} onClick={() => markAsRead(n.id, n.link)} 
                                        className="p-2 rounded notification-item" 
                                        style={{ 
                                            background: n.is_read ? 'rgba(255,255,255,0.03)' : 'linear-gradient(90deg, rgba(99,102,241,0.15), rgba(255,255,255,0.03))',
                                            borderLeft: n.is_read ? '3px solid transparent' : '3px solid #818cf8',
                                            cursor: 'pointer', transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = n.is_read ? 'rgba(255,255,255,0.03)' : 'linear-gradient(90deg, rgba(99,102,241,0.15), rgba(255,255,255,0.03))'}
                                    >
                                        <p className="m-0" style={{ fontSize: '11px', color: n.is_read ? 'rgba(255,255,255,0.5)' : '#fff', fontWeight: n.is_read ? 'normal' : '500', lineHeight: '1.4' }}>
                                            {n.message}
                                        </p>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                                            {new Date(n.data).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                <button 
                    onClick={handleLogout} 
                    className="btn w-100"
                    style={{ fontSize: '11px', padding: '12px', letterSpacing: '1px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-light)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,0,0,0.1)'; e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.borderColor = 'rgba(255,0,0,0.3)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-light)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                >
                    <i className="bi bi-box-arrow-right me-2"></i> LOGOUT
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
