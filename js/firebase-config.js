// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7a0MMxAmzFxZVJuwiEk457fSHZlnSK7I",
    authDomain: "kaiistore.firebaseapp.com",
    databaseURL: "https://kaiistore-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kaiistore",
    storageBucket: "kaiistore.firebasestorage.app",
    messagingSenderId: "756017530353",
    appId: "1:756017530353:web:134154b88716b794583050"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();