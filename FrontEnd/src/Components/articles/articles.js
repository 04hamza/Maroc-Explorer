import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './articles.css';

const Articles = ({ title, subtitle, articles }) => {

  return articles.length>0?
    <div className="articles">
      <h2>{title}</h2>
      <p className="subtitle">{subtitle}</p>
      <div className="articles-list">
        {articles.map((article) => (
          <div key={article.id} className="article-item" whileHover={{ scale: 1.05, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)" }}>
            <Link to={`/article/${article.id}`} className="article-link">
              <div className="article-image">
                <img src={article.image} alt={article.title}/>
              </div>
              <h4>{article.title}</h4>
              <p>{article.description}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>:""

};

export default Articles;