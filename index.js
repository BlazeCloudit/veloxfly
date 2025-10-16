// === RIFERIMENTI UI PRINCIPALI ===
const formPrenotazione = document.getElementById('flight-form'); 
const inputNome = document.getElementById('passenger_name');
const inputEmail = document.getElementById('contact_email');
const inputPartenza = document.getElementById('partenza');
const inputDestinazione = document.getElementById('destinazione');
const inputData = document.getElementById('data');
const rotteList = document.getElementById('rotte-list'); 

// === RIFERIMENTI UI AUTENTICAZIONE (Navbar) ===
const loginBtn = document.getElementById('login-button');
const logoutBtn = document.getElementById('logout-button');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');

// === RIFERIMENTI MODAL DI ACCESSO ===
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

// === FUNZIONE ID LOCALE ===
function generateLocalId() {
    const now = new Date();
    const ms = String(now.getTime()).slice(-6); 
    return `LOCAL-${ms}`;
}

// === LOGICA DI SALVATAGGIO LOCALE E REINDIRIZZAMENTO ===
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

        // CONTROLLO DI ROBUSTEZZA DELL'EMAIL (FIX 422)
        if (!datiSimulati.contact_email || datiSimulati.contact_email.indexOf('@') === -1) {
            alert("ATTENZIONE: Inserisci un'email di contatto valida. Operazione annullata.");
            btnPrenota.disabled = false;
            btnPrenota.textContent = "Crea Prenotazione";
            return;
        }

        // Salva ID e Dati
        const localId = generateLocalId();
        localStorage.setItem('prenotazione_id', localId);
        localStorage.setItem(`prenotazione_${localId}`, JSON.stringify(datiSimulati));
        
        // Reindirizzamento
        window.location.href = "prenotazione.html"; 
    });
}

// === LOGICA DI AUTENTICAZIONE (Gestione Sessione Professionale) ===
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

// Logica per il pulsante del Modal
function handleAuth(e) {
    e.preventDefault();
    const username = modalUsernameInput.value.trim();
    if (username) {
        localStorage.setItem('current_user', username);
        checkAuthStatus();
        if (authModal) authModal.hide();
        modalUsernameInput.value = ''; // Pulisci il campo
    } else {
        alert("Inserisci un nome utente per accedere alla tua sessione.");
    }
}

// Listener: Mostra il Modal
if (loginBtn && authModal) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        authModal.show();
    });
}

// Listener: Azioni nel Modal
if (modalLoginBtn) modalLoginBtn.addEventListener('click', handleAuth);
if (modalRegisterBtn) modalRegisterBtn.addEventListener('click', handleAuth);

// Listener: Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('current_user');
        checkAuthStatus();
    });
}

// Esegui al caricamento della pagina
checkAuthStatus();