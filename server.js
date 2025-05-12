// Importa Express para crear la aplicación web
import express from "express";

// Importa CORS para permitir solicitudes desde otros dominios (por ejemplo, desde el frontend)
import cors from "cors";

// Importa los modelos y configuración de Sequelize (ORM para la base de datos)
import db from "./app/models/index.js";

// Importa las rutas de autenticación (signup, signin)
import authRoutes from "./app/routes/auth.routes.js";

// Importa las rutas protegidas por roles de usuario
import userRoutes from "./app/routes/user.routes.js";

import session from "express-session";

// Crea una instancia de la aplicación Express
const app = express();

// Configura las opciones de CORS para permitir acceso desde el frontend en producción y desarrollo
const corsOptions = {
  origin: [
    "https://frontend-react-u4lc.onrender.com", // Dominio del frontend en producción
    // "http://localhost:3001", // Dominio del frontend en desarrollo
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Permite el envío de cookies o encabezados de autenticación
};

// Aplica el middleware de CORS a la aplicación
app.use(cors(corsOptions));

// Middleware para analizar solicitudes con cuerpo en formato JSON
app.use(express.json());

// Middleware para analizar solicitudes con cuerpo en formato URL-encoded (formularios)
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones (opcional, pero no recomendado para producción con MemoryStore)
app.use(
  session({
    secret: "your-secret-key", // Cambia esto por una clave secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Usa secure: true si usas HTTPS
  })
);

// Ruta simple para probar que el servidor está funcionando
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Node.js JWT Authentication API." });
});

// Define la ruta base para autenticación: /api/auth/signup y /api/auth/signin
app.use("/api/auth", authRoutes);

// Define la ruta base para pruebas de acceso según el rol del usuario: /api/test/*
app.use("/api/test", userRoutes);

// Función para inicializar los roles en la tabla `roles`
const initializeRoles = async () => {
  const roles = ["user", "admin", "moderator"];
  for (const role of roles) {
    const existingRole = await db.role.findOne({ where: { name: role } });
    if (!existingRole) {
      await db.role.create({ name: role });
      console.log(`Role '${role}' created.`);
    }
  }
};

// Define el puerto en el que se ejecutará el servidor. Usa el puerto asignado por Render o 3000 por defecto
const PORT = process.env.PORT || 3000;

// Sincroniza los modelos con la base de datos (sin borrar datos si force es false)
// Luego inicia el servidor y asegura que los roles existan
db.sequelize.sync({ force: false }).then(async () => {
  console.log("Database synchronized");
  await initializeRoles(); // Inicializa los roles
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});