// NON USA ALCUN DATABASE ESTERNO: solo Local Storage e EmailJS

// === CONFIGURAZIONE EMAILJS (Le tue chiavi) ===
// RICORDA DI INSERIRE LE TUE CHIAVI QUI SE NON LO HAI GIÀ FATTO
const EMAILJS_PUBLIC_KEY = "iH31rni3A7perWpQB";
const EMAILJS_SERVICE_ID = "service_vxf_smtp";
const EMAILJS_TEMPLATE_ID = "template_5340kpv"; 

// === RIFERIMENTI UI ===
const passengerNameDisplay = document.getElementById('passenger_name_display');
const contactEmailDisplay = document.getElementById('contact_email_display');
const partenzaDisplay = document.getElementById('partenza_display');
const destinazioneDisplay = document.getElementById('destinazione_display');
const dataDisplay = document.getElementById('data_display');

const bookingCodeDisplay = document.getElementById('booking_code_display');
const seatNumberDisplay = document.getElementById('seat_number_display');
const flightStatusDisplay = document.getElementById('flight_status_display');

const selezioneBagaglio = document.getElementById('selezione_bagaglio');
const selezionePosto = document.getElementById('selezione_posto');
const noteInput = document.getElementById('note_logistiche');
const btnConferma = document.getElementById('conferma-prenotazione');

// RIFERIMENTI NUOVI COSTI
const basePriceDisplay = document.getElementById('base-price');
const bagaglioCostDisplay = document.getElementById('bagaglio-cost');
const postoCostDisplay = document.getElementById('posto-cost');
const totalCostDisplay = document.getElementById('total-cost');

// MAPPATURA COSTI (Trasparenza anti-low-cost)
const COSTI = {
    BASE: 120.00, // Costo fisso Executive
    bagaglio: {
        'Base': 0.00,
        'Priority': 15.00,
        '20kg_Stiva': 35.00
    },
    posto: {
        'Standard': 0.00,
        'Fila_Emergenza': 25.00,
        'Prima_Fila': 30.00
    }
};

// === GESTIONE PRENOTAZIONE LOCALE (FIX CRITICO: LEGGE ID DALL'URL) ===
const urlParams = new URLSearchParams(window.location.search);
const prenotazioneId = urlParams.get('id');
const storageKey = `prenotazione_${prenotazioneId}`;

if (!prenotazioneId) {
    alert("ERRORE: ID Prenotazione mancante. Reindirizzamento alla Home.");
    window.location.href = "index.html"; 
}

let bookingData = JSON.parse(localStorage.getItem(storageKey));

if (!bookingData) {
    alert(`Dati per ID ${prenotazioneId} non trovati. Creare una nuova prenotazione.`);
    window.location.href = "index.html";
}

// Salva l'ID come ultima prenotazione vista (per il link "Mis Reservas")
localStorage.setItem('last_booking_id', prenotazioneId);

// Funzione per aggiornare e salvare i dati nella memoria del browser
function updateLocalData(field, value) {
    bookingData[field] = value;
    localStorage.setItem(storageKey, JSON.stringify(bookingData));
    calculateTotalCost(); // Ricalcola ad ogni cambio di extra
}

function displayBookingData() {
    // Dati Base
    if (passengerNameDisplay) passengerNameDisplay.value = bookingData.passenger_name || "";
    if (contactEmailDisplay) contactEmailDisplay.value = bookingData.contact_email || "";
    if (partenzaDisplay) partenzaDisplay.textContent = bookingData.partenza || "";
    if (destinazioneDisplay) destinazioneDisplay.textContent = bookingData.destinazione || "";
    if (dataDisplay) dataDisplay.textContent = bookingData.data || "";

    // Dati Avanzati (Ryanair API Style)
    if (bookingCodeDisplay) bookingCodeDisplay.value = bookingData.codice_prenotazione || "N/A (NON CONFERMATO)";
    if (flightStatusDisplay) flightStatusDisplay.textContent = bookingData.stato || "PENDING";
    
    // Assegnazione casuale (simulazione API) se non esistono
    if (!bookingData.seat_number) updateLocalData('seat_number', `R${Math.floor(Math.random() * 30) + 1}${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}`);
    if (seatNumberDisplay) seatNumberDisplay.textContent = bookingData.seat_number;
    
    // Sincronizza input utente con i dati eventualmente salvati
    if (selezioneBagaglio) selezioneBagaglio.value = bookingData.selezione_bagaglio || "Base";
    if (selezionePosto) selezionePosto.value = bookingData.selezione_posto || "Standard";
    if (noteInput) noteInput.value = bookingData.note_logistiche || "";

    calculateTotalCost(); // Calcola i costi all'avvio
}

/**
 * Logica Critica: Calcola e visualizza i costi totali (Trasparenza)
 */
function calculateTotalCost() {
    const bagaglioTipo = selezioneBagaglio.value;
    const postoTipo = selezionePosto.value;

    const costoBagaglio = COSTI.bagaglio[bagaglioTipo] || 0.00;
    const costoPosto = COSTI.posto[postoTipo] || 0.00;
    const costoBase = COSTI.BASE;

    const costoTotale = costoBase + costoBagaglio + costoPosto;

    // Aggiorna la visualizzazione
    if (basePriceDisplay) basePriceDisplay.textContent = `€ ${costoBase.toFixed(2)}`;
    if (bagaglioCostDisplay) bagaglioCostDisplay.textContent = `€ ${costoBagaglio.toFixed(2)}`;
    if (postoCostDisplay) postoCostDisplay.textContent = `€ ${costoPosto.toFixed(2)}`;
    if (totalCostDisplay) totalCostDisplay.textContent = `€ ${costoTotale.toFixed(2)}`;

    // Salva il totale nel Local Storage (per l'email)
    bookingData.costo_totale = costoTotale.toFixed(2); 
    localStorage.setItem(storageKey, JSON.stringify(bookingData));
}

displayBookingData();

// Listener per aggiornare i campi in tempo reale
if (selezioneBagaglio) selezioneBagaglio.addEventListener('change', () => updateLocalData('selezione_bagaglio', selezioneBagaglio.value));
if (selezionePosto) selezionePosto.addEventListener('change', () => updateLocalData('selezione_posto', selezionePosto.value));
if (noteInput) noteInput.addEventListener('change', () => updateLocalData('note_logistiche', noteInput.value));


/**
 * Funzione CRITICA: Genera il codice di prenotazione univoco.
 */
function generateBookingCode() {
    const now = new Date();
    // VXF + Mese + Giorno + 4 cifre randomiche
    const rand = String(Math.floor(Math.random()*9000)+1000);
    return `VXF-${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${rand}`;
}

// === INIZIALIZZAZIONE EMAILJS ===
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}


// === LOGICA DI CONFERMA E INVIO EMAIL (IL MOMENTO CRITICO: Anti-422) ===
btnConferma.addEventListener('click', async () => {
    btnConferma.disabled = true;
    btnConferma.textContent = "Conferma e Invio Email...";
    
    const codice_prenotazione = generateBookingCode();
    const emailDestinatario = bookingData.contact_email;
    
    // CONTROLLO CRITICO: FIX DEFINITIVO per errore 422
    if (!emailDestinatario || emailDestinatario.trim() === "" || emailDestinatario.indexOf('@') === -1) {
        console.error("ERRORE CRITICO: Email del destinatario non valida/vuota (422).");
        alert("ERRORE: L'email di contatto non è valida. Ritorna alla Home e riprova.");
        btnConferma.disabled = false;
        btnConferma.textContent = "RITENTA CONFERMA (Email NON VALIDA)";
        return; 
    }

    try {
        // 1. Aggiornamento Stato LOCALE (IMPORTANTE prima dell'invio)
        updateLocalData('stato', "CONFIRMED");
        updateLocalData('codice_prenotazione', codice_prenotazione);
        
        // Sincronizza la visualizzazione del codice sul Boarding Pass
        if (bookingCodeDisplay) bookingCodeDisplay.value = codice_prenotazione;
        if (flightStatusDisplay) flightStatusDisplay.textContent = "CONFIRMED";


        // 2. Preparazione e Invio EmailJS 
        const templateParams = {
            to_name: bookingData.passenger_name || "Cliente VeloxFly",
            to_email: emailDestinatario, 
            codice_prenotazione,
            partenza: bookingData.partenza || "N/A",
            destinazione: bookingData.destinazione || "N/A",
            data_volo: bookingData.data || "N/A",
            
            // Dettagli Extra (Trasparenza Costi)
            costo_totale: bookingData.costo_totale || COSTI.BASE.toFixed(2), 
            selezione_bagaglio: bookingData.selezione_bagaglio || "Base",
            selezione_posto: bookingData.selezione_posto || "Standard",
            seat_number: bookingData.seat_number || "N/A",
            note_logistiche: bookingData.note_logistiche || "Nessuna nota",
            
            // Miglioramento (Referente Logistico Umano)
            referente_logistico: "Luca Rossi (Responsabile Logistica)", 
            referente_contatto: "+39 333 1234567 (h24)",
            
            // NUOVA PROMESSA TECNOLOGICA
            promessa_comfort: "Grazie alla nostra tecnologia avanzata, il tuo decollo e atterraggio saranno Zero Fastidi, offrendoti un comfort che 'deride la legge della fisica'." 
        };
        
        if (typeof emailjs !== 'undefined') {
            const resp = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            console.log(`Email per ${codice_prenotazione} INVIATA con successo.`, resp);
        }
        
        // 3. Aggiorna lo stato visivo finale
        btnConferma.disabled = true; 
        btnConferma.classList.remove('btn-success');
        btnConferma.classList.add('btn-primary');
        btnConferma.textContent = `✅ PRENOTAZIONE CONFERMATA (${codice_prenotazione})! Controlla la tua email.`;


    } catch(err) {
        console.error("Errore generico di conferma o invio email:", err);
        alert("Errore invio email! La prenotazione è salvata localmente, ma l'email non è partita. Controlla la console.");
        btnConferma.disabled = false;
        btnConferma.textContent = "RITENTA INVIO EMAIL ⚠️";
    }
});