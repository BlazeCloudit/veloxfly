// === RIFERIMENTI UI ===
const formPrenotazione = document.getElementById('flight-form'); 
// (Altri riferimenti UI omessi per brevità)
const bodyMain = document.getElementById('body-main');
const loadingOverlay = document.getElementById('loading-overlay');
const loginBtn = document.getElementById('login-button');
const logoutBtn = document.getElementById('logout-button');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const myReservationsLink = document.getElementById('my-reservations-link');
const toggleThemeBtn = document.getElementById('toggle-theme');
const themeIcon = document.getElementById('theme-icon');
const langSwitchBtns = document.querySelectorAll('.lang-switch');
const currentLangDisplay = document.getElementById('current-lang-display');

// === DIZIONARIO TRADUZIONI (COMPLETO) ===
const translations = {
    it: {
        H1Title: "Vola con VeloxFly™ - Prenotazione Esecutiva", Plan: "Pianifica", MyReservations: "Le Mie Prenotazioni", Login: "Accedi", Logout: "Logout", Profile: "Profilo",
        TabFlights: "VOLI", TabCars: "NOLEGGIO AUTO", TabHotels: "HOTEL", PassengerName: "Nome Passeggero", ContactEmail: "Email di contatto (Obbligatoria)", 
        Departure: "Partenza", Destination: "Destinazione", FlightDate: "Data del volo", CreateBooking: "Crea Prenotazione", 
        CarsMockup: "Funzionalità Noleggio Auto (Mockup Realistico).", HotelsMockup: "Funzionalità Hotel (Mockup Realistico).",
        NewLocationsTitle: "Le Nostre Nuove Posizioni Esecutive e Staff Migliorato", StaffLoginTitle: "Area Staff Veloce (Login Mock)",
        StaffLoginDesc: "Accesso diretto per l'equipaggio e il personale logistico ai sistemi di decollo Zero Fastidi.", StaffLoginBtn: "Accedi Staff",
        LocationsHubTitle: "Nuovi Hub Esecutivi", Location1: "Dubai Al Maktoum (DWC)", Location2: "Singapore Changi (SIN) - Terminal Esecutivo",
        Location3: "New York JFK (JFK) - Punti Premium",
        AuthModalTitle: "Accesso / Registrazione VeloxFly™", AuthModalDesc: "Gestisci le tue prenotazioni e il tuo profilo utente.",
        Username: "Nome Utente", Password: "Password", AuthWarning: "ATTENZIONE: L'autenticazione è gestita tramite sessione locale (Local Storage), la base per un futuro 2FA.",
        ModalLogin: "Accedi", ModalRegister: "Registrati (Crea Sessione)", ThemeDark: "Modalità Scura"
    },
    en: {
        H1Title: "Fly with VeloxFly™ - Executive Booking", Plan: "Plan", MyReservations: "My Reservations", Login: "Login", Logout: "Logout", Profile: "Profile",
        TabFlights: "FLIGHTS", TabCars: "CAR RENTAL", TabHotels: "HOTELS", PassengerName: "Passenger Name", ContactEmail: "Contact Email (Required)", 
        Departure: "Departure", Destination: "Destination", FlightDate: "Flight Date", CreateBooking: "Create Booking",
        CarsMockup: "Car Rental Feature (Realistic Mockup).", HotelsMockup: "Hotel Feature (Realistic Mockup).",
        NewLocationsTitle: "Our New Executive Locations & Improved Staff", StaffLoginTitle: "Fast Staff Area (Login Mock)",
        StaffLoginDesc: "Direct access for crew and logistics personnel to Zero Nuisance takeoff systems.", StaffLoginBtn: "Staff Login",
        LocationsHubTitle: "New Executive Hubs", Location1: "Dubai Al Maktoum (DWC)", Location2: "Singapore Changi (SIN) - Executive Terminal",
        Location3: "New York JFK (JFK) - Premium Points",
        AuthModalTitle: "Login / Registration VeloxFly™", AuthModalDesc: "Manage your bookings and user profile.",
        Username: "Username", Password: "Password", AuthWarning: "WARNING: Authentication is managed via local session (Local Storage), the base for a future 2FA.",
        ModalLogin: "Login", ModalRegister: "Register (Create Session)", ThemeDark: "Dark Mode"
    }
};

let currentLang = localStorage.getItem('lang') || 'it';
let currentTheme = localStorage.getItem('theme') || 'light';

// === FUNZIONI CORE ===
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
        updateLanguage(currentLang); // Forza l'aggiornamento del testo tema
    }
}

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

function generateLocalId() {
    const now = new Date();
    const ms = String(now.getTime()).slice(-6); 
    return `VXF-${ms}-${Math.floor(Math.random()*900)+100}`;
}

// === LOGICA DI SALVATAGGIO LOCALE (Multiple Prenotazioni) ===
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
    // 1. Nascondi l'animazione dopo il caricamento (MENU ANIMAZIONE)
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => loadingOverlay.style.display = 'none', 500);
    }
    
    // 2. Applica tema/lingua
    if (currentTheme === 'dark' && bodyMain) bodyMain.classList.add('dark-mode');
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    updateLanguage(currentLang);

    if (toggleThemeBtn) toggleThemeBtn.addEventListener('click', toggleTheme);
    langSwitchBtns.forEach(btn => btn.addEventListener('click', (e) => updateLanguage(e.target.getAttribute('data-lang'))));

    // 3. Verifica Autenticazione
    checkAuthStatus();
});

// Nota: La logica Auth/Modal è stata omessa qui per brevità, assicurati sia presente.  