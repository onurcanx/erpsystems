import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [criticalCount, setCriticalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/products/stock-panel-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCriticalCount(res.data.criticalCount);
      if (res.data.criticalCount > 0) {
        setNotifications([
          {
            id: Date.now(),
            message: `${res.data.criticalCount} ürün kritik stok seviyesinde!`,
          },
        ]);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      setCriticalCount(0);
      setNotifications([]);
    }
    setLoading(false);
  }, []);

  // Stok hareketi sonrası çağrılacak fonksiyon
  const refreshNotifications = () => {
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      criticalCount,
      loading,
      fetchNotifications,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext); 