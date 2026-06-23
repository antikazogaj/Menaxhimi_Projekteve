import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Plugin për tekstin në qendër të donut
const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
        const { ctx, chartArea: { left, top, right, bottom } } = chart;
        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;

        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const done = chart.data.datasets[0].data[0];
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        ctx.save();

        // Rrethi i brendshëm me gradient
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
        grad.addColorStop(0, 'rgba(99,102,241,0.15)');
        grad.addColorStop(1, 'rgba(99,102,241,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Përqindja
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 30px Inter, sans-serif'; // u bë pak më e vogël që 100% të nxërë
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${pct}%`, cx, cy - 8);

        // Nëntitulli
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('EFIKASITET', cx, cy + 18);

        ctx.restore();
    }
};

ChartJS.register(centerTextPlugin);

const Reports = () => {
    const [stats, setStats] = useState({ done: 0, pending: 0 });
    const [timeStats, setTimeStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animVal, setAnimVal] = useState(0); // Për animacionin e përqindjes (nga 0 deri në x%)
    const token = localStorage.getItem('token');

    // Merr statistikat aktuale nga databaza për këtë përdorues
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/tasks/all/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data) {
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
        const fetchTimeStats = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/time-logs-stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTimeStats(res.data);
            } catch (error) {
                console.error("Gabim te time stats:", error);
            }
        };
        fetchStats();
        fetchTimeStats();
    }, [token]);

    // Llogaritjet e Efikasitetit (rregulla treshe)
    const total = stats.done + stats.pending;
    const efficiency = total > 0 ? Math.round((stats.done / total) * 100) : 0;

    // --- LOGJIKA E ANIMACIONIT (Rritja numërike nga 0 në X%) ---
    useEffect(() => {
        if (!loading) {
            let start = 0;
            const step = Math.ceil(efficiency / 40);
            const timer = setInterval(() => {
                start += step;
                if (start >= efficiency) { setAnimVal(efficiency); clearInterval(timer); }
                else setAnimVal(start);
            }, 20);
            return () => clearInterval(timer);
        }
    }, [loading, efficiency]);

    // Konfigurimi i të dhënave për librarinë 'react-chartjs-2' (Grafiku Donut)
    const chartData = {
        labels: ['Të Kryera', 'Në Proces'],
        datasets: [{
            data: total > 0 ? [stats.done, stats.pending] : [0, 1],
            backgroundColor: [
                'rgba(99,102,241,1)',
                'rgba(255,255,255,0.07)'
            ],
            hoverBackgroundColor: [
                'rgba(129,140,248,1)',
                'rgba(255,255,255,0.12)'
            ],
            borderColor: ['rgba(99,102,241,0.3)', 'rgba(255,255,255,0.05)'],
            borderWidth: 2,
            hoverOffset: 8,
        }],
    };

    const chartOptions = {
        cutout: '72%',
        animation: { animateRotate: true, duration: 1200, easing: 'easeInOutQuart' },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15,15,30,0.95)',
                titleColor: '#a5b4fc',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(99,102,241,0.3)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                    label: (ctx) => ` ${ctx.label}: ${ctx.raw} detyra`
                }
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    if (loading) return (
        <div className="page-container d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 48, height: 48, border: '3px solid rgba(99,102,241,0.2)',
                    borderTop: '3px solid #6366f1', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
                }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Duke u ngarkuar...</span>
            </div>
        </div>
    );

    return (
        <div className="page-container animate__animated animate__fadeIn">
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .stat-card { animation: fadeUp 0.5s ease forwards; }
                .stat-card:nth-child(2) { animation-delay: 0.1s; }
                .stat-card:nth-child(3) { animation-delay: 0.2s; }
                .glow-ring {
                    position: absolute; inset: -2px; border-radius: 50%;
                    background: conic-gradient(
                        rgba(99,102,241,0.6) ${efficiency * 3.6}deg,
                        rgba(255,255,255,0.04) 0deg
                    );
                    filter: blur(6px);
                    z-index: 0;
                }
                .legend-dot {
                    width: 10px; height: 10px; border-radius: 50%;
                    display: inline-block; margin-right: 8px;
                }
                .progress-premium {
                    height: 6px; border-radius: 99px;
                    background: rgba(255,255,255,0.07);
                    overflow: hidden;
                }
                .progress-premium-fill {
                    height: 100%; border-radius: 99px;
                    background: linear-gradient(90deg, #6366f1, #818cf8);
                    transition: width 1s ease;
                }
            `}</style>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div>
                    <h4 className="fw-bold m-0 text-uppercase" style={{ color: 'var(--text-main)', letterSpacing: '2px' }}>
                        📊 Raportet
                    </h4>
                    <p className="small m-0 mt-1" style={{ color: 'var(--text-light)' }}>Statistikat e detyrave tuaja në kohë reale</p>
                </div>
                <div style={{
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: 12, padding: '6px 16px', fontSize: 11,
                    color: '#a5b4fc', fontWeight: 700, letterSpacing: 1
                }}>
                    {total} DETYRA GJITHSEJ
                </div>
            </div>

            <div className="row g-4">

                {/* --- DONUT CHART PREMIUM --- */}
                <div className="col-md-5">
                    <div className="premium-card p-4 h-100 d-flex flex-column align-items-center justify-content-center" style={{ position: 'relative', overflow: 'hidden' }}>

                        {/* Sfond dekorativ */}
                        <div style={{
                            position: 'absolute', top: -60, right: -60,
                            width: 200, height: 200, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }} />

                        <h6 className="small text-uppercase fw-bold text-center mb-4" style={{ color: 'rgba(165,180,252,0.8)', letterSpacing: '2px', fontSize: 10 }}>
                            Statistikat Globale
                        </h6>

                        {/* Donut me glow ring */}
                        <div style={{ position: 'relative', width: 220, height: 220 }}>
                            <div className="glow-ring" />
                            <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                                {total > 0 ? (
                                    <Doughnut data={chartData} options={chartOptions} key={`${stats.done}-${stats.pending}`} />
                                ) : (
                                    <Doughnut data={chartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { enabled: false } } }} />
                                )}
                            </div>
                        </div>

                        {/* Legjenda */}
                        <div className="d-flex gap-4 mt-4">
                            <div className="d-flex align-items-center">
                                <span className="legend-dot" style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.6)' }} />
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Të Kryera <strong style={{ color: '#fff' }}>{stats.done}</strong></span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="legend-dot" style={{ background: 'rgba(255,255,255,0.2)' }} />
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Në Proces <strong style={{ color: '#fff' }}>{stats.pending}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PANELI I DJATHTË --- */}
                <div className="col-md-7">
                    <div className="premium-card p-4 h-100 d-flex flex-column" style={{ gap: 16 }}>
                        <h5 className="fw-bold mb-2" style={{ color: '#a5b4fc', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
                            Përmbledhja Ekzekutive
                        </h5>

                        {/* Karta statistike */}
                        {[
                            { label: 'Detyra të Kryera', value: stats.done, color: '#6366f1', icon: '✅', pct: total > 0 ? Math.round(stats.done / total * 100) : 0 },
                            { label: 'Detyra në Pritje', value: stats.pending, color: '#f59e0b', icon: '⏳', pct: total > 0 ? Math.round(stats.pending / total * 100) : 0 },
                            { label: 'Gjithsej Detyra', value: total, color: '#818cf8', icon: '📋', pct: 100 },
                        ].map((item, i) => (
                            <div key={i} className="stat-card" style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: `1px solid rgba(255,255,255,0.07)`,
                                borderLeft: `3px solid ${item.color}`,
                                borderRadius: 12,
                                padding: '14px 18px',
                                opacity: 0
                            }}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{item.value}</span>
                                </div>
                                <div className="progress-premium">
                                    <div className="progress-premium-fill" style={{
                                        width: `${item.pct}%`,
                                        background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`
                                    }} />
                                </div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5, textAlign: 'right' }}>
                                    {item.pct}% e totalit
                                </div>
                            </div>
                        ))}

                        {/* Efikasiteti global */}
                        <div className="d-flex justify-content-center mt-auto">
                            <div style={{
                                width: '100%',
                                maxWidth: '320px',
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(129,140,248,0.03))',
                                border: '1px solid rgba(99,102,241,0.3)',
                                borderRadius: 16,
                                padding: '20px',
                                textAlign: 'center',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }}>
                                <span style={{ fontSize: 10, color: '#a5b4fc', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                                    ⚡ Efikasiteti Overall
                                </span>
                                <div className="mb-3" style={{ fontSize: 38, fontWeight: 900, color: '#fff', textShadow: '0 2px 10px rgba(99,102,241,0.5)', lineHeight: 1 }}>
                                    {animVal}%
                                </div>
                                <div className="progress-premium mx-auto" style={{ height: '8px', width: '100%', maxWidth: '200px' }}>
                                    <div className="progress-premium-fill" style={{ width: `${efficiency}%` }} />
                                </div>
                                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: '12px 0 0', fontWeight: '500' }}>
                                    {efficiency >= 75 ? '🚀 Shkëlqyeshëm! Vazhdo kështu!' : efficiency >= 50 ? '💪 Mirë, mund të bësh edhe më shumë!' : '📌 Ka hapësirë për përmirësim.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BAR CHART: Koha e Shpenzuar */}
            <div className="row g-4 mt-2 justify-content-center">
                <div className="col-md-9">
                    <div className="premium-card p-4" style={{ borderTop: '3px solid #818cf8', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                        <h5 className="fw-bold mb-4 text-center" style={{ color: '#a5b4fc', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
                            Koha e Shpenzuar (Minuta) nga Anëtarët
                        </h5>
                        <div style={{ height: '300px', width: '100%' }}>
                            <Bar 
                                data={{
                                    labels: timeStats.map(s => s.name),
                                    datasets: [{
                                        label: 'Minuta Punë',
                                        data: timeStats.map(s => Number(s.total_minutes)),
                                        backgroundColor: 'rgba(129,140,248,0.85)',
                                        borderColor: 'rgba(99,102,241,1)',
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        maxBarThickness: 45
                                    }]
                                }} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: 'rgba(15,15,30,0.95)',
                                            titleColor: '#a5b4fc',
                                            bodyColor: '#e2e8f0',
                                            padding: 12,
                                            cornerRadius: 8,
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: 'rgba(255,255,255,0.05)', borderDash: [5, 5] },
                                            ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10 } }
                                        },
                                        x: {
                                            grid: { display: false },
                                            ticks: { color: 'rgba(255,255,255,0.8)', font: { size: 11, weight: 'bold' } }
                                        }
                                    }
                                }} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
