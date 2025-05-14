
import Navbar from '../navbar/navbar';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion,AnimatePresence } from 'framer-motion';
import MapMaroc from "../maps/mapMaroc/mapmaroc"
import Articles from '../articles/articles';
import {useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../loading/loaging';
import './home.css';

const Accueil = ({regions}) => {
   const { i18n } = useTranslation();
   const [accueilData, setAccueilData] = useState({});
   const [articals, setarticals] = useState([]);
   useEffect(() => {
      const fetchPageData = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/pages/accueil',{
            headers: {'Accept-Language':i18n.language},
          });
          setAccueilData(response.data);
          console.log(response.data)
        } catch (error) {
          console.error('Error fetching accueil data:', error);
          setAccueilData({
            title: '',
            description: '',
            sections: [],
          });
        }
      };
      fetchPageData();
    }, [i18n.language]);
    useEffect(() => {
      const fetchPageData = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/articles/latest',{
            headers: {'Accept-Language':i18n.language},
          });
          setarticals(response.data.data);
          console.log(response.data)
        } catch (error) {
          console.error('Error fetching accueil data:', error);
        }
      };
      fetchPageData();
    }, [i18n.language]);
    const scrollNext = () => {
      const container = document.querySelector(".articles-row");
      container.scrollBy({left: 600,behavior: "smooth"});
    };
    const scrollPrev = () => {
      const container = document.querySelector(".articles-row");
      container.scrollBy({left: -600,behavior: "smooth"});
    };
  if(!accueilData || accueilData.sections==null || !articals.length){
    return <Loading/>;
  }
  return (
    <div className="home" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
       <AnimatePresence>
            <div className="image-container">
                <img src="images/morroco7.png" alt="Background" />
            </div>
            <div className="overlay">
                <Navbar regions={regions.filter((ele=>(ele.name)))} />
                <motion.div 
                initial={{x: "-50%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="Presentation">  
                <h1 className='title'>{accueilData.title}</h1>
                <p className='description'>{accueilData.description}</p>
                </motion.div>
            </div>
            <motion.div className='presenatation'
             initial={{opacity: 0 }}
             animate={{opacity: 1 }}
             transition={{ duration: 2, ease: "easeInOut" }}
            >
                  <motion.div className='image'
                   initial={{filter:"blur(3px)"}}
                   animate={{filter:"blur(0px)"}}
                   transition={{ duration: 2, ease: "easeInOut" }}
                  >
                       <img src='images/ra.png' alt='rabat'></img>
                  </motion.div>
                  <div className='text'>
                    <h2 className='title'>{accueilData.sections[0].title}</h2>
                    <div className='info'>
                    {accueilData.sections[0].content}
                    </div>
                  </div>
            </motion.div>
            <div className='map'>
            <motion.div className='map-text'
                   initial={{opacity: 0 }}
                   animate={{opacity: 1 }}
                   transition={{ duration: 2, ease: "easeInOut" }}
            >
                <h2>{accueilData.sections[1].title}</h2>
                <p>
                {accueilData.sections[1].content}
                </p>
              <div className="news-articles">
                <div className="articles-row"> 
                  {articals.map((ele,index)=>(
                       <div className="news-article">
                       <Link to={`/article/${ele.id}`} className="news-link">
                         <h3>{ele.title}</h3>
                         <div  className="news-image" >
                              <img src={ele.image} alt={ele.title} />
                         </div>
                         <p>{ele.description}</p>
                       </Link>
                     </div>
                  ))} 
                </div>
                <button className="scroll-left" onClick={scrollPrev}>
                &#8592;
                </button>
                <button className="scroll-right" onClick={scrollNext}>
                &#8594;
                </button>
              </div>
            </motion.div>
              <MapMaroc/>
            </div>
            <Articles title={accueilData.sections[2].title} subtitle={accueilData.sections[2].content} articles={articals}/>
       </AnimatePresence>
     </div>
  );
};

export default Accueil;