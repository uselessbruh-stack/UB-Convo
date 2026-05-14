import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, serverTimestamp, onSnapshot, orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export async function getUserProfile(userId) {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
}

export async function updateUserProfile(userId, data) {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    ...data,
    lastSeen: serverTimestamp(),
  });
}

export async function completeProfile(userId, data) {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    username: data.username,
    profilePicUrl: data.profilePicUrl || null,
    phoneNumber: data.phoneNumber || null,
    profileCompleted: true,
    lastSeen: serverTimestamp(),
  });
}

export async function checkUsernameAvailable(username) {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username.toLowerCase())
  );
  const snap = await getDocs(q);
  return snap.empty;
}

export async function searchUsers(searchTerm, currentUserId) {
  if (!searchTerm || searchTerm.length < 2) return [];

  const term = searchTerm.toLowerCase();

  // Search by username
  const usernameQuery = query(
    collection(db, 'users'),
    where('username', '>=', term),
    where('username', '<=', term + '\uf8ff')
  );

  const usernameSnap = await getDocs(usernameQuery);
  const results = new Map();

  usernameSnap.forEach((docSnap) => {
    if (docSnap.id !== currentUserId) {
      results.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
    }
  });

  // Also search by name
  const nameQuery = query(
    collection(db, 'users'),
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff')
  );

  const nameSnap = await getDocs(nameQuery);
  nameSnap.forEach((docSnap) => {
    if (docSnap.id !== currentUserId && !results.has(docSnap.id)) {
      results.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
    }
  });

  return Array.from(results.values());
}

export async function setUserOnline(userId) {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    isOnline: true,
    lastSeen: serverTimestamp(),
  });
}

export async function setUserOffline(userId) {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    isOnline: false,
    lastSeen: serverTimestamp(),
  });
}

export async function updateUserSettings(userId, settings) {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, { settings });
}

export function subscribeToUser(userId, callback) {
  const ref = doc(db, 'users', userId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
}

export async function getAllUsers() {
  const q = query(collection(db, 'users'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
