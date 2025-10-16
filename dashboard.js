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

// NUOVI RIFERIMENTI PER I VANTAGGI AGGIUNTIVI (Tipo Ryanair)
const selezioneBagaglio = document.getElementById('selezione_bagaglio');
const selezionePosto = document.getElementById('selezione_posto');
const assicurazioneAnnullamento = document.getElementById('assicurazione_annullamento');
const fastTrack = document.getElementById('fast_track');


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
    
    // Sincronizza i nuovi input Selezioni/Checkbox
    if (selezioneBagaglio) selezioneBagaglio.value = bookingData.selezione_bagaglio || "Base";
    if (selezionePosto) selezionePosto.value = bookingData.selezione_posto || "Standard";
    if (assicurazioneAnnullamento) assicurazioneAnnullamento.checked = bookingData.assicurazione_annullamento || false;
    if (fastTrack) fastTrack.checked = bookingData.fast_track || false;
    
    // Gestione stato di blocco se già confermato
    if (bookingData.stato === "CONFIRMED") {
        btnConferma.disabled = true;
        btnConferma.textContent = `✅ CONFERMATO (${bookingData.codice_prenotazione})`;
        
        // Blocca tutti i campi modificabili
        hotelInput.disabled = true;
        noleggioSelect.disabled = true;
        noteInput.disabled = true;
        if (selezioneBagaglio) selezioneBagaglio.disabled = true;
        if (selezionePosto) selezionePosto.disabled = true;
        if (assicurazioneAnnullamento) assicurazioneAnnullamento.disabled = true;
        if (fastTrack) fastTrack.disabled = true;
    }
}

displayBookingData();

// Listener per aggiornare i campi in tempo reale
hotelInput.addEventListener('input', () => updateLocalData('hotel_scelto', hotelInput.value));
noleggioSelect.addEventListener('change', () => updateLocalData('noleggio_richiesto', noleggioSelect.value));
noteInput.addEventListener('input', () => updateLocalData('note_logistiche', noteInput.value));

// Listener per i nuovi Vantaggi Aggiuntivi (Tipo Ryanair)
if (selezioneBagaglio) selezioneBagaglio.addEventListener('change', () => updateLocalData('selezione_bagaglio', selezioneBagaglio.value));
if (selezionePosto) selezionePosto.addEventListener('change', () => updateLocalData('selezione_posto', selezionePosto.value));
if (assicurazioneAnnullamento) assicurazioneAnnullamento.addEventListener('change', () => updateLocalData('assicurazione_annullamento', assicurazioneAnnullamento.checked));
if (fastTrack) fastTrack.addEventListener('change', () => updateLocalData('fast_track', fastTrack.checked));


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
    
    const codice_prenotazione = generateBookingCode();
    const emailDestinatario = bookingData.contact_email;
    
    // CONTROLLO CRITICO: FIX per errore 422 - Email Destinatario Vuota
    if (!emailDestinatario || emailDestinatario.trim() === "" || emailDestinatario.indexOf('@') === -1) {
        console.error("ERRORE CRITICO: Email del destinatario non valida/vuota.");
        alert("ATTENZIONE: L'email di contatto fornita nel primo modulo non è valida. Impossibile inviare la conferma. (Verifica il salvataggio in index.html)");
        btnConferma.disabled = false;
        btnConferma.textContent = "RITENTA CONFERMA (Email Manca)";
        return; 
    }

    try {
        // 2. Aggiornamento Stato LOCALE 
        updateLocalData('stato', "CONFIRMED");
        updateLocalData('codice_prenotazione', codice_prenotazione);

        // 3. Preparazione e Invio EmailJS (Ora con TUTTI gli extra)
        const templateParams = {
            to_name: bookingData.passenger_name || "Cliente VeloxFly",
            to_email: emailDestinatario, 
            codice_prenotazione,
            partenza: bookingData.partenza || "N/A",
            destinazione: bookingData.destinazione || "N/A",
            data_volo: bookingData.data || "N/A",
            
            // Nuovi Dettagli Extra
            selezione_bagaglio: bookingData.selezione_bagaglio || "Base",
            selezione_posto: bookingData.selezione_posto || "Standard",
            assicurazione_annullamento: bookingData.assicurazione_annullamento ? "Sì (+€30)" : "No",
            fast_track: bookingData.fast_track ? "Sì (+€10)" : "No",

            // Logistica
            hotel_scelto: bookingData.hotel_scelto || "Nessun Hotel",
            noleggio_richiesto: bookingData.noleggio_richiesto || "No",
            note_logistiche: bookingData.note_logistiche || "Nessuna nota"
        };
        
        if (typeof emailjs !== 'undefined') {
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(resp => {
                    console.log(`Email per ${codice_prenotazione} inviata con successo.`, resp);
                })
                .catch(err => { 
                    console.error("ERRORE CRITICO INVIO EMAIL (Controlla EmailJS Dashboard):", err); 
                    alert("Errore invio email! La prenotazione è salvata localmente, ma l'email non è partita. Controlla la console.");
                });
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