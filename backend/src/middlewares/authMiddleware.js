const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Cek apakah token ada
    if (!authHeader) {
      return res.status(401).json({
        message: "Token tidak ditemukan",
      });
    }

    // Format:
    // Bearer tokennya
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token tidak valid",
      });
    }

    // Verifikasi JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Simpan user ke request
    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid atau kadaluarsa",
    });
  }
};

module.exports = verifyToken;