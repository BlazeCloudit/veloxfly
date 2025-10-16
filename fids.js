// fids.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where, orderBy } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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

// DOM
const fidsContainer = document.getElementById("fids-container");
const localTimeEl = document.getElementById("local-time");

// Funzione aggiornamento orario
function updateLocalTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('it-IT');
    localTimeEl.textContent = `Gate 1 - Ora Locale: ${timeStr}`;
}
setInterval(updateLocalTime, 1000);
updateLocalTime();

// Helper per badge colore
function getStatusBadge(stato){
    switch(stato){
        case "CONFIRMED": return '<span class="badge bg-warning text-dark">CONFIRMED</span>';
        case "CHECKED_IN": return '<span class="badge bg-info text-dark">CHECKED IN</span>';
        case "BOARDED": return '<span class="badge bg-success">BOARDED</span>';
        default: return `<span class="badge bg-secondary">${stato}</span>`;
    }
}

// Helper generazione gate fittizio
function getGate(id){
    const letters = ['A','B','C','D','E','F'];
    const letter = letters[id.charCodeAt(0) % letters.length];
    const number = (parseInt(id.slice(-2), 16) % 20 + 1).toString().padStart(2,'0');
    return `${letter}${number}`;
}

// Query realtime
const bookingsRef = collection(db, "velox_prenotazioni");
const q = query(bookingsRef, where("stato", "in", ["CONFIRMED","CHECKED_IN","BOARDED"]), orderBy("data","asc"));

onSnapshot(q, (snapshot) => {
    let html = `
        <table class="table table-dark table-striped text-white">
            <thead>
                <tr>
                    <th>Volo / Codice</th>
                    <th>Destinazione</th>
                    <th>Ora Prevista</th>
                    <th>Stato</th>
                    <th>Gate</th>
                </tr>
            </thead>
            <tbody>
    `;
    snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        html += `
            <tr>
                <td>${data.codice_prenotazione || "-"}</td>
                <td>${data.destinazione || "-"}</td>
                <td>${data.data || "-"}</td>
                <td>${getStatusBadge(data.stato)}</td>
                <td>${getGate(docSnap.id)}</td>
            </tr>
        `;
    });
    html += `</tbody></table>`;
    fidsContainer.innerHTML = html;
});
