import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../components/loading/loaging';
import { Card, Row, Col, Typography,List, Spin, Alert, Space,Button } from 'antd';
import { AreaChartOutlined, TeamOutlined, EnvironmentOutlined, MailOutlined,UserOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import './Dashboard.css';


const { Title } = Typography;
const Dashboard = () => {
  const { t ,i18n} = useTranslation();
  const [stats, setStats] = useState({
    totalRegions: 0,
    totalProvinces: 0,
    totalCommunes: 0,
    totalContacts: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [user, setUser] = useState({ name: 'Admin' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
  
        const userResponse = await axios.get('http://localhost:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);
  
        const statsResponse = await axios.get('http://localhost:8000/api/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsResponse.data);
  
        const activityResponse = await axios.get('http://localhost:8000/api/recentActivity', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentActivity(activityResponse.data);
  
        const visitsResponse = await axios.get('http://localhost:8000/api/visits', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVisits(visitsResponse.data);

        const usersResponse = await axios.get('http://localhost:8000/api/recent-users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentUsers(usersResponse.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setError(t('dashboard.error'));
          console.error('Fetch error:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData()
  }, [t]);

  const chartConfig = {
    data: visits,
    xField: 'date',
    yField: 'count',
    height: 300,
    color: '#fcdd77',
    point: {
      size: 10,
      shape: 'circle',
      style: {
        fill: '#fcdd77',
        stroke: '#fcdd77',
      },
    },
    xAxis: {
      label: {
        formatter: (text) => (text ? new Date(text).toLocaleDateString() : 'N/A'),
      },
    },
    yAxis: {
      title: { text: t('dashboard.visits') },
      min: 0,
    },
    tooltip: {
  showTitle: true,
  title: (datum) => (datum?.date ? new Date(datum.date).toLocaleDateString() : 'N/A'),
  formatter: (datum) => ({
    name: t('dashboard.visits'),
    value: datum.count != null ? `${datum.count} ${t('dashboard.visits')}` : 'No data',
  }),
  domStyles: {
    'g2-tooltip': { color: '#fcdd77' }, // Force tooltip text color
    'g2-tooltip-title': { color: '#fcdd77' },
    'g2-tooltip-list-item': { color: '#fcdd77' },
  },
}
  };

  if (loading) return <Loading/>;
  if (error) return <Alert message={error} type="error" showIcon style={{ margin: 20 }} />;

  return (
    <div className="dashboard-container" dir={t('dashboard.direction')}>
      <h2  className="welcome_title" style={{ textAlign: t('dashboard.direction') === 'rtl' ? 'right' : 'left' }}>
        {t('dashboard.welcome', { name: user.name })}
      </h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Space className='space'>
              <div className='label'>
              <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
              </svg>
              <div className='title'>{t('dashboard.regions')}</div>
              </div>
              <div className='info_space'>{stats.totalRegions}</div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Space  className='space'>
            <div className='label'>
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
              </svg>
              <div className='title'>{t('dashboard.provinces')}</div>
              </div>
              <div className='info_space'>{stats.totalProvinces}</div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Space className='space'>
            <div className='label'>
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
              </svg>
              <div className='title'>{t('dashboard.communes')}</div>
              </div>
              <div className='info_space'>{stats.totalCommunes}</div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Space className='space'>
            <div className='label'>
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-chat-left-text-fill" viewBox="0 0 16 16">
            <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793zm3.5 1a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z"/>
           </svg>
              <div className='title'>{t('dashboard.contacts')}</div>
              </div>
              <div className='info_space'>{stats.totalContacts}</div>
            </Space>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
        <Card hoverable>
          <h2 className="title_Liens" style={{ textAlign: t('dashboard.direction') === 'rtl' ? 'right' : 'left' }}>{t('dashboard.quick_links')}</h2>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Link to="/regions"><button>{t('dashboard.manage_regions')}</button></Link>
              <Link to="/contacts"><button>{t('dashboard.view_contacts')}</button></Link>
            </Space>
            </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
          <h2 className="title_Liens" style={{ textAlign: t('dashboard.direction') === 'rtl' ? 'right' : 'left' }}>{t('dashboard.recent_activity')}</h2>
            {recentActivity.length > 0 ? (
              <List
                dataSource={recentActivity}
                renderItem={(item) => (
                  <List.Item className='list_item'>
                    {item.message} - {new Date(item.created_at).toLocaleString()}
                  </List.Item>
                )}
              />
            ) : (
              <p>{t('dashboard.no_activity')}</p>
            )}
          </Card>
        </Col>
        <Col xs={24} md={18}>
          <Card>
          <h2 className="title_Liens" style={{ textAlign: t('dashboard.direction') === 'rtl' ? 'right' : 'left' }}>{t('dashboard.visit_trends')}</h2>
            {visits.length > 0 ? <Line {...chartConfig} /> : <p>{t('dashboard.no_visits')}</p>}
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
          <h2 className="title_Liens" style={{ textAlign: t('dashboard.direction') === 'rtl' ? 'right' : 'left' }}>{t('dashboard.recent_users')} <span>{recentUsers.length}</span></h2>
            {recentUsers.length > 0 ? (
              <>
              <List
                dataSource={recentUsers}
                renderItem={(item) => (
                  <List.Item className='list_users_items'>
                    <div className='list_name_users_items'>{item.name}</div> 
                     <div className='list_info_users_items'>{item.email} - {new Date(item.created_at).toLocaleDateString()}</div>
                  </List.Item>
                )}
              />
                {user.role="main_admin"? (<Link to="/users"><button className='btn-users'>
                  <svg xmlns="http://www.w3.org/2000/svg"  width="24" height="24" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                     <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                  </svg>
                  <span>{t('dashboard.manage_users')}</span></button></Link>):""}
              </>  
            ) : (
              <p>{t('dashboard.no_users')}</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
