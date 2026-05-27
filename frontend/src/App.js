import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Login';
import Register from './pages/Register';

// Sigurohu që i ke këto skedarë në folderin pages
import Users from './pages/Users'; 
import Settings from './pages/Settings';
import Reports from './pages/Reports';

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
