// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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

// Reference alla collezione
const bookingsRef = collection(db, "velox_prenotazioni");

// Query ordinata per 'creato_il' decrescente
const q = query(bookingsRef, orderBy("createdAt", "desc"));

// Container HTML
const container = document.getElementById("bookings-container");

// Funzione per renderizzare badge colore stato
function getBadge(stato) {
  switch(stato){
    case "DRAFT": return '<span class="badge bg-info">DRAFT</span>';
    case "CONFIRMED": return '<span class="badge bg-success">CONFIRMED</span>';
    default: return `<span class="badge bg-secondary">${stato || "N/A"}</span>`;
  }
}

// Funzione per renderizzare la tabella
function renderTable(docs){
  let html = `
    <table class="table table-striped table-hover align-middle">
      <thead class="table-dark">
        <tr>
          <th>Stato</th>
          <th>Codice Prenotazione</th>
          <th>Passeggero</th>
          <th>Rotta</th>
          <th>Data Volo</th>
          <th>Hotel</th>
          <th>Note</th>
          <th>Doc ID</th>
        </tr>
      </thead>
      <tbody>
  `;

  docs.forEach(doc => {
    const data = doc.data();
    html += `
      <tr>
        <td>${getBadge(data.stato)}</td>
        <td>${data.codice_prenotazione || "N/A"}</td>
        <td>${data.passenger_name || "-"}</td>
        <td>${(data.partenza || "-")} → ${(data.destinazione || "-")}</td>
        <td>${data.data || "-"}</td>
        <td>${data.hotel_scelto || "-"}</td>
        <td>${data.note_logistiche || "-"}</td>
        <td>${doc.id}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// Listener in tempo reale
onSnapshot(q, snapshot => {
  renderTable(snapshot.docs);
});
