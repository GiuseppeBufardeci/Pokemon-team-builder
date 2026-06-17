import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

export const registerWithEmail = async (email: string, password: string, nickname: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Subito dopo la registrazione, aggiorniamo il profilo Firebase aggiungendo il Nickname
  await updateProfile(userCredential.user, {
    displayName: nickname
  });
  return userCredential;
}

export const loginWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export const logout = () => {
  return signOut(auth)
}