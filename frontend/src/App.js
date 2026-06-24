// ============================================================================
// APP.JS - SKELETI KRYESOR I FRONTEND-IT
// Për Profesorin: Kjo është "Hyrja" e aplikacionit tonë në React.
// Këtu përdorim "React Router" për të krijuar një aplikacion me një faqe të vetme (SPA - Single Page Application).
// SPA do të thotë që faqja nuk bën asnjëherë "Refresh" të plotë kur kalojmë nga "Dashboard" tek "Përdoruesit",
// duke e bërë shumë herë më të shpejtë se faqet tradicionale!
// ============================================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users'; 
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Activities from './pages/Activities';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Layout-i kryesor me Sidebar */}
        <Route path="*" element={
          token ? (
            <div className="d-flex">
              <Sidebar />
              {/* Pjesa e djathtë që ndryshon */}
              <div style={{ marginLeft: '260px', width: '100%', minHeight: '100vh', backgroundColor: 'transparent' }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/project/:id" element={<ProjectDetails />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
