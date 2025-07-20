import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { parseJwt } from '../utils/jwt';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductHistoryPage.css';

function getChangedFields(oldData, newData) {
  if (!oldData || !newData) return [];
  const changed = [];
  for (const key in newData) {
    if (key === 'id') continue;
    if (oldData[key] !== newData[key]) {
      changed.push(key);
    }
  }
  return changed;
}

const fieldLabels = {
  name: 'Ad',
  description: 'Açıklama',
  category: 'Kategori',
  barcode: 'Barkod',
  quantity: 'Miktar',
  price: 'Fiyat',
};

const ProductHistoryPage = () => {
  const { id } = useParams();
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setUsername(payload?.username || '');
      setIsAdmin(!!payload?.is_admin);
    }
    setLoading(true);
    setError('');
    axios.get(`http://localhost:5000/products/${id}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Geçmiş alınamadı!');
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="producthistory-root">
      <Sidebar username={username} isAdmin={isAdmin} />
      <div className="producthistory-content">
        <div className="producthistory-center">
          <div className="product-detail-container producthistory-detail-container">
            <div className="producthistory-title">Düzenleme Geçmişi</div>
            {loading ? (
              <div className="product-detail-loading">Yükleniyor...</div>
            ) : error ? (
              <div className="product-detail-error">{error}</div>
            ) : history.length === 0 ? (
              <div className="producthistory-empty">Herhangi bir düzenleme yapılmamış.</div>
            ) : (
              <table className="producthistory-table">
                <thead>
                  <tr>
                    <th>Alan</th>
                    <th>Eski Değer</th>
                    <th>Yeni Değer</th>
                    <th>Düzenleyen</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => {
                    const changedFields = getChangedFields(h.old_data, h.new_data);
                    return changedFields.length === 0 ? null : changedFields.map(field => (
                      <tr key={h.id + '-' + field} className="producthistory-row">
                        <td className="producthistory-field">{fieldLabels[field] || field}</td>
                        <td className="producthistory-old">{String(h.old_data[field] ?? '-')}</td>
                        <td className="producthistory-new">{String(h.new_data[field] ?? '-')}</td>
                        <td>{h.edited_by_username || '-'}</td>
                        <td>{new Date(h.edited_at).toLocaleString('tr-TR')}</td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            )}
            <button onClick={() => navigate(-1)} className="producthistory-back">Geri Dön</button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ProductHistoryPage; 