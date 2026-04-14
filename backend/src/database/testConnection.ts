import pool from './connection';

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conexão com MariaDB bem-sucedida!');
    
    // Check tables
    const rows = await conn.query('SHOW TABLES');
    console.log('Tabelas encontradas no banco:', rows);

    conn.release();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Falha ao conectar com MariaDB:', err.message);
    process.exit(1);
  }
}

testConnection();
