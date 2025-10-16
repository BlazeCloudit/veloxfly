// NON USA ALCUN DATABASE ESTERNO: solo Local Storage e EmailJS

// === CONFIGURAZIONE EMAILJS ===
const EMAILJS_PUBLIC_KEY = "iH31rni3A7perWpQB";
const EMAILJS_SERVICE_ID = "service_vxf_smtp";
const EMAILJS_TEMPLATE_ID = "template_5340kpv"; 

// === RIFERIMENTI UI HUB E DETTAGLIO ===
const bookingListView = document.getElementById('booking-list-view');
const bookingDetailView = document.getElementById('booking-detail-view');
const bookingsTableBody = document.getElementById('bookings-table-body');
const noBookingsMessage = document.getElementById('no-bookings-message');
const backToListBtn = document.getElementById('back-to-list');

// Dettaglio
const passengerNameDisplay = document.getElementById('passenger_name_display');
const contactEmailDisplay = document.getElementById('contact_email_display');
const partenzaDisplay = document.getElementById('partenza_display');
const destinazioneDisplay = document.getElementById('destinazione_display');
const dataDisplay = document.getElementById('data_display');
const bookingCodeDisplay = document.getElementById('booking_code_display');
const statusDisplay = document.getElementById('status_display');

const hotelInput = document.getElementById('hotel_scelto');
const noleggioSelect = document.getElementById('noleggio_richiesto');
const noteInput = document.getElementById('note_logistiche');
const btnConferma = document.getElementById('conferma-prenotazione');

// === FUNZIONI CORE TEMA/LINGUA/AUTH (Replicate) ===
const bodyMain = document.getElementById('body-main');
const toggleThemeBtn = document.getElementById('toggle-theme');
const themeIcon = document.getElementById('theme-icon');
const langSwitchBtns = document.querySelectorAll('.lang-switch');
const currentLangDisplay = document.getElementById('current-lang-display');

// (Definizione del dizionario 'translations', 'updateLanguage', 'toggleTheme', 'checkAuthStatus' 
// e 'logoutUser' omessa qui per brevità, ma DEVE essere copiata da index.js)

// *** (Assicurati di incollare qui il codice per le funzioni 'translations', 'updateLanguage', 'toggleTheme', 'checkAuthStatus' e 'logoutUser' da index.js) ***

// === LOGICA HUB PRENOTAZIONI ===
function renderBookingsList() {
    // Ottiene TUTTI gli ID salvati
    const bookingIds = JSON.parse(localStorage.getItem('booking_ids') || '[]');
    bookingsTableBody.innerHTML = ''; 

    if (bookingIds.length === 0) {
        if (noBookingsMessage) noBookingsMessage.style.display = 'block';
        return;
    }
    if (noBookingsMessage) noBookingsMessage.style.display = 'none';

    bookingIds.forEach(id => {
        const key = `prenotazione_${id}`;
        const data = JSON.parse(localStorage.getItem(key));
        if (!data) return; 

        const statusText = data.stato || "PENDING";
        const row = bookingsTableBody.insertRow();
        const statusClass = statusText === 'CONFIRMED' ? 'status-confirmed' : 'status-pending';

        row.innerHTML = `
            <td>${id}</td>
            <td>${data.passenger_name}</td>
            <td>${data.partenza} &rarr; ${data.destinazione}</td>
            <td>${data.data}</td>
            <td class="${statusClass}">${statusText}</td>
            <td>
                <button class="btn btn-sm btn-primary view-detail-btn" data-id="${id}">
                    <i class="fas fa-search"></i> Dettagli
                </button>
            </td>
        `;
    });

    document.querySelectorAll('.view-detail-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            window.location.href = `dashboard.html?id=${id}`; 
        });
    });
}


// === LOGICA DETTAGLIO PRENOTAZIONE ===
let currentBookingData;
let currentStorageKey;

function updateLocalData(field, value) {
    currentBookingData[field] = value;
    localStorage.setItem(currentStorageKey, JSON.stringify(currentBookingData));
}

function displayBookingDetail(prenotazioneId) {
    currentStorageKey = `prenotazione_${prenotazioneId}`;
    currentBookingData = JSON.parse(localStorage.getItem(currentStorageKey));
    
    if (!currentBookingData) {
        alert("Dati non trovati per l'ID specificato.");
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Mostra la vista dettaglio, nasconde la lista
    if (bookingListView) bookingListView.style.display = 'none';
    if (bookingDetailView) bookingDetailView.style.display = 'block';
    
    // Riempie i campi
    passengerNameDisplay.value = currentBookingData.passenger_name || "";
    contactEmailDisplay.value = currentBookingData.contact_email || "";
    partenzaDisplay.value = currentBookingData.partenza || "";
    destinazioneDisplay.value = currentBookingData.destinazione || "";
    dataDisplay.value = currentBookingData.data || "";
    statusDisplay.value = currentBookingData.stato || "PENDING";
    bookingCodeDisplay.value = currentBookingData.codice_prenotazione || prenotazioneId;

    hotelInput.value = currentBookingData.hotel_scelto || "";
    noleggioSelect.value = currentBookingData.noleggio_richiesto || "";
    noteInput.value = currentBookingData.note_logistiche || "";
    
    // Gestione stato di blocco se già confermato
    if (currentBookingData.stato === "CONFIRMED") {
        btnConferma.disabled = true;
        btnConferma.textContent = `✅ CONFERMATO (${currentBookingData.codice_prenotazione})`;
        hotelInput.disabled = true;
        noleggioSelect.disabled = true;
        noteInput.disabled = true;
    }
    
    // Listener per aggiornare i campi in tempo reale
    hotelInput.addEventListener('input', () => updateLocalData('hotel_scelto', hotelInput.value));
    noleggioSelect.addEventListener('change', () => updateLocalData('noleggio_richiesto', noleggioSelect.value));
    noteInput.addEventListener('input', () => updateLocalData('note_logistiche', noteInput.value));
}


/**
 * Funzione CRITICA: Genera il codice di prenotazione univoco.
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


// === LOGICA DI CONFERMA E INVIO EMAIL ===
if (btnConferma) {
    btnConferma.addEventListener('click', async () => {
        btnConferma.disabled = true;
        btnConferma.textContent = "Invio conferma in corso...";
        
        // 🛑 1. GENERA IL CODICE DI RISPOSTA
        const codice_prenotazione = generateBookingCode();

        try {
            // 2. Aggiornamento Stato LOCALE 
            updateLocalData('stato', "CONFIRMED");
            updateLocalData('codice_prenotazione', codice_prenotazione);
            statusDisplay.value = "CONFIRMED";
            bookingCodeDisplay.value = codice_prenotazione;

            // 3. Preparazione e Invio EmailJS 
            const templateParams = {
                to_name: currentBookingData.passenger_name || "Cliente VeloxFly",
                to_email: currentBookingData.contact_email || "",
                codice_prenotazione: codice_prenotazione,
                partenza: currentBookingData.partenza || "N/A",
                destinazione: currentBookingData.destinazione || "N/A",
                data_volo: currentBookingData.data || "N/A",
                hotel_scelto: hotelInput.value || "Nessun Hotel",
                noleggio_richiesto: noleggioSelect.value || "No",
                note_logistiche: noteInput.value || "Nessuna nota"
            };
            
            if (typeof emailjs !== 'undefined') {
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
                alert(`Prenotazione ${codice_prenotazione} confermata. Email inviata a ${templateParams.to_email} (Simulazione).`);
            }
            
            // 4. Aggiorna lo stato visivo finale
            btnConferma.disabled = true; 
            btnConferma.textContent = `✅ CONFERMATO (${codice_prenotazione})`;
            hotelInput.disabled = true;
            noleggioSelect.disabled = true;
            noteInput.disabled = true;

        } catch(err) {
            console.error("Errore durante la simulazione di conferma:", err);
            btnConferma.disabled = false;
            btnConferma.textContent = "RITENTA CONFERMA ✅";
            alert("Errore nell'invio della conferma, riprova. Dati salvati localmente.");
        }
    });
}


// === INIZIALIZZAZIONE DASHBOARD ===
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inizializzazione Tema/Lingua/Auth
    if (bodyMain) {
        const theme = localStorage.getItem('theme') || 'light';
        if (theme === 'dark') bodyMain.classList.add('dark-mode');
    }
    // checkAuthStatus(); // Necessita delle funzioni Auth di index.js
    // updateLanguage(localStorage.getItem('lang') || 'it');
    
    // 2. Controllo routing
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        // Modalità Dettaglio
        displayBookingDetail(id);
    } else {
        // Modalità Lista (Hub)
        if (bookingListView) bookingListView.style.display = 'block';
        if (bookingDetailView) bookingDetailView.style.display = 'none';
        renderBookingsList();
    }
    
    // 3. Listener Torna alla Lista
    if (backToListBtn) {
        backToListBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html'; 
        });
    }
});