//firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getFirestore } from "firebase/firestore";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBc7AlB0Hi3vVrfO51OxprtlKbsR8S-TKA",
    authDomain: "videocall-edae7.firebaseapp.com",
    projectId: "videocall-edae7",
    storageBucket: "videocall-edae7.firebasestorage.app",
    messagingSenderId: "135303472745",
    appId: "1:135303472745:web:13af0b75d23250e73ee4f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const db = initializeFirestore(app, {
});
export const auth = getAuth(app);