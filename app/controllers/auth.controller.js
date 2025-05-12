import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authConfig from "../config/auth.config.js";

const { user: User, role: Role } = db;

export const signup = async (req, res) => {
  try {
    const { username, email, password, roles } = req.body; // Agregar 'password'

    const hashedPassword = await bcrypt.hash(password, 8); // Ahora 'password' está definido

    const userRole = await Role.findOne({ where: { name: "user" } });

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      roles: [userRole.id],
    });

    if (roles) {
      const foundRoles = await Role.findAll({
        where: {
          name: roles,
        },
      });
      const result = await user.setRoles(foundRoles);
      if (result) {
        res.send({ message: "User registered successfully!" });
      }
    } else {
      await user.setRoles([1]); // user role = 1
      res.send({ message: "User registered successfully!" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username },
      include: { model: Role, as: "roles" },
    });

    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    const token = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: 86400, // 24 hours
    });

    const authorities = user.roles.map(role => "ROLE_" + role.name.toUpperCase());

    req.session.token = token;

    return res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};