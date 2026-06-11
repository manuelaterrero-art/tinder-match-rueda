const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbxui7VZfvZqj92n-qSw6AAvJggJXplyQSCSIqamMXAbRQHa8D8LQ60UBpM-mz5tutpIJw/exec";

const form = document.getElementById("participantForm");
const box = document.getElementById("participants");

function countdown() {
    const target = new Date("2026-08-30T00:00:00");
    const diff = target - new Date();
    const days = Math.floor(diff / 86400000);

    const countdownElement = document.getElementById("countdown");

    if (countdownElement) {
        countdownElement.innerText =
            `Faltan ${days} días para la Rueda Gigante`;
    }
}

function calcularCompatibilidad(usuario, candidato) {

    if (usuario.rol === candidato.rol) {
        return 0;
    }

    let puntos = 0;

    if (usuario.nivel === candidato.nivel) {
        puntos += 50;
    } else {

        const flexibleUsuario =
            usuario.flexible === true ||
            usuario.flexible === "true";

        const flexibleCandidato =
            candidato.flexible === true ||
            candidato.flexible === "true";

        if (flexibleUsuario && flexibleCandidato) {
            puntos += 20;
        } else {
            return 0;
        }
    }

    const diasUsuario = usuario.disponibilidad || [];

    const diasCandidato = Array.isArray(candidato.disponibilidad)
        ? candidato.disponibilidad
        : String(candidato.disponibilidad || "")
            .split(",")
            .map(x => x.trim());

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
                📱 <a href="https://wa.me/${String(p.whatsapp).replace(/\\D/g,'')}" target="_blank">
                    ${p.whatsapp}
                </a>
            </div>
            `;
        });

    } catch (error) {

        console.error(error);

        box.innerHTML = `
        <div class="person">
            Error cargando participantes.
        </div>
        `;
    }
}

async function mostrarMatches(usuario) {

    try {

        const response = await fetch(SCRIPT_URL);

        const participantes = await response.json();

        const matches = participantes
            .map(p => ({
                ...p,
                score: calcularCompatibilidad(usuario, p)
            }))
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        let html = `
        <div class="card" id="matches">
            <h2>❤️ Mejores Matches</h2>
        `;

        if (matches.length === 0) {

            html += `
            <p>No encontramos coincidencias todavía.</p>
            `;

        } else {

            matches.forEach(m => {

                html += `
                <div class="person">
                    <strong>${m.nombre}</strong><br>
                    ${m.rol} • ${m.nivel}<br>
                    ❤️ Compatibilidad: ${m.score}%<br>
                    📱 <a href="https://wa.me/${String(m.whatsapp).replace(/\\D/g,'')}" target="_blank">
                        ${m.whatsapp}
                    </a>
                </div>
                `;
            });
        }

        html += `</div>`;

        const anterior = document.getElementById("matches");

        if (anterior) {
            anterior.remove();
        }

        document.body.insertAdjacentHTML("beforeend", html);

    } catch (error) {

        console.error(error);
    }
}

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const disponibilidad = [];

    document.querySelectorAll(".days input:checked")
        .forEach(d => disponibilidad.push(d.value));

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

        const resultado = await response.json();

        if (resultado.success) {

            alert("Registro enviado correctamente");

            form.reset();

            await cargarParticipantes();

            await mostrarMatches(participante);

        } else {

            alert("Error guardando datos");
        }

    } catch (error) {

        console.error(error);

        alert("Error enviando datos");
    }
});

countdown();
cargarParticipantes();