import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// =================================================================================
// --- CONFIGURAZIONE FIREBASE (DEVE ESSERE INCLUSA QUI) ---
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

// === RIFERIMENTI UI (Controlla che questi ID esistano in index.html) ===
const formPrenotazione = document.getElementById('form-prenotazione'); // Assicurati di avere questo ID sul tuo <form>
const inputNome = document.getElementById('nome_passeggero');
const inputEmail = document.getElementById('email_contatto');
const inputPartenza = document.getElementById('partenza');
const inputDestinazione = document.getElementById('destinazione');
const inputData = document.getElementById('data_viaggio');


// === LOGICA DI SALVATAGGIO SU FIRESTORE E REINDIRIZZAMENTO ===
formPrenotazione.addEventListener('submit', async (e) => {
    
    // 1. CRITICO: Impedisce il ricaricamento della pagina standard del modulo
    e.preventDefault(); 
    
    // Disabilita il pulsante durante l'invio (migliora UX)
    const btnPrenota = formPrenotazione.querySelector('button[type="submit"]');
    btnPrenota.disabled = true;
    btnPrenota.textContent = "Prenotazione in corso...";

    const nuovaPrenotazione = {
        passenger_name: inputNome.value,
        contact_email: inputEmail.value,
        partenza: inputPartenza.value,
        destinazione: inputDestinazione.value,
        data: inputData.value,
        stato: "PENDING", // Stato iniziale della prenotazione
        // Campi per prenotazione.html
        hotel_scelto: "",
        noleggio_richiesto: "",
        note_logistiche: "",
        codice_prenotazione: "N/A"
    };

    try {
        // 2. Salva il documento su Firestore
        const docRef = await addDoc(collection(db, "velox_prenotazioni"), nuovaPrenotazione);

        // 3. Salva l'ID nel browser (CRITICO per la pagina successiva)
        localStorage.setItem('prenotazione_id', docRef.id);
        
        // 4. Reindirizza alla pagina di configurazione (Avviene solo in caso di successo)
        window.location.href = "prenotazione.html"; 

    } catch(err) {
        // Gestione degli errori di salvataggio
        console.error("ERRORE CRITICO SALVATAGGIO FIRESTORE:", err);
        alert("Errore durante la prenotazione. Controlla la console.");
        
        btnPrenota.disabled = false;
        btnPrenota.textContent = "Prenota ora";
    }
});