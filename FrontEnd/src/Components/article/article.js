import "./article.css"
import { useState,useEffect } from "react"
import Navbar from "../navbar/navbar"
import { motion,AnimatePresence } from 'framer-motion';
import Loading from "../loading/loaging";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import axios from "axios";

const Article=()=>{
    const [article,setArticle]=useState({})
    const [regions, setRegions] = useState([]);
    const {id}=useParams()
    const { t,i18n } = useTranslation();
    useEffect(() => {
      const fetchPageData = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/articles/${id}`,{
            headers: {'Accept-Language':i18n.language},
          });
          setArticle(response.data);
        } catch (error) {
          console.error('Error fetching accueil data:', error);
        }
      };
      fetchPageData();
    }, [i18n.language]);
    useEffect(() => {
      const fetchRegionData = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/regions/Client',{
            headers: {'Accept-Language':i18n.language},
          });
          setRegions(response.data.data);
          console.log(response.data.data)
        } catch (error) {
          console.error('Error fetching accueil data:', error);
        }
      };
      fetchRegionData();
    }, [i18n.language]);
   if(!article.title || regions.length==0){
      return <Loading/>
   }
   return(
      <motion.div 
      className="article" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="navbar_div" style={{backgroundColor:"black"}}>
          <Navbar namedata="regions" regions={regions}/></div>
        <div className="article_div">
        <h1 className="article_title">{article.title}</h1>
        <div className="author">{t("By")} <span>{article.author}</span></div>
        <div className="published_at">{t("Posted on")} {new Date(article.published_at).toLocaleDateString('fr-FR', {day: 'numeric',month: 'long',year: 'numeric'})}</div>
        <div className="image_article">
            <img src={article.image} alt="image"/>
        </div>
        <div className="description">{article.description}</div>
        <div className="content" dangerouslySetInnerHTML={{ __html: article.content || '' }}>
        </div>
        </div>
      </motion.div>
   )
}
export default Article


