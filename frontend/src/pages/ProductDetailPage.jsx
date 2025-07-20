import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { parseJwt } from '../utils/jwt';
import axios from 'axios';
import './ProductDetailPage.css';

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

function getLastChangeSummary(history) {
  if (!history || history.length === 0) return null;
  const last = history[0];
  const changedFields = getChangedFields(last.old_data, last.new_data);
  return {
    user: last.edited_by_username || '-',
    date: new Date(last.edited_at).toLocaleString('tr-TR'),
    fields: changedFields
  };
}

const fieldLabels = {
  name: 'Ad',
  description: 'Açıklama',
  category: 'Kategori',
  barcode: 'Barkod',
  quantity: 'Miktar',
  price: 'Fiyat',
};

const ProductDetailPage = ({ handleLogout }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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
    axios.get(`http://localhost:5000/products`)
      .then(res => {
        const found = res.data.find(p => String(p.id) === String(id));
        setProduct(found);
        setLoading(false);
      })
      .catch(() => {
        setError('Ürün bilgisi alınamadı!');
        setLoading(false);
      });
    // Geçmişi çek
    setHistoryLoading(true);
    setHistoryError('');
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:5000/products/${id}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setHistory(res.data);
        setHistoryLoading(false);
      })
      .catch(() => {
        setHistoryError('Geçmiş alınamadı!');
        setHistoryLoading(false);
      });
  }, [id]);

  const lastChange = getLastChangeSummary(history);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex' }}>
      <Sidebar username={username} isAdmin={isAdmin} onLogout={handleLogout} />
      <div style={{ marginLeft: 200, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="product-detail-container">
            {/* Son değişiklik özeti */}
            {lastChange && (
              <div style={{
                background: '#f7f6f3',
                borderRadius: 8,
                padding: '12px 18px',
                marginBottom: 18,
                fontSize: 16,
                color: '#365256',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <b>Son değişiklik:</b>
                {lastChange.fields.length === 0 ? (
                  <span>Alan değişikliği yok</span>
                ) : (
                  lastChange.fields.map(f => (
                    <span key={f} style={{ background: '#E8A652', color: '#222', borderRadius: 4, padding: '2px 8px', marginRight: 6, fontWeight: 500 }}>{fieldLabels[f] || f}</span>
                  ))
                )}
                <span style={{ color: '#888', marginLeft: 8 }}>
                  {lastChange.date} - {lastChange.user}
                </span>
              </div>
            )}
            {/* Düzenleme Geçmişini Görüntüle linki */}
            <div style={{ marginBottom: 24 }}>
              <Link to={`/product/${id}/history`} style={{ color: '#365256', fontWeight: 600, fontSize: 18, textDecoration: 'underline', cursor: 'pointer' }}>
                Düzenleme Geçmişini Görüntüle
              </Link>
            </div>
            {loading ? (
              <div className="product-detail-loading">Yükleniyor...</div>
            ) : error ? (
              <div className="product-detail-error">{error}</div>
            ) : !product ? (
              <div className="product-detail-error">Ürün bulunamadı.</div>
            ) : (
              <>
                <div className="product-detail-title">{product.name}</div>
                <div className="product-detail-info"><b>Açıklama:</b> {product.description || '-'}</div>
                <div className="product-detail-info"><b>Kategori:</b> {product.category || '-'}</div>
                <div className="product-detail-info"><b>Barkod:</b> {product.barcode || '-'}</div>
                <div className="product-detail-info"><b>Miktar:</b> {product.quantity}</div>
                <div className="product-detail-info"><b>Fiyat:</b> {product.price} ₺</div>
                <div className="product-detail-info"><b>Birim:</b> {product.unit_name || '-'}</div>
                <div className="product-detail-info"><b>Ekleyen:</b> {product.created_by_username || '-'}</div>
                <div className="product-detail-info"><b>Son Düzenleyen:</b> {product.last_edited_by_username || '-'}</div>
                <div className="product-detail-info"><b>Eklenme Tarihi:</b> {new Date(product.created_at).toLocaleString('tr-TR')}</div>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetailPage; 