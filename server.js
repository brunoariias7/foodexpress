const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
    res.json({
        mensaje: "FoodExpress funcionando"
    });
});

// Probar conexión con MySQL
app.get("/test-db", async (req, res) => {
    try {
        const [resultado] = await db.query("SELECT 1 AS conexion");

        res.json({
            mensaje: "Conexión con MySQL exitosa",
            resultado: resultado
        });

    } catch (error) {
        console.error("Error MySQL:", error.message);

        res.status(500).json({
            mensaje: "Error al conectar con MySQL",
            error: error.message
        });
    }
});

// Consultar productos
app.get("/productos", async (req, res) => {
    try {
        const [productos] = await db.query(
            "SELECT * FROM productos"
        );

        res.json(productos);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al consultar productos"
        });
    }
});
// Crear un nuevo pedido
app.post("/pedidos", async (req, res) => {
    const { productos } = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
            mensaje: "El pedido está vacío"
        });
    }

    for (const producto of productos) {
        if (
            !Number.isInteger(Number(producto.id)) ||
            !Number.isInteger(Number(producto.cantidad)) ||
            Number(producto.id) <= 0 ||
            Number(producto.cantidad) <= 0
        ) {
            return res.status(400).json({
                mensaje: "Producto o cantidad inválida"
            });
        }
    }

    let conexion;

    try {
        conexion = await db.getConnection();
        await conexion.beginTransaction();

        let total = 0;
        const detalles = [];

        for (const producto of productos) {
            const [resultado] = await conexion.query(
                "SELECT id, nombre, precio FROM productos WHERE id = ?",
                [producto.id]
            );

            if (resultado.length === 0) {
                throw new Error("Producto no encontrado: " + producto.id);
            }

            const datos = resultado[0];
            const cantidad = Number(producto.cantidad);
            const precio = Number(datos.precio);
            const subtotal = precio * cantidad;

            total += subtotal;

            detalles.push({
                id: datos.id,
                nombre: datos.nombre,
                precio: precio,
                cantidad: cantidad,
                subtotal: subtotal
            });
        }

        const [pedidoCreado] = await conexion.query(
            "INSERT INTO pedidos (total) VALUES (?)",
            [total]
        );

        const pedidoId = pedidoCreado.insertId;

        for (const detalle of detalles) {
            await conexion.query(
                `INSERT INTO detalle_pedido
                (pedido_id, producto_id, nombre_producto,
                precio_unitario, cantidad, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    pedidoId,
                    detalle.id,
                    detalle.nombre,
                    detalle.precio,
                    detalle.cantidad,
                    detalle.subtotal
                ]
            );
        }

        await conexion.commit();

        res.status(201).json({
            mensaje: "Pedido guardado correctamente",
            pedido_id: pedidoId,
            total: total
        });

    } catch (error) {
        if (conexion) {
            await conexion.rollback();
        }

        console.error("Error al guardar pedido:", error);

        res.status(500).json({
            mensaje: "No se pudo guardar el pedido"
        });

    } finally {
        if (conexion) {
            conexion.release();
        }
    }
});
// Consultar todos los pedidos
app.get("/admin/pedidos", async (req, res) => {
    try {
        const [pedidos] = await db.query(
            "SELECT * FROM pedidos ORDER BY fecha_creacion DESC"
        );

        const [detalles] = await db.query(
            "SELECT * FROM detalle_pedido"
        );

        const pedidosCompletos = pedidos.map(function (pedido) {
            return {
                ...pedido,
                productos: detalles.filter(function (detalle) {
                    return detalle.pedido_id === pedido.id;
                })
            };
        });

        res.json(pedidosCompletos);

    } catch (error) {
        console.error("Error al consultar pedidos:", error);

        res.status(500).json({
            mensaje: "Error al consultar los pedidos"
        });
    }
});
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});