import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA9rpANJVk3rJMrQS5BjNxMGiaTrWIoJJg",
  authDomain: "gurumithuru.firebaseapp.com",
  projectId: "gurumithuru",
  storageBucket: "gurumithuru.firebasestorage.app",
  messagingSenderId: "575578916559",
  appId: "1:575578916559:web:82d67902ab46a1fffed9ba",
  measurementId: "G-48HHHHTB7V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;