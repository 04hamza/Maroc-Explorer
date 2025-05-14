
import Navbar from '../navbar/navbar';
import React from 'react';
import { motion,AnimatePresence } from 'framer-motion';
import Articles from '../articles/articles';
import {useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../loading/loaging';
import { useParams } from 'react-router-dom';
import "./region.css"
import RegionMap from '../regionMap/RegionMap';


const Region = ({regions}) => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [regionData, setRegionData] = useState({});
  const [error, setError] = useState(null);
  const [articals, setarticals] = useState([]);
  const [provinces, setProvices] = useState([]);
  const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchRegion = async () => {
          try {
            const response = await fetch(`http://localhost:8000/api/regions/${slug}`, {
              headers: {
                'Accept': 'application/json',
                'Accept-Language': i18n.language, 
              },
            });
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setRegionData(data);
            setError(null);
          
          } catch (err) {
            console.error('Error fetching region:', err);
            setError(t('region_not_found', { defaultValue: 'Region not found' }));
          }finally {
            setLoading(false);
          }
        };
        fetchRegion();
    },[slug,i18n.language,t]);
    useEffect(() => {
      const fetchPageData = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/regions/${slug}/articles`,{
            headers: {'Accept-Language':i18n.language},
          });
          setarticals(response.data.data);
          console.log(response.data)
        } catch (error) {
          console.error('Error fetching accueil data:', error);
        }
      };
      fetchPageData();
    }, [slug,i18n.language]);
    useEffect(() => {
      const fetchRegionData = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/regions/${slug}/province`,{
            headers: {'Accept-Language':i18n.language},
          });
          setProvices(response.data.data);
          console.log(response.data)
        } catch (error) {
          console.error('Error fetching accueil data:', error);
        }
      };
      fetchRegionData();
    }, [slug,i18n.language]);
    if(loading){return <Loading/>}
    if(error){
      return (
          <div>
            <Navbar regions={regions} CommuneStyle="yes"/>
            <div className="page_not_complete">{error}</div>;
          </div>
      )
    }
    if(!loading && (!regionData.name || (regionData.sections && regionData.sections.length<3))){
      
      return (<div>
        <Navbar regions={regions} CommuneStyle="yes"/>
      <div className='page_not_complete'>{t('page_not_complete')}</div>
      </div>)
    }
  return(
    <div className="region" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
       <AnimatePresence>
            <div className="image-container">
                <img src={regionData.image} alt="Background" />
            </div>
            <div className="overlay">
                <Navbar regions={regions.filter((ele=>(ele.name)))} 
                 provinces={provinces.filter((ele=>(ele.name)))} />
                <motion.div 
                initial={{x: "-50%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="Presentation">  
                <h1 className='title'>{regionData.name}</h1>
                <p className='description'>{regionData.description}</p>
                </motion.div>
            </div>
            <div className='Key_Statistics'>
              <div className='Key_Statistics_title'>{t("Key_Statistics")}</div>
              <div className='keys'>
              <div className='key'>
                        <div className='key_title'>{t("Total_Population_title")}</div>
                        <div className='key_info'>{regionData.Total_Population}</div>
              </div>
              <div className='key'>
                        <div className='key_title'>{t("Area_title")}</div>
                        <div className='key_info'>{regionData.Area}</div>
              </div>
              <div className='key'>
                        <div className='key_title'>{t("Number_Provinces_title")}</div>
                        <div className='key_info'>{regionData.Number_Provinces}</div>
              </div>
              <div className='key'>
                        <div className='key_title'>{t("Numbrer_Communes_title")}</div>
                        <div className='key_info'>{regionData.Numbrer_Communes}</div>
              </div>
              <div className='key'>
                        <div className='key_title'>{t("Urbanization_Rate_title")}</div>
                        <div className='key_info'>{regionData.Urbanization_Rate}</div>
              </div>
              </div>
            </div>
            <div className='specificites-culturelles-economiques'>
  <div className='image'>
    <img src={regionData.sections[0].image} alt={regionData.sections[0].title} />
  </div>
  <div className='description'>
    <h2 className='title'> 
      {regionData.sections[0].title}
    </h2>
    <div className='text-wrapper'>
      <div className='text' dangerouslySetInnerHTML={{ __html: regionData.sections[0].content || '' }} />
    </div>
  </div>
</div>
            <div className='map-div'>
               <div className='content'>
                  <h2 className='title'>{regionData.sections[1].title}</h2>
                  <div className='text'>
                  {regionData.sections[1].content}
                  </div>
                  <div className='image'>
                    <img src={i18n.language === 'ar' ? '/images/mapAr.png':'/images/mapLa.png'}></img>
                  </div>
               </div>
               <RegionMap latitude={regionData.latitude} longitude={regionData.longitude} zoom={regionData.zoom} regionSlug={slug}/>
            </div>
             <div class="geography-section-perent">
                <h2>{regionData.sections[2].title}</h2>
                <div className='geography-section-content'>
                <div className='t-one' dangerouslySetInnerHTML={{ __html: regionData.sections[2].content || '' }}></div>
                </div>
            </div>
            <Articles title="Perspectives Économiques 2025" subtitle="Découvrez les forces économiques qui façonnent l’avenir du Maroc." articles={articals}/>
       </AnimatePresence>
     </div>
  );
};

export default Region;