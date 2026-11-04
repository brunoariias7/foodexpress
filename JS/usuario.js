document.addEventListener("DOMContentLoaded", async () => {
    const usuarioMenu = document.getElementById("usuario-menu");

    try {
        const respuesta = await fetch("http://127.0.0.1:3000/sesion", {
            credentials: "include"
        });

        if (!respuesta.ok) {
            usuarioMenu.innerHTML = `
                <a href="login.html" aria-label="Iniciar sesión">♙</a>
            `;
            return;
        }

        const datos = await respuesta.json();

        usuarioMenu.innerHTML = `
            <div class="usuario-conectado">
                <span>Hola, ${datos.usuario}</span>
                <button id="cerrar-sesion">Cerrar sesión</button>
            </div>
        `;

        document.getElementById("cerrar-sesion").addEventListener("click", async () => {
            const cierre = await fetch("http://127.0.0.1:3000/logout", {
                method: "POST",
                credentials: "include"
            });

            if (cierre.ok) {
                window.location.reload();
            }
        });

    } catch (error) {
        console.error("Error al comprobar la sesión:", error);
    }
});