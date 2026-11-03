const express = require("express");
const cors = require("cors");
const db = require("./database");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    createDatabaseTable: true
});

app.use(session({
    key: "foodexpress_session",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

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
// Actualizar estado de un pedido
app.put("/admin/pedidos/:id", async (req, res) => {
    const pedidoId = Number(req.params.id);
    const { estado } = req.body;

    const estadosPermitidos = [
        "pendiente",
        "preparando",
        "enviado",
        "entregado"
    ];

    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
        return res.status(400).json({
            mensaje: "ID de pedido inválido"
        });
    }

    if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
            mensaje: "Estado no válido"
        });
    }

    try {
        const [resultado] = await db.query(
            "UPDATE pedidos SET estado = ? WHERE id = ?",
            [estado, pedidoId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });
        }

        res.json({
            mensaje: "Estado actualizado correctamente",
            pedido_id: pedidoId,
            estado: estado
        });

    } catch (error) {
        console.error("Error al actualizar estado:", error);

        res.status(500).json({
            mensaje: "No se pudo actualizar el estado"
        });
    }
});
// Registrar un nuevo usuario
app.post("/registro", async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            mensaje: "La contraseña debe tener al menos 8 caracteres"
        });
    }

    try {
        const correo = email.trim().toLowerCase();

        const [usuarios] = await db.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [correo]
        );

        if (usuarios.length > 0) {
            return res.status(409).json({
                mensaje: "Ese correo ya está registrado"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await db.query(
            `INSERT INTO usuarios (nombre, email, password_hash)
             VALUES (?, ?, ?)`,
            [nombre.trim(), correo, passwordHash]
        );

        res.status(201).json({
            mensaje: "Usuario registrado correctamente"
        });

    } catch (error) {
        console.error("Error al registrar usuario:", error);

        res.status(500).json({
            mensaje: "No se pudo registrar el usuario"
        });
    }
});
// Iniciar sesión
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            mensaje: "Completá todos los campos"
        });
    }

    try {
        const correo = email.trim().toLowerCase();

        const [usuarios] = await db.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [correo]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensaje: "Correo o contraseña incorrectos"
            });
        }

        const usuario = usuarios[0];

        const passwordValida = await bcrypt.compare(
            password,
            usuario.password_hash
        );

        if (!passwordValida) {
            return res.status(401).json({
                mensaje: "Correo o contraseña incorrectos"
            });
        }

        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };

        res.json({
            mensaje: "Inicio de sesión exitoso",
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error("Error al iniciar sesión:", error);

        res.status(500).json({
            mensaje: "Error interno del servidor"
        });
    }
});
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});