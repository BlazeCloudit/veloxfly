// === RIFERIMENTI UI ===
const formPrenotazione = document.getElementById('flight-form'); 
const bodyMain = document.getElementById('body-main');
const loadingOverlay = document.getElementById('loading-overlay');
const loginBtn = document.getElementById('login-button');
const logoutBtn = document.getElementById('logout-button');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const toggleThemeBtn = document.getElementById('toggle-theme');
const themeIcon = document.getElementById('theme-icon');
const langSwitchBtns = document.querySelectorAll('.lang-switch');
const currentLangDisplay = document.getElementById('current-lang-display');
const rotteList = document.getElementById('rotte-list');

// Auth Modal references
const modalUsernameInput = document.getElementById('modalUsername');
const modalPasswordInput = document.getElementById('modalPassword');
const modalLoginBtn = document.getElementById('modalLoginBtn');
const modalRegisterBtn = document.getElementById('modalRegisterBtn');
const authModal = new bootstrap.Modal(document.getElementById('authModal'));


// === DATI E TRADUZIONI ===
const rotteDisponibili = [
    "Milano Linate (LIN)", "Roma Fiumicino (FCO)", "Torino Caselle (TRN)", 
    "Venezia Tessera (VCE)", "Napoli Capodichino (NAP)", "Bari Palese (BRI)", 
    "Palermo Falcone Borsellino (PMO)", "Catania Fontanarossa (CTA)", 
    "Dubai Al Maktoum (DWC)", "Singapore Changi (SIN)", "New York JFK (JFK)"
];
const translations = {
    it: {
        SiteTitle: "VeloxFly™ | Portale Prenotazioni - Vola dove gli altri si fermano", H1Title: "Vola con VeloxFly™ - Prenotazione Veloce",
        Plan: "Pianifica", MyReservations: "Le Mie Prenotazioni", Login: "Accedi", Logout: "Logout", Profile: "Profilo",
        TabFlights: "VOLI", TabCars: "NOLEGGIO AUTO", TabHotels: "HOTEL", PassengerName: "Nome Passeggero", ContactEmail: "Email di contatto (Obbligatoria)", 
        Departure: "Partenza", Destination: "Destinazione", FlightDate: "Data del volo", CreateBooking: "Crea Prenotazione", 
        CarsMockup: "Funzionalità Noleggio Auto (Mockup Realistico).", HotelsMockup: "Funzionalità Hotel (Mockup Realistico).",
        NewLocationsTitle: "Le Nostre Nuove Posizioni e Accesso Staff", StaffLoginTitle: "Area Staff (Login Dedicato)",
        StaffLoginDesc: "Accesso diretto per l'equipaggio e il personale logistico ai sistemi di decollo Zero Fastidi.", StaffLoginBtn: "Accedi Staff",
        LocationsHubTitle: "Nuovi Punti Premium", Location1: "Dubai Al Maktoum (DWC)", Location2: "Singapore Changi (SIN) - Terminal Premium",
        Location3: "New York JFK (JFK) - Punti Premium",
        AuthModalTitle: "Accesso / Registrazione VeloxFly™", AuthModalDesc: "Gestisci le tue prenotazioni e il tuo profilo utente. **Qualsiasi password è accettata.**",
        Username: "Nome Utente", Password: "Password", AuthWarning: "ATTENZIONE: L'autenticazione è gestita tramite sessione locale (Local Storage).",
        ModalLogin: "Accedi", ModalRegister: "Registrati (Crea Sessione)", ThemeDark: "Modalità Scura"
    },
    en: {
        SiteTitle: "VeloxFly™ | Booking Portal - Fly where others stop", H1Title: "Fly with VeloxFly™ - Fast Booking", 
        Plan: "Plan", MyReservations: "My Reservations", Login: "Login", Logout: "Logout", Profile: "Profile",
        TabFlights: "FLIGHTS", TabCars: "CAR RENTAL", TabHotels: "HOTELS", PassengerName: "Passenger Name", ContactEmail: "Contact Email (Required)", 
        Departure: "Departure", Destination: "Destination", FlightDate: "Flight Date", CreateBooking: "Create Booking",
        CarsMockup: "Car Rental Feature (Realistic Mockup).", HotelsMockup: "Hotel Feature (Realistic Mockup).",
        NewLocationsTitle: "Our New Locations & Staff Access", StaffLoginTitle: "Staff Area (Dedicated Login)",
        StaffLoginDesc: "Direct access for crew and logistics personnel to Zero Nuisance takeoff systems.", StaffLoginBtn: "Staff Login",
        LocationsHubTitle: "New Premium Points", Location1: "Dubai Al Maktoum (DWC)", Location2: "Singapore Changi (SIN) - Premium Terminal",
        Location3: "New York JFK (JFK) - Premium Points",
        AuthModalTitle: "Login / Registration VeloxFly™", AuthModalDesc: "Manage your bookings and user profile. **Any password is accepted.**",
        Username: "Username", Password: "Password", AuthWarning: "WARNING: Authentication is managed via local session (Local Storage).",
        ModalLogin: "Login", ModalRegister: "Register (Create Session)", ThemeDark: "Dark Mode"
    }
};

let currentLang = localStorage.getItem('lang') || 'it';
let currentTheme = localStorage.getItem('theme') || 'light';

// === FUNZIONI CORE (Tema/Lingua) ===
function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    currentLangDisplay.textContent = lang.toUpperCase();
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    // Aggiorna il testo del toggle tema
    const themeText = currentTheme === 'dark' ? 'Modalità Chiara' : translations[lang].ThemeDark;
    if(toggleThemeBtn) toggleThemeBtn.innerHTML = (currentTheme === 'dark' ? '<i class="fas fa-sun me-2"></i>' : '<i class="fas fa-moon me-2"></i>') + themeText;
}

function toggleTheme() {
    if (bodyMain) {
        bodyMain.classList.toggle('dark-mode');
        currentTheme = bodyMain.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        updateLanguage(currentLang); 
    }
}

// === FUNZIONI AUTH (Mock) ===
function checkAuthStatus() {
    const loggedInUser = localStorage.getItem('current_user');
    if (loggedInUser) {
        loginBtn.style.display = 'none';
        userInfo.style.display = 'flex'; 
        usernameDisplay.textContent = loggedInUser;
    } else {
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

function loginUser() {
    const username = modalUsernameInput.value.trim();
    if (!username) { alert("Inserisci un nome utente."); return; }
    
    // Simulate finding user/creating session
    localStorage.setItem('current_user', username);
    checkAuthStatus();
    authModal.hide();
    alert(`Accesso eseguito per l'utente: ${username}`);
    // Clear inputs after use
    modalUsernameInput.value = '';
    modalPasswordInput.value = '';
}

function logoutUser() {
    localStorage.removeItem('current_user');
    checkAuthStatus();
    alert("Logout eseguito.");
}

// === LOGICA PRENOTAZIONI ===
function generateLocalId() {
    const now = new Date();
    const ms = String(now.getTime()).slice(-6); 
    return `VXF-${ms}-${Math.floor(Math.random()*900)+100}`;
}

if (formPrenotazione) {
    formPrenotazione.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const localId = generateLocalId();
        
        const datiSimulati = {
            passenger_name: document.getElementById('passenger_name').value,
            contact_email: document.getElementById('contact_email').value,
            partenza: document.getElementById('partenza').value,
            destinazione: document.getElementById('destinazione').value,
            data: document.getElementById('data').value,
            stato: "PENDING",
            codice_prenotazione: "" 
        };

        // Salva i dati con una chiave univoca
        localStorage.setItem(`prenotazione_${localId}`, JSON.stringify(datiSimulati));
        
        // Aggiungi l'ID alla lista di tutti gli ID (per la Dashboard)
        let bookingIds = JSON.parse(localStorage.getItem('booking_ids') || '[]');
        if (!bookingIds.includes(localId)) {
            bookingIds.push(localId);
            localStorage.setItem('booking_ids', JSON.stringify(bookingIds));
        }

        // Reindirizzamento alla Dashboard (che ora gestisce la lista)
        window.location.href = `dashboard.html?id=${localId}`; 
    });
}

// === INIZIALIZZAZIONE ===
document.addEventListener('DOMContentLoaded', () => {
    // Popola Rotte
    if (rotteList) { rotteDisponibili.forEach(rotta => { const option = document.createElement('option'); option.value = rotta; rotteList.appendChild(option); }); }

    // Nascondi l'animazione dopo il caricamento
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => loadingOverlay.style.display = 'none', 500);
    }
    
    // Applica tema/lingua
    if (currentTheme === 'dark' && bodyMain) bodyMain.classList.add('dark-mode');
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    updateLanguage(currentLang);

    // Listener Tema/Lingua
    if (toggleThemeBtn) toggleThemeBtn.addEventListener('click', toggleTheme);
    langSwitchBtns.forEach(btn => btn.addEventListener('click', (e) => updateLanguage(e.target.getAttribute('data-lang'))));

    // Listener Auth
    modalLoginBtn.addEventListener('click', loginUser);
    modalRegisterBtn.addEventListener('click', loginUser); // Register è un mock di Login
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
    checkAuthStatus();
}); 