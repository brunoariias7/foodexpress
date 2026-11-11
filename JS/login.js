const formulario = document.getElementById("form-login");
const mensaje = document.getElementById("mensaje-login");

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const respuesta = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje);
        }

        mensaje.textContent = `¡Bienvenido, ${resultado.usuario.nombre}!`;

        console.log("Usuario conectado:", resultado.usuario);

    } catch (error) {
        console.error("Error:", error);
        mensaje.textContent = error.message;
    }
});