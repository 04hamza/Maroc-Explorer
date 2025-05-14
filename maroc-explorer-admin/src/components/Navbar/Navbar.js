import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  // Nav-links animation variants
  const navVariants = {
    hidden: { x: i18n.language === 'ar' ? '100%' : '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { x: i18n.language === 'ar' ? '100%' : '-100%', opacity: 0, transition: { duration: 0.5 } },
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu on link click
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Language handling
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
      setSelectedLanguage(savedLanguage);
    } else if (!savedLanguage) {
      setSelectedLanguage('fr');
      localStorage.setItem('language', 'fr');
    }
  }, [i18n]);

  const changeLanguage = (e) => {
    const newLanguage = e.target.value;
    i18n.changeLanguage(newLanguage);
    setSelectedLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout',{}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    navigate('/login');
    handleLinkClick();
  };

  return (
    <nav
      className="navbar"
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      role="navigation"
      aria-label="Admin navigation"
    >
      <Link to="/" className="logo" aria-label="Maroc Explorer Admin">
        <div className="image">
          <img src="/images/logo_black.png" alt="Maroc Explorer Logo" />
        </div>
        <div className="title" dir="ltr">
          Maroc Explorer Admin
        </div>
      </Link>
      <button
        className={`burger ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="nav-links"
        aria-label={isOpen ? t('close') : t('open_menu')}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-x-lg"
            viewBox="0 0 16 16"
          >
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
          </svg>
        ) : (
          <>
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </>
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className={`nav-links ${isOpen ? 'open' : ''}`}
            id="nav-links"
            variants={navVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <li className="logo_burger">
              <Link to="/" className="logo" aria-label="Maroc Explorer Admin">
                <div className="image">
                  <img src="/images/logo_gold.png" alt="Maroc Explorer Logo" />
                </div>
                <div className="title" dir="ltr">
                  Maroc Explorer Admin
                </div>
              </Link>
            </li>
            <li className="li">
              <Link to="/" onClick={handleLinkClick} className="link">
                {t('nav.dashboard')}
              </Link>
            </li>
            <li className="li">
              <Link to="/regions" onClick={handleLinkClick} className="link">
                {t('nav.regions')}
              </Link>
            </li>
            <li className="li">
              <Link to="/contacts" onClick={handleLinkClick} className="link">
                {t('nav.contacts')}
              </Link>
            </li>
            <li className="li">
              <button
                className="logout-button link"
                onClick={handleLogout}
                aria-label={t('logout')}
              >
                {t('nav.logout')}
              </button>
            </li>
            <li className="language-selector">
              <select
                className="link"
                value={selectedLanguage}
                onChange={changeLanguage}
                aria-label={t('select_language')}
              >
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
      <ul className="nav-links desktop-nav">
        <li className="li">
          <Link to="/">{t('nav.dashboard')}</Link>
        </li>
        <li className="li">
          <Link to="/regions">{t('nav.regions')}</Link>
        </li>
        <li className="li">
          <Link to="/contacts">{t('nav.contacts')}</Link>
        </li>
        <li className="li">
          <button
            className="logout-button"
            onClick={handleLogout}
            aria-label={t('logout')}
          >
            {t('nav.logout')}
          </button>
        </li>
        <li className="language-selector">
          <select
            value={selectedLanguage}
            onChange={changeLanguage}
            aria-label={t('select_language')}
          >
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;