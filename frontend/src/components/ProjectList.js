import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ totalTasks: 0, totalMembers: 0 });
    
    // --- PJESA E RE PËR KRIJIMIN ---
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ emertimi: '', pershkrimi: '' });

    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        try {
            const resProjects = await axios.get('http://localhost:5000/api/projects', { headers });
            setProjects(Array.isArray(resProjects.data) ? resProjects.data : []);

            const resStats = await axios.get('http://localhost:5000/api/tasks/all/stats', { headers });
            setStats({
                totalTasks: (resStats.data.done || 0) + (resStats.data.pending || 0),
                totalMembers: 5 
            });
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchData(); }, []);

    // FUNKSIONI QË E KRIJON PROJEKTIN
    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/projects', newProject, { headers });
            setShowModal(false);
            setNewProject({ emertimi: '', pershkrimi: '' });
            fetchData(); // Rifreskon listën
            alert("Projekti u krijua!");
        } catch (error) {
            const dataObj = error.response?.data;
            const errorMsg = dataObj ? JSON.stringify(dataObj) : error.message;
            alert("Gabim gjatë krijimit të projektit: " + errorMsg);
        }
    };

    return (
        <div className="dashboard-wrapper">
            {/* STATISTIKAT (Pjesa jote ekzistuese) */}
            <div className="row mb-5 g-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4" style={{ backgroundColor: '#ffffff', borderRadius: '20px' }}>
                        <span className="text-muted small text-uppercase fw-bold mb-2" style={{ fontSize: '10px' }}>Projekte Totale</span>
                        <h2 className="fw-bold text-dark mb-0">{projects.length}</h2>
                    </div>
                </div>
                <div className="col-md-4"><div className="card border-0 shadow-sm p-4" style={{ backgroundColor: '#ffffff', borderRadius: '20px' }}><span className="text-muted small text-uppercase fw-bold mb-2" style={{ fontSize: '10px' }}>Detyra në Sistem</span><h2 className="fw-bold text-dark mb-0">{stats.totalTasks}</h2></div></div>
                <div className="col-md-4"><div className="card border-0 shadow-sm p-4" style={{ backgroundColor: '#ffffff', borderRadius: '20px' }}><span className="text-muted small text-uppercase fw-bold mb-2" style={{ fontSize: '10px' }}>Ekipi Aktiv</span><h2 className="fw-bold text-dark mb-0">{stats.totalMembers}</h2></div></div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h6 className="fw-bold text-muted text-uppercase mb-0" style={{ fontSize: '12px' }}>Projektet Aktive</h6>
                {/* BUTONI QË TASHMË E HAP MODALIN */}
                <button 
                    className="btn btn-dark btn-sm px-4 rounded-pill fw-bold" 
                    onClick={() => setShowModal(true)} 
                    style={{ fontSize: '10px' }}
                >
                    KRIJO PROJEKT +
                </button>
            </div>

            {/* MODAL I THJESHTË PËR KRIJIMIN (Shfaqet vetëm kur showModal është true) */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0" style={{ borderRadius: '20px' }}>
                            <div className="modal-header border-0">
                                <h6 className="fw-bold mb-0">Shto Projekt të Ri</h6>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateProject}>
                                <div className="modal-body">
                                    <input 
                                        type="text" 
                                        className="form-control mb-3 bg-light border-0" 
                                        placeholder="Emri i Projektit" 
                                        value={newProject.emertimi} 
                                        onChange={(e) => setNewProject({...newProject, emertimi: e.target.value})} 
                                        required 
                                    />
                                    <textarea 
                                        className="form-control bg-light border-0" 
                                        placeholder="Përshkrimi" 
                                        value={newProject.pershkrimi} 
                                        onChange={(e) => setNewProject({...newProject, pershkrimi: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="submit" className="btn btn-dark rounded-pill px-4">Ruaj</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* LISTA E KARTAVE (Pjesa jote ekzistuese) */}
            <div className="row">
                {projects.map(p => (
                    <div className="col-md-6 mb-4" key={p.id}>
                        <div className="card h-100 border-0 shadow-sm project-card" style={{ backgroundColor: '#ffffff', borderRadius: '25px', transition: '0.3s' }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <h4 className="fw-bold text-dark mb-0">{p.emertimi}</h4>
                                    <span className="badge bg-light text-muted border px-2" style={{ fontSize: '9px' }}>ID: #{p.id}</span>
                                </div>
                                <p className="text-secondary small mb-4">{p.pershkrimi || "Ska përshkrim."}</p>
                                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                    <Link to={`/project/${p.id}`} className="btn btn-dark btn-sm px-4 rounded-pill fw-bold" style={{ fontSize: '10px' }}>SHIKO DETYRAT →</Link>
                                    <span className="text-muted" style={{ fontSize: '9px' }}>AKTIV</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectList;
