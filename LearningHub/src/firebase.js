import {getAuth} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// Ihre Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDz5uNfFA3Tegct_7Mdd7Kt6wYh2RqF_1g",
  authDomain: "learninghub-6bf1a.firebaseapp.com",
  projectId: "learninghub-6bf1a",
  storageBucket: "learninghub-6bf1a.appspot.com",
  messagingSenderId: "883966897374",
  appId: "1:883966897374:web:cc84523201a64ce53a64f"
};

// Firebase starten
const app = initializeApp(firebaseConfig);

// 🔥 DAS HAT BEI IHNEN GEFEHLT:
export const db = getFirestore(app);
export const storage = getStorage(app); 
export const auth = getAuth(app);