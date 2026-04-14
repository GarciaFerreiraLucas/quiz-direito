import { Request, Response } from 'express';
import pool from '../database/connection';

export const getQuizzes = async (req: Request, res: Response): Promise<void> => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT q.id_quiz as id, q.titulo, q.titulo as nome, q.descricao, q.status as ativo,
             q.id_categoria, c.nome as categoria, q.tempo_estimado_min, q.tentativas_max,
             q.feedback_ativo, q.visibilidade,
             (SELECT COUNT(*) FROM quiz_pergunta qp WHERE qp.id_quiz = q.id_quiz) as total_perguntas
      FROM quiz q
      LEFT JOIN categoria c ON c.id_categoria = q.id_categoria
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar quizzes', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const getQuizById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT q.id_quiz as id, q.titulo, q.titulo as nome, q.descricao, q.status as ativo,
             q.id_categoria, c.nome as categoria, q.tempo_estimado_min, q.tentativas_max,
             q.feedback_ativo, q.visibilidade,
             (SELECT COUNT(*) FROM quiz_pergunta qp WHERE qp.id_quiz = q.id_quiz) as total_perguntas
      FROM quiz q
      LEFT JOIN categoria c ON c.id_categoria = q.id_categoria
      WHERE q.id_quiz = ?
    `, [id]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Quiz não encontrado' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar quiz', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const createQuiz = async (req: Request, res: Response): Promise<void> => {
  const { nome, descricao, ativo, id_categoria, tempo_estimado_min, tentativas_max, visibilidade, feedback_ativo } = req.body;

  if (!nome || !nome.trim()) {
    res.status(400).json({ error: 'Título é obrigatório.' });
    return;
  }

  const status = ativo !== undefined ? ativo : true;
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO quiz (titulo, descricao, status, id_categoria, tempo_estimado_min, tentativas_max, visibilidade, feedback_ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nome.trim(), descricao || '', status, id_categoria || null, tempo_estimado_min || 10, tentativas_max || 3, visibilidade || 'publico', feedback_ativo !== undefined ? feedback_ativo : true]
    );
    const newId = Number(result.insertId);

    // Return complete quiz info
    const rows = await conn.query(`
      SELECT q.id_quiz as id, q.titulo, q.titulo as nome, q.descricao, q.status as ativo,
             q.id_categoria, c.nome as categoria, q.tempo_estimado_min, q.tentativas_max,
             0 as total_perguntas
      FROM quiz q
      LEFT JOIN categoria c ON c.id_categoria = q.id_categoria
      WHERE q.id_quiz = ?
    `, [newId]);

    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar quiz', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const updateQuiz = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nome, descricao, ativo, id_categoria, tempo_estimado_min, tentativas_max, visibilidade, feedback_ativo } = req.body;

  if (!nome || !nome.trim()) {
    res.status(400).json({ error: 'Título é obrigatório.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE quiz SET titulo = ?, descricao = ?, status = ?, id_categoria = ?, tempo_estimado_min = ?, tentativas_max = ?, visibilidade = ?, feedback_ativo = ? WHERE id_quiz = ?',
      [nome.trim(), descricao || '', ativo, id_categoria || null, tempo_estimado_min || 10, tentativas_max || 3, visibilidade || 'publico', feedback_ativo !== undefined ? feedback_ativo : true, id]
    );

    const rows = await conn.query(`
      SELECT q.id_quiz as id, q.titulo, q.titulo as nome, q.descricao, q.status as ativo,
             q.id_categoria, c.nome as categoria, q.tempo_estimado_min, q.tentativas_max,
             (SELECT COUNT(*) FROM quiz_pergunta qp WHERE qp.id_quiz = q.id_quiz) as total_perguntas
      FROM quiz q
      LEFT JOIN categoria c ON c.id_categoria = q.id_categoria
      WHERE q.id_quiz = ?
    `, [id]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Quiz não encontrado' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar quiz', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const toggleQuizStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE quiz SET status = NOT status WHERE id_quiz = ?',
      [id]
    );
    const rows = await conn.query(`
      SELECT q.id_quiz as id, q.titulo, q.titulo as nome, q.descricao, q.status as ativo,
             q.id_categoria, c.nome as categoria, q.tempo_estimado_min, q.tentativas_max,
             (SELECT COUNT(*) FROM quiz_pergunta qp WHERE qp.id_quiz = q.id_quiz) as total_perguntas
      FROM quiz q
      LEFT JOIN categoria c ON c.id_categoria = q.id_categoria
      WHERE q.id_quiz = ?
    `, [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Quiz não encontrado' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao alternar status do quiz', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};
