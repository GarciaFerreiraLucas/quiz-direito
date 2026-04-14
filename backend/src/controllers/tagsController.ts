import { Request, Response } from 'express';
import pool from '../database/connection';

export const getTags = async (req: Request, res: Response): Promise<void> => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id_tag as id, nome as titulo, nome, descricao, status as ativo FROM tag');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar tags', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const getTagById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id_tag as id, nome as titulo, nome, descricao, status as ativo FROM tag WHERE id_tag = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Tag não encontrada' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar a tag', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  const { nome, descricao, ativo } = req.body;
  if (!nome || !nome.trim()) {
    res.status(400).json({ error: 'Nome é obrigatório.' });
    return;
  }
  const status = ativo !== undefined ? ativo : true;
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO tag (nome, descricao, status) VALUES (?, ?, ?)',
      [nome.trim(), descricao || '', status]
    );
    const newTag = { id: Number(result.insertId), titulo: nome.trim(), nome: nome.trim(), descricao: descricao || '', ativo: status };
    res.status(201).json(newTag);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar tag', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nome, descricao, ativo } = req.body;
  if (!nome || !nome.trim()) {
    res.status(400).json({ error: 'Nome é obrigatório.' });
    return;
  }
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE tag SET nome = ?, descricao = ?, status = ? WHERE id_tag = ?',
      [nome.trim(), descricao || '', ativo, id]
    );
    res.json({ id: Number(id), titulo: nome.trim(), nome: nome.trim(), descricao: descricao || '', ativo });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar tag', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const toggleTagStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('UPDATE tag SET status = NOT status WHERE id_tag = ?', [id]);
    const rows = await conn.query('SELECT id_tag as id, nome as titulo, nome, descricao, status as ativo FROM tag WHERE id_tag = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Tag não encontrada' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao alternar status da tag', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};
