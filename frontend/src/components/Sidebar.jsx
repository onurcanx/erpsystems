import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ username, isAdmin, onLogout }) => {
  const handleLogoutClick = () => {
    if (window.confirm('Gerçekten çıkış yapmak istiyor musunuz?')) {
      onLogout && onLogout();
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-title">{username ? username : 'Kullanıcı'}</div>
      <nav className="sidebar-menu">
        <NavLink to="/home" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'} >Ana Sayfa</NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>Ürün Listesi</NavLink>
        <NavLink to="/add-product" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>Ürün Ekle</NavLink>
        <NavLink to="/stock-panel" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>Stok Durum Paneli</NavLink>
        <NavLink to="/stock-in" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>Stok Girişi</NavLink>
        <NavLink to="/stock-out" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>Stok Çıkışı</NavLink>
        {isAdmin && (
          <NavLink to="/register" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>Üye Kaydı</NavLink>
        )}
      </nav>
      <button
        className="sidebar-logout"
        onClick={handleLogoutClick}
      >
        Çıkış Yap
      </button>
    </div>
  );
};

export default Sidebar; 