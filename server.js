const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Primera ruta de prueba
app.get("/", (req, res) => {
    res.json({
        mensaje: "¡Servidor FoodExpress funcionando correctamente!"
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});