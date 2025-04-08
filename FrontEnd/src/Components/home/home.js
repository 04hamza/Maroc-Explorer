
import Navbar from '../navbar/navbar';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion,AnimatePresence } from 'framer-motion';
import MapMaroc from "../maps/mapMaroc/mapmaroc "
import './home.css';

const Accueil = () => {
  const regions = [
    "Tanger-Tétouan-Al Hoceïma", "L'Oriental", "Fès-Meknès", "Rabat-Salé-Kénitra",
    "Béni Mellal-Khénifra", "Casablanca-Settat", "Marrakech-Safi", "Drâa-Tafilalet",
    "Souss-Massa", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab"
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
                  <motion.li
                    key={index}
                    initial={{ backgroundColor:"#ffffff"}}
                    whileHover={{ scale: 1.05,x:50,backgroundColor:"#f9ebbf"}}
                    transition={{ duration: 0.3,ease:"easeIn"}}
                  >
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
       </AnimatePresence>
     </div>
  );
};

export default Accueil;