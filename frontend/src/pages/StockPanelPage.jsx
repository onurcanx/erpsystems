import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { parseJwt } from '../utils/jwt';
import './ProductDetailPage.css';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockPanelPage = ({ handleLogout }) => {
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: '-',
    totalStock: '-',
    criticalCount: '-',
    lastProduct: '-'
  });
  const [movements, setMovements] = useState({ totalIn: '-', totalOut: '-' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setUsername(payload?.username || '');
      setIsAdmin(!!payload?.is_admin);
      setLoading(true);
      setError('');
      // Stok panel verilerini çek
      axios.get('http://localhost:5000/products/stock-panel-stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setStats(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError('Stok panel verileri alınamadı!');
          setLoading(false);
        });
      // Stok hareketleri özetini çek
      axios.get('http://localhost:5000/products/stock-movements-summary', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setMovements(res.data))
        .catch(() => setMovements({ totalIn: '-', totalOut: '-' }));
      // Stok hareketleri grafiği verisini çek
      axios.get('http://localhost:5000/products/stock-movements-graph', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setGraphData(res.data))
        .catch(() => setGraphData([]));
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex' }}>
      <Sidebar username={username} isAdmin={isAdmin} onLogout={handleLogout} />
      <div style={{ marginLeft: 200, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 48 }}>
          <div className="product-detail-container" style={{ maxWidth: 1100 }}>
            <div style={{ fontSize: 28, color: '#365256', fontWeight: 700, marginBottom: 32 }}>Stok Durum Paneli</div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
              <div style={{ background: '#f7f6f3', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '32px 38px', minWidth: 220, textAlign: 'center' }}>
                <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Toplam Ürün</div>
                <div style={{ fontSize: 32, color: '#365256', fontWeight: 700 }}>{loading ? '...' : stats.totalProducts}</div>
              </div>
              <div style={{ background: '#f7f6f3', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '32px 38px', minWidth: 220, textAlign: 'center' }}>
                <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Toplam Stok</div>
                <div style={{ fontSize: 32, color: '#365256', fontWeight: 700 }}>{loading ? '...' : stats.totalStock}</div>
              </div>
              <div style={{ background: '#f7f6f3', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '32px 38px', minWidth: 220, textAlign: 'center' }}>
                <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Kritik Stokta Ürün</div>
                <div style={{ fontSize: 32, color: '#b00020', fontWeight: 700 }}>{loading ? '...' : stats.criticalCount}</div>
              </div>
              <div style={{ background: '#f7f6f3', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '32px 38px', minWidth: 220, textAlign: 'center' }}>
                <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Son Eklenen Ürün</div>
                <div style={{ fontSize: 20, color: '#365256', fontWeight: 600 }}>{loading ? '...' : stats.lastProduct}</div>
              </div>
              <div style={{ background: '#f7f6f3', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '32px 38px', minWidth: 220, textAlign: 'center' }}>
                <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Toplam Ürün Girişi</div>
                <div style={{ fontSize: 32, color: '#09DF52', fontWeight: 700 }}>{loading ? '...' : movements.totalIn}</div>
              </div>
              <div style={{ background: '#f7f6f3', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '32px 38px', minWidth: 220, textAlign: 'center' }}>
                <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Toplam Ürün Çıkışı</div>
                <div style={{ fontSize: 32, color: '#b00020', fontWeight: 700 }}>{loading ? '...' : movements.totalOut}</div>
              </div>
            </div>
            {error && <div className="product-detail-error">{error}</div>}
            {graphData.length > 0 && (
              <div className="stock-panel-graph">
                <div className="stock-panel-graph-title">Stok Giriş/Çıkış (Son 30 Gün)</div>
                <Line
                  data={{
                    labels: graphData.map(d => d.date),
                    datasets: [
                      {
                        label: 'Giriş',
                        data: graphData.map(d => d.total_in),
                        borderColor: '#09DF52',
                        backgroundColor: 'rgba(9,223,82,0.08)',
                        tension: 0.3,
                        pointRadius: 2,
                        fill: true,
                      },
                      {
                        label: 'Çıkış',
                        data: graphData.map(d => d.total_out),
                        borderColor: '#b00020',
                        backgroundColor: 'rgba(176,0,32,0.08)',
                        tension: 0.3,
                        pointRadius: 2,
                        fill: true,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: false }
                    },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true }
                    }
                  }}
                  height={180}
                />
              </div>
            )}
            <div style={{ marginTop: 24, fontSize: 18, color: '#888', textAlign: 'center' }}>
              Detaylı stok raporları ve grafikler burada yer alacak.
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default StockPanelPage; 