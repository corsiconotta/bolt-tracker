import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC6G-gO1G60_1UkTiGkHWVeAkrLqbdaMWA",
  authDomain: "finaltracker-8bb3a.firebaseapp.com",
  projectId: "finaltracker-8bb3a",
  storageBucket: "finaltracker-8bb3a.firebasestorage.app",
  messagingSenderId: "171716971310",
  appId: "1:171716971310:web:10552c51258010eef288bf"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);