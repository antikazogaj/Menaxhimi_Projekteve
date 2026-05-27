import React, { useState } from 'react';
import axios from 'axios';

const AddProject = ({ onProjectAdded }) => {
    const [emertimi, setEmertimi] = useState('');
    const [pershkrimi, setPershkrimi] = useState('');
    const [show, setShow] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5001/api/projects', 
                { emertimi, pershkrimi }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmertimi(''); 
            setPershkrimi(''); 
            setShow(false);
            if (onProjectAdded) onProjectAdded(); // Rifreskon Dashboard-in
        } catch (err) {
            const dataObj = err.response?.data;
            const errorMsg = dataObj ? JSON.stringify(dataObj) : err.message;
            alert("Gabim gjatë krijimit të projektit: " + errorMsg);
        }
    };

    return (
        <div className="ms-2">
            {/* BUTONI I VOGËL DHE I PASTER "+" */}
            <button 
                onClick={() => setShow(true)} 
                className="btn btn-dark rounded-circle fw-bold shadow-sm d-flex align-items-center justify-content-center" 
                style={{ width: '40px', height: '40px', fontSize: '20px' }}
            >
                +
            </button>

            {/* MODAL-I QË HAPET VETËM KUR KLIKOHET */}
            {show && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 3000, backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="bg-white p-4 rounded-4 shadow-lg border-0 animate__animated animate__zoomIn" style={{ width: '400px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold m-0">Projekt i Ri</h5>
                            <button onClick={() => setShow(false)} className="btn-close shadow-none"></button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="small fw-bold text-muted mb-1">EMRI I PROJEKTIT</label>
                                <input type="text" className="form-control bg-light border-0 rounded-3 py-2" placeholder="Shkruaj emrin..." value={emertimi} onChange={(e) => setEmertimi(e.target.value)} required />
                            </div>
                            <div className="mb-4">
                                <label className="small fw-bold text-muted mb-1">PËRSHKRIMI (OPSIONALE)</label>
                                <textarea className="form-control bg-light border-0 rounded-3" rows="3" placeholder="Për çfarë bëhet fjalë?" value={pershkrimi} onChange={(e) => setPershkrimi(e.target.value)}></textarea>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-dark w-100 rounded-pill fw-bold py-2">KRIJO PROJEKTIN</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddProject;