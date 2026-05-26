import React, { useEffect, useState } from 'react';
import axios from 'axios';
// RREGULLIMI: Importet e sakta për Chart.js që të mos dalë gabimi i kuq
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const Reports = () => {
    // Fillojmë me objekt, fiks siç po e dërgon serveri në foto
    const [stats, setStats] = useState({ done: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/tasks/all/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Serveri po dërgon: {done: 2, pending: 4}
                console.log("Të dhënat reale:", res.data);

                if (res.data) {
                    // Nëse vjen si objekt {done, pending} e marrim direkt
                    // Nëse vjen si listë detyrash, i filtrojmë (siguri e dyfishtë)
                    if (Array.isArray(res.data)) {
                        setStats({
                            done: res.data.filter(t => t.statusi === 'Done').length,
                            pending: res.data.filter(t => t.statusi !== 'Done').length
                        });
                    } else {
                        setStats({
                            done: Number(res.data.done) || 0,
                            pending: Number(res.data.pending) || 0
                        });
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error("Gabim:", error);
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    const total = stats.done + stats.pending;
    const efficiency = total > 0 ? Math.round((stats.done / total) * 100) : 0;

    const data = {
        labels: ['Të Kryera', 'Në Proces'],
        datasets: [{
            data: [stats.done, stats.pending],
            backgroundColor: ['#1a1a1a', '#e9ecef'],
            borderColor: '#ffffff',
            borderWidth: 2,
        }],
    };

    if (loading) return <div className="p-5 text-center">Duke u ngarkuar...</div>;

    return (
        <div className="container mt-4">
            <h2 className="fw-bold text-dark text-uppercase mb-4">Raportet </h2>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 p-4 h-100" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
                        <h6 className="text-muted small text-uppercase fw-bold text-center mb-4">Statistikat Globale</h6>
                        <div style={{ height: '280px', margin: '0 auto', width: '100%' }}>
                            {/* KETU NDODH NDRYSHIMI: Sido që të vijnë të dhënat, grafiku do të shfaqet */}
                            {total > 0 ? (
                                <Pie data={data} key={`${stats.done}-${stats.pending}`} />
                            ) : (
                                <div className="text-center py-5 text-muted small">Nuk ka të dhëna në databazë.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm border-0 p-5 h-100 text-white" style={{ borderRadius: '20px', backgroundColor: '#1a1a1a' }}>
                        <h5 className="fw-bold mb-4">Përmbledhja Ekzekutive</h5>
                        <div className="d-flex justify-content-between mb-4 border-bottom border-secondary pb-2">
                            <span className="opacity-75 small">DETYRA TË KRYERA</span>
                            <span className="h4 fw-bold">{stats.done}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-4 border-bottom border-secondary pb-2">
                            <span className="opacity-75 small">DETYRA NË PRITJE</span>
                            <span className="h4 fw-bold">{stats.pending}</span>
                        </div>
                        <div className="mt-auto pt-4">
                            <div className="d-flex justify-content-between align-items-end mb-2">
                                <span className="small opacity-75">EFIKASITETI</span>
                                <span className="fw-bold">{efficiency}%</span>
                            </div>
                            <div className="progress" style={{ height: '8px', backgroundColor: '#333' }}>
                                <div className="progress-bar bg-white" style={{ width: `${efficiency}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
