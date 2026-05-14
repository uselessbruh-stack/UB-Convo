import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { DEFAULT_SETTINGS } from '../utils/constants';

export async function signUp(email, password, name) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  return user;
}

export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logOut() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function createUserDocument(userId, data) {
  const userRef = doc(db, 'users', userId);
  const existing = await getDoc(userRef);

  if (existing.exists() && existing.data().profileCompleted) {
    // Already fully set up, don't overwrite
    return existing.data();
  }

  const userData = {
    name: data.name || '',
    email: data.email || '',
    username: data.username || '',
    profilePicUrl: data.profilePicUrl || null,
    phoneNumber: data.phoneNumber || null,
    createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
    lastSeen: serverTimestamp(),
    isOnline: true,
    profileCompleted: !!data.username,
    settings: DEFAULT_SETTINGS,
  };

  await setDoc(userRef, userData, { merge: true });
  return userData;
}

export async function checkProfileComplete(userId) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return { exists: false, complete: false, data: null };
  }

  const data = snap.data();
  const complete = data.profileCompleted === true && !!data.username;
  return { exists: true, complete, data };
}
