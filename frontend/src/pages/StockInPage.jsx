import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { parseJwt } from '../utils/jwt';
import axios from 'axios';
import './AddProductPage.css';
import { useNotification } from '../context/NotificationContext';

const StockInPage = ({ handleLogout }) => {
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { refreshNotifications } = useNotification();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setUsername(payload?.username || '');
      setIsAdmin(!!payload?.is_admin);
      axios.get('http://localhost:5000/products', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setProducts(res.data));
    }
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/products/${selectedId}/stock-in`, {
        quantity: Number(quantity)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Stok girişi başarılı!');
      setQuantity('');
      setSelectedId('');
      refreshNotifications(); // Bildirimleri güncelle
    } catch (err) {
      setError('Stok girişi yapılamadı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex' }}>
      <Sidebar username={username} isAdmin={isAdmin} onLogout={handleLogout} />
      <div style={{ marginLeft: 200, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div className="add-product-container">
            <div className="add-product-title">Stok Girişi</div>
            <form className="add-product-form" onSubmit={handleSubmit}>
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                required
                className="add-product-input"
              >
                <option value="">Ürün Seçiniz</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                name="quantity"
                type="number"
                placeholder="Miktar"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                required
                min={1}
                className="add-product-input"
              />
              <button
                type="submit"
                disabled={loading}
                className="add-product-button"
              >
                {loading ? 'Ekleniyor...' : 'Stok Girişi Yap'}
              </button>
              {error && <div className="add-product-error">{error}</div>}
              {success && <div className="add-product-success">{success}</div>}
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default StockInPage; 