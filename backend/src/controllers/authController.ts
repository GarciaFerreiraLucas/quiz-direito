import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../database/connection';
import { loginSchema, registerSchema, validateBody } from '../validators/schemas';

const SECRET_KEY = process.env.JWT_SECRET || 'secret123';
const TOKEN_EXPIRY = '8h';

export const login = async (req: Request, res: Response): Promise<void> => {
  const validation = validateBody(loginSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error });
    return;
  }
  const { login, password } = validation.data;

  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT id_usuario, nome, email, senha_hash, perfil FROM usuario WHERE email = ? OR nome = ?',
      [login, login]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Usuário não encontrado' });
      return;
    }

    const user = rows[0];

    // Only BCrypt comparison — no plaintext fallback
    const passwordMatch = await bcrypt.compare(password, user.senha_hash);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Senha incorreta' });
      return;
    }

    // Map DB role to frontend role ('admin' in DB = 'professor' in frontend)
    const frontendRole = user.perfil === 'admin' ? 'professor' : user.perfil;

    const token = jwt.sign(
      { id: user.id_usuario, email: user.email, role: frontendRole },
      SECRET_KEY,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      token,
      user: {
        id: user.id_usuario,
        name: user.nome,
        email: user.email,
        role: frontendRole,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro no servidor', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { confirmarSenha } = req.body;
  const validation = validateBody(registerSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error });
    return;
  }
  const { nome, email, senha } = validation.data;

  if (senha !== confirmarSenha) {
    res.status(400).json({ error: 'As senhas não coincidem.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Check if email exists
    const rows = await conn.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);
    if (rows.length > 0) {
      res.status(400).json({ error: 'Este e-mail já está em uso.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await conn.query('INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)', [
      nome,
      email,
      hashedPassword,
      'user'
    ]);

    res.status(201).json({ message: 'Conta criada com sucesso! Faça login para continuar.' });
  } catch (err) {
    console.error('Error in register:', err);
    res.status(500).json({ error: 'Erro interno no servidor ao tentar registrar usuário.' });
  } finally {
    if (conn) conn.release();
  }
};
