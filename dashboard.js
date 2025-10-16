// NON USA ALCUN DATABASE ESTERNO: solo Local Storage e EmailJS

// === CONFIGURAZIONE EMAILJS (Replicata) ===
const EMAILJS_PUBLIC_KEY = "iH31rni3A7perWpQB";
const EMAILJS_SERVICE_ID = "service_vxf_smtp";
const EMAILJS_TEMPLATE_ID = "template_5340kpv"; 

// === RIFERIMENTI UI === (Per la logica Dettaglio/Conferma)
// (Omessi per brevità, sono gli stessi usati nel dashboard.html precedente)
const btnConferma = document.getElementById('conferma-prenotazione');
// ... (tutti gli altri riferimenti DOM per il dettaglio) ...

// === RIFERIMENTI UI HUB ===
const bookingListView = document.getElementById('booking-list-view');
const bookingDetailView = document.getElementById('booking-detail-view');
const bookingsTableBody = document.getElementById('bookings-table-body');
const noBookingsMessage = document.getElementById('no-bookings-message');
const backToListBtn = document.getElementById('back-to-list');

// === FUNZIONI CORE TEMA/LINGUA (Replicate) ===
const bodyMain = document.getElementById('body-main');
const toggleThemeBtn = document.getElementById('toggle-theme');
const themeIcon = document.getElementById('theme-icon');
const langSwitchBtns = document.querySelectorAll('.lang-switch');
const currentLangDisplay = document.getElementById('current-lang-display');

// (Definizione del dizionario 'translations' e delle funzioni 'updateLanguage'/'toggleTheme' omessa qui per brevità, ma DEVE essere copiata da index.js)

// ... (Incolla qui il dizionario 'translations', 'updateLanguage', 'toggleTheme') ...

// === LOGICA HUB PRENOTAZIONI ===
function renderBookingsList() {
    const bookingIds = JSON.parse(localStorage.getItem('booking_ids') || '[]');
    bookingsTableBody.innerHTML = ''; // Pulisci tabella

    if (bookingIds.length === 0) {
        if (noBookingsMessage) noBookingsMessage.style.display = 'block';
        return;
    }
    if (noBookingsMessage) noBookingsMessage.style.display = 'none';

    bookingIds.forEach(id => {
        const key = `prenotazione_${id}`;
        const data = JSON.parse(localStorage.getItem(key));
        if (!data) return; // Salta dati corrotti

        const row = bookingsTableBody.insertRow();
        const statusClass = data.stato === 'CONFIRMED' ? 'status-confirmed' : 'status-pending';

        row.innerHTML = `
            <td>${id}</td>
            <td>${data.passenger_name}</td>
            <td>${data.partenza} &rarr; ${data.destinazione}</td>
            <td>${data.data}</td>
            <td class="${statusClass}">${data.stato}</td>
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
            window.location.href = `dashboard.html?id=${id}`; // Ricarica in modalità dettaglio
        });
    });
}

function displayBookingDetail(prenotazioneId) {
    const key = `prenotazione_${prenotazioneId}`;
    let bookingData = JSON.parse(localStorage.getItem(key));
    
    if (!bookingData) {
        alert("Dati non trovati per l'ID specificato.");
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Mostra la vista dettaglio, nasconde la lista
    if (bookingListView) bookingListView.style.display = 'none';
    if (bookingDetailView) bookingDetailView.style.display = 'block';
    
    // ... (Logica per riempire tutti i campi del Boarding Pass, costi e servizi, omessa per brevità) ...
    
    // Logica di Conferma (bottone)
    if (btnConferma) {
        btnConferma.onclick = async () => { 
            // Usa la logica completa di conferma/invio email dal tuo codice precedente
            // (Assicurati di re-implementare qui la funzione generateBookingCode e la logica emailjs.send)
            alert("Simulazione: Eseguo la conferma e invio l'email.");
        };
    }
    
    if (backToListBtn) {
        backToListBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html'; // Ritorna alla lista
        });
    }
}

// === INIZIALIZZAZIONE DASHBOARD ===
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inizializzazione Tema/Lingua
    if (currentTheme === 'dark' && bodyMain) bodyMain.classList.add('dark-mode');
    updateLanguage(currentLang);
    if (toggleThemeBtn) toggleThemeBtn.addEventListener('click', toggleTheme);
    langSwitchBtns.forEach(btn => btn.addEventListener('click', (e) => updateLanguage(e.target.getAttribute('data-lang'))));
    
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
});