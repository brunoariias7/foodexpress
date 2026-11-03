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

// Mostrar al cargar
mostrarCarrito();