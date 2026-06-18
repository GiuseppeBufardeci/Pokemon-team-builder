import { useState, useEffect } from 'react';
import './OfflineBanner.css';

export function OfflineBanner() {
  // Inizializziamo lo stato leggendo direttamente l'API nativa del browser
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-banner">
      ⚠️ Sei offline. Le tue modifiche verranno salvate in locale e sincronizzate quando tornerà la connessione!
    </div>
  );
}