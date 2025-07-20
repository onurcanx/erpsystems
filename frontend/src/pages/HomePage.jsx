import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { parseJwt } from '../utils/jwt';
import axios from 'axios';
import './HomePage.css';

const HomePage = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginTime, setLoginTime] = useState('');
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      const payload = parseJwt(token);
      setUsername(payload?.username || '');
      setIsAdmin(!!payload?.is_admin);
    }
    const loginUserVal = localStorage.getItem('loginUser') || '';
    setLoginUser(loginUserVal);
    setLoginTime(localStorage.getItem('loginTime') || '');
    axios.get(`http://localhost:5000/activity-log?user=${encodeURIComponent(loginUserVal)}`)
      .then(res => {
        setActivity(res.data);
        setActivityLoading(false);
      })
      .catch(() => {
        setActivityError('Son işlemler alınamadı!');
        setActivityLoading(false);
      });
  }, [navigate]);

  return (
    <div className="homepage-root">
      <Sidebar username={username} isAdmin={isAdmin} onLogout={handleLogout} />
      <div className="homepage-content">
        <div className="homepage-center">
          {/* Giriş yapan kutusu sağ alt köşe */}
          <div className="homepage-login-info">
            <div>Giriş Yapan: <b>{loginUser}</b></div>
            <div>Giriş Saati: <b>{loginTime}</b></div>
          </div>
          <h2 className="homepage-title">Hoşgeldin{loginUser ? `, ${loginUser}` : ''}!</h2>
          {/* Son işlemler paneli */}
          <div className="homepage-activity-panel">
            <div className="homepage-activity-title">Senin Son İşlemlerin</div>
            {activityLoading ? (
              <div>Yükleniyor...</div>
            ) : activityError ? (
              <div style={{ color: '#b00020' }}>{activityError}</div>
            ) : activity.length === 0 ? (
              <div>Henüz işlem yok.</div>
            ) : (
              activity.map(a => (
                <div key={a.id} className="homepage-activity-item">
                  <span className="homepage-activity-icon">
                    {a.type === 'add' && '✔'}
                    {a.type === 'update' && '✏️'}
                    {a.type === 'stock_in' && '➕'}
                    {a.type === 'stock_out' && '➖'}
                    {a.type === 'delete' && '🗑️'}
                  </span>
                  <span className="homepage-activity-time">{new Date(a.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{a.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
 