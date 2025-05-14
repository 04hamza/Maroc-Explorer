import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Table, Button, Modal, Alert, Card, Row, Col, Space } from 'antd';
import Loading from '../../components/loading/loaging';
import Notification from '../../components/Notification/Notification';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import './Users.css';

const Users = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [confirmation, setConfirmation] = useState({ isOpen: false, message: '', resolve: null });
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [createFormData, setCreateFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [editFormData, setEditFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    checkUserRole();
    fetchUsers();
  }, [i18n.language, searchQuery]);

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.get('http://localhost:8000/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsMainAdmin(response.data.role === 'main_admin');
    } catch (err) {
      console.error('Role check error:', err);
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.get('http://localhost:8000/api/users', {
        headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language },
        params: { search: searchQuery },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Fetch users error:', err);
      if (err.response?.status === 401 || err.message === 'No token found') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError(t('users.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 3000);
  };

  const validateCreateForm = () => {
    const errors = {};
    if (!createFormData.name) errors.name = t('users.name_required');
    if (!createFormData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email))
      errors.email = t('users.email_required');
    if (!createFormData.password || createFormData.password.length < 8)
      errors.password = t('users.password_required');
    if (!createFormData.role) errors.role = t('users.role_required');
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.name) errors.name = t('users.name_required');
    if (!editFormData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email))
      errors.email = t('users.email_required');
    if (editFormData.password && editFormData.password.length < 8)
      errors.password = t('users.password_min');
    if (!editFormData.role) errors.role = t('users.role_required');
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      await axios.post(
        'http://localhost:8000/api/users',
        createFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      addNotification(t('users.created'), 'success');
      setIsCreateModalOpen(false);
      setCreateFormData({ name: '', email: '', password: '', role: '' });
      setCreateErrors({});
      fetchUsers();
    } catch (err) {
      console.error('Create user error:', err);
      if (err.response?.status === 401 || err.message === 'No token found') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (err.response?.status === 403) {
        addNotification(t('users.unauthorized'), 'error');
      } else {
        addNotification(t('users.error'), 'error');
      }
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const data = { ...editFormData };
      if (!data.password) delete data.password; // Omit password if empty
      await axios.put(
        `http://localhost:8000/api/users/${editUserId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      addNotification(t('users.updated'), 'success');
      setIsEditModalOpen(false);
      setEditFormData({ name: '', email: '', password: '', role: '' });
      setEditErrors({});
      fetchUsers();
    } catch (err) {
      console.error('Edit user error:', err);
      if (err.response?.status === 401 || err.message === 'No token found') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (err.response?.status === 403) {
        addNotification(t('users.unauthorized'), 'error');
      } else {
        addNotification(t('users.error'), 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirmation(t('users.delete_confirm'));
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        await axios.delete(`http://localhost:8000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        addNotification(t('users.deleted'), 'success');
        fetchUsers();
      } catch (err) {
        console.error('Delete user error:', err);
        if (err.response?.status === 401 || err.message === 'No token found') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (err.response?.status === 403) {
          addNotification(t('users.unauthorized'), 'error');
        } else {
          addNotification(t('users.error'), 'error');
        }
      }
    }
  };

  const handleView = (user) => {
    setViewUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditOpen = (user) => {
    setEditUserId(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
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

  const columns = [
    {
      title: t('users.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('users.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('users.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role) => t(`users.roles.${role}`),
    },
    {
      title: t('users.created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: t('users.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <button className=" btn view" type="primary" onClick={() => handleView(record)}>
            {t('users.view')}
          </button>
          {isMainAdmin && (
            <>
              <button className="btn edit" onClick={() => handleEditOpen(record)}>
                {t('users.edit')}
              </button>
              <button className="btn delete" type="danger" onClick={() => handleDelete(record.id)}>
                {t('users.delete')}
              </button>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <Alert message={error} type="error" showIcon style={{ margin: 20 }} />;

  return (
    <div className="users-container" dir={t('dashboard.direction')}>
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          onClose={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
        />
      ))}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        message={confirmation.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <h2 className="title_table" style={{ textAlign: t('dashboard.direction') === 'rtl' ? 'right' : 'left' }}>
              {t('users.title')}
            </h2>
            <div className="search-div">
              <div className="bi-div">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-search"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </div>
              <input
                type="text"
                className="search-bar"
                placeholder={t('users.search_placeholder')}
                value={searchQuery}
                onChange={handleSearch}
                aria-label={t('users.search_placeholder')}
              />
            </div>
            {isMainAdmin && (
              <Button
                type="primary"
                className="create-user"
                onClick={() => setIsCreateModalOpen(true)}
              >
                {t('users.create')}
              </Button>
            )}
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>
      <Modal
        title={t('users.view')}
        visible={isViewModalOpen}
        className="model-content"
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <button
            key="close"
            className="modal-button"
            onClick={() => setIsViewModalOpen(false)}
          >
            {t('users.close')}
          </button>,
        ]}
      >
        {viewUser && (
          <div className="view-content">
            <p><strong>{t('users.name')}:</strong> {viewUser.name}</p>
            <p><strong>{t('users.email')}:</strong> {viewUser.email}</p>
            <p><strong>{t('users.role')}:</strong> {t(`users.roles.${viewUser.role}`)}</p>
            <p><strong>{t('users.created_at')}:</strong> {new Date(viewUser.created_at).toLocaleString()}</p>
          </div>
        )}
      </Modal>
      <Modal
        title={t('users.create')}
        style={{minWidth:"500px"}}
        visible={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setCreateFormData({ name: '', email: '', password: '', role: '' });
          setCreateErrors({});
        }}
        footer={null}
      >
        <form className="custom-form" onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="create-name">{t('users.name')}</label>
            <input
              type="text"
              id="create-name"
              value={createFormData.name}
              onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              placeholder={t('users.name_placeholder')}
            />
            {createErrors.name && <span className="error">{createErrors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="create-email">{t('users.email')}</label>
            <input
              type="email"
              id="create-email"
              value={createFormData.email}
              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              placeholder={t('users.email_placeholder')}
            />
            {createErrors.email && <span className="error">{createErrors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="create-password">{t('users.password')}</label>
            <input
              type="password"
              id="create-password"
              value={createFormData.password}
              onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              placeholder={t('users.password_placeholder')}
            />
            {createErrors.password && <span className="error">{createErrors.password}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="create-role">{t('users.role')}</label>
            <select
              id="create-role"
              value={createFormData.role}
              onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
            >
              <option value="">{t('users.role_placeholder')}</option>
              <option value="admin">{t('users.roles.admin')}</option>
              <option value="main_admin">{t('users.roles.main_admin')}</option>
            </select>
            {createErrors.role && <span className="error">{createErrors.role}</span>}
          </div>
          <div className="form-actions">
            <button type="submit" className="modal-button primary">
              {t('users.create')}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        title={t('users.edit')}
        visible={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditFormData({ name: '', email: '', password: '', role: '' });
          setEditErrors({});
        }}
        footer={null}
      >
        <form className="custom-form" onSubmit={handleEdit}>
          <div className="form-group">
            <label htmlFor="edit-name">{t('users.name')}</label>
            <input
              type="text"
              id="edit-name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              placeholder={t('users.name_placeholder')}
            />
            {editErrors.name && <span className="error">{editErrors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-email">{t('users.email')}</label>
            <input
              type="email"
              id="edit-email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              placeholder={t('users.email_placeholder')}
            />
            {editErrors.email && <span className="error">{editErrors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-password">{t('users.password')}</label>
            <input
              type="password"
              id="edit-password"
              value={editFormData.password}
              onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              placeholder={t('users.password_optional')}
            />
            {editErrors.password && <span className="error">{editErrors.password}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="edit-role">{t('users.role')}</label>
            <select
              id="edit-role"
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
            >
              <option value="">{t('users.role_placeholder')}</option>
              <option value="admin">{t('users.roles.admin')}</option>
              <option value="main_admin">{t('users.roles.main_admin')}</option>
            </select>
            {editErrors.role && <span className="error">{editErrors.role}</span>}
          </div>
          <div className="form-actions">
            <button type="submit" className="modal-button primary">
              {t('users.update')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;