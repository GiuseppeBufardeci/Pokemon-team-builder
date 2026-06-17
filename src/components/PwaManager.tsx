import { useEffect, useState } from 'react';
// @ts-ignore (evita errori se TypeScript non trova subito i tipi del plugin virtuale)
import { registerSW } from 'virtual:pwa-register'

export function PwaManager() {
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    // Registrazione del Service Worker gestita dal Plugin PWA
    registerSW({ immediate: true })
  }, []);

  const requestNotification = async () => {
    if (!('Notification' in window)) {
      alert('Questo browser non supporta le notifiche desktop');
      return;
    }

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm === 'granted') {
      new Notification('Pokémon Team Builder', {
        body: 'Notifiche attivate! Riceverai avvisi sui tuoi team.',
        icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
      });
    }
  };

  if (permission === 'granted' || permission === 'denied') return null;

  return (
    <div style={{ padding: '0.75rem', background: '#ffd700', borderBottom: '3px solid #111', textAlign: 'center', fontWeight: 'bold' }}>
      Vuoi ricevere notifiche? 
      <button onClick={requestNotification} style={{ marginLeft: '1rem', padding: '0.4rem 0.8rem', background: '#e63b10', color: '#fff', border: '2px solid #111', fontWeight: 'bold', cursor: 'pointer', boxShadow: '2px 2px 0 #111' }}>
        Attiva Notifiche
      </button>
    </div>
  );
}