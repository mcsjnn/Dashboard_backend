// Importamos el módulo 'jsonwebtoken' para trabajar con JWT
import jwt from "jsonwebtoken";

// Importamos los modelos y constantes definidos en la aplicación
import db from "../models/index.js";

// Importamos la configuración de autenticación (clave secreta)
import authConfig from "../config/auth.config.js";

// Extraemos los modelos 'User' y 'Role' del objeto 'db'
const { user: User, role: Role } = db;

/**
 * Middleware para verificar la validez del token JWT en las solicitudes entrantes.
 */
export const verifyToken = async (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "¡No se proporcionó un token!" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), authConfig.secret);
    req.userId = decoded.id;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(401).json({ message: "¡No autorizado!" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "¡No autorizado!" });
  }
};

/**
 * Middleware para verificar si el usuario tiene el rol de 'admin'.
 */
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    const adminRole = roles.find(role => role.name === "admin");

    if (adminRole) {
      next();
      return;
    }

    res.status(403).json({ message: "¡Se requiere el rol de administrador!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Middleware para verificar si el usuario tiene el rol de 'moderator'.
 */
export const isModerator = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    const modRole = roles.find(role => role.name === "moderator");

    if (modRole) {
      next();
      return;
    }

    res.status(403).json({ message: "¡Se requiere el rol de moderador!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Middleware para verificar si el usuario tiene el rol de 'admin' o 'moderator'.
 */
export const isModeratorOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    const hasRole = roles.some(role => ["admin", "moderator"].includes(role.name));

    if (hasRole) {
      next();
      return;
    }

    res.status(403).json({ message: "¡Se requiere el rol de moderador o administrador!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};