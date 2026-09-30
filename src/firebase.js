import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBc5adhoRRbHlOZWPGIj8SWdko9abAzoXg",
  authDomain: "reuniteai-def13.firebaseapp.com",
  projectId: "reuniteai-def13",
  storageBucket: "reuniteai-def13.firebasestorage.app",
  messagingSenderId: "216196915411",
  appId: "1:216196915411:web:7caced9d9b219129117426",
  measurementId: "G-12GY165GV6"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;