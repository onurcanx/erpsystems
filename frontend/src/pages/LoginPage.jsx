import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('loginUser', username);
      localStorage.setItem('loginTime', new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
      navigate('/home');
    } catch (err) {
      setError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-title">Giriş Yap</div>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit" className="login-button">Giriş Yap</button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  );
};

export default LoginPage; 