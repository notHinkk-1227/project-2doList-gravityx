require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 5000;

const pool = require("./src/config/db");

const testRoutes = require("./src/routes/testRoutes");
const authRoutes = require("./src/routes/authRoutes");
const taskRoutes = require("./src/routes/taskRoutes");

app.use(cors());

app.use(express.json());

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

pool.connect()
  .then(() => {
    console.log("Database PostgreSQL berhasil terhubung");
  })
  .catch((err) => {
    console.error("Gagal terhubung ke database:", err.message);
  });

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});