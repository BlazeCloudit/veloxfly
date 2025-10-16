// === RIFERIMENTI UI ===
const formPrenotazione = document.getElementById('flight-form'); 
const inputNome = document.getElementById('passenger_name');
const inputEmail = document.getElementById('contact_email');
const inputPartenza = document.getElementById('partenza');
const inputDestinazione = document.getElementById('destinazione');
const inputData = document.getElementById('data');
const rotteList = document.getElementById('rotte-list'); 

// === RIFERIMENTI UI AUTENTICAZIONE (Navbar e Modal) ===
const loginBtn = document.getElementById('login-button');
const logoutBtn = document.getElementById('logout-button');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const myReservationsLink = document.getElementById('my-reservations-link');

const authModalEl = document.getElementById('authModal');
const authModal = authModalEl ? new bootstrap.Modal(authModalEl) : null;
const modalUsernameInput = document.getElementById('modalUsername');
const modalLoginBtn = document.getElementById('modalLoginBtn');
const modalRegisterBtn = document.getElementById('modalRegisterBtn');


// === POPOLAMENTO ROTTE ESTESO ===
const rotteDisponibili = [
    "Milano Linate (LIN)", "Roma Fiumicino (FCO)", "Torino Caselle (TRN)", 
    "Venezia Tessera (VCE)", "Napoli Capodichino (NAP)", "Bari Palese (BRI)", 
    "Palermo Falcone Borsellino (PMO)", "Catania Fontanarossa (CTA)", 
    "Reggio Calabria (REG)", "Genova Sestri (GOA)", "Bologna Marconi (BLQ)", 
    "Firenze Peretola (FLR)", "Pisa Galileo Galilei (PSA)", "Verona Villafranca (VRN)",
    "Olbia Costa Smeralda (OLB)", "Cagliari Elmas (CAG)", "Alghero Fertilia (AHO)", 
    "Brindisi Papola Casale (BDS)", "Lamezia Terme (SUF)", "Pescara Abruzzo (PSR)",
    "Ancona Falconara (AOI)", "Trieste Ronchi dei Legionari (TRS)", "Rimini Miramare (RMI)"
];

if (rotteList) {
    rotteDisponibili.forEach(rotta => {
        const option = document.createElement('option');
        option.value = rotta;
        rotteList.appendChild(option);
    });
}

// === FUNZIONE ID LOCALE (Genera una chiave unica per la sessione) ===
function generateLocalId() {
    const now = new Date();
    const ms = String(now.getTime()).slice(-6); 
    return `LOCAL-${ms}`;
}

// === LOGICA DI SALVATAGGIO LOCALE E REINDIRIZZAMENTO (FIX 422) ===
if (formPrenotazione) {
    formPrenotazione.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const btnPrenota = formPrenotazione.querySelector('button[type="submit"]');
        btnPrenota.disabled = true;
        btnPrenota.textContent = "Salvataggio in corso...";

        const datiSimulati = {
            passenger_name: inputNome.value,
            contact_email: inputEmail.value, // <--- Dato cruciale per EmailJS
            partenza: inputPartenza.value,
            destinazione: inputDestinazione.value,
            data: inputData.value,
            stato: "PENDING",
            codice_prenotazione: "" 
        };

        // CONTROLLO DI ROBUSTEZZA DELL'EMAIL
        if (!datiSimulati.contact_email || datiSimulati.contact_email.indexOf('@') === -1) {
            alert("ATTENZIONE: Inserisci un'email di contatto valida per creare la prenotazione.");
            btnPrenota.disabled = false;
            btnPrenota.textContent = "Crea Prenotazione";
            return;
        }

        // 1. Genera un ID
        const localId = generateLocalId();
        
        // 2. Salva la prenotazione nella memoria del browser
        localStorage.setItem(`prenotazione_${localId}`, JSON.stringify(datiSimulati));
        
        // 3. Reindirizzamento SICURO passando l'ID nell'URL (FIX 422)
        window.location.href = `dashboard.html?id=${localId}`; 
    });
}

// === LOGICA DI AUTENTICAZIONE (Gestione Sessione) ===
function checkAuthStatus() {
    const loggedInUser = localStorage.getItem('current_user');
    if (loggedInUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex'; 
        if (usernameDisplay) usernameDisplay.textContent = loggedInUser;
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

function handleAuth(e) {
    e.preventDefault();
    const username = modalUsernameInput.value.trim();
    if (username) {
        localStorage.setItem('current_user', username);
        checkAuthStatus();
        if (authModal) authModal.hide();
        modalUsernameInput.value = ''; 
        alert(`Accesso Riuscito: Benvenuto, ${username}! (Sessione Locale)`);
    } else {
        alert("Inserisci un nome utente per accedere alla tua sessione.");
    }
}

if (loginBtn && authModal) loginBtn.addEventListener('click', (e) => { e.preventDefault(); authModal.show(); });
if (modalLoginBtn) modalLoginBtn.addEventListener('click', handleAuth);
if (modalRegisterBtn) modalRegisterBtn.addEventListener('click', handleAuth);
if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('current_user');
    checkAuthStatus();
    alert("Logout Effettuato.");
});

// Mis Reservas: cerca l'ultima prenotazione e usa l'ID nell'URL
if (myReservationsLink) {
    myReservationsLink.addEventListener('click', (e) => {
        e.preventDefault();
        // L'ultima prenotazione salvata dal dashboard.js è quella da mostrare
        const lastId = localStorage.getItem('last_booking_id'); 
        if (lastId) {
            window.location.href = `dashboard.html?id=${lastId}`;
        } else {
            alert("Nessuna prenotazione recente trovata nel browser. Per favore, crea una nuova prenotazione.");
        }
    });
}

// Esegui al caricamento della pagina
checkAuthStatus();