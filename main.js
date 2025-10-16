// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// --- Config Firebase ---
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDFxsqBBGCtRQ_nkSlOvSZNGnxloqeZEto",
  authDomain: "veloxfly-logistica.firebaseapp.com",
  projectId: "veloxfly-logistica",
  storageBucket: "veloxfly-logistica.firebasestorage.app",
  messagingSenderId: "308781988721",
  appId: "1:308781988721:web:14555f6fa1afc4d73954d0"
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);

signInAnonymously(auth)
  .then(() => console.log("Autenticazione anonima Firebase: OK"))
  .catch(err => console.error("Auth error:", err));

const ROTTE_VELOXF Y = [
  "VXF-ROM (Roma Fiumicino)",
  "VXF-MIL (Milano Linate)",    
  "VXF-NAP (Napoli Capodichino)",
  "VXF-VCE (Venezia Marco Polo)",
  "VXF-CTA (Catania Fontanarossa)", 
  "VXF-OLB (Olbia Costa Smeralda)",
  "VXF-BRG (Bergamo Orio al Serio)" 
];

const datalist = document.getElementById('rotte-list');
ROTTE_VELOXFLY.forEach(r => {
  const opt = document.createElement('option');
  opt.value = r;
  datalist.appendChild(opt);
});

const form = document.getElementById('flight-form');
const partenzaInput = document.getElementById('partenza');
const destinazioneInput = document.getElementById('destinazione');
const dataInp   ut = document.getElementById('data');
const passengerNameInput = document.getElementById('passenger_name');
const contactEmailInput = document.getElementById('contact_email');

function isValidRotta(value) {
  return ROTTE_VELOXFLY.some(r => r.toLowerCase()   .startsWith(value.toLowerCase()) || r.toLowerCase() === value.toLowerCase());
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const partenza = partenzaInput.value.trim();
  const destinazione = destinazioneInput.value.trim();
  const data = dataInput.value;
  const passenger_name = passengerNameInput.value.trim();
  const contact_email = contactEmailInput.value.trim();

  if (!isValidRotta(partenza) || !isValidRotta(destinazione)) {
    return alert("Seleziona rotte valide dell'elenco VeloxFly™.");
  }
  if (!passenger_name || !contact_email || !data) {
    return alert("Compila tutti i campi richiesti.");
  }

  try {
    const docRef = await addDoc(collection(db, "velox_prenotazioni"), {
      passenger_name,
      contact_email,
      partenza,
      destinazione,
      data, 
      stato: "DRAFT",
      hotel_scelto: "",
      noleggio_richiesto: "",
      note_logistiche: "",
      createdAt: serverTimestamp()
    });

    localStorage.setItem('prenotazione_id', docRef.id);
    window.location.href = "prenotazione.html";
  } catch (err) {
    console.error("Errore creazione prenotazione DRAFT:", err);
    alert("Errore creazione prenotazione. Controlla console.");
  }
});
    