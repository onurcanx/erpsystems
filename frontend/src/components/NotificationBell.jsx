import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

const NotificationBell = () => {
  const { notifications, criticalCount, fetchNotifications } = useNotification();
  const [showNotif, setShowNotif] = React.useState(false);
  const [notifPanel, setNotifPanel] = React.useState(false);
  const notifTimeout = React.useRef(null);

  // Otomatik popup göster
  useEffect(() => {
    if (criticalCount > 0 && notifications.length > 0) {
      setShowNotif(true);
      if (notifTimeout.current) clearTimeout(notifTimeout.current);
      notifTimeout.current = setTimeout(() => setShowNotif(false), 3000);
    }
  }, [criticalCount, notifications]);

  useEffect(() => {
    fetchNotifications();
    return () => {
      if (notifTimeout.current) clearTimeout(notifTimeout.current);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {/* Sabit bildirim ikonu */}
      <div style={{ position: 'fixed', top: 24, right: 48, zIndex: 3000 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setNotifPanel(v => !v)}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#365256" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {criticalCount > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: '#b00020', color: '#fff', borderRadius: '50%', fontSize: 13, fontWeight: 700, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002' }}>{criticalCount}</span>
          )}
        </div>
        {/* Bildirim paneli (ikon tıklanınca) */}
        {notifPanel && (
          <div style={{ position: 'absolute', top: 38, right: 0, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #0002', padding: '14px 22px', minWidth: 220, color: '#b00020', fontWeight: 600, fontSize: 15 }}>
            {notifications.length > 0 ? (
              notifications.map(n => <div key={n.id}>{n.message}</div>)
            ) : (
              <div style={{ color: '#888', textAlign: 'center' }}>Bildirim yok</div>
            )}
          </div>
        )}
      </div>
      {/* Otomatik bildirim popup */}
      {showNotif && notifications.length > 0 && (
        <div style={{ position: 'fixed', top: 24, right: 100, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #0002', padding: '14px 22px', minWidth: 220, color: '#b00020', fontWeight: 600, fontSize: 15, zIndex: 3000 }}>
          {notifications[0].message}
        </div>
      )}
    </>
  );
};

export default NotificationBell; 