// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAL0TfblFl4iWoblgM1ss08Wip7S-XG3gY",
  authDomain: "house-inventory-app.firebaseapp.com",
  projectId: "house-inventory-app",
  storageBucket: "house-inventory-app.firebasestorage.app",
  messagingSenderId: "459816820754",
  appId: "1:459816820754:web:574de44bd9b674252bb8cb",
  measurementId: "G-DNPEYXYMEH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

export { auth, db, storage };