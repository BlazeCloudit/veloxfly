import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDFxsqBBGCtRQ_nkSlOvSZNGnxloqeZEto",
    authDomain: "veloxfly-logistica.firebaseapp.com",
    projectId: "veloxfly-logistica",
    storageBucket: "veloxfly-logistica.firebasestorage.app",
    messagingSenderId: "308781988721",
    appId: "1:308781988721:web:14555f6fa1afc4d73954d0"
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-code-input');
const resultsContainer = document.getElementById('results-container');

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = searchInput.value.trim().toUpperCase();
    resultsContainer.innerHTML = '<p>Ricerca in corso...</p>';

    try {
        const prenotazioniRef = collection(db, "velox_prenotazioni");
        const q = query(prenotazioniRef, where("codice_prenotazione", "==", code));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            resultsContainer.innerHTML = `<div class="alert alert-danger">Prenotazione non trovata.</div>`;
            return;
        }

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const boardingInfo = data.boarding_personnel_uid ? `<p class="text-muted"><small>Processato da: Personale Logistico (Audit ID registrato)</small></p>` : '';
            resultsContainer.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Prenotazione: ${data.codice_prenotazione || 'N/A'}</h5>
                        <p class="card-text"><strong>Rotta:</strong> ${data.partenza} → ${data.destinazione}</p>
                        <p class="card-text"><strong>Data Voli:</strong> ${data.data}</p>
                        <p class="card-text"><strong>Stato:</strong> 
                            <span class="badge ${data.stato === 'CONFIRMED' ? 'bg-warning' : data.stato === 'CHECKED_IN' ? 'bg-info' : data.stato === 'BOARDED' ? 'bg-success' : 'bg-secondary'}">
                                ${data.stato}
                            </span>
                        </p>
                        ${boardingInfo}
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error(err);
        resultsContainer.innerHTML = `<div class="alert alert-danger">Errore durante la ricerca. Riprova più tardi.</div>`;
    }
});
    