import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // TESTI 1: A po reagon butoni?
        console.log("Duke dërguar të dhënat:", { name, email, password });

        try {
            const response = await axios.post('http://localhost:5000/api/users/register', { 
    name, 
    email, 
    password 
});


            if (response.status === 201 || response.status === 200) {
                alert(" Sukses: U regjistruat në databazë!");
                navigate('/login');
            }
        } catch (error) {
            // TESTI 2: Kapja e gabimit të saktë
            console.error("Detajet e gabimit:", error);
            
            let mesazhi = "Serveri nuk po përgjigjet! Sigurohu që: \n1. XAMPP (MySQL) është START \n2. Backend (node server.js) është START";
            
            if (error.response) {
                // Gabimi vjen nga Backend-i (p.sh. Email ekziston ose gabim SQL)
                mesazhi = "Gabim nga Serveri: " + (error.response.data.message || "Gabim i panjohur");
            } else if (error.request) {
                // Gabim rrjeti (React nuk e gjen dot portin 5000)
                mesazhi = "React nuk po mundet ta gjejë Backend-in në portin 5000!";
            }

            alert("" + mesazhi);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow border-0">
                        <div className="card-body p-4">
                            <h3 className="text-center mb-4">Krijo Llogari</h3>
                            
                            {/* FORM onSubmit është shumë e rëndësishme */}
                            <form onSubmit={handleRegister}>
                                <div className="mb-3">
                                    <label className="form-label">Emri i Plotë</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Emri juaj" 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        placeholder="email@test.com" 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Fjalëkalimi</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="******" 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                                
                                {/* BUTTON type="submit" duhet të jetë brenda formës */}
                                <button type="submit" className="btn btn-success w-100 shadow-sm">
                                    Regjistrohu
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
