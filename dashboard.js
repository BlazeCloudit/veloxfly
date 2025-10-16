import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';

// =================================================================================
// --- CONFIGURAZIONE FIREBASE (COMPLETATA) ---
// =================================================================================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDFxsqBBGCtRQ_nkSlOvSZNGnxloqeZEto", 
    authDomain: "veloxfly-logistica.firebaseapp.com",
    projectId: "veloxfly-logistica",
    storageBucket: "veloxfly-logistica.firebasestorage.app",
    messagingSenderId: "308781988721", 
    appId: "1:308781988721:web:14555f6fa1afc4d73954d0"
};

// =================================================================================
// --- CONFIGURAZIONE EMAILJS (COMPLETATA) ---
// =================================================================================
const EMAILJS_PUBLIC_KEY = "iH31rni3A7perWpQB";
const EMAILJS_SERVICE_ID = "service_vxf_smtp";
const EMAILJS_TEMPLATE_ID = "template_5340kpv"; 

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

// === RIFERIMENTI UI ===
const passengerNameDisplay = document.getElementById('passenger_name_display');
const contactEmailDisplay = document.getElementById('contact_email_display');
const partenzaDisplay = document.getElementById('partenza_display');
const destinazioneDisplay = document.getElementById('destinazione_display');
const dataDisplay = document.getElementById('data_display');

const hotelInput = document.getElementById('hotel_scelto');
const noleggioSelect = document.getElementById('noleggio_richiesto');
const noteInput = document.getElementById('note_logistiche');
const btnConferma = document.getElementById('conferma-prenotazione');

// === GESTIONE PRENOTAZIONE E REINDIRIZZAMENTO ===
const prenotazioneId = localStorage.getItem('prenotazione_id');
if (!prenotazioneId) {
    console.error("Nessuna prenotazione trovata. Ritorno alla home.");
    window.location.href = "index.html";
}

const prenRef = doc(db, "velox_prenotazioni", prenotazioneId);

// === LISTENER REAL-TIME (onSnapshot) ===
onSnapshot(prenRef, snap => {
    if (!snap.exists()) {
        console.error("Prenotazione non trovata o rimossa. Verifica Firestore.");
        return;
    }
    
    const data = snap.data();
    
    // Aggiorna Dati di Sola Lettura
    passengerNameDisplay.value = data.passenger_name || "";
    contactEmailDisplay.value = data.contact_email || "";
    partenzaDisplay.value = data.partenza || "";
    destinazioneDisplay.value = data.destinazione || "";
    dataDisplay.value = data.data || "";

    // Sincronizza Input Utente
    hotelInput.value = data.hotel_scelto || "";
    noleggioSelect.value = data.noleggio_richiesto || "";
    noteInput.value = data.note_logistiche || "";

    // Gestione stato di blocco
    if (data.stato === "CONFIRMED") {
        btnConferma.disabled = true;
        btnConferma.textContent = `✅ CONFERMATO (${data.codice_prenotazione})`;
        hotelInput.disabled = true;
        noleggioSelect.disabled = true;
        noteInput.disabled = true;
    }
});

// === ASCOLTATORI PER AGGIORNAMENTO REAL-TIME ===
hotelInput.addEventListener('input', () => updateDoc(prenRef, { hotel_scelto: hotelInput.value }).catch(console.error));
noleggioSelect.addEventListener('change', () => updateDoc(prenRef, { noleggio_richiesto: noleggioSelect.value }).catch(console.error));
noteInput.addEventListener('input', () => updateDoc(prenRef, { note_logistiche: noteInput.value }).catch(console.error));

/** 
 * Genera un codice di prenotazione univoco.
 */
function generateBookingCode() {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth()+1).padStart(2,'0');
    const DD = String(now.getDate()).padStart(2,'0');
    const HH = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const rand = String(Math.floor(Math.random()*9000)+1000);
    return `VXF-${YYYY}${MM}${DD}-${HH}${mm}-${rand}`;
}

// === INIZIALIZZAZIONE EMAILJS ===
emailjs.init(EMAILJS_PUBLIC_KEY);


// === LOGICA DI CONFERMA E INVIO EMAIL ===
btnConferma.addEventListener('click', async () => {
    btnConferma.disabled = true;
    btnConferma.textContent = "Invio conferma in corso...";
    
    const codice_prenotazione = generateBookingCode();

    try {
        // 1. Aggiornamento Stato in Firestore
        await updateDoc(prenRef, { 
            stato: "CONFIRMED", 
            codice_prenotazione, 
            confermato_il: new Date().toISOString() 
        });

        // 2. Preparazione Parametri Email (recuperando i valori attuali degli input)
        const templateParams = {
            to_name: passengerNameDisplay.value || "Cliente VeloxFly",
            to_email: contactEmailDisplay.value || "",
            codice_prenotazione,
            partenza: partenzaDisplay.value || "N/A",
            destinazione: destinazioneDisplay.value || "N/A",
            data_volo: dataDisplay.value || "N/A",
            hotel_scelto: hotelInput.value || "Nessun Hotel",
            noleggio_richiesto: noleggioSelect.value || "No",
            note_logistiche: noteInput.value || "Nessuna nota"
        };

        // 3. Invio EmailJS 
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(resp => {
                console.log(`Prenotazione ${codice_prenotazione} confermata. Email inviata con successo.`, resp);
            })
            .catch(err => { 
                console.error("Errore invio email (Controlla le credenziali SendGrid e EmailJS):", err); 
                    console.warn(`Prenotazione ${codice_prenotazione} confermata, ma ERRORE invio email. Controlla la console.`); 
            });
        
        // Aggiorna lo stato visivo della conferma
        btnConferma.disabled = true; 
        btnConferma.textContent = `✅ CONFERMATO (${codice_prenotazione})`;


    } catch(err) {
        console.error("Errore durante la conferma critica in Firestore:", err);
        console.error("ERRORE CRITICO. Impossibile confermare la prenotazione in Firestore.");
        btnConferma.disabled = false;
        btnConferma.textContent = "RITENTA CONFERMA ✅";
    }
});