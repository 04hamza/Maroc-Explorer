import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const expirationTime = decoded.exp * 1000;
    console.log(expirationTime)
    const currentTime = Date.now();
    if (expirationTime < currentTime) {
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
    return children;
  } catch (err) {
    console.error('Error decoding token:', err);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;