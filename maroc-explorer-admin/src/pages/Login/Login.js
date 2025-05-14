import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './Login.css';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email:'', password:'' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = t('login.errors.email');
    if (!formData.password) newErrors.password = t('login.errors.password');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (validate()) {
      try {
        const response = await axios.post('http://localhost:8000/api/login', {email: formData.email,password: formData.password,});
        const { token } = response.data;
        localStorage.setItem('token', token);
        navigate('/');
      } catch (error) {
        setErrors({
          general: t('login.errors.invalid'),
        });
      }
    }
  };

  return (
    <div className="login-container">
         <nav>
            <div className='logo'>
                 <div className="image"><img src='/images/logo_gold.png' alt="Maroc Explorer Logo"/></div>
                 <div className="title" dir="ltr">Maroc Explorer</div>
            </div>
            <div></div>
         </nav>
        <div className="login-form">
        <h1 className="login-title">{t('Bienvenue')}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
          <label>{t('login.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('login.email')}
              className={errors.email ? 'input-error' : ''}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              autoComplete="off"
            />
            {errors.email && (
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
              <span>{errors.email}</span>
            </div>
            )}
          </div>
          <div className="form-group">
          <label>{t('login.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('login.password')}
              className={errors.password ? 'input-error' : ''}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete="off"
            />
            {errors.password && (
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
              <span>{errors.password}</span>
            </div>
            )}
          </div>
          {errors.general && (
            <p className="error general-error">{errors.general}</p>
          )}
          <button type="submit" className="submit-button">
            {t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;