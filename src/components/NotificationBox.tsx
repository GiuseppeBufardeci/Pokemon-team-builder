import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { markAsRead } from '../services/notifications';
import './NotificationBox.css';

interface AppNotification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export function NotificationBox() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Usiamo un ref per assicurarci che la notifica di riepilogo scatti SOLO all'avvio/login
  const hasShownSummary = useRef(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Estraiamo e ordiniamo per data (le più recenti in alto)
      const notifs = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as AppNotification))
        .sort((a, b) => b.createdAt - a.createdAt);
        
      setNotifications(notifs);

      // Contiamo quelle non lette
      const unreadCount = notifs.filter(n => !n.read).length;

      // Se ci sono notifiche non lette E non abbiamo ancora mostrato il riepilogo
      if (unreadCount > 0 && !hasShownSummary.current && Notification.permission === 'granted') {
        new Notification('Pokémon Team Builder', { 
            body: `Bentornato! Hai ${unreadCount} nuove notifiche da leggere nella tua bacheca.`,
            icon: '/icon-192.png'
        });
        hasShownSummary.current = true; // Impedisce che rispunti finché non si ricarica l'app
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  return (
    <div className="notification-widget">
      {/* Il pulsante galleggiante */}
      <button className="notification-btn" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {/* Il box a comparsa */}
      {isOpen && (
        <div className="notification-box">
          <div className="notification-box__header">
            <h4>Le tue Notifiche</h4>
            <button className="notification-box__close-btn" onClick={() => setIsOpen(false)}>✖</button>
          </div>
          <div className="notification-box__list">
            {unreadNotifications.length === 0 ? (
              <p className="notification-empty">Nessuna notifica.</p>
            ) : (
              unreadNotifications.map(notif => (
                <div key={notif.id} className="notification-item unread">
                  <p>{notif.message}</p>
                  <button onClick={() => markAsRead(notif.id)} className="notification-read-btn">
                    Segna come letta
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}