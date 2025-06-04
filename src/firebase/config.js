import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Optional: Only import analytics in browser (not SSR-safe)
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAL0TfblFl4iWoblgM1ss08Wip7S-XG3gY",
  authDomain: "house-inventory-app.firebaseapp.com",
  projectId: "house-inventory-app",
  storageBucket: "house-inventory-app.appspot.com",
  messagingSenderId: "459816820754",
  appId: "1:459816820754:web:574de44bd9b674252bb8cb",
  measurementId: "G-DNPEYXYMEH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Optional analytics (safe-check for browser)
let analytics = null;
isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

export { app, auth, db, storage, analytics };
