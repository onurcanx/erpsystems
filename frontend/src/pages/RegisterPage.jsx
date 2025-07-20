import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { parseJwt } from '../utils/jwt';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import './RegisterPage.css';

const RegisterPage = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    is_admin: false,
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    tc_no: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    const payload = parseJwt(token);
    setUsername(payload?.username || '');
    setIsAdmin(!!payload?.is_admin);
    if (!payload?.is_admin) {
      navigate('/home');
    }
  }, [navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckbox = e => {
    setForm({ ...form, is_admin: e.target.checked });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await axios.post('http://localhost:5000/register', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex' }}>
      <Sidebar username={username} isAdmin={isAdmin} />
      <div style={{ marginLeft: 200, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="register-container">
            <div className="register-title">Kullanıcı Ekle</div>
            <form className="register-form" onSubmit={handleSubmit}>
              <input name="first_name" placeholder="İsim" value={form.first_name} onChange={handleChange} required className="register-input" />
              <input name="last_name" placeholder="Soyisim" value={form.last_name} onChange={handleChange} required className="register-input" />
              <input name="phone" placeholder="Telefon Numarası" value={form.phone} onChange={handleChange} required className="register-input" />
              <input name="email" type="email" placeholder="E-posta" value={form.email} onChange={handleChange} required className="register-input" />
              <input name="tc_no" placeholder="TC Kimlik No" value={form.tc_no} onChange={handleChange} required className="register-input" />
              <input name="username" placeholder="Kullanıcı Adı" value={form.username} onChange={handleChange} required className="register-input" />
              <input name="password" type="password" placeholder="Şifre" value={form.password} onChange={handleChange} required className="register-input" />
              <label className="register-checkbox-label">
                <input type="checkbox" checked={form.is_admin} onChange={handleCheckbox} /> Admin olarak ekle
              </label>
              <button type="submit" className="register-button">Kullanıcı Ekle</button>
              {error && <div className="register-error">{error}</div>}
              {success && <div className="register-success">{success}</div>}
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default RegisterPage; 