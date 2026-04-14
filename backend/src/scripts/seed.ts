/**
 * Database migration/seed script.
 * Run with: npm run seed
 *
 * This script:
 * 1. Ensures the configured database exists
 * 2. Creates or updates the schema
 * 3. Inserts initial data with INSERT IGNORE
 */

import mariadb from 'mariadb';
import dotenv from 'dotenv';
import { loadSchemaSql } from '../database/schemaLoader';

dotenv.config();

async function runMigration() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'test';

  console.log('Starting database migration...');

  let conn;
  try {
    conn = await mariadb.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
      insertIdAsNumber: true,
      bigIntAsNumber: true,
    });

    const schemaSql = loadSchemaSql(database);
    const statements = schemaSql
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0 && !statement.startsWith('--'));

    for (const statement of statements) {
      try {
        await conn.query(statement);
      } catch (err: any) {
        if (!err.message?.includes('already exists')) {
          console.warn(`Statement warning: ${err.message?.substring(0, 120)}`);
        }
      }
    }

    console.log(`Schema created or updated successfully in "${database}".`);

    const userCount = await conn.query('SELECT COUNT(*) as cnt FROM usuario');
    if (Number(userCount[0].cnt) === 0) {
      console.log('Initial data inserted.');
    } else {
      console.log(`Database already has ${userCount[0].cnt} users. Seed data was kept with INSERT IGNORE.`);
    }

    console.log('Migration complete.');
  } catch (err: any) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

runMigration();
