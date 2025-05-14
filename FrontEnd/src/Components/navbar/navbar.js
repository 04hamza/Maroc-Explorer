import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useContact } from '../../context/ContactContext';

const Navbar = ({ regions, provinces,communes, ProvinceStyle,CommuneStyle }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpenRegion, setIsDropdownOpenRegion] = useState(false);
  const [isDropdownOpenProvinces, setIsDropdownOpenProvinces] = useState(false);
  const [isDropdownOpenCommunes, setIsDropdownOpenCommunes] = useState(false);
  const [menuState, setMenuState] = useState('main'); // 'main', 'regions', 'provinces'
  const { isContactOpen, openContactModal, closeContactModal } = useContact();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log({communes:communes})
  // Form state with honeypot
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    consent: false,
    honeypot: '',
    recaptcha_token: '',
  });
  const [errors, setErrors] = useState({});

  // Modal animation variants
  const modalVariants = {
    hidden: { x: '100vw', opacity: 0 },
    visible: { x:  '0%', opacity: 1, transition: { duration: 0.7 } },
    exit: { x: '100vw', opacity: 0, transition: { duration: 0.7 } },
  };

  // Nav-links animation variants
  const navVariants = {
    hidden: { x: i18n.language === 'ar' ? '100%' : '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { x: i18n.language === 'ar' ? '100%' : '-100%', opacity: 0, transition: { duration: 0.5 } },
  };

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, pointerEvents: 'none' },
    visible: { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: 0.3 } },
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) setMenuState('main'); // Reset to main menu when closing
  };

  // Show regions submenu
  const showRegions = () => {
    setMenuState('regions');
    setIsDropdownOpenRegion(true);
  };

  // Show provinces submenu
  const showProvinces = () => {
    setMenuState('provinces');
    setIsDropdownOpenProvinces(true);
  };

  
   const showCommunes = () => {
    setMenuState('communes');
    setIsDropdownOpenCommunes(true);
  };

  // Go back to main menu
  const goBack = () => {
    setMenuState('main');
    setIsDropdownOpenRegion(false);
    setIsDropdownOpenProvinces(false);
  };

  // Close menu on link click
  const handleLinkClick = () => {
    setIsOpen(false);
    setMenuState('main');
    setIsDropdownOpenRegion(false);
    setIsDropdownOpenProvinces(false);
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

  // Form input handling
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('contact.errors.name');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('contact.errors.email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.errors.email');
    }
    if (!formData.subject) {
      newErrors.subject = t('contact.errors.subject');
    }
    if (!formData.message.trim()) {
      newErrors.message = t('contact.errors.message');
    } else if (formData.message.length < 10) {
      newErrors.message = t('contact.errors.message');
    }
    if (!formData.consent) {
      newErrors.consent = t('contact.errors.consent');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await axios.post('http://localhost:8000/api/contact', formData, {
          headers: { 'Accept-Language': i18n.language },
        });
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          consent: false,
          honeypot: '',
          recaptcha_token: '',
        });
        setErrors({});
        setTimeout(() => {
          closeContactModal();
          setStatus(null);
          setIsSubmitting(false);
        }, 2000);
      } catch (error) {
        console.error('Submission error:', error.response?.data);
        setStatus('error');
        setFormData((prev) => ({ ...prev, honeypot: '' }));
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <nav
        className={
          ProvinceStyle && i18n.language !== 'ar'
            ? 'navbar blackNavbar'
            : ProvinceStyle
            ? 'navbar whiteNavbar'
            : CommuneStyle ? "navbar communestyle":"navbar"
        }
        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
        role="navigation"
        aria-label="Main navigation"
      >
        <Link to="/" className="logo" aria-label="Maroc Explorer Home">
          <div className="image">
            <img
              src={(ProvinceStyle && i18n.language === 'ar' || CommuneStyle) ? '/images/logo2.png' : '/images/logo.png'}
              alt="Maroc Explorer Logo"
            />
          </div>
          <div className="title" dir="ltr">
            Maroc Explorer
          </div>
        </Link>
        <button
          className={`burger ${isOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls="nav-links"
          aria-label={isOpen ? t('close') : t('open_menu')}
        >
        {isOpen?<svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="currentColor"
                  className="bi bi-x-lg"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                </svg>:<><span className="line"></span>
          <span className="line"></span>
          <span className="line"></span></>}
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
              {menuState === 'main' && (
                <>
                <li className="logo_burger">
                <Link to="/" className="logo" aria-label="Maroc Explorer Home">
                   <div className="image">
                   <img src="/images/burger_logo.png" alt="Maroc Explorer Logo"/>
                   </div>
                   <div className="title" dir="ltr">Maroc Explorer </div>
                </Link>
                  </li>
                  <li className="li">
                    <Link to="/" onClick={handleLinkClick} className='link'>
                      {t('home')}
                    </Link>
                  </li>
                  <li className="dropdown">
                    <button
                      className="dropdown-toggle link"
                      onClick={showRegions}
                      aria-label={t('regions')}
                      aria-expanded={menuState === 'regions'}
                    >
                      {t('regions')}
                    </button>
                  </li>
                  {provinces && (
                    <li className="dropdown">
                      <button
                        className="dropdown-toggle link"
                        onClick={showProvinces}
                        aria-label={t('provinces')}
                        aria-expanded={menuState === 'provinces'}
                      >
                        {t('provinces')}
                      </button>
                    </li>
                  )}
                  {communes && (
                    <li className="dropdown">
                      <button
                        className="dropdown-toggle link"
                        onClick={showCommunes}
                        aria-label={t('communes')}
                        aria-expanded={menuState === 'communes'}
                      >
                        {t('Communes')}
                      </button>
                    </li>
                  )}
                  <li className="li">
                    <button
                      className="contact-link link"
                      onClick={() => {
                        openContactModal();
                        handleLinkClick();
                      }}
                      aria-label={t('contacte')}
                    >
                      {t('contacte')}
                    </button>
                  </li>
                  <li className="language-selector">
                    <select
                     className='link'
                      value={selectedLanguage}
                      onChange={changeLanguage}
                      aria-label={t('select_language')}
                    >
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </li>
                </>
              )}
              {menuState === 'regions' && (
                <>
                  <li className="back-button">
                    <button
                      onClick={goBack}
                      aria-label={t('back')}
                      className="dropdown-toggle"
                      style={{color:"black"}}
                    >
                      {t('back')}
                    </button>
                  </li>
                  {regions.map((region, index) => (
                    <li className='region_link' key={index}>
                      <Link
                        to={`/region/${region.slug.toLowerCase().replace(' ', '-')}`}
                        onClick={handleLinkClick}
                      >
                        {region.name}
                      </Link>
                    </li>
                  ))}
                </>
              )}
              {menuState === 'provinces' && (
                <>
                  <li className="back-button">
                    <button
                      onClick={goBack}
                      aria-label={t('back')}
                      className="dropdown-toggle"
                    >
                      {t('back')}
                    </button>
                  </li>
                  {provinces.map((province, index) => (
                    <li className='region_link' key={index}>
                      <Link
                        to={`/provinces/${province.slug.toLowerCase().replace(' ', '-')}`}
                        onClick={handleLinkClick}
                      >
                        {province.name}
                      </Link>
                    </li>
                  ))}
                </>
              )}
              {menuState === 'communes' && (
                <>
                  <li className="back-button">
                    <button
                      onClick={goBack}
                      aria-label={t('back')}
                      className="dropdown-toggle"
                    >
                      {t('back')}
                    </button>
                  </li>
                  {communes.map((commune, index) => (
                     <li className='region_link' key={index}>
                           <Link
                              to={`/communes/${commune.slug.toLowerCase()}`}
                              onClick={handleLinkClick}>
                            {commune.name}
                           </Link>
                      </li>))}
                </>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
        <ul className="nav-links desktop-nav">
          <li className="li">
            <Link to="/">{t('home')}</Link>
          </li>
          <motion.li
            className="dropdown"
            onMouseEnter={() => setIsDropdownOpenRegion(true)}
            onMouseLeave={() => setIsDropdownOpenRegion(false)}
          >
            <button className="dropdown-toggle" aria-label={t('regions')}>
              {t('regions')}
            </button>
            <AnimatePresence>
              {isDropdownOpenRegion && (
                <motion.ul
                  className="dropdown-menu"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {regions.map((region, index) => (
                    <li key={index}>
                      <Link
                        to={`/region/${region.slug.toLowerCase().replace(' ', '-')}`}
                        onClick={handleLinkClick}
                      >
                        {region.name}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.li>
          {provinces && (
            <motion.li
              className="dropdown"
              onMouseEnter={() => setIsDropdownOpenProvinces(true)}
              onMouseLeave={() => setIsDropdownOpenProvinces(false)}
            >
              <button className="dropdown-toggle" aria-label={t('provinces')}>
                {t('provinces')}
              </button>
              <AnimatePresence>
                {isDropdownOpenProvinces && (
                  <motion.ul
                    className="dropdown-menu"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {provinces.map((province, index) => (
                      <li key={index}>
                        <Link
                          to={`/provinces/${province.slug.toLowerCase().replace(' ', '-')}`}
                          onClick={handleLinkClick}
                        >
                          {province.name}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          )}
           {communes && (
            <motion.li
              className="dropdown"
              onMouseEnter={() => setIsDropdownOpenCommunes(true)}
              onMouseLeave={() => setIsDropdownOpenCommunes(false)}
            >
              <button className="dropdown-toggle" aria-label={t('provinces')}>
                {t('Communes')}
              </button>
              <AnimatePresence>
                {isDropdownOpenCommunes && (
                  <motion.ul
                    className="dropdown-menu"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {communes.map((commune, index) => (
                      <li key={index}>
                        <Link
                          to={`/communes/${commune.slug.toLowerCase()}`}
                          onClick={handleLinkClick}
                        >
                          {commune.name}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          )}
          <li className="li">
            <button
              className="contact-link"
              onClick={openContactModal}
              aria-label={t('contacte')}
            >
              {t('contacte')}
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

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactOpen && (
          <motion.div
            className="contact-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-labelledby="contact-modal-title"
          >
            <div className="contact-modal-content">
              <button
                className="close-button-div"
                onClick={closeContactModal}
                aria-label={t('close')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-x-lg"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                </svg>
              </button>
              <h2 id="contact-modal-title">{t('contact.title')}</h2>
              <form onSubmit={onSubmit} className="contact-form">
                <div className="form-group">
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('contact.name')}
                    className={errors.name ? 'red' : ''}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <div className="error" id="name-error">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-exclamation-triangle-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                      </svg>
                      <span>{errors.name}</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('contact.email')}
                    className={errors.email ? 'red' : ''}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <div className="error" id="email-error">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-exclamation-triangle-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                      </svg>
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={errors.subject ? 'red' : ''}
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? 'subject-error' : undefined}
                  >
                    <option value="">{t('contact.subject')}</option>
                    <option value="General Inquiry">{t('contact.subjects.general')}</option>
                    <option value="Support">{t('contact.subjects.support')}</option>
                    <option value="Feedback">{t('contact.subjects.feedback')}</option>
                    <option value="Partnership">{t('contact.subjects.partnership')}</option>
                    <option value="Other">{t('contact.subjects.other')}</option>
                  </select>
                  {errors.subject && (
                    <div className="error" id="subject-error">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-exclamation-triangle-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                      </svg>
                      <span>{errors.subject}</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t('contact.message')}
                    className={errors.message ? 'red' : ''}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && (
                    <div className="error" id="message-error">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-exclamation-triangle-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                      </svg>
                      <span>{errors.message}</span>
                    </div>
                  )}
                </div>
                <div className="form-group consent">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? 'consent-error' : undefined}
                  />
                  <label htmlFor="consent" className={errors.consent ? 'red' : ''}>
                    {t('contact.consent')}
                  </label>
                </div>
                <div style={{ display: 'none' }}>
                  <input
                    type="text"
                    id="honeypot"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading-spinner"></span> : t('contact.submit')}
                </button>
              </form>
              {status === 'success' && (
                <motion.p
                  initial={{ x: -1, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { duration: 0.5 } }}
                  exit={{ opacity: 0 }}
                  className="success"
                >
                  {t('contact.success')}
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p
                  initial={{ x: -1, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { duration: 0.5 } }}
                  exit={{ opacity: 0 }}
                  className="error"
                >
                  {t('contact.error')}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;