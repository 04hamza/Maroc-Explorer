import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Login from "./pages/Login/Login";
import Dashboard from './pages/Dashboard/Dashboard';
import Regions from './pages/Regions/Regions';
import Navbar from './components/Navbar/Navbar';
import AppContent from './AppContent';
import Provinces from './pages/Provinces/Provinces';
import Communes from './pages/Communes/Communes';
import Contacts from './pages/Contacts/Contacts';
import Users from './pages/Users/Users';

function App() {
  return (
    <Router>
      <AppContent>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Navbar/><Dashboard/></ProtectedRoute>} />
          <Route path="/regions" element={<ProtectedRoute><Navbar/><Regions/></ProtectedRoute>} />
          <Route path="/provinces/:region_slug" element={<ProtectedRoute><Navbar/><Provinces /></ProtectedRoute>} />
          <Route path="/communes/:province_slug" element={<ProtectedRoute><Navbar/><Communes /></ProtectedRoute>}/>
          <Route path="/contacts" element={<ProtectedRoute><Navbar/><Contacts/></ProtectedRoute>}/> 
          <Route path="/users" element={<ProtectedRoute><Navbar/><Users/></ProtectedRoute>}/> 
        </Routes>
      </AppContent>
    </Router>
  );
}

export default App;