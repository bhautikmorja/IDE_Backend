const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  userName: { type: String, required: true },
  password: { type: String, required: true },
});

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  projectName: { type: String, requires: false },
  HTML: { type: String, required: false },
  CSS: { type: String, required: false },
  JS: { type: String, required: false },
});

const userModal = mongoose.model("user", userSchema);
const projectModal = mongoose.model("projects", projectSchema);

module.exports = { userModal, projectModal };
