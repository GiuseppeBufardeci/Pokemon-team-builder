import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyAH-JSUEOKDgqhMjIlwGmGadQCQmCVqKuk",
  authDomain: "pokemon-team-builder-2dc3a.firebaseapp.com",
  projectId: "pokemon-team-builder-2dc3a",
  storageBucket: "pokemon-team-builder-2dc3a.firebasestorage.app",
  messagingSenderId: "1033356491312",
  appId: "1:1033356491312:web:4f8f3b49143b633bb44bf5",

};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    // Permette di condividere la cache offline tra più schede del browser aperte!
    tabManager: persistentMultipleTabManager() 
  })
});
export default app