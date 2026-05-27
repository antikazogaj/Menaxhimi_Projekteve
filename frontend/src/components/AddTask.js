import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddTask = ({ projectId, onTaskAdded }) => {
    const [titulli, setTitulli] = useState('');
    const [pershkrimi, setPershkrimi] = useState('');
    const [dataAfatit, setDataAfatit] = useState('');
    const [labelId, setLabelId] = useState('');
    const [prioriteti, setPrioriteti] = useState('Medium');
    const [sprintId, setSprintId] = useState(''); 
    const [labels, setLabels] = useState([]);
    const [sprints, setSprints] = useState([]);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [resL, resS] = await Promise.all([
                    axios.get('http://localhost:5001/api/labels', { headers }),
                    axios.get(`http://localhost:5001/api/sprints/${projectId}`, { headers })
                ]);
                setLabels(Array.isArray(resL.data) ? resL.data : []);
                setSprints(Array.isArray(resS.data) ? resS.data : []);
            } catch (error) { console.error(error); }
        };
        fetchMetadata();
    }, [projectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/tasks', {
                project_id: Number(projectId), titulli, pershkrimi, sprint_id: sprintId || null,
                data_afatit: dataAfatit, label_id: labelId || null, prioriteti, statusi: 'To Do'
            }, { headers });
            setTitulli(''); setPershkrimi(''); setDataAfatit(''); setLabelId(''); setSprintId('');
            onTaskAdded(); 
        } catch (error) {
            const dataObj = error.response?.data;
            const errorMsg = dataObj ? JSON.stringify(dataObj) : error.message;
            alert("❌ Gabim gjatë shtimit të detyrës: " + errorMsg);
        }
    };

    return (
        <div className="premium-card mb-5">
            <div className="card-body p-4">
                <form onSubmit={handleSubmit} className="row g-3 align-items-end">
                    <div className="col-md-2">
                        <label className="fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>TITULLI</label>
                        <input type="text" className="form-control border-0 py-2" placeholder="Emri..." value={titulli} onChange={(e) => setTitulli(e.target.value)} required style={{ borderRadius: '10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    <div className="col-md-3">
                        <label className="fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>PËRSHKRIMI</label>
                        <input type="text" className="form-control border-0 py-2" placeholder="Detaje..." value={pershkrimi} onChange={(e) => setPershkrimi(e.target.value)} style={{ borderRadius: '10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    <div className="col-md-2">
                        <label className="fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>ZGJIDH FAZËN</label>
                        <select className="form-select border-0 py-2" value={sprintId} onChange={(e) => setSprintId(e.target.value)} style={{ borderRadius: '10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }}>
                            <option value="">Pa fazë</option>
                            {sprints.map(s => <option key={s.id} value={s.id}>{s.emertimi}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>ETIKETA</label>
                        <select className="form-select border-0 py-2" value={labelId} onChange={(e) => setLabelId(e.target.value)} style={{ borderRadius: '10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }}>
                            <option value="">Pa</option>
                            {labels.map(l => <option key={l.id} value={l.id}>{l.emertimi}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>AFATI</label>
                        <input type="date" className="form-control border-0 py-2" value={dataAfatit} onChange={(e) => setDataAfatit(e.target.value)} required style={{ borderRadius: '10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    <div className="col-md-1">
                        <button type="submit" className="btn btn-premium w-100 fw-bold py-2 shadow-sm" style={{ borderRadius: '10px' }}>+</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTask;
