import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrmfbGaQDD7JsAHHG2CG6k4XF6e5FSC1Y",
  authDomain: "appmasters-7ac91.firebaseapp.com",
  projectId: "appmasters-7ac91",
  storageBucket: "appmasters-7ac91.firebasestorage.app",
  messagingSenderId: "892957364899",
  appId: "1:892957364899:web:7269da23d3ef4f3559a516",
  measurementId: "G-F69KJ2F0HL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
