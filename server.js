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

    // Por ahora solo validamos que lleguen IDs y cantidades válidas
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

    res.json({
        mensaje: "Los productos llegaron correctamente al servidor"
    });
});
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});