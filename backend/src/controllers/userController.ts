import { Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../database/connection';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/express';

const SECRET_KEY = process.env.JWT_SECRET || 'secret123';
const TOKEN_EXPIRY = '8h';

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id_usuario, nome, email, perfil FROM usuario WHERE id_usuario = ?', [req.user.id]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const u = rows[0];
    const frontendRole = u.perfil === 'admin' ? 'professor' : u.perfil;

    res.json({
      id: u.id_usuario,
      nome: u.nome,
      email: u.email,
      perfil: frontendRole,
    });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Erro ao buscar dados do perfil.' });
  } finally {
    if (conn) conn.release();
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { nome, email, password } = req.body;

  if (!nome || !email) {
    res.status(400).json({ error: 'Nome e E-mail são obrigatórios.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Check if new email is already used by someone else
    const emailCheck = await conn.query('SELECT id_usuario FROM usuario WHERE email = ? AND id_usuario != ?', [email, req.user.id]);
    if (emailCheck.length > 0) {
      res.status(400).json({ error: 'Este e-mail já está cadastrado por outro usuário.' });
      return;
    }

    if (password) {
      if (password.length < 8) {
        res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres.' });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await conn.query('UPDATE usuario SET nome = ?, email = ?, senha_hash = ?, atualizado_em = NOW() WHERE id_usuario = ?', [
        nome, email, hashedPassword, req.user.id
      ]);
    } else {
      await conn.query('UPDATE usuario SET nome = ?, email = ?, atualizado_em = NOW() WHERE id_usuario = ?', [
        nome, email, req.user.id
      ]);
    }

    // Generate new JWT to reflect updated data
    const updatedRows = await conn.query('SELECT * FROM usuario WHERE id_usuario = ?', [req.user.id]);
    const updatedUser = updatedRows[0];
    const frontendRole = updatedUser.perfil === 'admin' ? 'professor' : updatedUser.perfil;

    // Use same field name 'role' (not 'profile') to match auth middleware expectations
    const token = jwt.sign(
      { id: updatedUser.id_usuario, email: updatedUser.email, role: frontendRole },
      SECRET_KEY,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      message: 'Perfil atualizado com sucesso.',
      token,
      user: { name: updatedUser.nome, email: updatedUser.email, role: frontendRole }
    });
  } catch (err: any) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
  } finally {
    if (conn) conn.release();
  }
};
