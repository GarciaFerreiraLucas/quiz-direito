import fs from 'fs';
import path from 'path';

const CREATE_DATABASE_REGEX = /CREATE DATABASE IF NOT EXISTS\s+`?[\w-]+`?\s*;/i;
const USE_DATABASE_REGEX = /USE\s+`?[\w-]+`?\s*;/i;

export function loadSchemaSql(databaseName: string) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const rawSql = fs.readFileSync(schemaPath, 'utf8');

  return rawSql
    .replace(CREATE_DATABASE_REGEX, `CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`)
    .replace(USE_DATABASE_REGEX, `USE \`${databaseName}\`;`);
}
