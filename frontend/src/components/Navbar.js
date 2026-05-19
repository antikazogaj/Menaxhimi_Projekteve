import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    
    // Kontrollojmë nëse përdoruesi është i kyçur (nëse ka token)
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        // Fshijmë token-in për të dalë nga sistemi
        localStorage.removeItem('token');
        alert("U çkyçët me sukses! Mirupafshim.");
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
            <div className="container">
                {/* Logoja që të dërgon në faqen kryesore */}
                <Link className="navbar-brand fw-bold" to="/">
                    <span className="text-primary">Task</span> Manager
                </Link>
                
                <div className="d-flex align-items-center">
                    {!token ? (
                        // Nëse NUK është i kyçur, shfaq këto:
                        <>
                            <Link className="btn btn-outline-light me-2 btn-sm px-3" to="/login">Login</Link>
                            <Link className="btn btn-primary btn-sm px-3" to="/register">Register</Link>
                        </>
                    ) : (
                        // Nëse ËSHTË i kyçur, shfaq butonin Logout:
                        <button 
                            className="btn btn-danger btn-sm px-3" 
                            onClick={handleLogout}
                        >
                            Dalja (Logout) 
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
