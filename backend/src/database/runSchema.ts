import mariadb from 'mariadb';
import dotenv from 'dotenv';
import { loadSchemaSql } from './schemaLoader';

dotenv.config();

async function run() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'test';

  let conn;
  try {
    conn = await mariadb.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    console.log('Conectado ao servidor MariaDB.');

    const sql = loadSchemaSql(database);
    console.log(`Executando schema.sql em ${database}...`);

    await conn.query(sql);

    console.log(`Tabelas e dados iniciais criados com sucesso no banco "${database}".`);
  } catch (err: any) {
    console.error('Falha ao executar o schema:', err.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

run();
