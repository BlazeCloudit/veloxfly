import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// =================================================================================
// --- CONFIGURAZIONE FIREBASE ---
// =================================================================================
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

// === RIFERIMENTI UI: GLI ID CORRISPONDONO AL TUO index.html ===
const formPrenotazione = document.getElementById('flight-form');    // ID del form
const inputNome = document.getElementById('passenger_name');        // ID del nome
const inputEmail = document.getElementById('contact_email');        // ID dell'email
const inputPartenza = document.getElementById('partenza');
const inputDestinazione = document.getElementById('destinazione');
const inputData = document.getElementById('data');                  // ID della data


// === LOGICA DI SALVATAGGIO E REINDIRIZZAMENTO ===
if (formPrenotazione) {
    formPrenotazione.addEventListener('submit', async (e) => {
        
        // CRITICO: Blocca il re-invio standard della pagina
        e.preventDefault(); 
        
        const btnPrenota = formPrenotazione.querySelector('button[type="submit"]');
        if (btnPrenota) {
            btnPrenota.disabled = true;
            btnPrenota.textContent = "Prenotazione in corso...";
        }

        // --- CONTROLLO DI SICUREZZA INPUT ---
        if (!inputPartenza || !inputDestinazione || !inputNome || !inputEmail || !inputData) {
            console.error("ERRORE CRITICO: Uno o più ID HTML sono mancanti.");
            alert("Errore interno: controlla la console (F12) per l'errore di riferimento ID.");
            if (btnPrenota) {
                btnPrenota.disabled = false;
                btnPrenota.textContent = "Crea Prenotazione (DRAFT)";
            }
            return;
        }
        // ------------------------------------

        const nuovaPrenotazione = {
            // Usa i valori completi inseriti dall'utente (es. "Reggio Calabria")
            passenger_name: inputNome.value,
            contact_email: inputEmail.value,
            partenza: inputPartenza.value,
            destinazione: inputDestinazione.value,
            data: inputData.value,
            stato: "PENDING",
            // Campi inizializzati per la pagina di conferma
            hotel_scelto: "",
            noleggio_richiesto: "",
            note_logistiche: "",
            codice_prenotazione: "N/A"
        };

        try {
            // 1. Salva il documento su Firestore
            const docRef = await addDoc(collection(db, "velox_prenotazioni"), nuovaPrenotazione);

            // 2. Salva l'ID nel browser (CRITICO per la pagina successiva)
            localStorage.setItem('prenotazione_id', docRef.id);
            
            // 3. Reindirizza alla pagina di configurazione
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
} else {
    // Messaggio che appare solo se l'ID del form è sbagliato (ma ora sappiamo che è 'flight-form')
    console.error("Elemento 'flight-form' non trovato in index.html! La logica non è stata avviata.");
}