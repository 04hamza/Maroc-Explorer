import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../../components/loading/loaging';
import './Regions.css';
import Notification from '../../components/Notification/Notification';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';

const Regions = () => {
  const { t, i18n } = useTranslation();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewRegion, setViewRegion] = useState(null);
  const [editingRegion, setEditingRegion] = useState(null);
  const [page, setPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgLoader, setImgLoader] = useState(false);
  const [imgLink, setImgLink] = useState('');
  const [sectionImgLoaders, setSectionImgLoaders] = useState([]);
  const [sectionImgLinks, setSectionImgLinks] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [confirmation, setConfirmation] = useState({ isOpen: false, message: '', resolve: null });
  const [errors, setErrors] = useState({
    latitude: '',
    longitude: '',
    zoom: '',
    is_published: '',
   'translations.0.language_code': '',
    'translations.0.name': '',
    'translations.0.description': '',
    'translations.0.image': '',
    'translations.0.Total_Population': '',
    'translations.0.Area': '',
    'translations.0.Number_Provinces': '',
    'translations.0.Numbrer_Communes': '',
    'translations.0.Urbanization_Rate': '',
    sections: [],
  });
  const [formData, setFormData] = useState({
    slug: '',
    latitude: '',
    longitude: '',
    zoom: '',
    is_published: false,
    translation: {
      language_code: i18n.language,
      name: '',
      description: '',
      image: '',
      Total_Population: '',
      Area: '',
      Number_Provinces: '',
      Numbrer_Communes: '',
      Urbanization_Rate: '',
    },
    sections: [{
      slug: '',
      order: 0,
      translation: { language_code: i18n.language, title: '', content: '', image: '' },
    }],
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegions();
  }, [i18n.language, page,searchQuery]);

  const fetchRegions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.get('http://localhost:8000/api/regions', {
        headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language },
        params: { page, search: searchQuery },
      });
      setRegions(response.data.data);
      console.log(response.data.data)
      setPagination({
        current_page: response.data.meta.current_page,
        last_page: response.data.meta.last_page,
      });
    } catch (err) {
      if (err.response?.status === 401 || err.message === 'No token found') {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(t('dashboard.error'));
      }
    } finally {
      setLoading(false);
    }
  };

// Add a notification
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  // Remove a notification
  const removeNotification = (id) => {
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 700);
  };
  

const showConfirmation = (message) => {
return new Promise((resolve) => {
setConfirmation({ isOpen: true, message, resolve });
});
};
const handleConfirm = () => {
confirmation.resolve(true);
setConfirmation({ isOpen: false, message: '', resolve: null });
};
const handleCancel = () => {
confirmation.resolve(false);
setConfirmation({ isOpen: false, message: '', resolve: null });
};

  const handleFormChange = (e, field, sectionIndex, sectionField) => {
    const newFormData = { ...formData };
    console.log(newFormData)
    if (sectionField) {
      newFormData.sections[sectionIndex].translation[sectionField] = e.target.value;
    } else if (field.includes('.') && sectionIndex !== undefined) {
      const [parent, child] = field.split('.');
      newFormData.sections[sectionIndex][child] = e.target.value;
    } else if (field.startsWith('translation.')) {
      newFormData.translation[field.split('.')[1]] = e.target.value;
    } else {
      newFormData[field] = field === 'is_published' ? e.target.checked : e.target.value;
    }
    setFormData(newFormData);
  };

  const handleChangeImage = (evt) => {
    setImgLoader(true);
    const file = evt.target.files[0];
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "first_time");
    data.append("cloud_name", "drv1e5g4u");
  
    axios
      .post("https://api.cloudinary.com/v1_1/drv1e5g4u/image/upload", data)
      .then((res) => {
        const imageUrl = res.data.secure_url;
        setImgLink(imageUrl);
        setFormData({
          ...formData,
          translation: { ...formData.translation, image: imageUrl },
        });
        setImgLoader(false);
      })
      .catch((err) => {
        console.error('Image upload failed:', err);
        setImgLoader(false);
        addNotification(t('dashboard.error'), 'error');
      });
  };
  const handleChangeSectionImage = (evt, sectionIndex) => {
    setSectionImgLoaders(prev => {
      const newLoaders = [...prev];
      newLoaders[sectionIndex] = true;
      return newLoaders;
    });
    const file = evt.target.files[0];
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "first_time");
    data.append("cloud_name", "drv1e5g4u");
  
    axios
      .post("https://api.cloudinary.com/v1_1/drv1e5g4u/image/upload", data)
      .then((res) => {
        const imageUrl = res.data.secure_url;
        setSectionImgLinks(prev => {
          const newLinks = [...prev];
          newLinks[sectionIndex] = imageUrl;
          return newLinks;
        });
        setFormData({
          ...formData,
          sections: formData.sections.map((section, idx) =>
            idx === sectionIndex
              ? { ...section, translation: { ...section.translation, image: imageUrl } }
              : section
          ),
        });
        setSectionImgLoaders(prev => {
          const newLoaders = [...prev];
          newLoaders[sectionIndex] = false;
          return newLoaders;
        });
      })
      .catch((err) => {
        console.error('Section image upload failed:', err);
        setSectionImgLoaders(prev => {
          const newLoaders = [...prev];
          newLoaders[sectionIndex] = false;
          return newLoaders;
        });
        addNotification(t('dashboard.error'), 'error');
      });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { slug: '', order: formData.sections.length, translation: { language_code: i18n.language, title: '', content: '', image: '' } }],
    });
    setSectionImgLinks(prev => [...prev, '']);
    setSectionImgLoaders(prev => [...prev, false]);
  };

  const removeSection = async (index) => {
    const confirmed = await showConfirmation(t('regions.confirm_remove_section'));
    if (confirmed) {
      setFormData({
        ...formData,
        sections: formData.sections.filter((_, i) => i !== index)
      });
      setSectionImgLinks(prev => prev.filter((_, i) => i !== index));
      setSectionImgLoaders(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const payload = {
        slug: formData.slug,
        latitude: formData.latitude,
        longitude: formData.longitude,
        zoom: formData.zoom,
        is_published: !!formData.is_published, 
        translations: [{ ...formData.translation, language_code: i18n.language }],
        sections: formData.sections.map(section => ({
          slug: section.slug,
          order: section.order,
          translations: [{ ...section.translation, language_code: i18n.language }],
        })),
      };

      if (editingRegion) {
        await axios.put(`http://localhost:8000/api/regions/${editingRegion.slug}`, payload, {
          headers: { Authorization: `Bearer ${token}` , 'Accept-Language': i18n.language },
        });
        addNotification(t('regions.updated'), 'success');
      } else {
        await axios.post('http://localhost:8000/api/regions', payload, {
          headers: { Authorization: `Bearer ${token}` ,'Accept-Language': i18n.language },
        });
        addNotification(t('regions.created'), 'success');
      }
      setIsModalOpen(false);
      setErrors({latitude:'',longitude:'',zoom:'',
        is_published: '',
    'translations.0.language_code': '',
    'translations.0.name': '',
    'translations.0.description': '',
    'translations.0.image': '',
    'translations.0.Total_Population': '',
    'translations.0.Area': '',
    'translations.0.Number_Provinces': '',
    'translations.0.Numbrer_Communes': '',
    'translations.0.Urbanization_Rate': '',
    sections: [], 
      })
      setFormData({
        slug: '',
        latitude: '',
        longitude: '',
        zoom: '',
        is_published: false,
        translation: {
          language_code: i18n.language,
          name: '',
          description: '',
          image: '',
          Total_Population: '',
          Area: '',
          Number_Provinces: '',
          Numbrer_Communes: '',
          Urbanization_Rate: '',
        },
        sections: [{
          slug: '',
          order: 0,
          translation: { language_code: i18n.language, title: '', content: '', image: '' },
        }],
      });
      setEditingRegion(null);
      setPage(1);
      fetchRegions();
    } catch (err) {
      if (err.response?.status === 401 || err.message === 'No token found') {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        addNotification(t('dashboard.error'), 'error');
        const newErrors = { ...errors };
        if(err.response.data && err.response.data.errors) {
            Object.keys(err.response.data.errors).forEach((field) => {
              newErrors[field] = err.response.data.errors[field][0];
          });
        }
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
      setImgLink('');
      setSectionImgLinks(['']);
      setSectionImgLoaders([false]);
    }
  };

  const handleEdit = (region) => {
    setEditingRegion(region);
    setErrors({latitude:'',longitude:'',zoom:'',
        is_published: '',
    'translations.0.language_code': '',
    'translations.0.name': '',
    'translations.0.description': '',
    'translations.0.image': '',
    'translations.0.Total_Population': '',
    'translations.0.Area': '',
    'translations.0.Number_Provinces': '',
    'translations.0.Numbrer_Communes': '',
    'translations.0.Urbanization_Rate': '',
    sections: [], 
      })
    setFormData({
      slug: region.slug,
      latitude: region.latitude || '',
      longitude: region.longitude || '',
      zoom: region.zoom || '',
      is_published: region.is_published || false, 
      translation: {
        language_code: i18n.language,
        name: region.name || '',
        description: region.description || '',
        image: region.image || '',
        Total_Population: region.Total_Population || '',
        Area: region.Area || '',
        Number_Provinces: region.Number_Provinces || '',
        Numbrer_Communes: region.Numbrer_Communes || '',
        Urbanization_Rate: region.Urbanization_Rate || '',
      },
      sections: region.sections?.length > 0 ? region.sections.map(section => ({
        slug: section.slug,
        order: section.order,
        translation: {
          language_code: i18n.language,
          title: section.title || '',
          content: section.content || '',
          image: section.image || '',
        },
      })) : [{ slug: '', order: 0, translation: { language_code: i18n.language, title: '', content: '', image: '' } }],
    });
    setImgLink(region.image || '');
    setIsModalOpen(true);
    setSectionImgLinks(region.sections?.length > 0 ? region.sections.map(section => section.image || '') : ['']);
    setSectionImgLoaders(region.sections?.length > 0 ? region.sections.map(() => false) : [false]);
  };

  const handleView = (region) => {
    setViewRegion(region);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (slug) => {
    const confirmed = await showConfirmation(t('regions.delete_confirm'));
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        await axios.delete(`http://localhost:8000/api/regions/${slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addNotification(t('regions.deleted'), 'success');
        setPage(1);
        fetchRegions();
      } catch (err) {
        if (err.response?.status === 401 || err.message === 'No token found') {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          addNotification(t('dashboard.error'), 'error');
        }
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPage(newPage);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value); // Update search query
    setPage(1); // Reset to first page
  };
  
  

  if (loading) return <Loading/>;
  if (error) return <div className="error">{error}</div>;

  return (
    <motion.div
      className="regions-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      dir={t('dashboard.direction')}
    >
      {/* Render Notifications */}
      {notifications.map(notif => (
        <Notification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          onClose={() => removeNotification(notif.id)}
        />
          ))} 
        <ConfirmationModal
        isOpen={confirmation.isOpen}
        message={confirmation.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <h2 className="title_table">{t('regions.title')}</h2>
      <div className='search-div'>
      <div className='bi-div'>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
      </svg>
      </div>
      <input
          type="text"
          className="search-bar"
          placeholder={t('regions.search_placeholder')}
          value={searchQuery}
          onChange={handleSearch}
          aria-label={t('regions.search_placeholder')}
        />
      </div>
      <button
        className="add-button"
        onClick={() => {
          setEditingRegion(null);
          setErrors({latitude:'',longitude:'',zoom:'',
        is_published: '',
    'translations.0.language_code': '',
    'translations.0.name': '',
    'translations.0.description': '',
    'translations.0.image': '',
    'translations.0.Total_Population': '',
    'translations.0.Area': '',
    'translations.0.Number_Provinces': '',
    'translations.0.Numbrer_Communes': '',
    'translations.0.Urbanization_Rate': '',
    sections: [], 
      })
          setFormData({
            slug: '',
            latitude: '',
            longitude: '',
            zoom: '',
            is_published: false,
            translation: {
              language_code: i18n.language,
              name: '',
              description: '',
              image: '',
              Total_Population: '',
              Area: '',
              Number_Provinces: '',
              Numbrer_Communes: '',
              Urbanization_Rate: '',
            },
            sections: [{
              slug: '',
              order: 0,
              translation: { language_code: i18n.language, title: '', content: '', image: '' },
            }],
          });
          setIsModalOpen(true);
          setImgLink('');
          setSectionImgLinks(['']);
          setSectionImgLoaders([false]);
        }}
      >
        {t('regions.add')}
      </button>
      <table className="regions-table">
        <thead>
          <tr>
            <th>{t('regions.name')}</th>
            <th>{t('regions.slug')}</th>
            <th>{t('regions.is_published')}</th>
            <th>{t('regions.actions')}</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {regions.map((region) => (
              <motion.tr
                key={region.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <td>{region.name}</td>
                <td>{region.slug}</td>
                <td style={{textAlign:"center"}}>{region.is_published ? t('regions.published') : t('regions.unpublished')}</td>
                <td className="td-actions">
                  <button className="action-button view" onClick={() => handleView(region)}>{t('regions.view')}</button>
                  <button className="action-button edit" onClick={() => handleEdit(region)}>{t('regions.edit')}</button>
                  <button className="action-button delete" onClick={() => handleDelete(region.slug)}>{t('regions.delete')}</button>
                  <button
                    className="action-button provinces"
                    onClick={() => navigate(`/provinces/${region.slug}`)}
                  >
                    {t('nav.provinces')}
                  </button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>

      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          {t('regions.previous')}
        </button>
        <span className="pagination-info">
          {t('regions.page')} {pagination.current_page} / {pagination.last_page}
        </span>
        <button
          className="pagination-button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === pagination.last_page}
        >
          {t('regions.next')}
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-content">
              <h3>{editingRegion ? t('regions.edit') : t('regions.add')}</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-asterisk" viewBox="0 0 16 16">
                  <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>{t('regions.slug')}
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleFormChange(e, 'slug')}
                  required
                  readOnly={editingRegion}
                />
                <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-asterisk" viewBox="0 0 16 16">
                  <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>{t('regions.latitude')}</label>
                <input
                  type="number"
                  value={formData.latitude}
                  onChange={(e) => handleFormChange(e, 'latitude')}
                  required
                />
                {errors.latitude && <div className="error-message">{errors.latitude}</div>}
                <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-asterisk" viewBox="0 0 16 16">
                  <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>{t('regions.longitude')}</label>
                <input
                  type="number"
                  value={formData.longitude}
                  onChange={(e) => handleFormChange(e, 'longitude')}
                  required
                />
                {errors.longitude && <div className="error-message">{errors.longitude}</div>}
                <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-asterisk" viewBox="0 0 16 16">
                  <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>{t('regions.zoom')}</label>
                <input
                  type="number"
                  value={formData.zoom}
                  onChange={(e) => handleFormChange(e, 'zoom')}          
                  required
                />
                 {errors.zoom && <div className="error-message">{errors.zoom}</div>}
                <label>{t('regions.is_published')}</label>
                <input
                  className='checkbox'
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => handleFormChange(e, 'is_published')}
                />
                {errors.is_published && <div className="error-message">{errors.is_published}</div>}
                <h4>{t('regions.translation')}</h4>
                <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-asterisk" viewBox="0 0 16 16">
                  <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>{t('regions.name')}</label>
                <input
                  type="text"
                  value={formData.translation.name}
                  onChange={(e) => handleFormChange(e, 'translation.name')}
                  required
                />
                <label>{t('regions.description')}</label>
                <textarea
                  value={formData.translation.description}
                  onChange={(e) => handleFormChange(e, 'translation.description')}
                />
                <label>{t('regions.image')}</label>
                <input
                 type="file"
                 accept="image/*"
                 onChange={handleChangeImage}
                />
                {imgLoader && <p style={{ color: 'orange' }}>{t('regions.image_loading')}</p>}
               {imgLink && (
                <div>
                <img src={imgLink} alt="Uploaded Region" style={{ maxWidth: '200px', marginTop: '10px' }} />
               </div>
                )}
                <label>{t('regions.population')}</label>
                <input
                  type="text"
                  value={formData.translation.Total_Population}
                  placeholder={t('regions.placeholder_Total_Population')}
                  onChange={(e) => handleFormChange(e, 'translation.Total_Population')}
                />
                <label>{t('regions.area')}</label>
                <input
                  type="text"
                  value={formData.translation.Area}
                  placeholder={t('regions.placeholder_Area')}
                  onChange={(e) => handleFormChange(e, 'translation.Area')}
                />
                <label>{t('regions.provinces')}</label>
                <input
                  type="text"
                  value={formData.translation.Number_Provinces}
                  placeholder={t('regions.placeholder_Number_Provinces')}
                  onChange={(e) => handleFormChange(e, 'translation.Number_Provinces')}
                />
                <label>{t('regions.communes')}</label>
                <input
                  type="text"
                  value={formData.translation.Numbrer_Communes}
                  placeholder={t('regions.placeholder_Numbrer_Communes')}
                  onChange={(e) => handleFormChange(e, 'translation.Numbrer_Communes')}
                />
                <label>{t('regions.urbanization')}</label>
                <input
                  type="text"
                  value={formData.translation.Urbanization_Rate}
                  placeholder={t('regions.placeholder_Urbanization_Rate')}
                  onChange={(e) => handleFormChange(e, 'translation.Urbanization_Rate')}
                />

                <h4>{t('regions.sections')}</h4>
                {formData.sections.map((section, index) => (
                  <motion.div
                    key={index}
                    className="section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-asterisk" viewBox="0 0 16 16">
                  <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>{t('regions.section_slug')}</label>
                    <input
                      type="text"
                      value={section.slug}
                      readOnly={editingRegion && index < (editingRegion.sections?.length || 0)}
                      onChange={(e) => handleFormChange(e, 'sections.slug', index)}
                      required
                    />
                    <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-asterisk" viewBox="0 0 16 16">
                  <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>{t('regions.section_order')}</label>
                    <input
                      type="number"
                      value={section.order}
                      min="1"
                      onChange={(e) => handleFormChange(e, 'sections.order', index)}
                      required
                    />
                    <label>{t('regions.section_title')}</label>
                    <input
                      type="text"
                      value={section.translation.title}
                      onChange={(e) => handleFormChange(e, 'title', index, 'title')}
                    />
                    <label>{t('regions.section_content')}</label>
                    <textarea
                      value={section.translation.content}
                      onChange={(e) => handleFormChange(e, 'content', index, 'content')}
                    />
                    <label>{t('regions.section_image')}</label>
                    <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => handleChangeSectionImage(e, index)}
                    />
                    {sectionImgLoaders[index] && <p style={{ color: 'orange' }}>{t('regions.image_loading')}</p>}
                    {sectionImgLinks[index] && (
                    <div>
                    <img src={sectionImgLinks[index]} alt={`Uploaded Section ${index}`} style={{ maxWidth: '200px', marginTop: '10px' }} />
                    </div>
                    )}
                    {formData.sections.length > 1 && (
                      <button type="button" className="remove-button" onClick={() => removeSection(index)}>
                        {t('regions.remove_section')}
                      </button>
                    )}
                  </motion.div>
                ))}
                <button type="button" className="add-button" onClick={addSection}>
                  {t('regions.add_section')}
                </button>

                <div className="form-buttons">
                  <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? <span className="loading-spinner"></span> : editingRegion ? t('regions.edit') : t('regions.add')}
                  </button>
                  <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
                    {t('regions.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isViewModalOpen && viewRegion && (
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-content">
              <h3>{t('regions.view')}</h3>
              <div className="view-content">
                <h4>{t('regions.details')}</h4>
                <p><strong>{t('regions.slug')}:</strong> {viewRegion.slug}</p>
                <p><strong>{t('regions.latitude')}:</strong> {viewRegion.latitude}</p>
                <p><strong>{t('regions.longitude')}:</strong> {viewRegion.longitude}</p>
                <p><strong>{t('regions.zoom')}:</strong> {viewRegion.zoom}</p>
                <p><strong>{t('regions.is_published')}:</strong> {viewRegion.is_published ? t('regions.published') : t('regions.unpublished')}</p>
                <h4>{t('regions.translation')}</h4>
                <p><strong>{t('regions.name')}:</strong> {viewRegion.name || '-'}</p>
                <p><strong>{t('regions.description')}:</strong> {viewRegion.description || '-'}</p>
                <div>
                      <strong>{t('regions.image')}</strong>
                      {viewRegion.image && (
                      <div>
                      <img src={viewRegion.image} alt="Uploaded Commune" style={{ maxWidth: '200px', marginTop: '10px' }} />
                      </div>
                      )}
                </div>
                <p><strong>{t('regions.population')}:</strong> {viewRegion.Total_Population || '-'}</p>
                <p><strong>{t('regions.area')}:</strong> {viewRegion.Area || '-'}</p>
                <p><strong>{t('regions.provinces')}:</strong> {viewRegion.Number_Provinces || '-'}</p>
                <p><strong>{t('regions.communes')}:</strong> {viewRegion.Numbrer_Communes || '-'}</p>
                <p><strong>{t('regions.urbanization')}:</strong> {viewRegion.Urbanization_Rate || '-'}</p>
                <h4>{t('regions.sections')}</h4>
                {viewRegion.sections?.length > 0 ? (
                  viewRegion.sections.map((section, index) => (
                    <div key={index} className="section">
                      <p><strong>{t('regions.section_slug')}:</strong> {section.slug}</p>
                      <p><strong>{t('regions.section_order')}:</strong> {section.order}</p>
                      <p><strong>{t('regions.section_title')}:</strong> {section.title || '-'}</p>
                      <p><strong>{t('regions.section_content')}:</strong> {section.content || '-'}</p>
                      <div>
                      <strong>{t('regions.image')}</strong>
                      {section.image && (
                      <div>
                      <img src={section.image} alt="Uploaded Commune" style={{ maxWidth: '200px', marginTop: '10px' }} />
                      </div>
                      )}
                </div>
                    </div>
                  ))
                ) : (
                  <p>{t('regions.no_sections')}</p>
                )}
              </div>
              <div className="form-buttons">
                <button
                  className="cancel-button"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  {t('regions.close')}
                </button>
                <button
                  className="submit-button"
                  onClick={() => window.open(`http://localhost:3000/region/${viewRegion.slug}`, '_blank')}
                >
                  {t('regions.preview_frontend')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Regions;