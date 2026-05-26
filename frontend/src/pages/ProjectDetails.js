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
            const [resT, resM, resA, resS] = await Promise.all([
                axios.get(`http://localhost:5000/api/tasks/${id}`, config).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/members/${id}`, config).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/activities/${id}`, config).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/sprints/${id}`, config).catch(() => ({ data: [] }))
            ]);
            setTasks(Array.isArray(resT.data) ? resT.data : []);
            setMembers(Array.isArray(resM.data) ? resM.data : []);
            setActivities(Array.isArray(resA.data) ? resA.data : []);
            setSprints(Array.isArray(resS.data) ? resS.data : []);
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
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
            <div className="mx-auto" style={{ maxWidth: '1100px' }}>

               {/* BUTONI KTHEHU */}
<div className="mb-4">
    <button 
        onClick={() => navigate('/')} 
        className="btn btn-link text-dark fw-bold text-decoration-none d-flex align-items-center gap-2 p-0"
        style={{ fontSize: '12px', letterSpacing: '1px' }}
    >
        <span style={{ fontSize: '18px' }}>←</span> DASHBOARD
    </button>
</div>

                
                {/* KERKIMI */}
                <div className="d-flex justify-content-end mb-4">
                    <div className="bg-white shadow-sm rounded-pill px-3 py-1 d-flex align-items-center" style={{ width: '250px', border: '1px solid #eee' }}>
                        <span className="me-2 text-muted small"></span>
                        <input type="text" className="form-control border-0 shadow-none p-0" style={{ fontSize: '12px' }} placeholder="Kërko..." onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {/* INFO HUB (ME FORMËN E EKIPIT) */}
                <div className="row g-3 mb-4">
                    <div className="col-md-5">
                        <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '15px' }}>
                            <h6 className="fw-bold small text-uppercase text-muted mb-2" style={{ fontSize: '10px' }}> EKIP I PUNËS</h6>
                            
                            {/* FORMA E RIKTHYER E EKIPIT */}
                            <form onSubmit={handleAddMember} className="d-flex gap-1 mb-2">
                                <input type="email" className="form-control form-control-sm bg-light border-0 rounded-pill px-3" style={{ fontSize: '10px' }} placeholder="Shto me email..." value={email} onChange={(e) => setEmail(e.target.value)} required />
                                <button type="submit" className="btn btn-dark btn-sm rounded-circle fw-bold">+</button>
                            </form>

                            <div className="d-flex flex-wrap gap-1">
                                {members.map((m, i) => (
                                    <span key={i} className="badge bg-light text-dark border rounded-pill fw-normal" style={{ fontSize: '9px' }}>{m.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-7">
                        <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '15px' }}>
                            <h6 className="fw-bold small text-uppercase text-muted mb-2" style={{ fontSize: '10px' }}> AKTIVITETET</h6>
                            <div className="d-flex gap-2 overflow-auto pb-1">
                                {activities.slice(0, 5).map((a, i) => (
                                    <div key={i} className="flex-shrink-0 bg-light p-2 rounded-3 border-start border-2 border-dark" style={{ minWidth: '130px' }}>
                                        <div className="fw-bold" style={{ fontSize: '9px', whiteSpace:'nowrap' }}>{a.veprimi}</div>
                                        <div className="text-muted" style={{ fontSize: '8px' }}>{new Date(a.data).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SPRINTS (ME FORMËN E SPRINTIT TË RI) */}
                <div className="d-flex align-items-center gap-2 mb-4 overflow-auto pb-2 border-bottom">
                    <button onClick={() => setSelectedSprint(null)} className={`btn btn-xs rounded-pill px-3 fw-bold ${!selectedSprint ? 'btn-dark' : 'btn-light text-muted'}`} style={{ fontSize: '10px' }}>Gjitha</button>
                    {sprints.map((s) => (
                        <div key={s.id} className="position-relative">
                            <button onClick={() => setSelectedSprint(s.id)} className={`btn btn-xs rounded-pill px-3 fw-bold border ${selectedSprint === s.id ? 'btn-dark' : 'btn-white text-muted'}`} style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>{s.emertimi}</button>
                            <span onClick={(e) => handleDeleteSprint(s.id, e)} className="ms-1 text-danger cursor-pointer fw-bold" style={{ fontSize: '10px' }}>×</span>
                        </div>
                    ))}
                    
                    {/* FORMA E RIKTHYER E SPRINTIT */}
                    <form onSubmit={handleAddSprint} className="d-flex gap-1 ms-auto">
                        <input type="text" className="form-control form-control-sm border-0 bg-white rounded-pill px-2 shadow-sm" placeholder="Faza..." value={newSprintName} onChange={(e) => setNewSprintName(e.target.value)} style={{ width: '70px', fontSize: '10px' }} />
                        <button type="submit" className="btn btn-outline-dark btn-sm rounded-circle">+</button>
                    </form>
                </div>

                <div className="mb-4">
                    <AddTask projectId={id} onTaskAdded={fetchData} />
                </div>

                {/* BOARD */}
                <div className="row g-4 justify-content-center">
                    {['To Do', 'Done'].map(status => (
                        <div key={status} className="col-md-6" onDragOver={onDragOver} onDrop={(e) => onDrop(e, status)}>
                            <h6 className="fw-bold text-uppercase mb-3 px-1" style={{ fontSize: '10px', color: status === 'Done' ? '#28a745' : '#007bff', letterSpacing: '1px' }}>
                                {status === 'Done' ? 'KRYERA' : ' PROCES'}
                            </h6>

                            <div className="task-list" style={{ minHeight: '200px' }}>
                                {filteredTasks.filter(t => status === 'Done' ? t.statusi === 'Done' : t.statusi !== 'Done').map(t => (
                                    <div key={t.id} draggable onDragStart={(e) => onDragStart(e, t.id)} className="card border-0 shadow-sm mb-3" style={{ borderRadius: '14px', opacity: status === 'Done' ? 0.7 : 1, cursor: 'grab' }}>
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                {t.label_emertimi && <span className="badge rounded-pill px-2 py-1" style={{ backgroundColor: status === 'Done' ? '#eee' : (t.ngjyra || '#333'), color: status === 'Done' ? '#aaa' : '#fff', fontSize: '8px' }}>{t.label_emertimi.toUpperCase()}</span>}
                                                <button onClick={() => { if(window.confirm("Fshij?")) axios.delete(`http://localhost:5000/api/tasks/${t.id}`, {headers}).then(fetchData) }} className="btn btn-link text-muted p-0" style={{fontSize:'12px'}}>delete</button>
                                            </div>

                                            <h6 className={`fw-bold mb-1 ${status === 'Done' ? 'text-decoration-line-through text-muted' : ''}`} style={{ fontSize: '14px' }}>{t.titulli}</h6>
                                            <p className="text-secondary mb-3" style={{ fontSize: '12px' }}>{t.pershkrimi}</p>

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
                            border: '1px solid #eee' 
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
    <div className="mt-2 mb-3 bg-white p-2 rounded-3 border-start border-3 border-primary shadow-sm">
        <h6 style={{ fontSize: '9px' }} className="fw-bold text-muted text-uppercase mb-2">Diskutimi:</h6>
        {t.comments.map((c, idx) => (
            <div key={idx} className="mb-2 pb-1 border-bottom border-light">
                <div className="d-flex justify-content-between">
                    <span className="fw-bold" style={{ fontSize: '10px', color: '#333' }}>{c.perdoruesi}:</span>
                    <span className="text-muted" style={{ fontSize: '8px' }}>{new Date(c.data).toLocaleDateString()}</span>
                </div>
                <p className="m-0 text-secondary" style={{ fontSize: '11px', lineHeight: '1.2' }}>{c.komenti}</p>
            </div>
        ))}
    </div>
)}

                                            <div className="bg-light p-2 rounded-3">
                                                <div className="d-flex gap-1 mb-2">
                                                    <div className="input-group input-group-sm">
                                                        <input type="file" className="form-control border-0 bg-white" style={{fontSize:'9px'}} onChange={(e) => setSelectedFile({...selectedFile, [t.id]: e.target.files})} />
                                                        <button className="btn btn-white bg-white border-start" onClick={() => handleFileUpload(t.id)} style={{fontSize:'9px'}}>📎</button>
                                                    </div>
                                                    <div className="input-group input-group-sm">
                                                        <input type="text" className="form-control border-0 bg-white" placeholder="Shto koment..." style={{fontSize:'9px'}} value={commentText[t.id] || ''} onChange={(e) => setCommentText({...commentText, [t.id]: e.target.value})} />
                                                        <button className="btn btn-dark" onClick={() => handleAddComment(t.id)} style={{fontSize:'9px'}}>OK</button>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <button className="btn btn-xs px-3 rounded-pill fw-bold btn-dark" style={{ fontSize: '9px', padding: '3px 12px' }} onClick={() => handleUpdateStatus(t.id, status === 'Done' ? 'To Do' : 'Done')}>
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
