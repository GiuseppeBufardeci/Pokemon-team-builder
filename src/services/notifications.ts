import { collection, addDoc, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Crea una nuova notifica nel database
export const addNotification = async (userId: string, message: string) => {
    await addDoc(collection(db, 'notifications'), {
        userId,
        message,
        read: false,
        createdAt: Date.now()
    });
};

// Crea o aggiorna una notifica con un ID univoco (per evitare spam di like)
export const setUniqueNotification = async (notificationId: string, userId: string, message: string) => {
    await setDoc(doc(db, 'notifications', notificationId), {
        userId,
        message,
        read: false,
        createdAt: Date.now()
    }, { merge: true });
};

// Elimina una notifica (es. quando l'utente toglie il like)
export const removeNotification = async (notificationId: string) => {
    await deleteDoc(doc(db, 'notifications', notificationId));
};

// Segna una notifica come letta
export const markAsRead = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
};