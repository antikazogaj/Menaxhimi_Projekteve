import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AddProject from './AddProject';
import DashboardStats from './DashboardStats';

const Dashboard = () => {
    // 1. Deklarojmë States (Këto që të mungonin)
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0 });
    
    // 2. Deklarojmë Headers (Edhe kjo të mungonte)
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // 3. Funksioni i rregulluar
    const fetchData = async () => {
        try {
            const [resP, resT] = await Promise.all([
                axios.get('http://localhost:5001/api/projects', { headers }),
                axios.get('http://localhost:5001/api/tasks/all/user', { headers }).catch(() => ({ data: [] }))
            ]);

            const projectsData = Array.isArray(resP.data) ? resP.data : [];
            const tasksData = Array.isArray(resT.data) ? resT.data : [];

            setProjects(projectsData);
            setStats({
                totalTasks: tasksData.length,
                completedTasks: tasksData.filter(t => t.statusi?.toLowerCase() === 'done').length
            });

        } catch (e) { 
            console.error("Gabim:", e); 
            setProjects([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="page-container animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <h4 className="fw-bold m-0" style={{ color: 'var(--text-main)' }}>MENAXHIMI I PROJEKTEVE</h4>
                <AddProject onProjectAdded={fetchData} />
            </div>

            {/* KARTAT E STATISTIKAVE */}
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="premium-card p-4">
                        <div className="small fw-bold mb-1" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>PROJEKTE</div>
                        <h2 className="fw-bold m-0" style={{ color: 'var(--primary)' }}> {projects.length}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="premium-card p-4">
                        <div className="small fw-bold mb-1" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>DETYRA TOTALE</div>
                        <h2 className="fw-bold m-0" style={{ color: 'var(--accent)' }}> {stats.totalTasks}</h2>
                    </div>
                </div>
            </div>

            <h6 className="fw-bold mb-4 text-uppercase small" style={{ letterSpacing: '1px', color: 'var(--text-light)' }}>Projektet e Mia</h6>
            <div className="row g-4">
                {projects.map(p => (
                    <div key={p.id} className="col-md-4">
                        <div className="premium-card h-100 p-4 d-flex flex-column">
                            <h5 className="fw-bold mb-2" style={{ color: 'var(--text-main)' }}>{p.emertimi}</h5>
                            <p className="small mb-4 flex-grow-1" style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>{p.pershkrimi || 'Pa përshkrim.'}</p>
                            <Link to={`/project/${p.id}`} className="btn btn-premium w-100 mt-auto text-center" style={{ textDecoration: 'none', fontSize: '12px' }}>
                                HAPE PROJEKTIN →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
