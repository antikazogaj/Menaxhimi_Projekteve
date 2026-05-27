import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AddTask from '../components/AddTask';

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
    const [commentText, setCommentText] = useState({});
    const [selectedFile, setSelectedFile] = useState({});

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        try {
            const config = { headers };
            const [resT, resM, resA, resS, resL] = await Promise.all([
                axios.get(`http://localhost:5000/api/tasks/${id}`, config).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/members/${id}`, config).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/activities/${id}`, config).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/sprints/${id}`, config).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/labels`, config).catch(() => ({ data: [] }))
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
            await axios.post('http://localhost:5000/api/members/add', { project_id: id, email, roli: 'Member' }, { headers });
            setEmail(''); fetchData();
        } catch (e) { alert("Përdoruesi nuk u gjet!"); }
    };

    // 2. SHTIMI I SPRINTIT (RIKTHTYER)
    const handleAddSprint = async (e) => {
        e.preventDefault();
        if (!newSprintName) return;
        await axios.post('http://localhost:5000/api/sprints', { project_id: id, emertimi: newSprintName }, { headers });
        setNewSprintName(''); fetchData();
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { statusi: newStatus, project_id: id }, { headers });
            fetchData();
        } catch (error) { console.error(error); }
    };

    const handleUpdateLabel = async (taskId, labelId) => {
        try {
            await axios.put(`http://localhost:5000/api/tasks/${taskId}/label`, { label_id: labelId }, { headers });
            fetchData();
        } catch (error) { console.error(error); }
    };

    const handleDeleteSprint = async (sId, e) => {
        e.stopPropagation();
        if (window.confirm("Fshij fazën?")) {
            await axios.delete(`http://localhost:5000/api/sprints/${sId}`, { headers });
            fetchData();
        }
    };

    // DRAG & DROP
    const onDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);
    const onDragOver = (e) => e.preventDefault();
    const onDrop = (e, newStatus) => {
        const taskId = e.dataTransfer.getData("taskId");
        handleUpdateStatus(taskId, newStatus);
    };

    const handleFileUpload = async (taskId) => {
        const file = selectedFile[taskId];
        if (!file || file.length === 0) return;
        const formData = new FormData();
        formData.append('file', file); 
        formData.append('task_id', taskId);
        await axios.post('http://localhost:5000/api/attachments/upload', formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
        alert("📎 U ngarkua!"); fetchData();
    };

    const handleAddComment = async (taskId) => {
        if (!commentText[taskId]) return;
        await axios.post(`http://localhost:5000/api/comments`, { taskId, komenti: commentText[taskId] }, { headers });
        setCommentText({ ...commentText, [taskId]: '' }); fetchData();
    };

    const filteredTasks = tasks.filter(t => 
        (t.titulli || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!selectedSprint || Number(t.sprint_id) === Number(selectedSprint))
    );

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
                    <div className="shadow-sm rounded-pill px-3 py-1 d-flex align-items-center" style={{ width: '250px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                                <input type="email" className="form-control form-control-sm border-0 rounded-pill px-3 text-white" style={{ fontSize: '10px', background: 'rgba(0,0,0,0.2)' }} placeholder="Shto me email..." value={email} onChange={(e) => setEmail(e.target.value)} required />
                                <button type="submit" className="btn btn-premium btn-sm rounded-circle fw-bold" style={{ padding: '0 8px' }}>+</button>
                            </form>

                            <div className="d-flex flex-wrap gap-1">
                                {members.map((m, i) => (
                                    <span key={i} className="badge border rounded-pill fw-normal" style={{ fontSize: '9px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-light)' }}>{m.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-7">
                        <div className="premium-card p-4 h-100">
                            <h6 className="fw-bold small text-uppercase mb-3" style={{ fontSize: '11px', color: 'var(--accent)', letterSpacing: '1px' }}> AKTIVITETET</h6>
                            <div className="d-flex gap-3 overflow-auto pb-2 no-scrollbar">
                                {activities.slice(0, 5).map((a, i) => (
                                    <div key={i} className="flex-shrink-0 p-3 rounded-3 border-start border-4 border-primary" style={{ minWidth: '140px', background: 'rgba(0,0,0,0.2)', boxShadow: 'var(--shadow-sm)' }}>
                                        <div className="fw-bold" style={{ fontSize: '9px', whiteSpace:'nowrap', color: 'var(--text-main)' }}>{a.veprimi}</div>
                                        <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{new Date(a.data).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SPRINTS (ME FORMËN E SPRINTIT TË RI) */}
                <div className="d-flex align-items-center gap-2 mb-4 overflow-auto pb-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <button onClick={() => setSelectedSprint(null)} className={`btn btn-xs rounded-pill px-3 fw-bold ${!selectedSprint ? 'btn-premium' : 'text-light'}`} style={{ fontSize: '10px', background: !selectedSprint ? '' : 'rgba(0,0,0,0.2)' }}>Gjitha</button>
                    {sprints.map((s) => (
                        <div key={s.id} className="position-relative">
                            <button onClick={() => setSelectedSprint(s.id)} className={`btn btn-xs rounded-pill px-3 fw-bold border ${selectedSprint === s.id ? 'btn-premium' : 'text-light'}`} style={{ fontSize: '10px', whiteSpace: 'nowrap', background: selectedSprint === s.id ? '' : 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)' }}>{s.emertimi}</button>
                            <span onClick={(e) => handleDeleteSprint(s.id, e)} className="ms-1 text-danger cursor-pointer fw-bold" style={{ fontSize: '10px' }}>×</span>
                        </div>
                    ))}
                    
                    {/* FORMA E RIKTHYER E SPRINTIT */}
                    <form onSubmit={handleAddSprint} className="d-flex gap-1 ms-auto">
                        <input type="text" className="form-control form-control-sm border-0 rounded-pill px-2 shadow-sm text-white" placeholder="Faza..." value={newSprintName} onChange={(e) => setNewSprintName(e.target.value)} style={{ width: '70px', fontSize: '10px', background: 'rgba(0,0,0,0.2)' }} />
                        <button type="submit" className="btn btn-premium btn-sm rounded-circle" style={{ padding: '0 8px' }}>+</button>
                    </form>
                </div>

                <div className="mb-4">
                    <AddTask projectId={id} onTaskAdded={fetchData} />
                </div>

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
                                                <button onClick={() => { if(window.confirm("Fshij?")) axios.delete(`http://localhost:5000/api/tasks/${t.id}`, {headers}).then(fetchData) }} className="btn btn-link text-muted p-0" style={{fontSize:'12px'}}>delete</button>
                                            </div>

                                            <h6 className={`fw-bold mb-1`} style={{ fontSize: '14px', color: 'var(--text-main)', opacity: status === 'Done' ? 0.6 : 1, textDecoration: status === 'Done' ? 'line-through' : 'none' }}>{t.titulli}</h6>
                                            <p className="mb-3" style={{ fontSize: '12px', color: 'var(--text-light)' }}>{t.pershkrimi}</p>

                                            {/* SHFAQJA E FOTOVE (Poshtë përshkrimit) */}
{Array.isArray(t.attachments) && t.attachments.length > 0 && (
    <div className="d-flex flex-wrap gap-1 mb-3 mt-1">
        {t.attachments.map((file, idx) => (
            file?.rruga ? (
                <a 
                    key={idx} 
                    href={`http://localhost:5000/uploads/${file.rruga}`} 
                    target="_blank" 
                    rel="noreferrer"
                >
                    <img 
                        src={`http://localhost:5000/uploads/${file.rruga}`} 
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
                <div className="d-flex justify-content-between">
                    <span className="fw-bold" style={{ fontSize: '10px', color: 'var(--text-main)' }}>{c.perdoruesi}:</span>
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
                                                        <button className="btn text-white border-start" style={{borderColor: 'rgba(255,255,255,0.1)'}} onClick={() => handleFileUpload(t.id)} style={{fontSize:'9px'}}>📎</button>
                                                    </div>
                                                    <div className="input-group input-group-sm">
                                                        <input type="text" className="form-control border-0 text-white" placeholder="Shto koment..." style={{fontSize:'9px', background: 'transparent'}} value={commentText[t.id] || ''} onChange={(e) => setCommentText({...commentText, [t.id]: e.target.value})} />
                                                        <button className="btn btn-premium" onClick={() => handleAddComment(t.id)} style={{fontSize:'9px'}}>OK</button>
                                                    </div>
                                                </div>
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
            </div>
        </div>
    );
};

export default ProjectDetails;
