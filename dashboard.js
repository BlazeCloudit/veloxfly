// NON USA ALCUN DATABASE ESTERNO: solo Local Storage e EmailJS

// === CONFIGURAZIONE EMAILJS ===
const EMAILJS_PUBLIC_KEY = "iH31rni3A7perWpQB";
const EMAILJS_SERVICE_ID = "service_vxf_smtp";
const EMAILJS_TEMPLATE_ID = "template_5340kpv"; 

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

// === GESTIONE PRENOTAZIONE LOCALE ===
const prenotazioneId = localStorage.getItem('prenotazione_id');
const storageKey = `prenotazione_${prenotazioneId}`;

if (!prenotazioneId) {
    window.location.href = "index.html"; 
}
let bookingData = JSON.parse(localStorage.getItem(storageKey));

if (!bookingData) {
    alert("Dati prenotazione non trovati.");
    window.location.href = "index.html";
}

// Funzione per aggiornare e salvare i dati nella memoria del browser
function updateLocalData(field, value) {
    bookingData[field] = value;
    localStorage.setItem(storageKey, JSON.stringify(bookingData));
}

function displayBookingData() {
    // Aggiorna campi di sola lettura
    passengerNameDisplay.value = bookingData.passenger_name || "";
    contactEmailDisplay.value = bookingData.contact_email || "";
    partenzaDisplay.value = bookingData.partenza || "";
    destinazioneDisplay.value = bookingData.destinazione || "";
    dataDisplay.value = bookingData.data || "";

    // Sincronizza input utente con i dati eventualmente salvati
    hotelInput.value = bookingData.hotel_scelto || "";
    noleggioSelect.value = bookingData.noleggio_richiesto || "";
    noteInput.value = bookingData.note_logistiche || "";
    
    // Gestione stato di blocco se già confermato
    if (bookingData.stato === "CONFIRMED") {
        btnConferma.disabled = true;
        btnConferma.textContent = `✅ CONFERMATO (${bookingData.codice_prenotazione})`;
        hotelInput.disabled = true;
        noleggioSelect.disabled = true;
        noteInput.disabled = true;
    }
}

displayBookingData();

// Listener per aggiornare i campi in tempo reale
hotelInput.addEventListener('input', () => updateLocalData('hotel_scelto', hotelInput.value));
noleggioSelect.addEventListener('change', () => updateLocalData('noleggio_richiesto', noleggioSelect.value));
noteInput.addEventListener('input', () => updateLocalData('note_logistiche', noteInput.value));


/**
 * Funzione CRITICA: Genera il codice di prenotazione univoco (la "risposta").
 */
function generateBookingCode() {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth()+1).padStart(2,'0');
    const DD = String(now.getDate()).padStart(2,'0');
    const HH = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const rand = String(Math.floor(Math.random()*9000)+1000);
    // Questo è il codice di risposta finale: VXF-AAAA-MMGG-HHmm-XXXX
    return `VXF-${YYYY}${MM}${DD}-${HH}${mm}-${rand}`;
}

// === INIZIALIZZAZIONE EMAILJS ===
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}


// === LOGICA DI CONFERMA E INVIO EMAIL (LA RISPOSTA FINALE) ===
btnConferma.addEventListener('click', async () => {
    btnConferma.disabled = true;
    btnConferma.textContent = "Invio conferma in corso...";
    
    // 🛑 1. GENERA IL CODICE DI RISPOSTA
    const codice_prenotazione = generateBookingCode();

    try {
        // 2. Aggiornamento Stato LOCALE 
        updateLocalData('stato', "CONFIRMED");
        updateLocalData('codice_prenotazione', codice_prenotazione);

        // 3. Preparazione e Invio EmailJS (usa i dati aggiornati)
        const templateParams = {
            to_name: bookingData.passenger_name || "Cliente VeloxFly",
            to_email: bookingData.contact_email || "",
            codice_prenotazione,
            partenza: bookingData.partenza || "N/A",
            destinazione: bookingData.destinazione || "N/A",
            data_volo: bookingData.data || "N/A",
            hotel_scelto: hotelInput.value || "Nessun Hotel",
            noleggio_richiesto: noleggioSelect.value || "No",
            note_logistiche: noteInput.value || "Nessuna nota"
        };
        
        if (typeof emailjs !== 'undefined') {
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        }
        
        // 4. Aggiorna lo stato visivo finale
        btnConferma.disabled = true; 
        btnConferma.textContent = `✅ CONFERMATO (${codice_prenotazione})`;


    } catch(err) {
        console.error("Errore durante la simulazione di conferma:", err);
        btnConferma.disabled = false;
        btnConferma.textContent = "RITENTA CONFERMA ✅";
    }
});