import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "quiz_juridico",
  connectionLimit: 5,
});

export async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error("Erro ao conectar no banco:", error);
    throw error;
  }
}

export default pool;