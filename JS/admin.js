const listaPedidos = document.getElementById("lista-pedidos");

async function cargarPedidos() {
    try {
        const respuesta = await fetch("http://localhost:3000/admin/pedidos");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los pedidos");
        }

        const pedidos = await respuesta.json();

        listaPedidos.innerHTML = "";

        if (pedidos.length === 0) {
            listaPedidos.innerHTML = "<p>Todavía no hay pedidos.</p>";
            return;
        }

        pedidos.forEach(function (pedido) {
            const tarjeta = document.createElement("article");
            tarjeta.className = "card";

            const productosHTML = pedido.productos.map(function (producto) {
                return `
                    <p>
                        ${producto.nombre_producto}
                        x${producto.cantidad}
                        — $${Number(producto.subtotal).toLocaleString("es-AR")}
                    </p>
                `;
            }).join("");

            tarjeta.innerHTML = `
                <div class="card-body">
                    <h2>Pedido #${pedido.id}</h2>
                    <p>Fecha: ${new Date(pedido.fecha_creacion).toLocaleString("es-AR")}</p>
                    <p>Estado: ${pedido.estado}</p>

                    <h3>Productos</h3>
                    ${productosHTML}

                    <h3>Total: $${Number(pedido.total).toLocaleString("es-AR")}</h3>

<label>Estado del pedido:</label>

<select class="estado-pedido" data-id="${pedido.id}">
    <option value="pendiente" ${pedido.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
    <option value="preparando" ${pedido.estado === "preparando" ? "selected" : ""}>Preparando</option>
    <option value="enviado" ${pedido.estado === "enviado" ? "selected" : ""}>Enviado</option>
    <option value="entregado" ${pedido.estado === "entregado" ? "selected" : ""}>Entregado</option>
</select>

<button class="guardar-estado" data-id="${pedido.id}">
    Guardar estado
</button>
                </div>
            `;

            listaPedidos.appendChild(tarjeta);
        });

    } catch (error) {
        console.error(error);
        listaPedidos.innerHTML = "<p>Error al cargar los pedidos.</p>";
    }
}
// Guardar cambios de estado
listaPedidos.addEventListener("click", async function (evento) {
    if (!evento.target.classList.contains("guardar-estado")) {
        return;
    }

    const pedidoId = evento.target.dataset.id;

    const selector = listaPedidos.querySelector(
        `.estado-pedido[data-id="${pedidoId}"]`
    );

    const nuevoEstado = selector.value;

    try {
        const respuesta = await fetch(
            `http://localhost:3000/admin/pedidos/${pedidoId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    estado: nuevoEstado
                })
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje);
        }

        alert("¡Estado del pedido actualizado!");

        cargarPedidos();

    } catch (error) {
        console.error(error);
        alert("No se pudo actualizar el estado: " + error.message);
    }
});
cargarPedidos();