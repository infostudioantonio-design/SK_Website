// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-Np3yipFAElpqRllriV-Z4FecvDCXkVc",
  authDomain: "superkonnectedwebsite.firebaseapp.com",
  projectId: "superkonnectedwebsite",
  storageBucket: "superkonnectedwebsite.firebasestorage.app",
  messagingSenderId: "1003348135208",
  appId: "1:1003348135208:web:17a5cdbe77b98783be541d",
  measurementId: "G-N6L6HBNCLK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
