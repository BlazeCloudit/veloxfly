// gate.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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
const db = getFirestore(app);

// DOM Elements
const codeInput = document.getElementById("boarding-code-input");
const statusDisplay = document.getElementById("status-display");
const boardingArea = document.getElementById("boarding-area");
const passengerNameEl = document.getElementById("passenger-name");
const flightRouteEl = document.getElementById("flight-route");
const boardBtn = document.getElementById("board-btn");

// Documento corrente trovato
let currentDoc = null;

// Funzione per ricerca prenotazione
async function searchBooking(code) {
    if(!code) return;

    const bookingsRef = collection(db, "velox_prenotazioni");
    const q = query(bookingsRef, where("codice_prenotazione", "==", code.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if(querySnapshot.empty){
        boardingArea.style.display = "none";
        statusDisplay.innerHTML = `<div class="alert alert-danger">Codice Prenotazione Non Valido ❌</div>`;
        currentDoc = null;
        return;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    currentDoc = docSnap;

    passengerNameEl.textContent = `Passeggero: ${data.passenger_name || "-"}`;
    flightRouteEl.textContent = `Rotta: ${(data.partenza || "-")} → ${(data.destinazione || "-")}`;
    boardingArea.style.display = "block";

    if(data.stato === "CONFIRMED" || data.stato === "CHECKED_IN"){
        boardBtn.disabled = false;
        statusDisplay.innerHTML = `<div class="alert alert-success">Prenotazione valida. Procedere all'imbarco.</div>`;
    } else if(data.stato === "BOARDED"){
        boardBtn.disabled = true;
        boardingArea.style.display = "block";
        statusDisplay.innerHTML = `<div class="alert alert-info">Passeggero già a bordo. Stato: BOARDED ✅</div>`;
    } else {
        boardBtn.disabled = true;
        statusDisplay.innerHTML = `<div class="alert alert-warning">Stato prenotazione: ${data.stato || "N/A"}</div>`;
    }
}

// Event listener per Enter
codeInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter") {
        e.preventDefault();
        searchBooking(codeInput.value.trim());
    }
});

// Event listener bottone board
boardBtn.addEventListener("click", async () => {
    if(!currentDoc) return;

    const docRef = doc(db, "velox_prenotazioni", currentDoc.id);
    try{
        await updateDoc(docRef, {
            stato: "BOARDED",
            boarding_time: new Date().toISOString()
        });
        boardBtn.disabled = true;
        statusDisplay.innerHTML = `<div class="alert alert-success">IMBARCATO CON SUCCESSO. Prossimo passeggero. ✅</div>`;
        boardingArea.style.display = "none";
        codeInput.value = "";
        codeInput.focus();
    } catch(err){
        console.error("Errore durante l'imbarco:", err);
        statusDisplay.innerHTML = `<div class="alert alert-danger">Errore durante l'imbarco. Riprova.</div>`;
    }
});
