import React, { useState, useEffect } from 'react';
import api from '../api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AddTask = ({ projectId, onTaskAdded, existingTasks = [], members = [] }) => {
    // --- STATE VARIABLES ---
    // Ruajnë vlerat që përdoruesi po shkruan në format e tyre përkatëse
    const [titulli, setTitulli] = useState('');
    const [pershkrimi, setPershkrimi] = useState(''); // Ky vjen nga editori Rich Text (Quill)
    const [dataFillimit, setDataFillimit] = useState('');
    const [dataAfatit, setDataAfatit] = useState('');
    const [labelId, setLabelId] = useState('');
    const [prioriteti, setPrioriteti] = useState('Medium');
    const [sprintId, setSprintId] = useState(''); 
    const [dependsOnTaskId, setDependsOnTaskId] = useState(''); // Për Gantt Chart, nga cila detyrë varet
    const [assignedTo, setAssignedTo] = useState(''); // Përdoruesi që i caktohet detyra
    
    // Këto lista mbushen me të dhëna nga databaza për të shfaqur opsionet në "Select"
    const [labels, setLabels] = useState([]);
    const [sprints, setSprints] = useState([]);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // Ky efekt (useEffect) ekzekutohet sapo hapet faqja për të marrë listat mbështetëse
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Tërheqim të gjitha etiketat dhe fazat (sprints) e këtij projekti njëkohësisht
                const [resL, resS] = await Promise.all([
                    api.get('/api/labels'),
                    api.get(`/api/sprints/${projectId}`)
                ]);
                setLabels(Array.isArray(resL.data) ? resL.data : []);
                setSprints(Array.isArray(resS.data) ? resS.data : []);
            } catch (error) { console.error(error); }
        };
        fetchMetadata();
    }, [projectId]); // Ekzekutohet përsëri vetëm nëse ndryshon `projectId`

    // Funksioni që thirret kur përdoruesi shtyp butonin "+" (Submit)
    const handleSubmit = async (e) => {
        e.preventDefault(); // Ndalon rifreskimin automatik të faqes nga shfletuesi
        try {
            // Dërgojmë një kërkesë 'POST' me të gjitha të dhënat e reja
            await api.post('/api/tasks', {
                project_id: Number(projectId), titulli, pershkrimi, sprint_id: sprintId || null,
                data_fillimit: dataFillimit || null, data_afatit: dataAfatit || null, 
                label_id: labelId || null, prioriteti, statusi: 'To Do',
                depends_on_task_id: dependsOnTaskId || null,
                assigned_to: assignedTo || null
            });
            
            // Pasi ruhet me sukses, pastrojmë të gjitha fushat e formës
            setTitulli(''); setPershkrimi(''); setDataFillimit(''); setDataAfatit(''); setLabelId(''); setSprintId(''); setDependsOnTaskId(''); setAssignedTo('');
            
            // Njoftojmë komponentin prind (`ProjectDetails`) që të rifreskojë listën e detyrave
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
                        <input type="text" className="form-control border-0 py-2 text-white" placeholder="Emri..." value={titulli} onChange={(e) => setTitulli(e.target.value)} required style={{ borderRadius: '10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    <div className="col-md-4">
                        <label className="fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>PËRSHKRIMI (Rich Text)</label>
                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
                            <ReactQuill theme="snow" value={pershkrimi} onChange={setPershkrimi} style={{ color: 'white' }} />
                        </div>
                    </div>
                    <div className="col-md-2">
                        <label className="fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>VARËSIA (Opcion)</label>
                        <select className="form-select border-0 py-2 text-white" value={dependsOnTaskId} onChange={(e) => setDependsOnTaskId(e.target.value)} style={{ borderRadius: '10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }}>
                            <option value="" style={{color: 'black'}}>S'ka varësi</option>
                            {existingTasks.map(t => <option key={t.id} value={t.id} style={{color: 'black'}}>{t.titulli}</option>)}
                        </select>
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
                        <label className="fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>CAKTO TEK (Opcion)</label>
                        <select className="form-select border-0 py-2" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={{ borderRadius: '10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }}>
                            <option value="">Pa caktuar</option>
                            {members.map(m => <option key={m.user_id} value={m.user_id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>DATA E FILLIMIT</label>
                        <input type="date" className="form-control border-0 py-2 text-white" value={dataFillimit} onChange={(e) => setDataFillimit(e.target.value)} required style={{ borderRadius: '10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    <div className="col-md-2">
                        <label className="fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>DATA E FUNDIT</label>
                        <input type="date" className="form-control border-0 py-2 text-white" value={dataAfatit} onChange={(e) => setDataAfatit(e.target.value)} required style={{ borderRadius: '10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)' }} />
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
