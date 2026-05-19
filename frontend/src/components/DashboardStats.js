import React from 'react';

const DashboardStats = ({ projects = [], tasks = [] }) => {
    return (
        <div className="row g-4 mb-5">
            {/* Karta 1: Projekte */}
            <div className="col-md-3">
                <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
                    <div className="text-muted small fw-bold mb-2">PROJEKTE</div>
                    <div className="d-flex align-items-center justify-content-between">
                        <h2 className="fw-bold m-0">{projects.length}</h2>
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary"></div>
                    </div>
                </div>
            </div>

            {/* Karta 2: Detyra Totale */}
            <div className="col-md-3">
                <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
                    <div className="text-muted small fw-bold mb-2">DETYRA TOTALE</div>
                    <div className="d-flex align-items-center justify-content-between">
                        <h2 className="fw-bold m-0">{tasks.length}</h2>
                        <div className="bg-dark bg-opacity-10 p-2 rounded-3 text-dark"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
