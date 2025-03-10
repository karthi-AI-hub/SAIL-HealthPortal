import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAiwj0VizGDAn16CFluh4p6JLXun6vU0-E",
    authDomain: "ehms-sail.firebaseapp.com",
    projectId: "ehms-sail",
    storageBucket: "ehms-sail.firebasestorage.app",
    messagingSenderId: "402071934205",
    appId: "1:402071934205:web:4135c5807886f93c14da94"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, setDoc, doc, getDoc };
