// login.js
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

// Controllo stato utente già loggato
onAuthStateChanged(auth, user => {
  if (user) {
    window.location.href = "admin.html";
  }
});

// Elementi DOM
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const errorMsg = document.getElementById("error-msg");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  errorMsg.textContent = ""; // reset messaggio

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // reindirizza dopo login
    window.location.href = "admin.html";
  } catch (error) {
    console.error("Login error:", error);
    errorMsg.textContent = "Credenziali non valide. Riprova.";
  }
});
