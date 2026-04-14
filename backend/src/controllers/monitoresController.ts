import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../database/connection';

// GET /monitores — List all users with perfil = 'monitor'
export const getMonitores = async (req: Request, res: Response): Promise<void> => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT id_usuario as id, nome, email, status as ativo FROM usuario WHERE perfil = ?',
      ['monitor']
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar monitores', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// GET /monitores/:id — Get a single monitor by id
export const getMonitorById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT id_usuario as id, nome, email, status as ativo FROM usuario WHERE id_usuario = ? AND perfil = ?',
      [id, 'monitor']
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Monitor não encontrado' });
      return;
    }

    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar monitor', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// POST /monitores — Create a new monitor (user with perfil = 'monitor')
export const createMonitor = async (req: Request, res: Response): Promise<void> => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    return;
  }

  if (senha.length < 6) {
    res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Check if email is already in use
    const existing = await conn.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);
    if (existing.length > 0) {
      res.status(400).json({ error: 'Este e-mail já está em uso.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const result = await conn.query(
      'INSERT INTO usuario (nome, email, senha_hash, perfil, status) VALUES (?, ?, ?, ?, ?)',
      [nome, email, hashedPassword, 'monitor', true]
    );

    const newMonitor = {
      id: Number(result.insertId),
      nome,
      email,
      ativo: true,
    };

    res.status(201).json(newMonitor);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar monitor', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// PUT /monitores/:id — Update an existing monitor
export const updateMonitor = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nome, email, senha, ativo } = req.body;

  if (!nome || !email) {
    res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Check if email is used by someone else
    const emailCheck = await conn.query(
      'SELECT id_usuario FROM usuario WHERE email = ? AND id_usuario != ?',
      [email, id]
    );
    if (emailCheck.length > 0) {
      res.status(400).json({ error: 'Este e-mail já está em uso por outro usuário.' });
      return;
    }

    // Update with or without password
    if (senha && senha.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(senha, 10);
      await conn.query(
        'UPDATE usuario SET nome = ?, email = ?, senha_hash = ?, status = ?, atualizado_em = NOW() WHERE id_usuario = ? AND perfil = ?',
        [nome, email, hashedPassword, ativo !== undefined ? ativo : true, id, 'monitor']
      );
    } else {
      await conn.query(
        'UPDATE usuario SET nome = ?, email = ?, status = ?, atualizado_em = NOW() WHERE id_usuario = ? AND perfil = ?',
        [nome, email, ativo !== undefined ? ativo : true, id, 'monitor']
      );
    }

    const rows = await conn.query(
      'SELECT id_usuario as id, nome, email, status as ativo FROM usuario WHERE id_usuario = ?',
      [id]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Monitor não encontrado' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar monitor', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// PATCH /monitores/:id/status — Toggle monitor status
export const toggleMonitorStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE usuario SET status = NOT status WHERE id_usuario = ? AND perfil = ?',
      [id, 'monitor']
    );
    const rows = await conn.query(
      'SELECT id_usuario as id, nome, email, status as ativo FROM usuario WHERE id_usuario = ?',
      [id]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Monitor não encontrado' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao alternar status do monitor', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};
