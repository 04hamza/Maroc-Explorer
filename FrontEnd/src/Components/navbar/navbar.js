import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './navbar.css'; 
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const regions = [
    "Tanger-Tétouan-Al Hoceïma",
    "Fès-Meknès",
    "Rabat-Salé-Kénitra",
    "Béni Mellal-Khénifra",
    "Casablanca-Settat",
    "Marrakech-Safi",
    "Drâa-Tafilalet",
    "Souss-Massa",
    "Guelmim-Oued Noun",
    "Laâyoune-Sakia El Hamra",
    "Dakhla-Oued Ed-Dahab"]


  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, pointerEvents: 'none' }, 
    visible: { opacity: 1, y: 0, pointerEvents: 'auto' }, 
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <div className="image">
          <img src="/images/logo.png" alt="Maroc Explorer Logo" />
        </div>
        <div className="title">Maroc Explorer</div>
      </Link>

      <div className="burger" onClick={() => setIsOpen(!isOpen)}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li className="li">
          <Link to="/">Accueil</Link>
        </li>

        <motion.li
          className="dropdown"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
          whileHover={{ backgroundColor: "#233142"}}
          transition={{ duration:1}}
        >
          <span className="dropdown-toggle">Régions</span>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.ul
                className="dropdown-menu"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.3 }}
              >
                {regions.map((region, index) => (
                  <li key={index}>
                    <Link to={`/region/${region.toLowerCase().replace(" ", "-")}`}>
                      {region}
                    </Link>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.li>
        <li className="li">
          <NavLink to="/contact" activeClassName="active">
            Contact
          </NavLink>
        </li>
        <li className="language-selector">
          <select defaultValue="FR">
            <option value="FR">Français</option>
            <option style={{textAlign:"end"}} value="AR">العربية</option>
            <option value="EN">English</option>
          </select>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;