import React from 'react';
import 'antd/dist/reset.css';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';
import { I18nextProvider } from 'react-i18next';
import i18n from './translations/i18n';

const root = createRoot(document.getElementById('root'));
root.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);