const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (data) => {
  return jwt.sign(data, "token");
};

const verifyToken = (data) => {
  return jwt.verify(data, "token");
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const checkHashPassword = async (password, hashPassword) => {
  return await bcrypt.compare(password, hashPassword);
};

export { generateToken, verifyToken, hashPassword, checkHashPassword };
