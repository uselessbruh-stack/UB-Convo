import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA75WE7qsbMgXSGM-FUJMDUGRwhHh1qkx4",
  authDomain: "travelguide-dcf56.firebaseapp.com",
  projectId: "travelguide-dcf56",
  storageBucket: "travelguide-dcf56.appspot.com",
  messagingSenderId: "1051828735227",
  appId: "1:1051828735227:web:5ca8a78f8d68ee86c4b45e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use modern persistence API (replaces deprecated enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);

export default app;
