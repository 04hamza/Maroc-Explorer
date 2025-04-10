
import Navbar from '../navbar/navbar';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion,AnimatePresence } from 'framer-motion';
import MapMaroc from "../maps/mapMaroc/mapmaroc "
import Articles from '../articles/articles';
import './home.css';

const Accueil = () => {
  const regions = [
    "Tanger-Tétouan-Al Hoceïma", "L'Oriental", "Fès-Meknès", "Rabat-Salé-Kénitra",
    "Béni Mellal-Khénifra", "Casablanca-Settat", "Marrakech-Safi", "Drâa-Tafilalet",
    "Souss-Massa", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab"
  ];
  const economicArticles = [
    { 
      id: 5, 
      title: "Le Tourisme à Marrakech : Un Pilier Économique en Pleine Expansion", 
      image: "https://i.pinimg.com/736x/7e/44/1f/7e441f0fa5c80f6fe335d2b6dc6f0124.jpg", 
      description: "Moteur économique majeur." 
    },
    { 
      id: 6, 
      title: "Le Port de Tanger Med : Un Hub Logistique Stratégique en Méditerranée", 
      image: "https://i.pinimg.com/736x/63/39/4b/63394bc7c63f25d60a367a7e59fb4e3c.jpg", 
      description: "Hub logistique en Méditerranée." 
    },
    { 
      id: 7, 
      title: "L’Agriculture dans la Région du Souss : Leader des Exportations d’Agrumes", 
      image: "https://i.pinimg.com/736x/8c/70/87/8c7087b949e46053ef1d927565d417d8.jpg", 
      description: "Exportations d’agrumes." 
    },
    { 
      id: 8, 
      title: "Le Projet d’Énergie Solaire Noor : Vers une Économie Verte et Durable", 
      image: "https://i.pinimg.com/736x/18/ff/65/18ff65914a7a460fdf8bace58e96f535.jpg", 
      description: "Projet pour une économie verte." 
    },
    { id: 9, title: "Le Secteur Textile de Casablanca : Une Industrie en Croissance Constante", image: "https://i.pinimg.com/736x/41/01/5a/41015a9fbc2564c01e4d79783fea17bd.jpg", description: "Production textile compétitive sur le marché mondial." },
  ];
  return (
    <div className="home">
       <AnimatePresence>
            <div className="image-container">
                <img src="images/morroco7.png" alt="Background" />
            </div>
            <div className="overlay">
                <Navbar/>
                <motion.div 
                initial={{x: "-50%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="Presentation">  
                <h1 className='title'>Bienvenue sur le Portail Interactif du Maroc</h1>
                <p className='description'>Ce site vous permet d’explorer les régions, provinces et communes du Maroc à travers une carte interactive et une navigation intuitive. Découvrez la richesse du pays, de ses paysages à ses cultures, en un seul clic.</p>
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
                    <h2 className='title'>Présentation Générale du Maroc</h2>
                    <div className='info'>
                    Le Maroc est un pays situé à l'extrême nord-ouest de l’Afrique. Il se distingue par une grande richesse géographique, historique et culturelle.
                    <br></br>
                    Le Royaume est divisé en 12 régions administratives, chacune composée de provinces et de communes. Chaque région possède ses caractéristiques naturelles, économiques et culturelles uniques.
                    <br></br>
                    Le territoire marocain offre une diversité de paysages impressionnante : montagnes de l'Atlas et du Rif, vastes plaines, oasis, déserts et littoraux maritimes.
                    <br></br>
                    Sa culture est profondément amazighe, influencée au fil de l’histoire par certaines influences orientales et européennes, ce qui donne au Maroc une identité plurielle et riche.
                    <br></br>
                    Le Maroc est également reconnu pour sa gastronomie, son artisanat traditionnel, et ses villes dynamiques mêlant histoire et modernité.
                    </div>
                  </div>
            </motion.div>
            <div className='map'>
            <motion.div className='map-text'
                   initial={{opacity: 0 }}
                   animate={{opacity: 1 }}
                   transition={{ duration: 2, ease: "easeInOut" }}
            >
                <h2>Explorez la Carte Interactive</h2>
                <p>
                 Découvrez les 12 régions administratives du Maroc, chacune avec ses provinces, ses cultures et ses paysages uniques. 
                 De la vibrante région de Casablanca-Settat aux montagnes majestueuses du Rif, en passant par les déserts dorés du Sahara, 
                 chaque région offre une histoire riche et des trésors à explorer. Cliquez sur une région pour en savoir plus sur son patrimoine, 
                 ses spécialités locales et ses attractions incontournables !
                 </p>
              <motion.div
                 className="region-list"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.6, ease:"easeIn" }}
                 >
              <h3>Choisissez une Région</h3>
              <ul>
                {regions.map((region, index) => (
                  <motion.li key={index}>
                    <Link to={`/region/${region.toLowerCase().replace(/\s+/g, '-')}`}>
                      {region}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            </motion.div>
                <MapMaroc/>
            </div>
            <Articles title="Perspectives Économiques 2025" subtitle="Découvrez les forces économiques qui façonnent l’avenir du Maroc." articles={economicArticles}/>
       </AnimatePresence>
     </div>
  );
};

export default Accueil;