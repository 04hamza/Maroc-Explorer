import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../components/loading/loaging';
import { motion, AnimatePresence } from 'framer-motion';
import "../Regions/Regions.css";
import Notification from '../../components/Notification/Notification';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';

const Provinces = () => {
  const { t, i18n } = useTranslation();
  const { region_slug } = useParams();
  const [provinces, setProvinces] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProvince, setViewProvince] = useState(null);
  const [editingProvince, setEditingProvince] = useState(null);
  const [page, setPage] = useState(1);
  const [imgLoader, setImgLoader] = useState(false);
  const [imgLink, setImgLink] = useState('');
  const [sectionImgLoaders, setSectionImgLoaders] = useState([]);
  const [sectionImgLinks, setSectionImgLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [searchQuery, setSearchQuery] = useState(''); // New state for search
  const [notifications, setNotifications] = useState([]);
  const [confirmation, setConfirmation] = useState({ isOpen: false, message: '', resolve: null });
  const [errors, setErrors] = useState({
      latitude: '',
      longitude: '',
      zoom: '',
      is_published: '',
    });
  const [formData, setFormData] = useState({
    region_id: '',
    name: '',
    latitude: '',
    longitude: '',
    zoom: '',
    is_published: false, 
    translation: {
      language_code: i18n.language,
      name: '',
      title: '',
      description: '',
      image: '',
      Total_Population: '',
      Area: '',
      Numbrer_Communes: '',
      Provincial_Capital: '',
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
    fetchProvinces();
  }, [i18n.language, page, region_slug,searchQuery]);

  const fetchRegions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.get('http://localhost:8000/api/regions/Client', {
        headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language },
      });
      setRegions(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch regions:', err);
    }
  };

  const fetchProvinces = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.get(`http://localhost:8000/api/regions/${region_slug}/provinces/admin`, {
        headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language },
        params: { page, lang: i18n.language,search: searchQuery },
      });
      const provincesData = response.data.data || [];
      setProvinces(provincesData);
      setPagination({
        current_page: page,
        last_page: provincesData.length > 0 ? page : 1,
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
    if (sectionField) {
      newFormData.sections[sectionIndex].translation[sectionField] = e.target.value;
    } else if (field.includes('.') && sectionIndex !== undefined) {
      const [parent, child] = field.split('.');
      newFormData.sections[sectionIndex][child] = e.target.value;
    } else if (field.startsWith('translation.')) {
      newFormData.translation[field.split('.')[1]] = e.target.value;
    }  else {
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
      sections: [...formData.sections, { slug: '', order: 0, translation: { language_code: i18n.language, title: '', content: '', image: '' } }],
    });
    setSectionImgLinks(prev => [...prev, '']);
    setSectionImgLoaders(prev => [...prev, false]);
  };

  const removeSection = async(index) => {
    const confirmed = await showConfirmation(t('provinces.confirm_remove_section'));
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
        region_id: formData.region_id,
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        zoom: formData.zoom,
        is_published: !!formData.is_published, 
        translation: { ...formData.translation, language_code: i18n.language },
        sections: formData.sections.map(section => ({
          slug: section.slug,
          order: section.order,
          translation: { ...section.translation, language_code: i18n.language },
        })),
      };
      if (editingProvince) {
        await axios.put(`http://localhost:8000/api/provinces/${editingProvince.name}`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language },
        });
        addNotification(t('provinces.updated'), 'success');
      } else {
        await axios.post(`http://localhost:8000/api/provinces`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language },
        });
        addNotification(t('provinces.created'), 'success');
      }
      setIsModalOpen(false);
      setErrors({latitude:'',longitude:'',zoom:'',is_published: ''
      })
      setFormData({
        region_id: '',
        name: '',
        latitude: '',
        longitude: '',
        zoom: '',
        is_published: !!formData.is_published, 
        translation: {
          language_code: i18n.language,
          name: '',
          title: '',
          description: '',
          image: '',
          Total_Population: '',
          Area: '',
          Numbrer_Communes: '',
          Provincial_Capital: '',
        },
        sections: [{
          slug: '',
          order: 0,
          translation: { language_code: i18n.language, title: '', content: '', image: '' },
        }],
      });
      setEditingProvince(null);
      setPage(1);
      fetchProvinces();
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

  const handleEdit = (province) => {
    setEditingProvince(province);
    setErrors({latitude:'',longitude:'',zoom:'',
        is_published: ''
      })
    setFormData({
      region_id: province.region_id || '',
      name: province.name || '',
      latitude: province.latitude || '',
      longitude: province.longitude || '',
      zoom: province.zoom || '',
      is_published: province.is_published  || false,
      translation: {
        language_code: i18n.language,
        name: province.translation.name || '',
        title: province.translation.title || '',
        description: province.translation.description || '',
        image: province.translation.image || '',
        Total_Population: province.translation.Total_Population || '',
        Area: province.translation.Area || '',
        Numbrer_Communes: province.translation.Numbrer_Communes || '',
        Provincial_Capital: province.translation.Provincial_Capital || '',
      },
      sections: province.sections?.length > 0 ? province.sections.map(section => {
        return {
          slug: section.slug,
          order: section.order,
          translation: {
            language_code: i18n.language,
            title: section.translation.title || '',
            content: section.translation.content || '',
            image:section.translation.image || '',
          },
        };
      }) : [{ slug: '', order: 0, translation: { language_code: i18n.language, title: '', content: '', image: '' } }],
    });
    setIsModalOpen(true);
    setImgLink(province.translation.image || '');
    setIsModalOpen(true);
    setSectionImgLinks(province.sections?.length > 0 ? province.sections.map(section => section.translation.image || '') : ['']);
    setSectionImgLoaders(province.sections?.length > 0 ? province.sections.map(() => false) : [false]);
  };

  const handleView = (province) => {
    setViewProvince(province);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (name) => {
    const confirmed = await showConfirmation(t('provinces.delete_confirm'));
        if (confirmed) {
          try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            await axios.delete(`http://localhost:8000/api/provinces/${name}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            addNotification(t('provinces.deleted'), 'success');
            setPage(1);
            fetchProvinces();
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

  if (loading) return <Loading />;
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
      <h2 className="title_table">{t('provinces.title')}</h2>
      <div className='search-div'>
      <div className='bi-div'>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
      </svg>
      </div>
      <input
          type="text"
          className="search-bar"
          placeholder={t('provinces.search_placeholder')}
          value={searchQuery}
          onChange={handleSearch}
          aria-label={t('provinces.search_placeholder')}
        />
      </div>
      <button
        className="add-button"
        onClick={() => {
          setEditingProvince(null);
          setErrors({latitude:'',longitude:'',zoom:'',
        is_published: ''
      })
          setFormData({
            region_id: '',
            name: '',
            latitude: '',
            longitude: '',
            zoom: '',
            is_published: false,
            translation: {
              language_code: i18n.language,
              name: '',
              title: '',
              description: '',
              image: '',
              Total_Population: '',
              Area: '',
              Numbrer_Communes: '',
              Provincial_Capital: '',
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
        {t('provinces.add')}
      </button>
      <table className="regions-table">
        <thead>
          <tr>
            <th>{t('provinces.name')}</th>
            <th>{t('regions.is_published')}</th>
            <th>{t('provinces.actions')}</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {provinces.map((province) => (
              <motion.tr
                key={province.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <td>{province.translation?.name || province.name}</td>
                <td style={{textAlign:"center"}}>{province.is_published ? t('regions.published') : t('regions.unpublished')}</td>
                <td className="td-actions">
                  <button className="action-button view" onClick={() => handleView(province)}>{t('provinces.view')}</button>
                  <button className="action-button edit" onClick={() => handleEdit(province)}>{t('provinces.edit')}</button>
                  <button className="action-button delete" onClick={() => handleDelete(province.name)}>{t('provinces.delete')}</button>
                  <button
                    className="action-button provinces"
                    onClick={() => navigate(`/communes/${province.name}`)}
                  >
                    {t('nav.communes')}
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
          {t('provinces.previous')}
        </button>
        <span className="pagination-info">
          {t('provinces.page')} {pagination.current_page} / {pagination.last_page}
        </span>
        <button
          className="pagination-button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === pagination.last_page}
        >
          {t('provinces.next')}
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
              <h3>{editingProvince ? t('provinces.edit') : t('provinces.add')}</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('provinces.region')}
                </label>
                <select
                  value={formData.region_id}
                  onChange={(e) => handleFormChange(e, 'region_id')}
                  required
                >
                  <option value="">{t('provinces.select_region')}</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 1 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('provinces.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  readOnly={editingProvince}
                  onChange={(e) => handleFormChange(e, 'name')}
                  required
                />
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('provinces.latitude')}
                </label>
                <input
                  type="number"
                  value={formData.latitude}
                  onChange={(e) => handleFormChange(e, 'latitude')}
                  required
                />
                {errors.latitude && <div className="error-message">{errors.latitude}</div>}
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('provinces.longitude')}
                </label>
                <input
                  type="number"
                  value={formData.longitude}
                  onChange={(e) => handleFormChange(e, 'longitude')}
                  required
                />
                {errors.longitude && <div className="error-message">{errors.longitude}</div>}
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('provinces.zoom')}
                </label>
                <input
                  type="number"
                  value={formData.zoom}
                  onChange={(e) => handleFormChange(e, 'zoom')}
                  required
                  min="0"
                />
                {errors.zoom && <div className="error-message">{errors.zoom}</div>}
                <label>{t('regions.is_published')}</label>
                <input
                  className='checkbox'
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => handleFormChange(e, 'is_published')}
                />
                <h4>{t('provinces.translation')}</h4>
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('provinces.name')}
                </label>
                <input
                  type="text"
                  value={formData.translation.name}
                  onChange={(e) => handleFormChange(e, 'translation.name')}
                  required
                />
                <label>{t('provinces.title')}</label>
                <input
                  type="text"
                  value={formData.translation.title}
                  onChange={(e) => handleFormChange(e, 'translation.title')}
                />
                <label>{t('provinces.description')}</label>
                <textarea
                  value={formData.translation.description}
                  onChange={(e) => handleFormChange(e, 'translation.description')}
                />
                <label>{t('provinces.image')}</label>
                <input
                 type="file"
                 accept="image/*"
                 onChange={handleChangeImage}
                />
                {imgLoader && <p style={{ color: 'orange' }}>{t('regions.image_loading')}</p>}
               {imgLink && (
                <div>
                <img src={imgLink} alt="Uploaded Province" style={{ maxWidth: '200px', marginTop: '10px' }} />
               </div>
                )}
                <label>{t('provinces.population')}</label>
                <input
                  type="text"
                  value={formData.translation.Total_Population}
                  placeholder={t('provinces.placeholder_Total_Population')}
                  onChange={(e) => handleFormChange(e, 'translation.Total_Population')}
                />
                <label>{t('provinces.area')}</label>
                <input
                  type="text"
                  value={formData.translation.Area}
                  placeholder={t('provinces.placeholder_Area')}
                  onChange={(e) => handleFormChange(e, 'translation.Area')}
                />
                <label>{t('provinces.communes')}</label>
                <input
                  type="text"
                  value={formData.translation.Numbrer_Communes}
                  placeholder={t('provinces.placeholder_Numbrer_Communes')}
                  onChange={(e) => handleFormChange(e, 'translation.Numbrer_Communes')}
                />
                <label>{t('provinces.provincial_capital')}</label>
                <input
                  type="text"
                  value={formData.translation.Provincial_Capital}
                  placeholder={t('provinces.placeholder_Provincial_Capital')}
                  onChange={(e) => handleFormChange(e, 'translation.Provincial_Capital')}
                />

                <h4>{t('provinces.sections')}</h4>
                {formData.sections.map((section, index) => (
                  <motion.div
                    key={index}
                    className="section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                        <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                      </svg>
                      {t('provinces.section_slug')}
                    </label>
                    <input
                      type="text"
                      value={section.slug}
                      readOnly={editingProvince && index < (editingProvince.sections?.length || 0)}
                      onChange={(e) => handleFormChange(e, 'sections.slug', index)}
                      required
                    />
                    <label>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                        <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                      </svg>
                      {t('provinces.section_order')}
                    </label>
                    <input
                      type="number"
                      value={section.order}
                      min="1"
                      onChange={(e) => handleFormChange(e, 'sections.order', index)}
                      required
                    />
                    <label>{t('provinces.section_title')}</label>
                    <input
                      type="text"
                      value={section.translation.title}
                      onChange={(e) => handleFormChange(e, 'title', index, 'title')}
                    />
                    <label>{t('provinces.section_content')}</label>
                    <textarea
                      value={section.translation.content}
                      onChange={(e) => handleFormChange(e, 'content', index, 'content')}
                    />
                    <label>{t('provinces.section_image')}</label>
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
                        {t('provinces.remove_section')}
                      </button>
                    )}
                  </motion.div>
                ))}
                <button type="button" className="add-button" onClick={addSection}>
                  {t('provinces.add_section')}
                </button>

                <div className="form-buttons">
                  <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? <span className="loading-spinner"></span> : editingProvince ? t('provinces.edit') : t('provinces.add')}
                  </button>
                  <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
                    {t('provinces.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isViewModalOpen && viewProvince && (
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-content">
              <h3>{t('provinces.view')}</h3>
              <div className="view-content">
                <h4>{t('provinces.details')}</h4>
                <p><strong>{t('provinces.region')}:</strong> {regions.find(r => r.id === viewProvince.region_id)?.name || '-'}</p>
                <p><strong>{t('provinces.name')}:</strong> {viewProvince.name}</p>
                <p><strong>{t('provinces.latitude')}:</strong> {viewProvince.latitude}</p>
                <p><strong>{t('provinces.longitude')}:</strong> {viewProvince.longitude}</p>
                <p><strong>{t('provinces.zoom')}:</strong> {viewProvince.zoom}</p>
                <p><strong>{t('regions.is_published')}:</strong> {viewProvince.is_published ? t('regions.published') : t('regions.unpublished')}</p>
                <h4>{t('provinces.translation')}</h4>
                {viewProvince.translation ? (
                    <div>
                      <p><strong>{t('provinces.language')} ({viewProvince.translation.language_code}):</strong></p>
                      <p><strong>{t('provinces.name')}:</strong> {viewProvince.translation.name || '-'}</p>
                      <p><strong>{t('provinces.title')}:</strong> {viewProvince.translation.title || '-'}</p>
                      <p><strong>{t('provinces.description')}:</strong> {viewProvince.translation.description || '-'}</p>
                      <div>
                       <strong>{t('provinces.image')}</strong>
                      {viewProvince.translation.image && (
                      <div>
                      <img src={viewProvince.translation.image} alt="Uploaded Commune" style={{ maxWidth: '200px', marginTop: '10px' }} />
                      </div>
                      )}
                      </div>
                      <p><strong>{t('provinces.population')}:</strong> {viewProvince.translation.Total_Population || '-'}</p>
                      <p><strong>{t('provinces.area')}:</strong> {viewProvince.translation.Area || '-'}</p>
                      <p><strong>{t('provinces.communes')}:</strong> {viewProvince.translation.Numbrer_Communes || '-'}</p>
                      <p><strong>{t('provinces.provincial_capital')}:</strong> {viewProvince.translation.Provincial_Capital || '-'}</p>
                    </div>
                ) : (
                  <p>{t('provinces.no_translations')}</p>
                )}
                <h4>{t('provinces.sections')}</h4>
                {viewProvince.sections?.length > 0 ? (
                  viewProvince.sections.map((section, index) => (
                    <div key={index} className="section">
                      <p><strong>{t('provinces.section_slug')}:</strong> {section.slug}</p>
                      <p><strong>{t('provinces.section_order')}:</strong> {section.order}</p>
                      {section.translation? (
                          <div>
                            <p><strong>{t('provinces.language')} ({section.translation.language_code}):</strong></p>
                            <p><strong>{t('provinces.section_title')}:</strong> {section.translation.title || '-'}</p>
                            <p><strong>{t('provinces.section_content')}:</strong> {section.translation.content || '-'}</p>
                            {viewProvince.sections[index].translation.image && (
                            <div>
                             <p><strong>{t('provinces.section_image')}</strong></p>
                            <div>
                            <img src={viewProvince.sections[index].translation.image} alt={`Uploaded Section ${index}`} style={{ maxWidth: '200px', marginTop: '10px' }} />
                            </div>
                            </div>
                            )}
                          </div>
                      ) : (
                        <p>{t('provinces.no_section_translations')}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p>{t('provinces.no_sections')}</p>
                )}
              </div>
              <div className="form-buttons">
                <button
                  className="cancel-button"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  {t('provinces.close')}
                </button>
                <button
                  className="submit-button"
                  onClick={() => window.open(`http://localhost:3000/provinces/${viewProvince.name}`, '_blank')}
                >
                  {t('provinces.preview_frontend')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Provinces;