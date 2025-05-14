import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../components/loading/loaging';
import { motion, AnimatePresence } from 'framer-motion';
import "../Regions/Regions.css";
import Notification from '../../components/Notification/Notification';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';

const Communes = () => {
  const { t, i18n } = useTranslation();
  const { province_slug } = useParams();
  const [communes, setCommunes] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewCommune, setViewCommune] = useState(null);
  const [editingCommune, setEditingCommune] = useState(null);
  const [page, setPage] = useState(1);
  const [imgLoader, setImgLoader] = useState(false);
  const [imgLink, setImgLink] = useState('');
  const [sectionImgLoaders, setSectionImgLoaders] = useState([]);
  const [sectionImgLinks, setSectionImgLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [notifications, setNotifications] = useState([]);
   const [confirmation, setConfirmation] = useState({ isOpen: false, message: '', resolve: null });
  const [errors, setErrors] = useState({
        latitude: '',
        longitude: '',
        zoom: '',
        is_published: '',
      });
  const [formData, setFormData] = useState({
    province_id: '',
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
      Total_Population: '',
      Area: '',
      Number_Communes: '',
      Provincial_Capital: '',
      image: '',
      number_faculties: '',
      number_hospitals: ''
    },
    sections: [{
      slug: '',
      order: 0,
      translation: { language_code: i18n.language, title: '', content: '', image: '' }
    }]
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProvinces();
    fetchCommunes();
  }, [i18n.language, page, province_slug, searchQuery]);

  const fetchProvinces = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.get(`http://localhost:8000/api/regions/${province_slug}/provinces`, {
        headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language }
      });
      const provincesData = response.data.data || [];
      setProvinces(provincesData);
      console.log({provincesData:provincesData})
      const currentProvince = provincesData.find(p => p.slug === province_slug);
      if (currentProvince) {
        setProvinceId(currentProvince.id);
        setFormData(prev => ({ ...prev, province_id: currentProvince.id }));
      }
    } catch (err) {
      console.error('Failed to fetch provinces:', err);
    }
  };

  const fetchCommunes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.get(`http://localhost:8000/api/provinces/${province_slug}/communes/admin`, {
        headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language },
        params: { page, lang: i18n.language, search: searchQuery }
      });
      setCommunes(response.data.data || []);
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
      sections: [...formData.sections, {
        slug: '',
        order: formData.sections.length,
        translation: { language_code: i18n.language, title: '', content: '', image: '' }
      }]
    });
    setSectionImgLinks(prev => [...prev, '']);
    setSectionImgLoaders(prev => [...prev, false]);
  };

  const removeSection = async (index) => {
    const confirmed = await showConfirmation(t('communes.confirm_remove_section'));
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
        province_id: formData.province_id,
        name: formData.name,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        zoom: formData.zoom || null,
        is_published: !!formData.is_published,
        translation: { ...formData.translation, language_code: i18n.language },
        sections: formData.sections.map(section => ({
          slug: section.slug,
          order: section.order,
          translation:{ ...section.translation, language_code: i18n.language }
        }))
      };
       console.log(payload)
      if (editingCommune) {
        await axios.put(`http://localhost:8000/api/communes/${editingCommune.name}`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language }
        });
        addNotification(t('communes.updated'), 'success');
      } else {
        await axios.post(`http://localhost:8000/api/communes`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language }
        });
         addNotification(t('communes.created'), 'success');
      }
      setIsModalOpen(false);
       setErrors({latitude:'',longitude:'',zoom:'',is_published: ''})
      setFormData({
        province_id: provinceId,
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
          Total_Population: '',
          Area: '',
          Number_Communes: '',
          Provincial_Capital: '',
          image: '',
          number_faculties: '',
          number_hospitals: ''
        },
        sections: [{
          slug: '',
          order: 0,
          translation: { language_code: i18n.language, title: '', content: '', image: '' }
        }]
      });
      setEditingCommune(null);
      setPage(1);
      fetchCommunes();
    } catch (err) {
      console.log(err)
      if (err.response?.status === 401 || err.message === 'No token found') {
        localStorage.removeItem('token');
        navigate('/login');
      } else{
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

  const handleEdit = (commune) => {
    setEditingCommune(commune);
    setFormData({
      province_id: commune.province_id || provinceId,
      name: commune.name || '',
      latitude: commune.latitude || '',
      longitude: commune.longitude || '',
      zoom: commune.zoom || '',
      is_published: commune.is_published || false,
      translation: {
        language_code: i18n.language,
        name: commune.translation?.name || '',
        title: commune.translation?.title || '',
        description: commune.translation?.description || '',
        Total_Population: commune.translation?.Total_Population || '',
        Area: commune.translation?.Area || '',
        Number_Communes: commune.translation?.Number_Communes || '',
        Provincial_Capital: commune.translation?.Provincial_Capital || '',
        image: commune.translation?.image || '',
        number_faculties: commune.translation?.number_faculties || '',
        number_hospitals: commune.translation?.number_hospitals || ''
      },
      sections: commune.sections?.length > 0 ? commune.sections.map(section => ({
        slug: section.slug,
        order: section.order,
        translation: {
          language_code: i18n.language,
          title: section.translation?.title || '',
          content: section.translation?.content || '',
          image: section.translation?.image || ''
        }
      })) : [{
        slug: '',
        order: 0,
        translation: { language_code: i18n.language, title: '', content: '', image: '' }
      }]
    });
    setImgLink(commune.translation?.image || '');
    setIsModalOpen(true);
    setSectionImgLinks(commune.sections?.length > 0 ? commune.sections.map(section => section.translation?.image || '') : ['']);
    setSectionImgLoaders(commune.sections?.length > 0 ? commune.sections.map(() => false) : [false]);
  };

  const handleView = (commune) => {
    setViewCommune(commune);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (name) => {
    const confirmed = await showConfirmation(t('communes.delete_confirm'));
            if (confirmed) {
              try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');
                await axios.delete(`http://localhost:8000/api/communes/${name}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                addNotification(t('communes.deleted'), 'success');
                setPage(1);
                fetchCommunes();
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
    setSearchQuery(e.target.value);
    setPage(1);
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
      <h2 className="title_table">{t('communes.title')}</h2>
      <div className='search-div'>
        <div className='bi-div'>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
          </svg>
        </div>
        <input
          type="text"
          className="search-bar"
          placeholder={t('communes.search_placeholder')}
          value={searchQuery}
          onChange={handleSearch}
          aria-label={t('communes.search_placeholder')}
        />
      </div>
      <button
        className="add-button"
        onClick={() => {
          setEditingCommune(null);
           setErrors({latitude:'',longitude:'',zoom:'',
        is_published: ''})
          setFormData({
            province_id: provinceId,
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
              Total_Population: '',
              Area: '',
              Number_Communes: '',
              Provincial_Capital: '',
              image: '',
              number_faculties: '',
              number_hospitals: ''
            },
            sections: [{
              slug: '',
              order: 0,
              translation: { language_code: i18n.language, title: '', content: '', image: '' }
            }]
          });
          setIsModalOpen(true);
          setImgLink('');
          setSectionImgLinks(['']);
          setSectionImgLoaders([false]);
        }}
      >
        {t('communes.add')}
      </button>
      <table className="regions-table">
        <thead>
          <tr>
            <th>{t('communes.name')}</th>
            <th>{t('communes.is_published')}</th>
            <th>{t('communes.actions')}</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {communes.map((commune) => (
              <motion.tr
                key={commune.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <td>{commune.translation?.name || commune.name}</td>
                <td style={{textAlign: "center"}}>{commune.is_published ? t('communes.published') : t('communes.unpublished')}</td>
                <td className="td-actions">
                  <button className="action-button view" onClick={() => handleView(commune)}>{t('communes.view')}</button>
                  <button className="action-button edit" onClick={() => handleEdit(commune)}>{t('communes.edit')}</button>
                  <button className="action-button delete" onClick={() => handleDelete(commune.name)}>{t('communes.delete')}</button>
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
          {t('communes.previous')}
        </button>
        <span className="pagination-info">
          {t('communes.page')} {pagination.current_page} / {pagination.last_page}
        </span>
        <button
          className="pagination-button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === pagination.last_page}
        >
          {t('communes.next')}
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
              <h3>{editingCommune ? t('communes.edit') : t('communes.add')}</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('communes.province')}
                </label>
                <select
                  value={formData.province_id}
                  onChange={(e) => handleFormChange(e, 'province_id')}
                  required
                >
                  <option value="">{t('communes.select_province')}</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.translation?.name || province.name}
                    </option>
                  ))}
                </select>
                <label>
                  {t('communes.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange(e, 'name')}
                  readOnly={editingCommune}
                  required
                />
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('communes.latitude')}
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
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('communes.longitude')}
                </label>
                <input
                  type="number"
                  value={formData.longitude}
                  onChange={(e) => handleFormChange(e, 'longitude')}
                  required
                />
                {errors.latitude && <div className="error-message">{errors.longitude}</div>}
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('communes.zoom')}
                </label>
                <input
                  type="number"
                  value={formData.zoom}
                  onChange={(e) => handleFormChange(e, 'zoom')}
                  required
                />
                {errors.latitude && <div className="error-message">{errors.zoom}</div>}
                <label>{t('communes.is_published')}</label>
                <input
                  className='checkbox'
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => handleFormChange(e, 'is_published')}
                />
                <h4>{t('communes.translation')}</h4>
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                    <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                  </svg>
                  {t('communes.name')}
                </label>
                <input
                  type="text"
                  value={formData.translation.name}
                  onChange={(e) => handleFormChange(e, 'translation.name')}
                  required
                />
                <label>{t('communes.title_commune')}</label>
                <input
                  type="text"
                  value={formData.translation.title}
                  onChange={(e) => handleFormChange(e, 'translation.title')}
                />
                <label>{t('communes.description')}</label>
                <textarea
                  value={formData.translation.description}
                  onChange={(e) => handleFormChange(e, 'translation.description')}
                />
                <label>{t('communes.image')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChangeImage}
                />
                {imgLoader && <p style={{ color: 'orange' }}>{t('communes.image_loading')}</p>}
                {imgLink && (
                  <div>
                    <img src={imgLink} alt="Uploaded Commune" style={{ maxWidth: '200px', marginTop: '10px' }} />
                  </div>
                )}
                <label>{t('communes.faculties')}</label>
                <input
                  type="text"
                  value={formData.translation.number_faculties}
                  onChange={(e) => handleFormChange(e, 'translation.number_faculties')}
                />
                <label>{t('communes.hospitals')}</label>
                <input
                  type="text"
                  value={formData.translation.number_hospitals}
                  onChange={(e) => handleFormChange(e, 'translation.number_hospitals')}
                />
                <label>{t('communes.population')}</label>
                <input
                  type="text"
                  value={formData.translation.Total_Population}
                  placeholder={t('communes.placeholder_Total_Population')}
                  onChange={(e) => handleFormChange(e, 'translation.Total_Population')}
                />
                <label>{t('communes.area')}</label>
                <input
                  type="text"
                  value={formData.translation.Area}
                  placeholder={t('communes.placeholder_Area')}
                  onChange={(e) => handleFormChange(e, 'translation.Area')}
                />
                <label>{t('communes.communes')}</label>
                <input
                  type="text"
                  value={formData.translation.Number_Communes}
                  placeholder={t('communes.placeholder_Numbrer_Communes')}
                  onChange={(e) => handleFormChange(e, 'translation.Number_Communes')}
                />
                <label>{t('communes.provincial_capital')}</label>
                <input
                  type="text"
                  value={formData.translation.Provincial_Capital}
                  placeholder={t('communes.placeholder_Provincial_Capital')}
                  onChange={(e) => handleFormChange(e, 'translation.Provincial_Capital')}
                />
                <h4>{t('communes.sections')}</h4>
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
                        <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                      </svg>
                      {t('communes.section_slug')}
                    </label>
                    <input
                      type="text"
                      value={section.slug}
                      onChange={(e) => handleFormChange(e, 'sections.slug', index)}
                      readOnly={editingCommune && index < (editingCommune.sections?.length || 0)}
                      required
                    />
                    <label>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-asterisk" viewBox="0 0 16 16">
                        <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
                      </svg>
                      {t('communes.section_order')}
                    </label>
                    <input
                      type="number"
                      value={section.order}
                      onChange={(e) => handleFormChange(e, 'sections.order', index)}
                      required
                      min="1"
                    />
                    <label>{t('communes.section_title')}</label>
                    <input
                      type="text"
                      value={section.translation.title}
                      onChange={(e) => handleFormChange(e, 'title', index, 'title')}
                    />
                    <label>{t('communes.section_content')}</label>
                    <textarea
                      value={section.translation.content}
                      onChange={(e) => handleFormChange(e, 'content', index, 'content')}
                    />
                    <label>{t('communes.section_image')}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleChangeSectionImage(e, index)}
                    />
                    {sectionImgLoaders[index] && <p style={{ color: 'orange' }}>{t('communes.image_loading')}</p>}
                    {sectionImgLinks[index] && (
                      <div>
                        <img src={sectionImgLinks[index]} alt={`Uploaded Section ${index}`} style={{ maxWidth: '200px', marginTop: '10px' }} />
                      </div>
                    )}
                    {formData.sections.length > 1 && (
                      <button type="button" className="remove-button" onClick={() => removeSection(index)}>
                        {t('communes.remove_section')}
                      </button>
                    )}
                  </motion.div>
                ))}
                <button type="button" className="add-button" onClick={addSection}>
                  {t('communes.add_section')}
                </button>

                <div className="form-buttons">
                  <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? <span className="loading-spinner"></span> : editingCommune ? t('communes.edit') : t('communes.add')}
                  </button>
                  <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
                    {t('communes.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isViewModalOpen && viewCommune && (
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-content">
              <h3>{t('communes.view')}</h3>
              <div className="view-content">
                <h4>{t('communes.details')}</h4>
                <p><strong>{t('communes.province')}:</strong> {provinces.find(p => p.id === viewCommune.province_id)?.translation?.name || viewCommune.province_name || '-'}</p>
                <p><strong>{t('communes.latitude')}:</strong> {viewCommune.latitude || '-'}</p>
                <p><strong>{t('communes.longitude')}:</strong> {viewCommune.longitude || '-'}</p>
                <p><strong>{t('communes.zoom')}:</strong> {viewCommune.zoom || '-'}</p>
                <p><strong>{t('communes.is_published')}:</strong> {viewCommune.is_published ? t('communes.published') : t('communes.unpublished')}</p>
                <h4>{t('communes.translation')}</h4>
                {viewCommune.translation ? (
                  <div>
                    <p><strong>{t('communes.language')} ({viewCommune.translation.language_code}):</strong></p>
                    <p><strong>{t('communes.name')}:</strong> {viewCommune.translation.name || '-'}</p>
                    <p><strong>{t('communes.title')}:</strong> {viewCommune.translation.title || '-'}</p>
                    <p><strong>{t('communes.description')}:</strong> {viewCommune.translation.description || '-'}</p>
                    <div className='image'>
                      <strong>{t('communes.image')}</strong>
                      {viewCommune.translation.image && (
                        <div>
                          <img src={viewCommune.translation.image} alt="Uploaded Commune" style={{ maxWidth: '200px', marginTop: '10px' }} />
                        </div>
                      )}
                    </div>
                    <p><strong>{t('communes.faculties')}:</strong> {viewCommune.translation.number_faculties || '-'}</p>
                    <p><strong>{t('communes.hospitals')}:</strong> {viewCommune.translation.number_hospitals || '-'}</p>
                    <p><strong>{t('communes.population')}:</strong> {viewCommune.translation.Total_Population || '-'}</p>
                    <p><strong>{t('communes.area')}:</strong> {viewCommune.translation.Area || '-'}</p>
                    <p><strong>{t('communes.communes')}:</strong> {viewCommune.translation.Number_Communes || '-'}</p>
                    <p><strong>{t('communes.provincial_capital')}:</strong> {viewCommune.translation.Provincial_Capital || '-'}</p>
                  </div>
                ) : (
                  <p>{t('communes.no_translations')}</p>
                )}
                <h4>{t('communes.sections')}</h4>
                {viewCommune.sections?.length > 0 ? (
                  viewCommune.sections.map((section, index) => (
                    <div key={index} className="section">
                      <p><strong>{t('communes.section_slug')}:</strong> {section.slug || '-'}</p>
                      <p><strong>{t('communes.section_order')}:</strong> {section.order || '-'}</p>
                      {section.translation ? (
                        <div>
                          <p><strong>{t('communes.language')} ({section.translation.language_code}):</strong></p>
                          <p><strong>{t('communes.section_title')}:</strong> {section.translation.title || '-'}</p>
                          <p><strong>{t('communes.section_content')}:</strong> {section.translation.content || '-'}</p>
                          {section.translation.image && (
                            <div className='image'>
                              <strong>{t('communes.section_image')}</strong>
                              <div>
                                <img src={section.translation.image} alt={`Uploaded Section ${index}`} style={{ maxWidth: '200px', marginTop: '10px' }} />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>{t('communes.no_section_translations')}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p>{t('communes.no_sections')}</p>
                )}
              </div>
              <div className="form-buttons">
                <button
                  className="cancel-button"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  {t('communes.close')}
                </button>
                <button
                  className="submit-button"
                  onClick={() => window.open(`http://localhost:3000/communes/${viewCommune.name}`, '_blank')}
                >
                  {t('communes.preview_frontend')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Communes;