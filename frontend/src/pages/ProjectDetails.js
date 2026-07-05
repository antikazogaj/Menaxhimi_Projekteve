import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AddTask from '../components/AddTask';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import api from '../api';

// Regjistro elementët e Chart.js për grafikun Line
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [activities, setActivities] = useState([]); 
    const [sprints, setSprints] = useState([]);
    const [allLabels, setAllLabels] = useState([]);
    const [email, setEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSprint, setSelectedSprint] = useState(null);
    const [newSprintName, setNewSprintName] = useState('');
    const [burndownData, setBurndownData] = useState(null);
    const [commentText, setCommentText] = useState({});
    const [selectedFile, setSelectedFile] = useState({});
    const [timeLogMinutes, setTimeLogMinutes] = useState({}); // State për inputin e kohës
    const [viewMode, setViewMode] = useState('board'); // 'board' ose 'gantt'

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // --- FUNKSIONI KRYESOR PËR MARRJEN E TË DHËNAVE ---
    const fetchData = async () => {
        try {
            const config = { headers };
            // Përdorim Promise.all për të marrë 5 lloje të dhënash në të njëjtën kohë
            // Kjo e bën faqen të hapet shumë më shpejt se sa t'i merrnim një nga një
            const [resT, resM, resA, resS, resL] = await Promise.all([
                axios.get(`http://localhost:5001/api/tasks/${id}`, config).catch(() => ({ data: [] })), // Detyrat
                axios.get(`http://localhost:5001/api/members/${id}`, config).catch(() => ({ data: [] })), // Anëtarët
                axios.get(`http://localhost:5001/api/activities/${id}`, config).catch(() => ({ data: [] })), // Aktivitetet (Historiku)
                axios.get(`http://localhost:5001/api/sprints/${id}`, config).catch(() => ({ data: [] })), // Fazat
                axios.get(`http://localhost:5001/api/labels`, config).catch(() => ({ data: [] })) // Etiketat
            ]);
            setTasks(Array.isArray(resT.data) ? resT.data : []);
            setMembers(Array.isArray(resM.data) ? resM.data : []);
            setActivities(Array.isArray(resA.data) ? resA.data : []);
            setSprints(Array.isArray(resS.data) ? resS.data : []);
            setAllLabels(Array.isArray(resL.data) ? resL.data : []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, [id]);

    // 1. SHTIMI I ANETARIT (RIKTHTYER)
    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/members/add', { project_id: id, email, roli: 'Member' }, { headers });
            setEmail(''); fetchData();
        } catch (e) { alert("Përdoruesi nuk u gjet!"); }
    };

    // 2. SHTIMI I SPRINTIT (RIKTHTYER)
    const handleAddSprint = async (e) => {
        e.preventDefault();
        if (!newSprintName) return;
        await axios.post('http://localhost:5001/api/sprints', { project_id: id, emertimi: newSprintName }, { headers });
        setNewSprintName(''); fetchData();
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await axios.put(`http://localhost:5001/api/tasks/${taskId}`, { statusi: newStatus, project_id: id }, { headers });
            fetchData();
        } catch (error) { console.error(error); }
    };

    const handleUpdateLabel = async (taskId, labelId) => {
        try {
            await axios.put(`http://localhost:5001/api/tasks/${taskId}/label`, { label_id: labelId }, { headers });
            fetchData();
        } catch (error) { console.error(error); }
    };

    const handleDeleteSprint = async (sId, e) => {
        e.stopPropagation();
        if (window.confirm("Fshij fazën?")) {
            try {
                await axios.delete(`http://localhost:5001/api/sprints/${sId}`, { headers });
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || "Nuk keni të drejtë të fshini faza!");
            }
        }
    };

    // --- LOGJIKA E DRAG & DROP (Tërhiq dhe Lësho) ---
    // Kur fillojmë të tërheqim një detyrë, ruajmë ID-në e saj
    const onDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);
    // Lejon zonën tjetër të pranojë "lëshimin" e detyrës
    const onDragOver = (e) => e.preventDefault();
    // Kur lëshojmë detyrën në një kolonë të re ('To Do' ose 'Done')
    const onDrop = (e, newStatus) => {
        const taskId = e.dataTransfer.getData("taskId"); // Marrim ID-në e ruajtur
        handleUpdateStatus(taskId, newStatus); // Përditësojmë statusin në databazë
    };

    // --- FUNKSIONI PËR NGARKIMIN E SKEDARËVE ---
    const handleFileUpload = async (taskId) => {
        const file = selectedFile[taskId];
        if (!file || file.length === 0) return;
        const formData = new FormData(); // FormData përdoret për të dërguar skedarë (file) në API
        formData.append('file', file[0]); // Sigurohemi që marrim skedarin e parë të zgjedhur
        formData.append('task_id', taskId);
        // Header i veçantë 'multipart/form-data' nevojitet kur dërgojmë foto/dokumente
        await axios.post('http://localhost:5001/api/attachments/upload', formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
        alert("📎 U ngarkua!"); fetchData();
    };

    const handleAddComment = async (taskId) => {
        if (!commentText[taskId]) return;
        await axios.post(`http://localhost:5001/api/comments`, { taskId, komenti: commentText[taskId] }, { headers });
        setCommentText({ ...commentText, [taskId]: '' }); fetchData();
    };

    // --- SHTIMI I KOHËS (TIME LOGS) ---
    const handleAddTimeLog = async (taskId) => {
        if (!timeLogMinutes[taskId]) return;
        try {
            await axios.post(`http://localhost:5001/api/tasks/${taskId}/time-logs`, { durationMinutes: parseInt(timeLogMinutes[taskId]) }, { headers });
            setTimeLogMinutes({ ...timeLogMinutes, [taskId]: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || "Gabim gjatë shtimit të kohës");
        }
    };

    const handleDeleteTimeLog = async (logId) => {
        if(window.confirm("Jeni i sigurt që doni të fshini këtë kohë?")) {
            try {
                await axios.delete(`http://localhost:5001/api/time-logs/${logId}`, { headers });
                fetchData();
            } catch (err) {
                alert(err.response?.data?.error || "Nuk keni të drejta për të fshirë këtë log!");
            }
        }
    };

    const filteredTasks = tasks.filter(t => 
        (t.titulli || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!selectedSprint || Number(t.sprint_id) === Number(selectedSprint))
    );

    // Krijojmë të dhënat për Gantt
    // Hapi 1: Marrim vetëm detyrat që kanë data të sakta, përndryshe grafiku do të "krashte"
    const validTasksWithDates = tasks.filter(t => {
        if (!t.data_fillimit || !t.data_afatit) return false;
        const s = new Date(t.data_fillimit);
        const e = new Date(t.data_afatit);
        return !isNaN(s.getTime()) && !isNaN(e.getTime()); // Kontrollon nëse datat janë reale
    });
    
    // Ruajmë ID-të e vlefshme për të kontrolluar varësitë më vonë
    const validIds = validTasksWithDates.map(t => t.id.toString());

    // Hapi 2: Përshtatim të dhënat tona në formatin specifik që kërkon libraria `gantt-task-react`
    const ganttTasks = validTasksWithDates.map(t => {
        const start = new Date(t.data_fillimit);
        const end = new Date(t.data_afatit);
        
        // Nëse fillimi dhe mbarimi janë në të njëjtën ditë, libraria Gantt kërkon të paktën 1 ditë distancë që të vizatohet drejt
        if (start.getTime() === end.getTime()) {
            end.setDate(end.getDate() + 1);
        }
        
        let deps = [];
        if (t.depends_on_task_id) {
            const depId = t.depends_on_task_id.toString();
            if (validIds.includes(depId)) {
                deps = [depId];
            }
        }

        return {
            start,
            end,
            name: t.titulli || 'E paemërtuar',
            id: t.id.toString(),
            type: 'task',
            progress: t.statusi === 'Done' ? 100 : 0,
            isDisabled: false,
            dependencies: deps
        };
    });

    // --- LOGJIKA E GRAFIKUT BURNDOWN ---
    // Ky graf tregon se sa shpejt po mbyllen detyrat krahasuar me kohën e mbetur (Ideale vs Reale)
    useEffect(() => {
        if (selectedSprint && viewMode === 'burndown') {
            api.get(`/api/sprints/${selectedSprint}/burndown`).then(res => {
                const { sprint, tasks } = res.data;
                const totalTasks = tasks.length;
                let remaining = totalTasks; // Fillon me numrin total të detyrave
                
                // Gruponi detyrat e përfunduara ('Done') bazuar në datën e përfundimit të tyre
                const completedByDate = {};
                tasks.filter(t => t.statusi === 'Done' && t.completed_at).forEach(t => {
                    const d = new Date(t.completed_at).toLocaleDateString();
                    completedByDate[d] = (completedByDate[d] || 0) + 1; // Rrit numëruesin për çdo detyrë në atë datë
                });

                // Këto do jenë pikat në boshtin X (datat)
                const labels = ['Start', ...Object.keys(completedByDate)];
                // Këto do jenë pikat në boshtin Y (numri i detyrave të mbetura)
                const dataPoints = [totalTasks];
                
                Object.keys(completedByDate).forEach(date => {
                    remaining -= completedByDate[date];
                    dataPoints.push(remaining);
                });

                setBurndownData({
                    labels,
                    datasets: [
                        {
                            label: 'Detyra të mbetura (Real)',
                            data: dataPoints,
                            borderColor: '#34d399',
                            backgroundColor: 'rgba(52,211,153,0.2)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Ecuria Ideale',
                            data: [totalTasks, 0], // Vetëm start dhe fund për vijë të drejtë (ideal case)
                            borderColor: 'rgba(255,255,255,0.2)',
                            borderDash: [5, 5],
                            tension: 0
                        }
                    ]
                });
            }).catch(console.error);
        }
    }, [selectedSprint, viewMode]);

    return (
        <div className="page-container animate__animated animate__fadeIn">
            <div className="mx-auto" style={{ maxWidth: '1100px' }}>

               {/* BUTONI KTHEHU */}
<div className="mb-4">
    <button 
        onClick={() => navigate('/')} 
        className="btn btn-link fw-bold text-decoration-none d-flex align-items-center gap-2 p-0"
        style={{ fontSize: '12px', letterSpacing: '1px', color: 'var(--text-main)' }}
    >
        <span style={{ fontSize: '18px' }}>←</span> DASHBOARD
    </button>
</div>

                
                {/* KERKIMI */}
                <div className="d-flex justify-content-end mb-4">
                    <div className="shadow-sm rounded-pill px-3 py-1 d-flex align-items-center" style={{ width: '250px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                        <span className="me-2 text-muted small"></span>
                        <input type="text" className="form-control border-0 shadow-none p-0 bg-transparent text-white" style={{ fontSize: '12px' }} placeholder="Kërko..." onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {/* INFO HUB (ME FORMËN E EKIPIT) */}
                <div className="row g-4 mb-4">
                    <div className="col-md-5">
                        <div className="premium-card p-4 h-100">
                            <h6 className="fw-bold small text-uppercase mb-3" style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '1px' }}> EKIP I PUNËS</h6>
                            
                            {/* FORMA E RIKTHYER E EKIPIT */}
                            <form onSubmit={handleAddMember} className="d-flex gap-1 mb-2">
                                <input type="email" className="form-control form-control-sm border-0 rounded-pill px-3 text-white" style={{ fontSize: '10px', background: 'var(--glass-bg)' }} placeholder="Shto me email..." value={email} onChange={(e) => setEmail(e.target.value)} required />
                                <button type="submit" className="btn btn-premium btn-sm rounded-circle fw-bold" style={{ padding: '0 8px' }}>+</button>
                            </form>

                            <div className="d-flex flex-wrap gap-1">
                                {members.map((m, i) => (
                                    <span key={i} className="badge border rounded-pill fw-normal d-flex align-items-center gap-1" style={{ fontSize: '9px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-light)', padding: '4px 8px' }}>
                                        {m.avatar_url ? (
                                            <img src={`http://localhost:5001/uploads/${m.avatar_url}`} className="rounded-circle object-fit-cover" style={{width: '12px', height: '12px'}} alt="avatar" />
                                        ) : (
                                            <span style={{fontSize:'9px'}}>👤</span>
                                        )}
                                        {m.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-7">
                        <div className="premium-card p-4 h-100">
                            <h6 className="fw-bold small text-uppercase mb-3" style={{ fontSize: '11px', color: 'var(--accent)', letterSpacing: '1px' }}> AKTIVITETET</h6>
                            {activities.length === 0 ? (
                                <div className="text-center p-3 text-muted" style={{ fontSize: '11px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px' }}>
                                    Nuk ka aktivitete ende.
                                </div>
                            ) : (
                                <div className="d-flex gap-3 overflow-auto pb-2 no-scrollbar">
                                    {activities.slice(0, 10).map((a, i) => (
                                        <div key={i} className="flex-shrink-0 p-3 rounded-3 border-start border-4 border-primary" style={{ minWidth: '160px', maxWidth: '200px', background: 'rgba(0,0,0,0.2)', boxShadow: 'var(--shadow-sm)' }}>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                {a.avatar ? (
                                                    <img src={`http://localhost:5001/uploads/${a.avatar}`} className="rounded-circle object-fit-cover" style={{width: '14px', height: '14px'}} alt="avatar" />
                                                ) : (
                                                    <span style={{fontSize:'12px'}}>👤</span>
                                                )}
                                                <span className="fw-bold" style={{ fontSize: '9px', color: 'var(--text-main)' }}>{a.user_name || 'Përdoruesi'}</span>
                                            </div>
                                            <div className="fw-bold text-primary mb-1" style={{ fontSize: '10px', whiteSpace:'normal' }}>{a.veprimi}</div>
                                            <div style={{ fontSize: '9px', color: 'var(--text-light)', marginBottom: '5px', whiteSpace: 'normal', lineHeight: '1.2' }}>{a.pershkrimi}</div>
                                            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{new Date(a.data).toLocaleDateString()} {new Date(a.data).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SPRINTS (ME FORMËN E SPRINTIT TË RI) */}
                <div className="d-flex align-items-center gap-2 mb-4 overflow-auto pb-2 border-bottom" style={{ borderColor: 'var(--glass-border)' }}>
                    <button onClick={() => setSelectedSprint(null)} className={`btn btn-xs rounded-pill px-3 fw-bold ${!selectedSprint ? 'btn-premium' : 'text-light'}`} style={{ fontSize: '10px', background: !selectedSprint ? '' : 'var(--glass-bg)' }}>Gjitha</button>
                    {sprints.map((s) => (
                        <div key={s.id} className="position-relative">
                            <button onClick={() => setSelectedSprint(s.id)} className={`btn btn-xs rounded-pill px-3 fw-bold border ${selectedSprint === s.id ? 'btn-premium' : 'text-light'}`} style={{ fontSize: '10px', whiteSpace: 'nowrap', background: selectedSprint === s.id ? '' : 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>{s.emertimi}</button>
                            <span onClick={(e) => handleDeleteSprint(s.id, e)} className="ms-1 text-danger cursor-pointer fw-bold" style={{ fontSize: '10px' }}>×</span>
                        </div>
                    ))}
                    
                    {/* FORMA E RIKTHYER E SPRINTIT */}
                    <form onSubmit={handleAddSprint} className="d-flex gap-1 ms-auto">
                        <input type="text" className="form-control form-control-sm border-0 rounded-pill px-2 shadow-sm text-white" placeholder="Faza..." value={newSprintName} onChange={(e) => setNewSprintName(e.target.value)} style={{ width: '70px', fontSize: '10px', background: 'var(--glass-bg)' }} />
                        <button type="submit" className="btn btn-premium btn-sm rounded-circle" style={{ padding: '0 8px' }}>+</button>
                    </form>
                </div>

                <div className="mb-4">
                    <style>{`
                        .ql-toolbar { background: var(--glass-bg); border: none !important; border-bottom: 1px solid var(--glass-border) !important; border-top-left-radius: 10px; border-top-right-radius: 10px; }
                        .ql-toolbar button { filter: invert(1); }
                        [data-theme="light"] .ql-toolbar button { filter: none; }
                        .ql-container { border: none !important; min-height: 80px; }
                        .ql-editor { color: var(--text-main); font-size: 13px; }
                    `}</style>
                    <AddTask projectId={id} onTaskAdded={fetchData} existingTasks={tasks} members={members} />
                </div>

                {/* ZGJEDHJA E PAMJES */}
                <div className="d-flex mb-4 gap-2 border-bottom pb-3 align-items-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <button onClick={() => setViewMode('board')} className={`btn btn-sm px-4 rounded-pill fw-bold ${viewMode === 'board' ? 'btn-premium' : 'btn-outline-light'}`}>Tabela e Detyrave</button>
                    {selectedSprint && (
                        <button onClick={() => setViewMode('burndown')} className={`btn btn-sm px-4 rounded-pill fw-bold ms-auto ${viewMode === 'burndown' ? 'btn-premium' : 'btn-outline-light'}`}>🔥 Burndown Chart</button>
                    )}
                </div>

                {viewMode === 'board' && (
                <>
                {/* BOARD */}
                <div className="row g-4 justify-content-center mt-2">
                    {['To Do', 'Done'].map(status => (
                        <div key={status} className="col-md-6" onDragOver={onDragOver} onDrop={(e) => onDrop(e, status)}>
                            <div className="d-flex align-items-center mb-3 px-2">
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: status === 'Done' ? 'var(--success)' : 'var(--primary)', marginRight: '8px' }}></div>
                                <h6 className="fw-bold text-uppercase m-0" style={{ fontSize: '12px', color: 'var(--text-main)', letterSpacing: '1px' }}>
                                    {status === 'Done' ? 'KRYERA' : ' NË PROCES'}
                                </h6>
                            </div>

                            <div className="task-list glass-panel p-3 rounded-4" style={{ minHeight: '300px' }}>
                                {filteredTasks.filter(t => status === 'Done' ? t.statusi === 'Done' : t.statusi !== 'Done').map(t => (
                                    <div key={t.id} draggable onDragStart={(e) => onDragStart(e, t.id)} className="premium-card mb-3" style={{ opacity: status === 'Done' ? 0.7 : 1, cursor: 'grab' }}>
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between mb-2 align-items-start">
                                                <select 
                                                    className="form-select form-select-sm border-0 d-inline-block" 
                                                    style={{ 
                                                        width: 'auto', 
                                                        backgroundColor: t.label_emertimi ? (status === 'Done' ? 'rgba(255,255,255,0.05)' : (t.ngjyra || 'rgba(255,255,255,0.1)')) : 'rgba(255,255,255,0.1)', 
                                                        color: t.label_emertimi ? (status === 'Done' ? 'var(--text-muted)' : '#fff') : 'var(--text-light)', 
                                                        fontSize: '9px', 
                                                        outline: 'none', 
                                                        boxShadow: 'none',
                                                        borderRadius: '10px',
                                                        padding: '2px 16px 2px 8px',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer'
                                                    }}
                                                    value={t.label_id || ''}
                                                    onChange={(e) => handleUpdateLabel(t.id, e.target.value)}
                                                >
                                                    <option value="">+ ETIKETË</option>
                                                    {allLabels.map(l => <option key={l.id} value={l.id}>{l.emertimi.toUpperCase()}</option>)}
                                                </select>
                                                <button onClick={() => { 
                                                    if(window.confirm("Fshij?")) {
                                                        axios.delete(`http://localhost:5001/api/tasks/${t.id}`, {headers})
                                                            .then(fetchData)
                                                            .catch(err => alert(err.response?.data?.error || err.response?.data?.message || "Nuk keni të drejtë të fshini detyra!"));
                                                    }
                                                }} className="btn btn-link text-muted p-0" style={{fontSize:'12px'}}>delete</button>
                                            </div>

                                            <h6 className={`fw-bold mb-1`} style={{ fontSize: '14px', color: 'var(--text-main)', opacity: status === 'Done' ? 0.6 : 1, textDecoration: status === 'Done' ? 'line-through' : 'none' }}>{t.titulli}</h6>
                                            
                                            {t.assigned_to_name && (
                                                <div className="mb-2 d-flex align-items-center gap-1">
                                                    {t.assigned_to_avatar ? (
                                                        <img src={`http://localhost:5001/uploads/${t.assigned_to_avatar}`} className="rounded-circle object-fit-cover" style={{width: '16px', height: '16px'}} alt="avatar" />
                                                    ) : (
                                                        <span style={{fontSize:'12px'}}>👤</span>
                                                    )}
                                                    <span className="badge rounded-pill" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', fontSize: '9px', fontWeight: 'normal' }}>
                                                        {t.assigned_to_name}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="mb-3 quill-content" style={{ fontSize: '12px', color: 'var(--text-light)' }} dangerouslySetInnerHTML={{ __html: t.pershkrimi || '' }}></div>

                                            {/* SHFAQJA E FOTOVE (Poshtë përshkrimit) */}
{Array.isArray(t.attachments) && t.attachments.length > 0 && (
    <div className="d-flex flex-wrap gap-1 mb-3 mt-1">
        {t.attachments.map((file, idx) => (
            file?.rruga ? (
                <a 
                    key={idx} 
                    href={`http://localhost:5001/uploads/${file.rruga}`} 
                    target="_blank" 
                    rel="noreferrer"
                >
                    <img 
                        src={`http://localhost:5001/uploads/${file.rruga}`} 
                        alt="attachment"
                        style={{ 
                            width: '35px', 
                            height: '35px', 
                            objectFit: 'cover', 
                            borderRadius: '6px', 
                            border: '1px solid rgba(255,255,255,0.1)' 
                        }} 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </a>
            ) : null
        ))}
    </div>
)}

{/* --- PJESA E RE: LISTA E KOMENTEVE --- */}
{t.comments && t.comments.length > 0 && (
    <div className="mt-2 mb-3 p-2 rounded-3 border-start border-3 border-primary shadow-sm" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <h6 style={{ fontSize: '9px', color: 'var(--text-muted)' }} className="fw-bold text-uppercase mb-2">Diskutimi:</h6>
        {t.comments.map((c, idx) => (
            <div key={idx} className="mb-2 pb-1 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="d-flex align-items-center gap-1">
                        {c.user_avatar ? (
                            <img src={`http://localhost:5001/uploads/${c.user_avatar}`} className="rounded-circle object-fit-cover" style={{width: '14px', height: '14px'}} alt="avatar" />
                        ) : (
                            <span style={{fontSize:'10px'}}>👤</span>
                        )}
                        <span className="fw-bold" style={{ fontSize: '10px', color: 'var(--text-main)' }}>{c.perdoruesi}:</span>
                    </div>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{new Date(c.data).toLocaleDateString()}</span>
                </div>
                <p className="m-0" style={{ fontSize: '11px', lineHeight: '1.2', color: 'var(--text-light)' }}>{c.komenti}</p>
            </div>
        ))}
    </div>
)}

                                            <div className="p-2 rounded-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                <div className="d-flex gap-1 mb-2">
                                                    <div className="input-group input-group-sm">
                                                        <input type="file" className="form-control border-0 text-white" style={{fontSize:'9px', background: 'transparent'}} onChange={(e) => setSelectedFile({...selectedFile, [t.id]: e.target.files})} />
                                                        <button className="btn text-white border-start" style={{borderColor: 'rgba(255,255,255,0.1)', fontSize:'9px'}} onClick={() => handleFileUpload(t.id)}>📎</button>
                                                    </div>
                                                <div className="input-group input-group-sm">
                                                        <input type="text" className="form-control border-0 text-white" placeholder="Shto koment..." style={{fontSize:'9px', background: 'transparent'}} value={commentText[t.id] || ''} onChange={(e) => setCommentText({...commentText, [t.id]: e.target.value})} />
                                                        <button className="btn btn-premium" onClick={() => handleAddComment(t.id)} style={{fontSize:'9px'}}>OK</button>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-1 mb-2">
                                                    <div className="input-group input-group-sm">
                                                        <input type="number" className="form-control border-0 text-white" placeholder="Minuta (p.sh 30)" style={{fontSize:'9px', background: 'transparent'}} value={timeLogMinutes[t.id] || ''} onChange={(e) => setTimeLogMinutes({...timeLogMinutes, [t.id]: e.target.value})} />
                                                        <button className="btn text-white border-start" style={{borderColor: 'rgba(255,255,255,0.1)', fontSize:'9px', background: 'var(--accent)'}} onClick={() => handleAddTimeLog(t.id)}>⏳ Shto Kohë</button>
                                                    </div>
                                                </div>
                                                
                                                {/* --- LISTA E TIME LOGS --- */}
                                                {t.time_logs && t.time_logs.length > 0 && (
                                                    <div className="mt-2 mb-2 p-1 rounded-2 border-start border-2 border-success" style={{ background: 'rgba(0,0,0,0.1)' }}>
                                                        <h6 style={{ fontSize: '8px', color: 'var(--text-muted)' }} className="fw-bold text-uppercase mb-1">Historiku i Kohës:</h6>
                                                        {t.time_logs.map((log, idx) => (
                                                            <div key={idx} className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '9px', color: 'var(--text-light)' }}>
                                                                <span className="d-flex align-items-center gap-1">
                                                                    {log.user_avatar ? (
                                                                        <img src={`http://localhost:5001/uploads/${log.user_avatar}`} className="rounded-circle object-fit-cover" style={{width: '12px', height: '12px'}} alt="avatar" />
                                                                    ) : (
                                                                        <span style={{fontSize:'9px'}}>👤</span>
                                                                    )}
                                                                    <strong className="text-white">{log.user_name}</strong> punoi {log.duration_minutes}m ({new Date(log.data).toLocaleDateString()})
                                                                </span>
                                                                <button onClick={() => handleDeleteTimeLog(log.id)} className="btn btn-link text-danger p-0 ms-2" style={{fontSize:'10px', textDecoration:'none'}} title="Fshi kohën">×</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                <div className="text-end">
                                                    <button className="btn btn-sm px-4 rounded-pill fw-bold btn-premium" style={{ fontSize: '10px' }} onClick={() => handleUpdateStatus(t.id, status === 'Done' ? 'To Do' : 'Done')}>
                                                        {status === 'Done' ? 'RIKTHE' : 'KRYE ✓'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                </>
                )}
                {viewMode === 'burndown' && (
                    <div className="premium-card p-4">
                        <h5 className="fw-bold text-uppercase mb-4" style={{ color: 'var(--accent)' }}>Burndown Chart - Faza {sprints.find(s => s.id === selectedSprint)?.emertimi}</h5>
                        {burndownData ? (
                            <div style={{ height: '400px' }}>
                                <Line 
                                    data={burndownData} 
                                    options={{
                                        responsive: true, maintainAspectRatio: false,
                                        scales: {
                                            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#fff' } },
                                            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#fff' } }
                                        },
                                        plugins: { legend: { labels: { color: '#fff' } } }
                                    }} 
                                />
                            </div>
                        ) : (
                            <div className="text-center p-5 text-muted small">Nuk ka të dhëna të mjaftueshme për këtë fazë.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;
