import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import pool from '../database/connection';
import { sendPasswordResetEmail } from '../services/emailService';

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'E-mail inválido.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // 1. Validate if user exists
    const users = await conn.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);

    // We MUST always return the same success message even if the user doesn't exist
    // to prevent email enumeration attacks. We only do the process if user exists.
    if (users.length > 0) {
      const user = users[0];

      // 2. Clear old pending tokens to avoid clutter
      await conn.query('DELETE FROM password_reset_tokens WHERE user_id = ? AND used_at IS NULL', [user.id_usuario]);

      // 3. Generate raw token and hash it
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      // 4. Save to database (Expire in 30 minutes)
      const expiresAt = new Date(Date.now() + 30 * 60000);
      await conn.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id_usuario, tokenHash, expiresAt]
      );

      // 5. Generate Reset Link
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      // 6. Send Email
      await sendPasswordResetEmail(email, resetLink);
    }

    res.status(200).json({
      message: 'Se o e-mail estiver cadastrado, enviaremos as instruções de redefinição de senha em alguns instantes.',
    });
  } catch (err: any) {
    console.error('Error in forgotPassword:', err);
    res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  } finally {
    if (conn) conn.release();
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    res.status(400).json({ error: 'Preencha todos os campos corretamente.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'As senhas não coincidem.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'A nova senha deve conter pelo menos 8 caracteres.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // 1. Hash the incoming raw token to find it in DB
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const tokens = await conn.query(
      'SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?',
      [tokenHash]
    );

    if (tokens.length === 0) {
      res.status(400).json({ error: 'O link de recuperação é inválido.' });
      return;
    }

    const resetRequest = tokens[0];

    // 2. Check if token was already used
    if (resetRequest.used_at !== null) {
      res.status(400).json({ error: 'Este link já foi utilizado. Solicite uma nova recuperação se necessário.' });
      return;
    }

    // 3. Check expiration
    if (new Date(resetRequest.expires_at) < new Date()) {
      res.status(400).json({ error: 'O link de recuperação de senha expirou. Por favor, solicite-o novamente.' });
      return;
    }

    // 4. Update the user password with BCrypt hash
    const newPasswordHash = await bcrypt.hash(password, 10);

    await conn.query('UPDATE usuario SET senha_hash = ?, atualizado_em = NOW() WHERE id_usuario = ?', [
      newPasswordHash,
      resetRequest.user_id,
    ]);

    // 5. Mark token as used
    await conn.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [resetRequest.id]);

    res.status(200).json({ message: 'Sua senha foi redefinida com sucesso!' });
  } catch (err: any) {
    console.error('Error in resetPassword:', err);
    res.status(500).json({ error: 'Erro interno ao redefinir a senha.' });
  } finally {
    if (conn) conn.release();
  }
};
