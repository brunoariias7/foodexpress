// Recuperar el pedido guardado
let pedido = JSON.parse(localStorage.getItem("pedido")) || [];

// Elementos del HTML
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const botonVaciar = document.getElementById("vaciar-carrito");

// Mostrar productos
function mostrarCarrito() {
    listaCarrito.innerHTML = "";

    let total = 0;

    if (pedido.length === 0) {
        listaCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";
    }

    pedido.forEach(function (producto, indice) {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        const elemento = document.createElement("div");
        elemento.className = "pedido";

        elemento.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio.toLocaleString("es-AR")}</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <p>Subtotal: $${subtotal.toLocaleString("es-AR")}</p>
            <button onclick="eliminarProducto(${indice})">Eliminar</button>
        `;

        listaCarrito.appendChild(elemento);
    });

    totalCarrito.textContent = "$" + total.toLocaleString("es-AR");
}

// Eliminar producto
function eliminarProducto(indice) {
    pedido.splice(indice, 1);

    localStorage.setItem("pedido", JSON.stringify(pedido));

    mostrarCarrito();
}

// Vaciar carrito
botonVaciar.addEventListener("click", function () {
    pedido = [];

    localStorage.setItem("pedido", JSON.stringify(pedido));

    mostrarCarrito();
});
// Confirmar pedido
const botonConfirmar = document.getElementById("confirmar-pedido");

botonConfirmar.addEventListener("click", async function () {
    if (pedido.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    const productos = pedido.map(function (producto) {
        return {
            id: producto.id,
            cantidad: producto.cantidad
        };
    });

    try {
        const respuesta = await fetch("http://localhost:3000/pedidos", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ productos: productos })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje);
        }

        alert(
            "¡Pedido confirmado!\nNúmero de pedido: " +
            resultado.pedido_id +
            "\nTotal: $" +
            Number(resultado.total).toLocaleString("es-AR")
        );

        pedido = [];

        localStorage.setItem("pedido", JSON.stringify(pedido));

        mostrarCarrito();

    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo confirmar el pedido: " + error.message);
    }
});
// Mostrar al cargar
mostrarCarrito();