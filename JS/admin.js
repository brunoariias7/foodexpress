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
                </div>
            `;

            listaPedidos.appendChild(tarjeta);
        });

    } catch (error) {
        console.error(error);
        listaPedidos.innerHTML = "<p>Error al cargar los pedidos.</p>";
    }
}

cargarPedidos();