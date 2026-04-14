/**
 * Basic validation tests for Zod schemas.
 * Run with: npx ts-node src/tests/validation.test.ts
 */

import { loginSchema, registerSchema, quizSchema, informativoSchema, validateBody } from '../validators/schemas';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('\n🧪 Running validation tests...\n');

// Login schema
{
  const valid = validateBody(loginSchema, { login: 'admin@gmail.com', password: '123456' });
  assert(valid.success === true, 'loginSchema accepts valid input');

  const empty = validateBody(loginSchema, { login: '', password: '' });
  assert(empty.success === false, 'loginSchema rejects empty login');

  const missing = validateBody(loginSchema, {});
  assert(missing.success === false, 'loginSchema rejects missing fields');
}

// Register schema
{
  const valid = validateBody(registerSchema, { nome: 'Test User', email: 'test@test.com', senha: 'abcdefgh' });
  assert(valid.success === true, 'registerSchema accepts valid input');

  const shortPass = validateBody(registerSchema, { nome: 'Test', email: 'test@test.com', senha: '123' });
  assert(shortPass.success === false, 'registerSchema rejects short password');

  const badEmail = validateBody(registerSchema, { nome: 'Test', email: 'not-an-email', senha: 'abcdefgh' });
  assert(badEmail.success === false, 'registerSchema rejects invalid email');

  const shortName = validateBody(registerSchema, { nome: 'T', email: 'test@test.com', senha: 'abcdefgh' });
  assert(shortName.success === false, 'registerSchema rejects short name');
}

// Quiz schema
{
  const valid = validateBody(quizSchema, { nome: 'Quiz Test' });
  assert(valid.success === true, 'quizSchema accepts minimal input');

  const full = validateBody(quizSchema, {
    nome: 'Full Quiz',
    descricao: 'Description',
    ativo: true,
    id_categoria: 1,
    tempo_estimado_min: 15,
    tentativas_max: 5,
    visibilidade: 'privado',
    feedback_ativo: false,
  });
  assert(full.success === true, 'quizSchema accepts full input');

  const empty = validateBody(quizSchema, { nome: '' });
  assert(empty.success === false, 'quizSchema rejects empty nome');
}

// Informativo schema
{
  const valid = validateBody(informativoSchema, { titulo: 'Info Test' });
  assert(valid.success === true, 'informativoSchema accepts minimal input');

  const withTags = validateBody(informativoSchema, {
    titulo: 'With Tags',
    resumo: 'Summary',
    tagIds: [1, 2, 3],
  });
  assert(withTags.success === true, 'informativoSchema accepts tagIds');

  const empty = validateBody(informativoSchema, { titulo: '' });
  assert(empty.success === false, 'informativoSchema rejects empty titulo');
}

console.log('\n🏁 Validation tests complete.\n');
