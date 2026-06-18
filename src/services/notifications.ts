import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
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

// Segna una notifica come letta
export const markAsRead = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
};