# Pokémon Team Builder

Benvenuto nel **Pokémon Team Builder**, un'applicazione Web Progressiva (PWA) sviluppata in **React** con **TypeScript** e **Vite**, pensata per permettere agli allenatori di creare, gestire e condividere le proprie squadre Pokémon!

Questo progetto è stato realizzato come progetto universitario.

## 🚀 Funzionalità Principali

- **Creazione Team:** Costruisci la tua squadra scegliendo il gioco Pokémon desiderato e selezionando fino a 6 Pokémon (dati presi dinamicamente tramite *PokeAPI*).
- **Gestione Utente:** Autenticazione tramite Email/Password o Google (Firebase Auth).
- **I Miei Team:** Visualizza, modifica, elimina e pubblica le tue squadre salvate su Firebase Firestore.
- **Community & Leaderboard:** Esplora i team pubblici creati da altri utenti, metti "Mi Piace" e commenta.
- **PWA (Progressive Web App):** L'app è installabile, supporta il funzionamento offline ed è abilitata alla ricezione di notifiche desktop.
- **UI Neo-Brutalista:** Un'interfaccia utente moderna, coerente e completamente responsiva.

## 🛠️ Tecnologie Utilizzate

- **Frontend:** React 19, TypeScript, Vite, React Router DOM
- **Backend/BaaS:** Firebase (Auth, Firestore)
- **PWA:** vite-plugin-pwa, Workbox
- **Dati:** API REST esterne (PokeAPI)

## 💻 Istruzioni per l'Avvio in Locale (Per il Docente)

Segui questi semplici passaggi per clonare, installare ed eseguire il progetto.

### 1. Installazione ed Esecuzione Standard

```bash
# Clona il repository
git clone https://github.com/GiuseppeBufardeci/Pokemon-team-builder.git
cd Pokemon-team-builder

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```
*Il progetto sarà accessibile su `http://localhost:5173`.*

### 2. Testare le funzionalità PWA (Offline & Installazione)

I Service Worker per la gestione offline vengono registrati correttamente solo sulla build di produzione ottimizzata. Per testare l'esperienza PWA completa (Offline fallback, Banner di installazione e Notifiche) in locale:

```bash
# Esegui la build del progetto
npm run build

# Avvia il server di anteprima della produzione
npm run preview
```
