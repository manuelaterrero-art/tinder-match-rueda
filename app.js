import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyDIQVHW-W6TeUpHkRCxurwNUryu00Na_vM",
authDomain: "tinder-match-rueda.firebaseapp.com",
projectId: "tinder-match-rueda",
storageBucket: "tinder-match-rueda.firebasestorage.app",
messagingSenderId: "502983459956",
appId: "1:502983459956:web:f430fd90b41f0054cafd21"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("participantForm");
const participantsBox = document.getElementById("participants");

function countdown() {
const target = new Date("2026-08-30T00:00:00");
const diff = target - new Date();
const days = Math.floor(diff / 86400000);

document.getElementById("countdown").innerText =
`Faltan ${days} días para la Rueda Gigante`;
}

function calcularCompatibilidad(usuario, candidato) {

if (usuario.rol === candidato.rol) return 0;

let puntos = 0;

if (usuario.nivel === candidato.nivel) {
puntos += 50;
} else {
if (usuario.flexible && candidato.flexible) {
puntos += 20;
} else {
return 0;
}
}

usuario.disponibilidad.forEach(dia => {
if (
Array.isArray(candidato.disponibilidad) &&
candidato.disponibilidad.includes(dia)
) {
puntos += 10;
}
});

return Math.min(puntos, 100);
}

async function cargarParticipantes() {

participantsBox.innerHTML = "Cargando...";

const snapshot = await getDocs(
collection(db, "participantes")
);

participantsBox.innerHTML = "";

snapshot.forEach(doc => {

```
const p = doc.data();

participantsBox.innerHTML += `
  <div class="person">
    <strong>${p.nombre}</strong><br>
    ${p.rol} • ${p.nivel}<br>
    <a href="https://wa.me/${p.whatsapp}" target="_blank">
      📱 ${p.whatsapp}
    </a>
  </div>
`;
```

});
}

async function mostrarMatches(usuario) {

const snapshot = await getDocs(
collection(db, "participantes")
);

let matches = [];

snapshot.forEach(doc => {

```
const candidato = doc.data();

const score =
  calcularCompatibilidad(usuario, candidato);

if (score > 0) {
  matches.push({
    ...candidato,
    score
  });
}
```

});

matches.sort((a, b) => b.score - a.score);

const anterior = document.getElementById("matches");

if (anterior) anterior.remove();

let html = `     <section class="card" id="matches">       <h2>❤️ Mejores Matches</h2>
  `;

matches.slice(0, 5).forEach(m => {

```
html += `
  <div class="person">
    <strong>${m.nombre}</strong><br>
    ${m.rol} • ${m.nivel}<br>
    ❤️ ${m.score}% compatibilidad<br>
    <a href="https://wa.me/${m.whatsapp}" target="_blank">
      📱 Contactar
    </a>
  </div>
`;
```

});

html += "</section>";

document.body.insertAdjacentHTML(
"beforeend",
html
);
}

form.addEventListener("submit", async (e) => {

e.preventDefault();

const disponibilidad = [];

document
.querySelectorAll(".days input:checked")
.forEach(c => disponibilidad.push(c.value));

const participante = {
nombre: document.getElementById("nombre").value,
whatsapp: document.getElementById("whatsapp").value,
rol: document.getElementById("rol").value,
nivel: document.getElementById("nivel").value,
flexible: document.getElementById("flexible").checked,
disponibilidad: disponibilidad,
fecha: Date.now()
};

await addDoc(
collection(db, "participantes"),
participante
);

alert("Participante registrado");

form.reset();

await cargarParticipantes();

await mostrarMatches(participante);

});

countdown();
cargarParticipantes();
