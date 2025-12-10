import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const firebaseConfig = {
apiKey: "TON_API_KEY",
authDomain: "ton-projet.firebaseapp.com",
projectId: "ton-projet",
storageBucket: "ton-projet.appspot.com",
messagingSenderId: "XXXXXXX",
appId: "1:XXXX:web:XXXX"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
