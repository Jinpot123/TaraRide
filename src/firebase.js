
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBWGL12-i5IirCfN2pSQT1Smg65Ps0i7cE",
  authDomain: "tararide-booking-app.firebaseapp.com",
  projectId: "tararide-booking-app",
  storageBucket: "tararide-booking-app.firebasestorage.app",
  messagingSenderId: "992326135365",
  appId: "1:992326135365:web:b4f580ecd7e7f3f9483d2c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
