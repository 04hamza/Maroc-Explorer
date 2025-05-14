import { useEffect, useState } from 'react';
import Navbar from '../navbar/navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import './province.css';
import Loading from '../loading/loaging';
import ProvinceMap from '../provinceMap/ProvinceMap';
import axios from 'axios';
import Articles from '../articles/articles';

const Province = ({ regions }) => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [provinceData, setProvinceData] = useState({});
  const [error, setError] = useState(null);
  const [regionSlug, setRegionSlug] = useState('');
  const [articles, setArticles] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvince = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/provinces/${slug}`, {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': i18n.language,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setProvinceData(data.data);
        setRegionSlug(data.data.region_slug);
        setError(null);
        console.log('Province data:', data.data);
      } catch (err) {
        console.error('Error fetching province:', err);
        setError(t('region_not_found', { defaultValue: 'Province not found' }));
      } finally {
        setLoading(false);
      }
    };
    fetchProvince();
  }, [slug, i18n.language, t, navigate]);

  useEffect(() => {
    if (!regionSlug) return; // Wait until regionSlug is set
    const fetchArticles = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/regions/${regionSlug}/articles`, {
          headers: { 'Accept-Language': i18n.language },
        });
        setArticles(response.data.data);
        console.log('Articles data:', response.data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };
    fetchArticles();
  }, [i18n.language, regionSlug]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/regions/${provinceData.slug}/provinces`, {
          headers: { 'Accept-Language': i18n.language },
        });
        setProvinces(response.data.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    if (regionSlug) fetchProvinces();
  }, [i18n.language, provinceData]);

  useEffect(() => {
    const fetchCommunes = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/communes/by-province/${slug}`, {
          headers: { 'Accept-Language': i18n.language },
        });
        setCommunes(response.data.data);
        console.log(response.data.data)
      } catch (error) {
        console.error('Error fetching communes:', error);
      }
    };
    fetchCommunes();
  }, [i18n.language, slug]);

  if (loading) {
    return <Loading />;
  }
  if(error){  
    return (
        <div>
          <Navbar regions={regions} CommuneStyle="yes"/>
          <div className="page_not_complete">{error}</div>;
        </div>
    )
  }
  if (!loading && (!provinceData.name || (provinceData.sections && provinceData.sections.length < 2))) {
    return <div className="page_not_complete">{t('page_not_complete')}</div>;
  }

  return (
    <div className="province" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <AnimatePresence>
        <div className="image-container">
          <img src={provinceData.image} alt="Background" />
        </div>
        <div className="overlay">
          <Navbar 
             regions={regions.filter((ele=>(ele.name)))} 
             provinces={provinces.filter((ele=>(ele.name)))} 
             communes={communes.filter((ele=>(ele.name)))} 
             ProvinceStyle="yes" />
          <motion.div
            initial={{ x: '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="presentation_province"
          >
            <h1 className="title">{provinceData.title}</h1>
            <p className="description">{provinceData.description}</p>
          </motion.div>
        </div>
        <div className="Key_Statistics">
          <div className="Key_Statistics_title">{t('Key_Statistics')}</div>
          <div className="keys">
            <div className="key">
              <div className="key_title">{t('Total_Population_title')}</div>
              <div className="key_info">{provinceData.Total_Population}</div>
            </div>
            <div className="key">
              <div className="key_title">{t('Area_title')}</div>
              <div className="key_info">{provinceData.Area}</div>
            </div>
            <div className="key">
              <div className="key_title">{t('Region')}</div>
              <div className="key_info">{provinceData.region_name}</div>
            </div>
            <div className="key">
              <div className="key_title">{t('Numbrer_Communes_title')}</div>
              <div className="key_info">{provinceData.Numbrer_Communes}</div>
            </div>
            <div className="key">
              <div className="key_title">{t('Provincial Capital')}</div>
              <div className="key_info">{provinceData.Provincial_Capital}</div>
            </div>
          </div>
        </div>
        <div className="section_one">
          <div className="image">
            <img src={provinceData.sections?.[0]?.image} alt="Section" />
          </div>
          <div className="province_content">
            <h2>{provinceData.sections?.[0]?.title}</h2>
            <div>{provinceData.sections?.[0]?.content}</div>
          </div>
        </div>
        <div className="map-div">
          <div className="content">
            <h2 className="title">{provinceData.sections?.[1]?.title}</h2>
            <div className="text">{provinceData.sections?.[1]?.content}</div>
            <div className="direction">
              <img src={i18n.language === 'ar' ? '/images/mapAr.png' : '/images/mapLa.png'} alt="Map Direction" />
            </div>
          </div>
          <ProvinceMap
            latitude={provinceData.latitude}
            longitude={provinceData.longitude}
            zoom={provinceData.zoom}
            provinceSlug={slug}
          />
        </div>
        <Articles
          title="Perspectives Économiques 2025"
          subtitle="Découvrez les forces économiques qui façonnent l’avenir du Maroc."
          articles={articles}
        />
      </AnimatePresence>
    </div>
  );
};

export default Province;