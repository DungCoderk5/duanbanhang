// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAT-veuw2hyNFNCDLxJFQLsO6ahI7cyiAE",
  authDomain: "dangnhap-43729.firebaseapp.com",
  projectId: "dangnhap-43729",
  storageBucket: "dangnhap-43729.firebasestorage.app",
  messagingSenderId: "469179012608",
  appId: "1:469179012608:web:28aee3bf3342e42a322ae5",
  measurementId: "G-SQZKHW9TS5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app); 
// Tạo provider cho Google và Facebook
const googleProvider = new GoogleAuthProvider();


export { auth, googleProvider,db };