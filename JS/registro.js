const formulario = document.getElementById("form-registro");
const mensaje = document.getElementById("mensaje-registro");

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar").value;

    if (password !== confirmar) {
        mensaje.textContent = "Las contraseñas no coinciden";
        return;
    }

    try {
        const respuesta = await fetch("http://localhost:3000/registro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre: nombre,
                email: email,
                password: password
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje);
        }

        mensaje.textContent = "¡Cuenta creada correctamente!";

        formulario.reset();

    } catch (error) {
        console.error("Error:", error);
        mensaje.textContent = error.message;
    }
});