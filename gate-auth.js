// gate-auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// --- Config Firebase ---
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDFxsqBBGCtRQ_nkSlOvSZNGnxloqeZEto",
    authDomain: "veloxfly-logistica.firebaseapp.com",
    projectId: "veloxfly-logistica",
    storageBucket: "veloxfly-logistica.firebasestorage.app",
    messagingSenderId: "308781988721",
    appId: "1:308781988721:web:14555f6fa1afc4d73954d0"
};

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);

// DOM Elements
const emailInput = document.getElementById("personnel-email");
const passwordInput = document.getElementById("personnel-password");
const loginBtn = document.getElementById("login-btn");
const errorMessage = document.getElementById("error-message");

// Controllo stato login iniziale
onAuthStateChanged(auth, (user) => {
    if(user){
        window.location.href = "gate.html";
    }
});

// Login on button click
loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if(!email || !password){
        errorMessage.textContent = "Inserisci email e password.";
        return;
    }

    try{
        await signInWithEmailAndPassword(auth, email, password);
        // Redirige automaticamente grazie a onAuthStateChanged
    } catch(err){
        console.error("Errore login:", err);
        errorMessage.textContent = "ID Personale o Password non validi.";
    }
});
