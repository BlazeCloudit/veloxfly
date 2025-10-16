import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// === CONFIGURAZIONE FIREBASE ===
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

// === RIFERIMENTI UI (MATCHANO index.html) ===
const formPrenotazione = document.getElementById('flight-form');
const inputNome = document.getElementById('passenger_name');
const inputEmail = document.getElementById('contact_email');
const inputPartenza = document.getElementById('partenza');
const inputDestinazione = document.getElementById('destinazione');
const inputData = document.getElementById('data');
const rotteList = document.getElementById('rotte-list'); 

// === LOGICA AGGIUNTA: POPOLAMENTO ROTTE ===
const rotteDisponibili = [
    "Milano Linate (LIN)", "Roma Fiumicino (FCO)", "Torino Caselle (TRN)", 
    "Venezia Tessera (VCE)", "Napoli Capodichino (NAP)", "Bari Palese (BRI)", 
    "Palermo Falcone Borsellino (PMO)", "Catania Fontanarossa (CTA)", 
    "Reggio Calabria (REG)", "Genova Sestri (GOA)"
];

if (rotteList) {
    rotteDisponibili.forEach(rotta => {
        const option = document.createElement('option');
        option.value = rotta;
        rotteList.appendChild(option);
    });
}

// === LOGICA DI SALVATAGGIO E REINDIRIZZAMENTO ===
if (formPrenotazione) {
    formPrenotazione.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const btnPrenota = formPrenotazione.querySelector('button[type="submit"]');
        if (btnPrenota) {
            btnPrenota.disabled = true;
            btnPrenota.textContent = "Prenotazione in corso...";
        }

        // --- CONTROLLO DI VALIDAZIONE BASE ---
        if (!inputPartenza.value || !inputDestinazione.value || !inputNome.value || !inputEmail.value || !inputData.value) {
            alert("Per favore, compila tutti i campi obbligatori.");
            if (btnPrenota) {
                btnPrenota.disabled = false;
                btnPrenota.textContent = "Crea Prenotazione (DRAFT)";
            }
            return;
        }
        // ------------------------------------

        const nuovaPrenotazione = {
            passenger_name: inputNome.value,
            contact_email: inputEmail.value,
            partenza: inputPartenza.value,
            destinazione: inputDestinazione.value,
            data: inputData.value,
            stato: "PENDING",
            hotel_scelto: "",
            noleggio_richiesto: "",
            note_logistiche: "",
            codice_prenotazione: "N/A"
        };

        try {
            const docRef = await addDoc(collection(db, "velox_prenotazioni"), nuovaPrenotazione);
            localStorage.setItem('prenotazione_id', docRef.id);
            
            // Reindirizzamento critico
            window.location.href = "prenotazione.html"; 

        } catch(err) {
            console.error("ERRORE CRITICO SALVATAGGIO FIRESTORE:", err);
            alert("Errore grave: Impossibile salvare la prenotazione. Controlla la console.");
            
            if (btnPrenota) {
                btnPrenota.disabled = false;
                btnPrenota.textContent = "Crea Prenotazione (DRAFT)";
            }
        }
    });
}