import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import AddProject from './AddProject.js';
import DashboardStats from './DashboardStats';

// ============================================================================
// KOMPONENTI DASHBOARD (Faqja Kryesore)
// Për Profesorin: Ky komponent përdor "Hooks" të React (useState dhe useEffect).
// Qëllimi i tij është të marrë listën e projekteve dhe statistikat nga Backend-i
// dhe t'i shfaqë ato në mënyrë vizuale sapo përdoruesi hyn në faqe.
// ============================================================================

const Dashboard = () => {
    // --- STATE VARIABLES (Gjendja e Aplikacionit) ---
    // Për Profesorin: 'useState' është si një variabël inteligjente.
    // Kur 'projects' ndryshon vlerë (psh. mbushet me të dhëna), React-i e vizaton 
    // përsëri ekranin AUTOMATIKISHT për të shfaqur ndryshimin (Virtual DOM).
    const [projects, setProjects] = useState([]);
    
    // Ruajmë statistikat për kartat e sipërme. Fillon me zëro.
    const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0 });
    
    // Funksion Asinkron për të folur me databazën
    const fetchData = async () => {
        try {
            // Për Profesorin: 'Promise.all' e bën sistemin shumë më të shpejtë!
            // Në vend që t'i kërkoj projektet, të pres, dhe pastaj të kërkoj detyrat,
            // unë i nis TË DYJA kërkesat paralelisht në të njëjtën kohë.
            const [resP, resT] = await Promise.all([
                api.get('/api/projects'), // Lista e projekteve
                api.get('/api/tasks/all/user').catch(() => ({ data: [] })) // Të gjitha detyrat për të nxjerrë totalin
            ]);

            // Sigurohemi që nëse serveri kthen gabim, të kemi një varg bosh [] në vend që t'i bëjmë "crash" aplikacionit.
            const projectsData = Array.isArray(resP.data) ? resP.data : [];
            const tasksData = Array.isArray(resT.data) ? resT.data : [];

            // Përditësojmë States (Kjo shkakton rifreskim të pamjes)
            setProjects(projectsData);
            setStats({
                totalTasks: tasksData.length,
                // Funksioni filter() kalon nëpër të gjitha detyrat dhe numëron vetëm ato që janë "Done"
                completedTasks: tasksData.filter(t => t.statusi?.toLowerCase() === 'done').length 
            });

        } catch (e) { 
            console.error("Gabim gjatë marrjes së të dhënave:", e); 
            setProjects([]);
        }
    };

    // --- useEffect HOOK ---
    // Për Profesorin: 'useEffect' është një "Cikël Jete" (Lifecycle method).
    // Kur e le kllapën të zbrazët '[]' në fund, i them React-it:
    // "Bëje 'fetchData' VETËM NJË HERË sapo hapet kjo faqe, dhe asnjëherë më!"
    // Po të mos ishte [], do i bënte request serverit mijëra herë në sekondë duke e bllokuar (Infinite Loop).
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
