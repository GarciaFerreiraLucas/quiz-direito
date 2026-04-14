import { Request, Response } from 'express';
import pool from '../database/connection';

// GET /perguntas?quizId=X — lista perguntas de um quiz (com alternativas inline)
export const getPerguntas = async (req: Request, res: Response): Promise<void> => {
  const quizId = Number(req.query.quizId);

  let conn;
  try {
    conn = await pool.getConnection();

    let perguntas: any[];

    if (quizId && Number.isFinite(quizId)) {
      // Busca perguntas vinculadas a um quiz específico
      perguntas = await conn.query(
        `SELECT p.id_pergunta, p.enunciado, p.tipo, p.dificuldade, p.status,
                c.nome AS categoria
         FROM pergunta p
         LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
         INNER JOIN quiz_pergunta qp ON qp.id_pergunta = p.id_pergunta
         WHERE qp.id_quiz = ?
         ORDER BY p.id_pergunta DESC`,
        [quizId]
      );
    } else {
      // Busca todas as perguntas
      perguntas = await conn.query(
        `SELECT p.id_pergunta, p.enunciado, p.tipo, p.dificuldade, p.status,
                c.nome AS categoria
         FROM pergunta p
         LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
         ORDER BY p.id_pergunta DESC`
      );
    }

    // Para cada pergunta, buscar alternativas
    const result = [];
    for (const p of perguntas) {
      const alternativas = await conn.query(
        `SELECT id_alternativa, texto, correta, ordem FROM alternativa WHERE id_pergunta = ? ORDER BY ordem`,
        [p.id_pergunta]
      );

      const tags = await conn.query(
        `SELECT t.id_tag, t.nome FROM tag t INNER JOIN pergunta_tag pt ON pt.id_tag = t.id_tag WHERE pt.id_pergunta = ?`,
        [p.id_pergunta]
      );

      result.push({
        id: p.id_pergunta,
        pergunta: p.enunciado,
        categoria: p.categoria || '',
        dificuldade: p.dificuldade || 'facil',
        ativo: !!p.status,
        alternativas: alternativas.map((a: any) => ({
          id: a.id_alternativa,
          texto: a.texto,
          correta: !!a.correta,
          feedback: '',
        })),
        tags: tags.map((t: any) => ({ id: t.id_tag, nome: t.nome })),
      });
    }

    res.json(result);
  } catch (err: any) {
    console.error('Error in getPerguntas:', err);
    res.status(500).json({ error: 'Erro ao buscar perguntas.' });
  } finally {
    if (conn) conn.release();
  }
};

// GET /perguntas/:id — busca uma pergunta específica com alternativas
export const getPerguntaById = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      `SELECT p.id_pergunta, p.enunciado, p.tipo, p.dificuldade, p.status, p.id_categoria,
              c.nome AS categoria
       FROM pergunta p
       LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
       WHERE p.id_pergunta = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Pergunta não encontrada.' });
      return;
    }

    const p = rows[0];

    const alternativas = await conn.query(
      `SELECT id_alternativa, texto, correta, ordem FROM alternativa WHERE id_pergunta = ? ORDER BY ordem`,
      [id]
    );

    const tags = await conn.query(
      `SELECT t.id_tag, t.nome FROM tag t INNER JOIN pergunta_tag pt ON pt.id_tag = t.id_tag WHERE pt.id_pergunta = ?`,
      [id]
    );

    res.json({
      id: p.id_pergunta,
      pergunta: p.enunciado,
      categoriaId: p.id_categoria,
      categoria: p.categoria || '',
      dificuldade: p.dificuldade || 'facil',
      ativo: !!p.status,
      alternativas: alternativas.map((a: any) => ({
        id: a.id_alternativa,
        texto: a.texto,
        correta: !!a.correta,
        feedback: '',
      })),
      tags: tags.map((t: any) => ({ id: t.id_tag, nome: t.nome })),
    });
  } catch (err: any) {
    console.error('Error in getPerguntaById:', err);
    res.status(500).json({ error: 'Erro ao buscar pergunta.' });
  } finally {
    if (conn) conn.release();
  }
};

// POST /perguntas — cria pergunta + alternativas + vínculos
export const createPergunta = async (req: Request, res: Response): Promise<void> => {
  const { enunciado, categoriaId, dificuldade, status, alternativas, tagIds, quizId } = req.body;

  if (!enunciado || !alternativas || alternativas.length < 2) {
    res.status(400).json({ error: 'Enunciado e pelo menos 2 alternativas são obrigatórios.' });
    return;
  }

  const hasCorreta = alternativas.some((a: any) => a.correta);
  if (!hasCorreta) {
    res.status(400).json({ error: 'Pelo menos uma alternativa deve ser marcada como correta.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // 1. Inserir a pergunta
    const result = await conn.query(
      `INSERT INTO pergunta (enunciado, id_categoria, dificuldade, status) VALUES (?, ?, ?, ?)`,
      [enunciado, categoriaId || null, dificuldade || 'facil', status !== undefined ? status : true]
    );
    const perguntaId = Number(result.insertId);

    // 2. Inserir alternativas
    for (let i = 0; i < alternativas.length; i++) {
      const alt = alternativas[i];
      await conn.query(
        `INSERT INTO alternativa (id_pergunta, texto, correta, ordem) VALUES (?, ?, ?, ?)`,
        [perguntaId, alt.texto, !!alt.correta, i + 1]
      );
    }

    // 3. Vincular tags (pergunta_tag)
    if (tagIds && Array.isArray(tagIds)) {
      for (const tagId of tagIds) {
        await conn.query(`INSERT INTO pergunta_tag (id_pergunta, id_tag) VALUES (?, ?)`, [perguntaId, tagId]);
      }
    }

    // 4. Vincular ao quiz (quiz_pergunta)
    if (quizId) {
      await conn.query(`INSERT INTO quiz_pergunta (id_quiz, id_pergunta) VALUES (?, ?)`, [quizId, perguntaId]);
    }

    res.status(201).json({ id: perguntaId, message: 'Pergunta criada com sucesso.' });
  } catch (err: any) {
    console.error('Error in createPergunta:', err);
    res.status(500).json({ error: 'Erro ao criar pergunta.' });
  } finally {
    if (conn) conn.release();
  }
};

// PUT /perguntas/:id — atualiza pergunta + recria alternativas
export const updatePergunta = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { enunciado, categoriaId, dificuldade, status, alternativas, tagIds } = req.body;

  if (!enunciado) {
    res.status(400).json({ error: 'Enunciado é obrigatório.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // 1. Atualizar pergunta
    await conn.query(
      `UPDATE pergunta SET enunciado = ?, id_categoria = ?, dificuldade = ?, status = ? WHERE id_pergunta = ?`,
      [enunciado, categoriaId || null, dificuldade || 'facil', status !== undefined ? status : true, id]
    );

    // 2. Recriar alternativas (deletar antigas e inserir novas)
    if (alternativas && alternativas.length > 0) {
      await conn.query(`DELETE FROM alternativa WHERE id_pergunta = ?`, [id]);

      for (let i = 0; i < alternativas.length; i++) {
        const alt = alternativas[i];
        await conn.query(
          `INSERT INTO alternativa (id_pergunta, texto, correta, ordem) VALUES (?, ?, ?, ?)`,
          [id, alt.texto, !!alt.correta, i + 1]
        );
      }
    }

    // 3. Recriar vínculos de tags
    if (tagIds && Array.isArray(tagIds)) {
      await conn.query(`DELETE FROM pergunta_tag WHERE id_pergunta = ?`, [id]);
      for (const tagId of tagIds) {
        await conn.query(`INSERT INTO pergunta_tag (id_pergunta, id_tag) VALUES (?, ?)`, [id, tagId]);
      }
    }

    res.json({ message: 'Pergunta atualizada com sucesso.' });
  } catch (err: any) {
    console.error('Error in updatePergunta:', err);
    res.status(500).json({ error: 'Erro ao atualizar pergunta.' });
  } finally {
    if (conn) conn.release();
  }
};

// PATCH /perguntas/:id/status — toggle ativo/inativo
export const togglePerguntaStatus = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(`SELECT id_pergunta, status FROM pergunta WHERE id_pergunta = ?`, [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Pergunta não encontrada.' });
      return;
    }

    const newStatus = !rows[0].status;
    await conn.query(`UPDATE pergunta SET status = ? WHERE id_pergunta = ?`, [newStatus, id]);

    res.json({ id, ativo: newStatus });
  } catch (err: any) {
    console.error('Error in togglePerguntaStatus:', err);
    res.status(500).json({ error: 'Erro ao alterar status.' });
  } finally {
    if (conn) conn.release();
  }
};
