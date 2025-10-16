// NON USA ALCUN DATABASE ESTERNO: solo Local Storage e EmailJS

// === CONFIGURAZIONE EMAILJS (Le tue chiavi) ===
const EMAILJS_PUBLIC_KEY = "iH31rni3A7perWpQB";
const EMAILJS_SERVICE_ID = "service_vxf_smtp";
const EMAILJS_TEMPLATE_ID = "template_5340kpv"; 

// === RIFERIMENTI UI ===
// ... (omessi, restano invariati) ...
const btnConferma = document.getElementById('conferma-prenotazione');

// NUOVI RIFERIMENTI PER I VANTAGGI AGGIUNTIVI (Tipo Ryanair)
const selezioneBagaglio = document.getElementById('selezione_bagaglio');
const selezionePosto = document.getElementById('selezione_posto');
const assicurazioneAnnullamento = document.getElementById('assicurazione_annullamento');
const fastTrack = document.getElementById('fast_track');


// === GESTIONE PRENOTAZIONE LOCALE ===
// ... (omesso, resta invariato) ...
const prenotazioneId = localStorage.getItem('prenotazione_id');
const storageKey = `prenotazione_${prenotazioneId}`;
let bookingData = JSON.parse(localStorage.getItem(storageKey));

// Funzione per aggiornare e salvare i dati nella memoria del browser
function updateLocalData(field, value) {
    bookingData[field] = value;
    localStorage.setItem(storageKey, JSON.stringify(bookingData));
}

// ... (displayBookingData e listener per aggiornamento dati restano invariati) ...

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


// === LOGICA DI CONFERMA E INVIO EMAIL (LA RISPOSTA FINALE) ===
btnConferma.addEventListener('click', async () => {
    btnConferma.disabled = true;
    btnConferma.textContent = "Conferma e Invio Email...";
    
    const codice_prenotazione = generateBookingCode();
    const emailDestinatario = bookingData.contact_email;
    
    // CONTROLLO CRITICO: FIX DEFINITIVO per errore 422 - Email Destinatario Vuota
    if (!emailDestinatario || emailDestinatario.trim() === "" || emailDestinatario.indexOf('@') === -1) {
        console.error("ERRORE CRITICO: Email del destinatario non valida/vuota. L'invio a EmailJS è bloccato (422).");
        alert("ERRORE DI INVIO: L'email di contatto non è valida. L'invio della conferma è stato bloccato. Correggi l'email nel riepilogo.");
        btnConferma.disabled = false;
        btnConferma.textContent = "RITENTA CONFERMA (Email NON VALIDA)";
        return; 
    }

    try {
        // 2. Aggiornamento Stato LOCALE 
        updateLocalData('stato', "CONFIRMED");
        updateLocalData('codice_prenotazione', codice_prenotazione);

        // 3. Preparazione e Invio EmailJS (Il tuo "server quantistico" in azione)
        const templateParams = {
            to_name: bookingData.passenger_name || "Cliente VeloxFly",
            to_email: emailDestinatario, 
            codice_prenotazione,
            partenza: bookingData.partenza || "N/A",
            destinazione: bookingData.destinazione || "N/A",
            data_volo: bookingData.data || "N/A",
            
            // Nuovi Dettagli Extra (Dati Reali)
            selezione_bagaglio: bookingData.selezione_bagaglio || "Base (Zaino)",
            selezione_posto: bookingData.selezione_posto || "Standard (Gratuito)",
            assicurazione_annullamento: bookingData.assicurazione_annullamento ? "Sì (Completa)" : "No",
            fast_track: bookingData.fast_track ? "Sì (Incluso)" : "No",

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
                    console.error("ERRORE CRITICO INVIO EMAIL (Controlla EmailJS Dashboard - Template):", err); 
                    alert("Errore invio email! Controlla la Console e la configurazione EmailJS (Template). La prenotazione è salvata.");
                });
        }
        
        // 4. Aggiorna lo stato visivo finale
        btnConferma.disabled = true; 
        btnConferma.textContent = `✅ CONFERMATO (${codice_prenotazione})`;


    } catch(err) {
        console.error("Errore generico di conferma:", err);
        btnConferma.disabled = false;
        btnConferma.textContent = "RITENTA CONFERMA ✅";
    }
});