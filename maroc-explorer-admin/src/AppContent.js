import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import './pages/Regions/Regions.css'; 

const AppContent = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isTokenWarningOpen, setIsTokenWarningOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let warningTimeout;
    let checkInterval;

    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsTokenWarningOpen(false);
        navigate('/login');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        console.log('Token expires at:', new Date(expirationTime).toLocaleString());

        if (expirationTime < currentTime) {
          console.log('Token is expired');
          localStorage.removeItem('token');
          setIsTokenWarningOpen(false);
          navigate('/login');
        } else {
          // Show warning 5 minutes (300000 ms) before expiration
          const warningTime = expirationTime - currentTime - 300000;
          if (warningTime > 0) {
            warningTimeout = setTimeout(() => {
              setIsTokenWarningOpen(true);
            }, warningTime);
          } else if (expirationTime - currentTime <= 300000) {
            setIsTokenWarningOpen(true);
          }
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        localStorage.removeItem('token');
        setIsTokenWarningOpen(false);
        navigate('/login');
      }
    };


    checkToken();


    checkInterval = setInterval(checkToken, 60000);

   
    return () => {
      clearTimeout(warningTimeout);
      clearInterval(checkInterval);
    };
  }, [navigate, t]);

  const refreshToken = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/refresh-token', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      localStorage.setItem('token', response.data.token);
      setIsTokenWarningOpen(false);
    } catch (err) {
      localStorage.removeItem('token');
      setIsTokenWarningOpen(false);
      navigate('/login');
    }
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {false && (
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-content">
              <h3>{t('auth.session_expiring')}</h3>
              <p>{t('auth.session_expiring_message')}</p>
              <div className="form-buttons">
                <button className="submit-button" onClick={refreshToken}>
                  {t('auth.extend_session')}
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setIsTokenWarningOpen(false);
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                >
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppContent;