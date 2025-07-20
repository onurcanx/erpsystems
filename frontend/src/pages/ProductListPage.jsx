import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { parseJwt } from '../utils/jwt';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './ProductListPage.css';

const ProductListPage = ({ handleLogout }) => {
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setUsername(payload?.username || '');
      setIsAdmin(!!payload?.is_admin);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Ürünler alınamadı!');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/categories').then(res => setCategories(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== id));
    } catch {
      alert('Ürün silinemedi!');
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  // Filtrelenmiş ürünler
  const filteredProducts = products.filter(p =>
    (selectedCategory === '' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex' }}>
      <Sidebar username={username} isAdmin={isAdmin} onLogout={handleLogout} />
      <div style={{ marginLeft: 200, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 60 }}>
          <div className="product-list-container">
            <div className="product-list-title">Ürün Listesi</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
              <input
                type="text"
                placeholder="Ürün adı ile ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="product-list-search"
                style={{ padding: '8px 14px', fontSize: 16, borderRadius: 6, border: '1px solid #ccc', width: 220 }}
              />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="product-list-search"
                style={{ padding: '8px 14px', fontSize: 16, borderRadius: 6, border: '1px solid #ccc', width: 180 }}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {loading ? (
              <div>Yükleniyor...</div>
            ) : error ? (
              <div className="product-list-error">{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div>Hiç ürün yok.</div>
            ) : (
              <table className="product-list-table">
                <thead>
                  <tr>
                    <th>Ad</th>
                    <th>Miktar</th>
                    <th>Birim</th>
                    <th>Kategori</th>
                    <th>Fiyat</th>
                    <th>Eklenme Tarihi</th>
                    <th>Ekleyen Kullanıcı</th>
                    <th>Son Düzenleyen</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/product/${p.id}`} style={{ color: '#365256', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}>{p.name}</Link>
                      </td>
                      <td>{p.quantity}</td>
                      <td>{p.unit_name || '-'}</td>
                      <td>{p.category || '-'}</td>
                      <td>{p.price} ₺</td>
                      <td>{new Date(p.created_at).toLocaleString('tr-TR')}</td>
                      <td>{p.created_by_username || '-'}</td>
                      <td>{p.last_edited_by_username || '-'}</td>
                      <td>
                        <div className="product-list-actions">
                          <button onClick={() => handleEdit(p.id)} className="product-list-edit">Düzenle</button>
                          <button onClick={() => handleDelete(p.id)} className="product-list-delete">Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ProductListPage; 