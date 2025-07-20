import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage';
import AddProductPage from './pages/AddProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import EditProductPage from './pages/EditProductPage';
import ProductHistoryPage from './pages/ProductHistoryPage';
import StockPanelPage from './pages/StockPanelPage';
import StockInPage from './pages/StockInPage';
import StockOutPage from './pages/StockOutPage';
import NotificationBell from './components/NotificationBell';
import axios from 'axios';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };
  return (
    <NotificationProvider>
      <NotificationBell />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage handleLogout={handleLogout} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductListPage handleLogout={handleLogout} />} />
          <Route path="/add-product" element={<AddProductPage handleLogout={handleLogout} />} />
          <Route path="/product/:id" element={<ProductDetailPage handleLogout={handleLogout} />} />
          <Route path="/edit-product/:id" element={<EditProductPage handleLogout={handleLogout} />} />
          <Route path="/product/:id/history" element={<ProductHistoryPage />} />
          <Route path="/stock-panel" element={<StockPanelPage handleLogout={handleLogout} />} />
          <Route path="/stock-in" element={<StockInPage handleLogout={handleLogout} />} />
          <Route path="/stock-out" element={<StockOutPage handleLogout={handleLogout} />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App; 