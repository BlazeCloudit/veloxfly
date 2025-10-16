// === RIFERIMENTI UI ===
const formPrenotazione = document.getElementById('flight-form'); 
const inputNome = document.getElementById('passenger_name');
const inputEmail = document.getElementById('contact_email');
const inputPartenza = document.getElementById('partenza');
const inputDestinazione = document.getElementById('destinazione');
const inputData = document.getElementById('data');
const rotteList = document.getElementById('rotte-list'); 

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

// === LOGICA DI SALVATAGGIO LOCALE E REINDIRIZZAMENTO ===
if (formPrenotazione) {
    formPrenotazione.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const btnPrenota = formPrenotazione.querySelector('button[type="submit"]');
        btnPrenota.disabled = true;
        btnPrenota.textContent = "Simulazione Salvataggio... OK";

        // 1. Dati iniziali da salvare
        const datiSimulati = {
            passenger_name: inputNome.value,
            contact_email: inputEmail.value,
            partenza: inputPartenza.value,
            destinazione: inputDestinazione.value,
            data: inputData.value,
            stato: "PENDING",
            codice_prenotazione: "" // Sarà riempito nel dashboard.js
        };

        // 2. Salva un ID e i dati simulati nella memoria del browser
        const localId = generateLocalId();
        localStorage.setItem('prenotazione_id', localId);
        localStorage.setItem(`prenotazione_${localId}`, JSON.stringify(datiSimulati));
        
        // 3. Reindirizzamento garantito
        window.location.href = "prenotazione.html"; 
    });
}