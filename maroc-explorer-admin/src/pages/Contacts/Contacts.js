import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Table, Button, Modal, Alert, Input, Card, Row, Col, Space, Form } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Loading from '../../components/loading/loaging';
import Notification from '../../components/Notification/Notification';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import './Contacts.css';

const Contacts = () => {
  const { t, i18n } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [viewContact, setViewContact] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState({ isOpen: false, message: '', resolve: null });
  const [replyForm] = Form.useForm();
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [i18n.language, page, searchQuery]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.get('http://localhost:8000/api/contacts', {
        headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language },
        params: { page, search: searchQuery },
      });
      setContacts(response.data.data);
      setPagination({
        current_page: response.data.meta.current_page,
        last_page: response.data.meta.last_page,
      });
    } catch (err) {
      console.error('Fetch contacts error:', err);
      if (err.response?.status === 401 || err.message === 'No token found') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError(t('contacts.error'));
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

  const handleDelete = async (id) => {
    const confirmed = await showConfirmation(t('contacts.delete_confirm'));
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        await axios.delete(`http://localhost:8000/api/contacts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        addNotification(t('contacts.deleted'), 'success');
        setPage(1);
        fetchContacts();
      } catch (err) {
        if (err.response?.status === 401 || err.message === 'No token found') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          addNotification(t('contacts.error'), 'error');
        }
      }
    }
  };

  const handleView = (contact) => {
    setViewContact(contact);
    setIsViewModalOpen(true);
    replyForm.resetFields();
  };

  const handleReply = async (values) => {
    if (!viewContact) return;
    setReplyLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      await axios.post(
        `http://localhost:8000/api/contacts/${viewContact.id}/reply`,
        {
          message: values.message,
          email: viewContact.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      addNotification(t('contacts.reply_sent'), 'success');
      setIsViewModalOpen(false);
      replyForm.resetFields();
    } catch (err) {
      console.error('Reply error:', err);
      if (err.response?.status === 401 || err.message === 'No token found') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        addNotification(t('contacts.reply_error'), 'error');
      }
    } finally {
      setReplyLoading(false);
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
      title: t('contacts.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('contacts.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('contacts.message'),
      dataIndex: 'message',
      key: 'message',
      render: (text) => (text.length > 50 ? `${text.substring(0, 50)}...` : text),
    },
    {
      title: t('contacts.created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: t('contacts.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button className="view" type="primary" onClick={() => handleView(record)}>
            {t('contacts.view')}
          </Button>
          <Button className="delete" type="danger" onClick={() => handleDelete(record.id)}>
            {t('contacts.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <Alert message={error} type="error" showIcon style={{ margin: 20 }} />;

  return (
    <div className="contacts-container" dir={t('dashboard.direction')}>
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
              {t('contacts.title')}
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
                placeholder={t('contacts.search_placeholder')}
                value={searchQuery}
                onChange={handleSearch}
                aria-label={t('contacts.search_placeholder')}
              />
            </div>
            <Table
              columns={columns}
              dataSource={contacts}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
            />
            <div className="pagination">
              <Button
                className="pagination-button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                {t('contacts.previous')}
              </Button>
              <span className="pagination-info">
                {t('contacts.page')} {pagination.current_page} / {pagination.last_page}
              </span>
              <Button
                className="pagination-button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.last_page}
              >
                {t('contacts.next')}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      <Modal
        title={t('contacts.view')}
        visible={isViewModalOpen}
        className="model-content"
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
      >
        {viewContact && (
          <div className="view-content">
            <p>
              <strong>{t('contacts.name')}:</strong> {viewContact.name}
            </p>
            <p>
              <strong>{t('contacts.email')}:</strong> {viewContact.email}
            </p>
            <p>
              <strong>{t('contacts.message')}:</strong> {viewContact.message}
            </p>
            <p>
              <strong>{t('contacts.created_at')}:</strong>{' '}
              {new Date(viewContact.created_at).toLocaleString()}
            </p>
            <Form
              form={replyForm}
              onFinish={handleReply}
              layout="vertical"
              className="reply-form"
            >
              <Form.Item
                name="message"
                label={<span style={{ fontFamily: "'Staatliches', sans-serif",fontSize:"22px" }}>{t('contacts.reply')}</span>}
                rules={[{ required: true, message: t('contacts.reply_required') }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder={t('contacts.reply_placeholder')}
                  style={{ fontFamily: "'Staatliches', sans-serif" ,fontSize:"20px"}}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={replyLoading}
                  className="contact-view"
                  style={{ fontFamily: "'Staatliches', sans-serif" }}
                >
                  {t('contacts.send')}
                </Button>
                <Button
                  className="contact-view"
                  style={{ marginLeft: 8, fontFamily: "'Staatliches', sans-serif" }}
                  onClick={() => setIsViewModalOpen(false)}
                >
                  {t('contacts.close')}
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Contacts;