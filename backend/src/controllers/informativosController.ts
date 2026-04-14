import { Request, Response } from 'express';
import pool from '../database/connection';

const SELECT_FIELDS = `
  i.id_informativo as id, 
  i.titulo as title, 
  i.autor as author, 
  DATE_FORMAT(i.data_publicacao, '%d/%m/%Y') as date,
  i.resumo as summary, 
  i.conteudo_md as content, 
  i.status as ativo,
  i.imagem_url as imageUrl
`;

export const getInformativos = async (req: Request, res: Response): Promise<void> => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT ${SELECT_FIELDS} FROM informativo i`);

    // Fetch tags for each informativo
    for (const row of rows) {
      const tags = await conn.query(
        `SELECT t.id_tag as id, t.nome FROM tag t 
         INNER JOIN informativo_tag it ON it.id_tag = t.id_tag 
         WHERE it.id_informativo = ?`,
        [row.id]
      );
      row.tags = tags;
      row.category = tags.length > 0 ? tags[0].nome : 'Geral';
    }

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar informativos', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const getInformativoById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT ${SELECT_FIELDS} FROM informativo i WHERE i.id_informativo = ?`, [id]);
    
    if (rows.length > 0) {
      const info = rows[0];
      const tags = await conn.query(
        `SELECT t.id_tag as id, t.nome FROM tag t 
         INNER JOIN informativo_tag it ON it.id_tag = t.id_tag 
         WHERE it.id_informativo = ?`,
        [id]
      );
      info.tags = tags;
      info.category = tags.length > 0 ? tags[0].nome : 'Geral';
      res.json(info);
    } else {
      res.status(404).json({ error: 'Informativo não encontrado' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar informativo', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const createInformativo = async (req: Request, res: Response): Promise<void> => {
  const { titulo, resumo, conteudo_md, autor, imagem_url, tagIds } = req.body;

  if (!titulo || !titulo.trim()) {
    res.status(400).json({ error: 'Título é obrigatório.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO informativo (titulo, resumo, conteudo_md, autor, imagem_url, data_publicacao, status) VALUES (?, ?, ?, ?, ?, CURDATE(), TRUE)',
      [titulo.trim(), resumo || '', conteudo_md || '', autor || '', imagem_url || null]
    );
    const newId = Number(result.insertId);

    // Insert tag associations
    if (tagIds && Array.isArray(tagIds)) {
      for (const tagId of tagIds) {
        await conn.query('INSERT INTO informativo_tag (id_informativo, id_tag) VALUES (?, ?)', [newId, tagId]);
      }
    }
    
    const rows = await conn.query(`SELECT ${SELECT_FIELDS} FROM informativo i WHERE i.id_informativo = ?`, [newId]);
    const info = rows[0];
    const tags = await conn.query(
      `SELECT t.id_tag as id, t.nome FROM tag t 
       INNER JOIN informativo_tag it ON it.id_tag = t.id_tag 
       WHERE it.id_informativo = ?`,
      [newId]
    );
    info.tags = tags;
    info.category = tags.length > 0 ? tags[0].nome : 'Geral';
    
    res.status(201).json(info);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar informativo', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const updateInformativo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { titulo, resumo, conteudo_md, autor, imagem_url, ativo, tagIds } = req.body;

  if (!titulo || !titulo.trim()) {
    res.status(400).json({ error: 'Título é obrigatório.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE informativo SET titulo = ?, resumo = ?, conteudo_md = ?, autor = ?, imagem_url = ?, status = ? WHERE id_informativo = ?',
      [titulo.trim(), resumo || '', conteudo_md || '', autor || '', imagem_url || null, ativo !== undefined ? ativo : true, id]
    );

    // Update tag associations
    if (tagIds && Array.isArray(tagIds)) {
      await conn.query('DELETE FROM informativo_tag WHERE id_informativo = ?', [id]);
      for (const tagId of tagIds) {
        await conn.query('INSERT INTO informativo_tag (id_informativo, id_tag) VALUES (?, ?)', [id, tagId]);
      }
    }
    
    const rows = await conn.query(`SELECT ${SELECT_FIELDS} FROM informativo i WHERE i.id_informativo = ?`, [id]);

    if (rows.length > 0) {
      const info = rows[0];
      const tags = await conn.query(
        `SELECT t.id_tag as id, t.nome FROM tag t 
         INNER JOIN informativo_tag it ON it.id_tag = t.id_tag 
         WHERE it.id_informativo = ?`,
        [id]
      );
      info.tags = tags;
      info.category = tags.length > 0 ? tags[0].nome : 'Geral';
      res.json(info);
    } else {
      res.status(404).json({ error: 'Informativo não encontrado' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar informativo', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const toggleInformativoStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('UPDATE informativo SET status = NOT status WHERE id_informativo = ?', [id]);
    
    const rows = await conn.query(`SELECT ${SELECT_FIELDS} FROM informativo i WHERE i.id_informativo = ?`, [id]);

    if (rows.length > 0) {
      const info = rows[0];
      const tags = await conn.query(
        `SELECT t.id_tag as id, t.nome FROM tag t 
         INNER JOIN informativo_tag it ON it.id_tag = t.id_tag 
         WHERE it.id_informativo = ?`,
        [id]
      );
      info.tags = tags;
      info.category = tags.length > 0 ? tags[0].nome : 'Geral';
      res.json(info);
    } else {
      res.status(404).json({ error: 'Informativo não encontrado' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao alternar status do informativo', message: err.message });
  } finally {
    if (conn) conn.release();
  }
};
