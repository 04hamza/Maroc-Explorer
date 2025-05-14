
import Navbar from '../navbar/navbar';
import React from 'react';
import { motion,AnimatePresence } from 'framer-motion';
import Articles from '../articles/articles';
import {useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../loading/loaging';
import { useParams } from 'react-router-dom';
import "./commune.css"
import RegionMap from '../regionMap/RegionMap';


const Commune= ({regions}) => {
  const { t,i18n } = useTranslation();
  const {slug}=useParams();
  const [communeData,setCommuneData]=useState({})
  const [error, setError] = useState(null);
  const [provinceSlug,setProvinceSlug]=useState();
  const [articals, setarticals] = useState([]);
  const [provinces, setProvices] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/communes/${slug}`, {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': i18n.language, 
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setCommuneData(data.data);
        setProvinceSlug(data.data.province_name)
        setError(null);
        console.log({commun:data.data})
        setProvinceSlug(data.data.province_name)
      } catch (err) {
        console.error('Error fetching commun:', err);
        setError(t('region_not_found', { defaultValue: 'Commune not found' }));
      }finally {
        setLoading(false);
      }
    };fetchRegion();
},[slug,i18n.language,t]);

useEffect(() => {
  const fetchRegionData = async () => {
try {
  const response = await axios.get(`http://localhost:8000/api/regions/${communeData.province_name}/provinces`,{
    headers: {'Accept-Language':i18n.language},
  });
  setProvices(response.data.data);
} catch (error) {
  console.error('Error fetching accueil data:', error);
}
};
fetchRegionData();
}, [slug,i18n.language,communeData]);

useEffect(() => {
  const fetchRegionData = async () => {
try {
  const response = await axios.get(`http://localhost:8000/api/communes/by-province/${communeData.province_name}`,{
    headers: {'Accept-Language':i18n.language},
  });
  console.log({communes:response.data.data})
  setCommunes(response.data.data);
} catch (error) {
  console.error('Error fetching accueil data:', error);
}
};
fetchRegionData();
}, [communeData,slug,i18n.language]);
useEffect(() => {
  const fetchPageData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/provinces/${provinceSlug}/articles`,{
        headers: {'Accept-Language':i18n.language},
      });
      setarticals(response.data.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching accueil data:', error);
    }
  };
  fetchPageData();
}, [i18n.language,provinceSlug]);

if(loading){return <Loading/>}
if(error){
  return (
      <div>
        <Navbar regions={regions} CommuneStyle="yes"/>
        <div className="page_not_complete">{error}</div>;
      </div>
  )
}
if(!loading && (communeData.name && (communeData.sections && communeData.sections.length<1))){
  return <div className='page_not_complete'>{t('page_not_complete')}</div>;
}

  return(
    <div className="commun" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
       <AnimatePresence>
            <Navbar regions={regions.filter((ele=>(ele.name)))}  provinces={provinces.filter((ele=>(ele.name)))} communes={communes.filter((ele=>(ele.name)))} CommuneStyle="yes"></Navbar>
             <motion.div>
                 <div className='presentation'>
                  <div className='image'>
                    <img src={communeData.image}></img>
                  </div>
                  <div className='content'>
                    <h2 className='title'>{communeData.title}</h2>
                    <div className='text'>{communeData.description}</div>
                  </div>
                 </div>
                 <div>
                 <div className='Key_Statistics'>
               <div className='Key_Statistics_title'>{t("Key_Statistics")}</div>
               <div className='keys'>
               <div className='key'>
                         <div className='key_title'>{t("Total_Population_title")}</div>
                         <div className='key_info'>{communeData.Total_Population}</div>
               </div>
               <div className='key'>
                         <div className='key_title'>{t("Area_title")}</div>
                         <div className='key_info'>{communeData.Area}</div>
               </div>
               <div className='key'>
                         <div className='key_title'>{t("Number_Arrondissements")}</div>
                         <div className='key_info'>{communeData.Number_Communes}</div>
               </div>
               <div className='key'>
                         <div className='key_title'>{t("Provincial_Capital")}</div>
                         <div className='key_info'>{communeData.Provincial_Capital}</div>
               </div>
               <div className='key'>
                         <div className='key_title'>{t("Number_Faculties")}</div>
                         <div className='key_info'>{communeData.number_faculties}</div>
               </div>
               <div className='key'>
                         <div className='key_title'>{t("Number_Hospitals")}</div>
                         <div className='key_info'>{communeData.number_hospitals}</div>
               </div>
               </div>
             </div>
                  <div className='sectionOne'>
                    <h2 className='title'></h2>
                    <div className='text'></div>
                  </div>
                  <div className='image'>
                    <img></img>
                  </div>
                 </div>
             </motion.div>
             <Articles title="Perspectives Économiques 2025" subtitle="Découvrez les forces économiques qui façonnent l’avenir du Maroc." articles={articals}/>
       </AnimatePresence>
     </div>
  );
};

export default Commune;