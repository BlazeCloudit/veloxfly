// checkin.js
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
const form = document.getElementById("checkin-form");
const codeInput = document.getElementById("checkin-code-input");
const passengerDetails = document.getElementById("passenger-details");

// Stato del documento trovato
let currentDoc = null;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = codeInput.value.trim().toUpperCase();
    passengerDetails.innerHTML = "";
    currentDoc = null;

    if(!code) return;

    const bookingsRef = collection(db, "velox_prenotazioni");
    const q = query(bookingsRef, where("codice_prenotazione", "==", code));
    const querySnapshot = await getDocs(q);

    if(querySnapshot.empty){
        passengerDetails.innerHTML = `<div class="alert alert-danger text-center">Prenotazione non valida o Codice errato.</div>`;
        return;
    }

    // Assume un solo documento
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    currentDoc = docSnap;

    // Render dettagli
    let html = `
      <ul class="list-group mb-3">
        <li class="list-group-item"><strong>Passeggero:</strong> ${data.passenger_name || "-"}</li>
        <li class="list-group-item"><strong>Rotta:</strong> ${(data.partenza || "-")} → ${(data.destinazione || "-")}</li>
        <li class="list-group-item"><strong>Hotel:</strong> ${data.hotel_scelto || "-"}</li>
        <li class="list-group-item"><strong>Stato:</strong> ${data.stato || "N/A"}</li>
      </ul>
      <div class="d-grid">
        <button id="checkin-btn" class="btn btn-success"></button>
      </div>
    `;
    passengerDetails.innerHTML = html;

    const checkinBtn = document.getElementById("checkin-btn");

    // Logica pulsante in base allo stato
    if(data.stato === "CONFIRMED"){
        checkinBtn.textContent = "Procedi al Check-in";
        checkinBtn.disabled = false;
        checkinBtn.style.display = "block";
    } else if(data.stato === "CHECKED_IN"){
        checkinBtn.textContent = "Imbarco Eseguito";
        checkinBtn.disabled = true;
        checkinBtn.style.display = "block";
    } else if(data.stato === "BOARDED"){
        passengerDetails.innerHTML += `<div class="alert alert-info text-center mt-2">Passeggero già a bordo.</div>`;
        checkinBtn.style.display = "none";
    } else {
        checkinBtn.style.display = "none";
    }

    // Event listener Check-in
    checkinBtn.addEventListener("click", async () => {
        if(!currentDoc) return;
        const docRef = doc(db, "velox_prenotazioni", currentDoc.id);
        try{
            await updateDoc(docRef, {
                stato: "CHECKED_IN",
                checkin_time: new Date().toISOString()
            });
            checkinBtn.textContent = "Check-in Completato ✅";
            checkinBtn.disabled = true;
        } catch(err){
            console.error("Errore aggiornamento check-in:", err);
            alert("Errore durante il check-in. Riprova.");
        }
    });
});
