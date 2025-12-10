// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDTSla_VMUOkXQyTYEQi6yWKCVqY8toRKE",
  authDomain: "livre-magog.firebaseapp.com",
  projectId: "livre-magog",
  storageBucket: "livre-magog.firebasestorage.app",
  messagingSenderId: "321783745514",
  appId: "1:321783745514:web:0f040b4b15288908830093",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
