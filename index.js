const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const { userModal, projectModal } = require("./Schemas");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);

mongoose.connect("mongodb://127.0.0.1:27017/IDE").then(() => {
  console.log("mongo is running");
});

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("new user connected: ", socket.id);

  socket.on("send-code", async (data) => {
    await projectModal.findByIdAndUpdate(data.id, {
      [data.lang]: data.value,
    });

    io.emit("received-code", data);
  });
});

app.post("/signup", async (req, res) => {
  try {
    const user = req.body;
    const findByEmail = await userModal.findOne({ email: user.email });
    if (findByEmail) {
      return res.status(400).send("User already exists");
    }

    const createUser = await userModal.create(user);

    const token = createUser._id;

    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const findUser = await userModal.findOne({ email: req.body.email });

    if (!findUser) {
      return res.status(400).send("User not found");
    }
    if (findUser.password !== req.body.password) {
      res.status(400).send("Invalid Credentials");
    }
    const token = findUser._id;
    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/create-project/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { projectName } = req.body;

    const newProject = await projectModal.create({
      userId: userId,
      projectName: projectName,
    });

    res.status(201).send(newProject);
  } catch (err) {
    res.status(500).send("Something went wrong.");
  }
});

app.get("/all-projects/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const projects = await projectModal.find({ userId });

    res.status(200).send(projects);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

app.get("/project/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const project = await projectModal.findById(id);

    res.status(200).send(project);
  } catch (err) {
    res.status(500).send("Something went wrong.");
  }
});

app.delete("/project/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleteProject = await projectModal.findByIdAndDelete(id);

    if (!deleteProject) {
      return res.status(404).send("Project not found");
    }

    res.status(200).send("Project deleted successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email;

    const findUserByEmail = await userModal.findOne({ email });
    if (!findUserByEmail) {
      return res.status(404).send("User not Found");
    }

    const userId = findUserByEmail._id;

    const url = `http://localhost:5173/new-password?userId=${userId}`;
    res.status(201).send({ url });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/new-password", async (req, res) => {
  try {
    const { userId, password } = req.body;

    await userModal.findByIdAndUpdate(userId, { password });

    res.status(200).send("Password Update Successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

httpServer.listen(5000, () => {
  console.log("port is running on 5000");
});
