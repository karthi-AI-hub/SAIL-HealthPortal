import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAgTAJ53NIso0aZufNJIlbBYOGedMELY2w",
    authDomain: "work-vortex.firebaseapp.com",
    projectId: "work-vortex",
    storageBucket: "work-vortex.firebasestorage.app",
    messagingSenderId: "873074055372",
    appId: "1:873074055372:web:b807af8f9ed9623aa34a69"
  };
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
