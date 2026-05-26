import React, { useState } from 'react';
import axios from 'axios';

const AddSprint = ({ projectId, onSprintAdded }) => {
    const [emertimi, setEmertimi] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5000/api/sprints', {
                project_id: projectId,
                emertimi: emertimi,
                statusi: 'Active'
            }, { headers: { Authorization: `Bearer ${token}` } });

            setEmertimi('');
            onSprintAdded(); // Rifreskon listën lart
        } catch (error) { alert("Gabim gjatë shtimit të fazës!"); }
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex gap-2 mb-3">
            <input 
                type="text" 
                className="form-control form-control-sm bg-light border-0" 
                placeholder="Emri i fazës (p.sh. Sprint 3)..." 
                value={emertimi}
                onChange={(e) => setEmertimi(e.target.value)}
                required
                style={{ borderRadius: '8px', fontSize: '12px' }}
            />
            <button type="submit" className="btn btn-dark btn-sm fw-bold">+</button>
        </form>
    );
};

export default AddSprint;
