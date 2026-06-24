const { types } = require("pg");
 
// OID 1082 = tipe DATE bawaan PostgreSQL
types.setTypeParser(1082, (val) => val); // val sudah berbentuk "YYYY-MM-DD", kembalikan apa adanya
 
// ---- lanjutan kode pool/db kamu yang sudah ada, taruh di bawah baris ini ----
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;