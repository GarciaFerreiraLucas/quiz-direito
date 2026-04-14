import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { sendPasswordResetEmail } from '../services/emailService';

async function test() {
  console.log('Iniciando teste de envio de e-mail...');
  console.log('Configurações atuais:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- EMAIL_TEST_RECEIVER:', process.env.EMAIL_TEST_RECEIVER);
  console.log('- EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('- API KEY present:', !!process.env.RESEND_API_KEY);

  try {
    const result = await sendPasswordResetEmail('teste@exemplo.com', 'http://localhost:5173/reset-password?token=test-token');
    console.log('Resultado do Resend:', result);
  } catch (error: any) {
    console.error('ERRO DETECTADO NO ENVIO:', error.message);
  }
}

test();
