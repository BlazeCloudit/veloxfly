// === RIFERIMENTI CORE ===
const bodyMain = document.getElementById('body-main');
const toggleThemeBtnNav = document.getElementById('toggle-theme'); // Nav Bar
const toggleThemeBtnPref = document.getElementById('toggle-theme-pref'); // Preferenze Tab
const themeIcon = document.getElementById('theme-icon');
const langSwitchBtns = document.querySelectorAll('.lang-switch');
const currentLangDisplay = document.getElementById('current-lang-display');
const languageSelectPref = document.getElementById('language-select-pref');
const userDisplayInput = document.getElementById('user-display');

// (Definizione del dizionario 'translations' omessa qui per brevità, ma DEVE essere copiata da index.js)
const translations = { /* ... COPIA QUI IL DIZIONARIO COMPLETO ... */ };

let currentLang = localStorage.getItem('lang') || 'it';
let currentTheme = localStorage.getItem('theme') || 'light';

// === FUNZIONI TEMA/LINGUA (Replicate) ===
function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    currentLangDisplay.textContent = lang.toUpperCase();
    
    // Aggiorna tutti gli elementi con data-lang-key
    document.querySelectorAll('[data-lang-key]').forEach(element => { /* ... */ });
    // ... (Logica completa di updateLanguage, copiata da index.js) ...
}

function toggleTheme() {
    // ... (Logica completa di toggleTheme, copiata da index.js) ...
}

function checkAuthStatus() {
    const loggedInUser = localStorage.getItem('current_user');
    if (userDisplayInput) userDisplayInput.value = loggedInUser || 'Ospite';
    if (!loggedInUser) {
        alert("Non sei loggato. Accesso ai dati profilo limitato.");
        // Reindirizzamento o logica di blocco UI se necessario
    }
    // ... (Logica visualizzazione Login/Logout nella navbar) ...
}

// === INIZIALIZZAZIONE PROFILO ===
document.addEventListener('DOMContentLoaded', () => {
    // 1. Applica tema/lingua
    if (currentTheme === 'dark' && bodyMain) bodyMain.classList.add('dark-mode');
    updateLanguage(currentLang);

    // Sincronizza il selettore nella tab Preferenze
    if (languageSelectPref) languageSelectPref.value = currentLang;

    // 2. Listener per la navbar (bottone a tendina)
    if (toggleThemeBtnNav) toggleThemeBtnNav.addEventListener('click', toggleTheme);
    langSwitchBtns.forEach(btn => btn.addEventListener('click', (e) => updateLanguage(e.target.getAttribute('data-lang'))));

    // 3. Listener per la tab Preferenze
    if (toggleThemeBtnPref) toggleThemeBtnPref.addEventListener('click', toggleTheme);
    if (languageSelectPref) languageSelectPref.addEventListener('change', (e) => updateLanguage(e.target.value));

    // 4. Verifica Autenticazione
    checkAuthStatus();
});