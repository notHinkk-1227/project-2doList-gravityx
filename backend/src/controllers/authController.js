const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validasi Input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    // 2. Cek Email Sudah Ada
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email sudah terdaftar",
      });
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan User
    const newUser = await pool.query(
      `
      INSERT INTO users
      (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
      `,
      [username, email, hashedPassword]
    );

    // 5. Response
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
        message: "Email atau password salah",
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
        message: "Email atau password salah",
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
  res.status(200).json({
    message: "Profile berhasil diakses",
    user: req.user,
  });
};

module.exports = {
  register,
  login,
  profile,
};