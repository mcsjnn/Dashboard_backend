import dotenv from "dotenv";

// Carga las variables de entorno desde el archivo .env (en desarrollo)
dotenv.config();

export default {
  secret: process.env.JWT_SECRET || "default-secret-key", // Usa la variable de entorno o una clave por defecto
};