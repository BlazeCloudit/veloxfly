import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// =================================================================================
// --- CONFIGURAZIONE FIREBASE ---
// =================================================================================
// NOTA: Utilizza la configurazione già esistente
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

// === RIFERIMENTI UI (ASSUMENDO GLI ID STANDARD DEL MODULO) ===
// DEVI ASSICURARTI CHE QUESTI ID SIANO ESATTAMENTE GLI STESSI NEL TUO index.html
const formPrenotazione = document.getElementById('form-prenotazione');
const inputNome = document.getElementById('nome_passeggero');
const inputEmail = document.getElementById('email_contatto');
// I campi qui sotto ora prenderanno il valore testuale inserito dall'utente
const inputPartenza = document.getElementById('partenza');
const inputDestinazione = document.getElementById('destinazione');
const inputData = document.getElementById('data_viaggio');


// === LOGICA DI SALVATAGGIO E REINDIRIZZAMENTO ===
if (formPrenotazione) {
    formPrenotazione.addEventListener('submit', async (e) => {
        
        // CRITICO: Impedisce il ricaricamento della pagina e permette a JS di agire
        e.preventDefault(); 
        
        // Ottieni il pulsante e disabilitalo
        const btnPrenota = formPrenotazione.querySelector('button[type="submit"]');
        if (btnPrenota) {
            btnPrenota.disabled = true;
            btnPrenota.textContent = "Prenotazione in corso...";
        }

        // Estrai i valori testuali completi
        const partenzaValue = inputPartenza.value;
        const destinazioneValue = inputDestinazione.value;
        
        // Controlla che i campi essenziali non siano vuoti (validazione di base)
        if (!inputNome.value || !inputEmail.value || !partenzaValue || !destinazioneValue || !inputData.value) {
            alert("Per favore, compila tutti i campi obbligatori.");
             if (btnPrenota) {
                btnPrenota.disabled = false;
                btnPrenota.textContent = "Prenota ora";
            }
            return;
        }

        const nuovaPrenotazione = {
            passenger_name: inputNome.value,
            contact_email: inputEmail.value,
            // Uso i nomi delle città completi
            partenza: partenzaValue,
            destinazione: destinazioneValue,
            data: inputData.value,
            stato: "PENDING",
            // Campi inizializzati
            hotel_scelto: "",
            noleggio_richiesto: "",
            note_logistiche: "",
            codice_prenotazione: "N/A"
        };

        try {
            // Salva il documento su Firestore
            const docRef = await addDoc(collection(db, "velox_prenotazioni"), nuovaPrenotazione);

            // Salva l'ID nel browser (necessario per prenotazione.html)
            localStorage.setItem('prenotazione_id', docRef.id);
            
            // Reindirizza alla pagina di configurazione (CRITICO)
            window.location.href = "prenotazione.html"; 

        } catch(err) {
            console.error("ERRORE CRITICO SALVATAGGIO FIRESTORE:", err);
            alert("Errore durante la prenotazione. Controlla la console per i dettagli.");
            
            if (btnPrenota) {
                btnPrenota.disabled = false;
                btnPrenota.textContent = "Prenota ora";
            }
        }
    });
} else {
    // Questo è il messaggio di errore se l'ID 'form-prenotazione' non è in index.html
    console.error("Elemento 'form-prenotazione' non trovato in index.html! IL CODICE NON PUÒ AVVIARE LA PRENOTAZIONE.");
}
