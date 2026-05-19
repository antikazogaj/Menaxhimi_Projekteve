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
                axios.get('http://localhost:5000/api/projects', { headers }),
                axios.get('http://localhost:5000/api/tasks/all/user', { headers }).catch(() => ({ data: [] }))
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
        <div className="p-5">
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                <h4 className="fw-bold text-dark m-0">MENAXHIMI I PROJEKTEVE</h4>
                <AddProject onProjectAdded={fetchData} />
            </div>

            {/* KARTAT E STATISTIKAVE */}
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px' }}>
                        <div className="text-muted small fw-bold mb-1">PROJEKTE</div>
                        <h2 className="fw-bold m-0"> {projects.length}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px' }}>
                        <div className="text-muted small fw-bold mb-1">DETYRA TOTALE</div>
                        <h2 className="fw-bold m-0"> {stats.totalTasks}</h2>
                    </div>
                </div>
            </div>

            <h6 className="fw-bold text-secondary mb-4 text-uppercase small">Projektet e Mia</h6>
            <div className="row">
                {projects.map(p => (
                    <div key={p.id} className="col-md-4 mb-4">
                        <div className="card h-100 p-4 border-0 shadow-sm bg-white" style={{ borderRadius: '20px' }}>
                            <h5 className="fw-bold text-dark mb-2">{p.emertimi}</h5>
                            <p className="text-muted small mb-4">{p.pershkrimi || 'Pa përshkrim.'}</p>
                            <Link to={`/project/${p.id}`} className="btn btn-dark w-100 mt-auto rounded-pill py-2 fw-bold" style={{ fontSize: '12px' }}>
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
