const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // 1. Validasi Input
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    // 2. Cek Email Sudah Ada
    const existingEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        message: "Email sudah terdaftar",
      });
    }

    // 3. Cek Username Sudah Ada
    const existingUsername = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({
        message: "Username sudah digunakan",
      });
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Simpan User
    const newUser = await pool.query(
      `
      INSERT INTO users
      (name, username, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, username, email, created_at
      `,
      [name, username, email, hashedPassword]
    );

    // 6. Response
    res.status(201).json({
      message: "Register berhasil",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi
    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    // Cari user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: "Email tidak ditemukan",
        error_field: "email",
      });
    }

    const user = userResult.rows[0];

    // Cek password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Password salah",
        error_field: "password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const profile = async (req, res) => {
  try {
    // req.user hanya berisi payload JWT ({id, email}),
    // jadi kita query ulang ke DB untuk ambil data lengkap (termasuk username)
    const result = await pool.query(
      "SELECT id, name, username, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({
      message: "Profile berhasil diakses",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  register,
  login,
  profile,
};