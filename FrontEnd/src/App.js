import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate as NavigateTo } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ContactProvider } from './context/ContactContext';
import Accueil from './Components/home/home';
import Footer from './Components/footer/footer';
import Article from './Components/article/article';
import ScrollToTop from './Components/ScrollToTop';
import Region from './Components/region/region';
import Province from './Components/province/province';
import Commune from './Components/commune/commune';
import { useLocation } from 'react-router-dom';
import Navbar from './Components/navbar/navbar';

function App() {
  const [regions, setRegions] = useState([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    axios.post('http://localhost:8000/api/track-visit').catch((err) => console.error('Track visit error:', err));
  }, []);

  useEffect(() => {
    const fetchRegionData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/regions/Client', {
          headers: { 'Accept-Language': i18n.language },
        });
        setRegions(response.data.data);
        console.log({ "response": response });
      } catch (error) {
        console.error('Error fetching regions data:', error);
      }
    };
    fetchRegionData();
  }, [i18n.language]);

  const ErrorPage = () => {
    const { t } = useTranslation();
    return (
      <div className="error-page" style={{ padding: '50px', textAlign: 'center' }}>
         <Navbar regions={regions.filter((ele=>(ele.name)))}  CommuneStyle="yes"></Navbar>
        <h2>{t('error.title')}</h2>
        <p>{t('error.message')}</p>
        <button
          className='button-route'
          onClick={() => window.location.href = '/'}
          style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
        >
          {t('error.back_home')}
        </button>
      </div>
    );
  };

  const RedirectExtraSegments = () => {
    const { pathname } = useLocation();
    const segments = pathname.split('/').filter(Boolean);
    const expectedSegments = segments[0] === '' ? 1 : 2; // 1 for "/", 2 for "/:base/:param"
    if (segments.length > expectedSegments) {
      const basePath = '/' + segments.slice(0, expectedSegments).join('/');
      return <NavigateTo to={basePath} replace />;
    }
    return null;
  };

  return (
    <ContactProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Accueil regions={regions} />} />
          <Route path="/:extra" element={<NavigateTo to="/" replace />} />
          <Route path="/article/:id" element={<Article regions={regions} />} />
          <Route path="/article/:id/*" element={<RedirectExtraSegments />} />
          <Route path="/region/:slug" element={<Region regions={regions} />} />
          <Route path="/region/:slug/*" element={<RedirectExtraSegments />} />
          <Route path="/provinces/:slug" element={<Province regions={regions} />} />
          <Route path="/provinces/:slug/*" element={<RedirectExtraSegments />} />
          <Route path="/communes/:slug" element={<Commune regions={regions} />} />
          <Route path="/communes/:slug/*" element={<RedirectExtraSegments />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
        <Footer />
      </Router>
    </ContactProvider>
  );
}

export default App;