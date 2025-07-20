import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { parseJwt } from '../utils/jwt';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddProductPage.css';

const AddProductPage = ({ handleLogout }) => {
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    barcode: '',
    quantity: '',
    price: '',
    critical_stock: '',
    unit_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setUsername(payload?.username || '');
      setIsAdmin(!!payload?.is_admin);
    }
    // Birimleri çek
    axios.get('http://localhost:5000/units').then(res => setUnits(res.data));
    // Kategorileri çek
    axios.get('http://localhost:5000/categories').then(res => setCategories(res.data));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/products/add', {
        name: form.name,
        description: form.description,
        category: form.category,
        barcode: form.barcode,
        quantity: Number(form.quantity),
        price: Number(form.price),
        critical_stock: Number(form.critical_stock),
        unit_id: Number(form.unit_id)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Ürün başarıyla eklendi!');
      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      setError('Ürün eklenemedi!');
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
            <div className="add-product-title">Ürün Ekle</div>
            <form className="add-product-form" onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Ürün Adı"
                value={form.name}
                onChange={handleChange}
                required
                className="add-product-input"
              />
              <input
                name="description"
                placeholder="Açıklama"
                value={form.description}
                onChange={handleChange}
                className="add-product-input"
              />
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="add-product-input"
              >
                <option value="">Kategori Seçiniz</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                name="barcode"
                placeholder="Barkod Numarası"
                value={form.barcode}
                onChange={handleChange}
                className="add-product-input"
              />
              <input
                name="quantity"
                type="number"
                placeholder="Miktar"
                value={form.quantity}
                onChange={handleChange}
                required
                min={1}
                className="add-product-input"
              />
              <input
                name="price"
                type="number"
                step="0.01"
                placeholder="Toplam Alış Fiyatı"
                value={form.price}
                onChange={handleChange}
                required
                min={0}
                className="add-product-input"
              />
              <input
                name="critical_stock"
                type="number"
                placeholder="Kritik Stok Seviyesi"
                value={form.critical_stock}
                onChange={handleChange}
                required
                min={1}
                className="add-product-input"
              />
              <select
                name="unit_id"
                value={form.unit_id}
                onChange={handleChange}
                required
                className="add-product-input"
              >
                <option value="">Birim Seçiniz</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="add-product-button"
              >
                {loading ? 'Ekleniyor...' : 'Ekle'}
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

export default AddProductPage; 