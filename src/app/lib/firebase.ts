import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyayp4KE-rlvZBV1VvVjuBHJdX57Om5aI",
  authDomain: "lms-3itc-edu.firebaseapp.com",
  projectId: "lms-3itc-edu",
  storageBucket: "lms-3itc-edu.firebasestorage.app",
  messagingSenderId: "949329559808",
  appId: "1:949329559808:web:926dffc680dde2d4f8f3e5"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
