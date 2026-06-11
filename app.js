const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbz3VxiIyRtlnQds5dBbUvr2FR9gvM_YZYh99BHv_1e5jpv-f8d234_gZttZHGri2udY4w/exec";

const form = document.getElementById("participantForm");
const box = document.getElementById("participants");

function calcularCompatibilidad(usuario, candidato) {

    if (usuario.rol === candidato.rol) return 0;

    let puntos = 0;

    if (usuario.nivel === candidato.nivel) {
        puntos += 50;
    } else {
        const flexible1 = usuario.flexible === true || usuario.flexible === "true";
        const flexible2 = candidato.flexible === true || candidato.flexible === "true";

        if (flexible1 && flexible2) {
            puntos += 20;
        } else {
            return 0;
        }
    }

    const diasUsuario = usuario.disponibilidad || [];
    const diasCandidato = Array.isArray(candidato.disponibilidad)
        ? candidato.disponibilidad
        : String(candidato.disponibilidad).split(",");

    diasUsuario.forEach(dia => {
        if (diasCandidato.includes(dia)) {
            puntos += 10;
        }
    });

    return Math.min(puntos, 100);
}

async function cargarParticipantes() {

    try {

        const response = await fetch(SCRIPT_URL);
        const participantes = await response.json();

        box.innerHTML = "";

        participantes.reverse().forEach(p => {

            box.innerHTML += `
            <div class="person">
                <strong>${p.nombre}</strong><br>
                ${p.rol} • ${p.nivel}<br>
                📱 <a href="https://wa.me/${p.whatsapp.replace(/\\D/g,'')}" target="_blank">
                    ${p.whatsapp}
                </a>
            </div>
            `;
        });

    } catch (error) {
        console.error(error);
    }
}

form.addEventListener("submit", async function(e) {

    e.preventDefault();

    const disponibilidad = [];

    document.querySelectorAll(".days input:checked").forEach(d => {
        disponibilidad.push(d.value);
    });

    const participante = {
        nombre: document.getElementById("nombre").value,
        whatsapp: document.getElementById("whatsapp").value,
        rol: document.getElementById("rol").value,
        nivel: document.getElementById("nivel").value,
        flexible: document.getElementById("flexible").checked,
        disponibilidad
    };

    try {

        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(participante)
        });

        await response.json();

        alert("¡Registro enviado correctamente!");

        form.reset();

        cargarParticipantes();

        mostrarMatches(participante);

    } catch (error) {

        console.error(error);
        alert("Error enviando datos.");

    }

});

async function mostrarMatches(usuario) {

    const response = await fetch(SCRIPT_URL);
    const participantes = await response.json();

    let matches = participantes
        .map(p => ({
            ...p,
            score: calcularCompatibilidad(usuario, p)
        }))
        .filter(p => p.score > 0)
        .sort((a,b) => b.score - a.score)
        .slice(0,5);

    let html = `
    <div class="card">
        <h2>❤️ Mejores Matches</h2>
    `;

    if(matches.length === 0){

        html += `
        <p>Aún no encontramos coincidencias.</p>
        `;

    } else {

        matches.forEach(m => {

            html += `
            <div class="person">
                <strong>${m.nombre}</strong><br>
                ${m.rol} • ${m.nivel}<br>
                Compatibilidad: ${m.score}%<br>
                📱 <a href="https://wa.me/${m.whatsapp.replace(/\\D/g,'')}" target="_blank">
                    ${m.whatsapp}
                </a>
            </div>
            `;

        });

    }

    html += "</div>";

    const oldMatches = document.getElementById("matches");

    if(oldMatches){
        oldMatches.remove();
    }

    const div = document.createElement("div");
    div.id = "matches";
    div.innerHTML = html;

    document.body.appendChild(div);
}

function countdown() {

    const target = new Date("2026-08-30T00:00:00");

    const diff = target - new Date();

    const days = Math.floor(diff / 86400000);

    document.getElementById("countdown").innerText =
        `Faltan ${days} días para la Rueda Gigante`;

}

countdown();
cargarParticipantes();