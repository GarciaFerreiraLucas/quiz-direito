import { Request, Response } from 'express';
import pool from '../database/connection';

export const getCategorias = async (req: Request, res: Response): Promise<void> => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id_categoria as id, nome as titulo, nome, descricao, status as ativo FROM categoria');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar categorias', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const getCategoriaById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id_categoria as id, nome as titulo, nome, descricao, status as ativo FROM categoria WHERE id_categoria = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Categoria não encontrada' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar a categoria', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const createCategoria = async (req: Request, res: Response): Promise<void> => {
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
      'INSERT INTO categoria (nome, descricao, status) VALUES (?, ?, ?)',
      [nome.trim(), descricao || '', status]
    );
    const newCat = { id: Number(result.insertId), titulo: nome.trim(), nome: nome.trim(), descricao: descricao || '', ativo: status };
    res.status(201).json(newCat);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar categoria', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const updateCategoria = async (req: Request, res: Response): Promise<void> => {
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
      'UPDATE categoria SET nome = ?, descricao = ?, status = ? WHERE id_categoria = ?',
      [nome.trim(), descricao || '', ativo, id]
    );
    res.json({ id: Number(id), titulo: nome.trim(), nome: nome.trim(), descricao: descricao || '', ativo });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar categoria', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const toggleCategoriaStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('UPDATE categoria SET status = NOT status WHERE id_categoria = ?', [id]);
    const rows = await conn.query('SELECT id_categoria as id, nome as titulo, nome, descricao, status as ativo FROM categoria WHERE id_categoria = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Categoria não encontrada' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao alternar status da categoria', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};
