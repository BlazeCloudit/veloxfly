// === RIFERIMENTI CORE ===
const bodyMain = document.getElementById('body-main');
const toggleThemeBtnNav = document.getElementById('toggle-theme'); 
const toggleThemeBtnPref = document.getElementById('toggle-theme-pref'); 
const themeIcon = document.getElementById('theme-icon');
const langSwitchBtns = document.querySelectorAll('.lang-switch');
const currentLangDisplay = document.getElementById('current-lang-display');
const languageSelectPref = document.getElementById('language-select-pref');
const userDisplayInput = document.getElementById('user-display');
const logoutButton = document.getElementById('logout-button');

// *** (Incolla qui il codice completo per il dizionario 'translations' e le funzioni 'updateLanguage', 'toggleTheme' e 'checkAuthStatus' da index.js) ***

let currentLang = localStorage.getItem('lang') || 'it';
let currentTheme = localStorage.getItem('theme') || 'light';

// === FUNZIONI AGGIUNTIVE AUTH ===
function logoutUser() {
    localStorage.removeItem('current_user');
    window.location.href = 'index.html'; // Reindirizza alla Home dopo il logout
}

function checkAuthStatus() {
    const loggedInUser = localStorage.getItem('current_user');
    if (userDisplayInput) userDisplayInput.value = loggedInUser || 'Ospite';
    
    // Controlli UI Nav
    const loginBtn = document.getElementById('login-button');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');

    if (loggedInUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex'; 
        if (usernameDisplay) usernameDisplay.textContent = loggedInUser;
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        // Blocco di accesso alla pagina se non loggato
        alert("Accesso negato: devi effettuare il login per vedere il tuo profilo.");
        window.location.href = 'index.html';
    }
}


// === INIZIALIZZAZIONE PROFILO ===
document.addEventListener('DOMContentLoaded', () => {
    // 1. Applica tema/lingua
    if (currentTheme === 'dark' && bodyMain) bodyMain.classList.add('dark-mode');
    // updateLanguage(currentLang); // Funzione da index.js

    // Sincronizza il selettore nella tab Preferenze
    if (languageSelectPref) languageSelectPref.value = currentLang;

    // 2. Listener per la navbar (e la tab Preferenze)
    if (toggleThemeBtnNav) toggleThemeBtnNav.addEventListener('click', toggleTheme);
    if (toggleThemeBtnPref) toggleThemeBtnPref.addEventListener('click', toggleTheme);
    langSwitchBtns.forEach(btn => btn.addEventListener('click', (e) => updateLanguage(e.target.getAttribute('data-lang'))));
    if (languageSelectPref) languageSelectPref.addEventListener('change', (e) => updateLanguage(e.target.value));
    
    // Listener Logout
    if (logoutButton) logoutButton.addEventListener('click', logoutUser);

    // 3. Verifica Autenticazione (e riempie i dati)
    checkAuthStatus();
});