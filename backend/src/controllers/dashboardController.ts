import { Request, Response } from 'express';
import pool from '../database/connection';
import { AuthenticatedRequest } from '../types/express';

// GET /dashboard/stats — Estatísticas do usuário logado
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;

  let conn;
  try {
    conn = await pool.getConnection();

    const tentativasRows = await conn.query(
      'SELECT COUNT(*) AS total FROM tentativa WHERE id_usuario = ? AND fim_em IS NOT NULL',
      [userId]
    );
    const totalTentativas = Number(tentativasRows[0].total);

    const mediaRows = await conn.query(
      'SELECT AVG(pontuacao_total) AS media FROM tentativa WHERE id_usuario = ? AND fim_em IS NOT NULL',
      [userId]
    );
    const mediaPontuacao = mediaRows[0].media ?? 0;

    const melhorRows = await conn.query(
      'SELECT MAX(pontuacao_total) AS melhor FROM tentativa WHERE id_usuario = ? AND fim_em IS NOT NULL',
      [userId]
    );
    const melhorNota = melhorRows[0].melhor ?? 0;

    const acertosRows = await conn.query(
      `SELECT COUNT(*) AS total FROM resposta r
       INNER JOIN tentativa t ON t.id_tentativa = r.id_tentativa
       WHERE t.id_usuario = ? AND r.correta = true`,
      [userId]
    );
    const totalAcertos = Number(acertosRows[0].total);

    const ultimaRows = await conn.query(
      `SELECT t.id_tentativa, t.id_quiz, q.titulo AS quiz_titulo, t.pontuacao_total, t.fim_em
       FROM tentativa t
       INNER JOIN quiz q ON q.id_quiz = t.id_quiz
       WHERE t.id_usuario = ? AND t.fim_em IS NOT NULL
       ORDER BY t.fim_em DESC LIMIT 1`,
      [userId]
    );
    const ultimaTentativa = ultimaRows.length > 0 ? {
      quizTitulo: ultimaRows[0].quiz_titulo,
      pontuacao: ultimaRows[0].pontuacao_total,
      data: ultimaRows[0].fim_em,
    } : null;

    res.json({
      totalTentativas,
      mediaPontuacao: Math.round(mediaPontuacao * 100) / 100,
      melhorNota: Math.round(melhorNota * 100) / 100,
      totalAcertos,
      ultimaTentativa,
    });
  } catch (err: any) {
    console.error('Error in getDashboardStats:', err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  } finally {
    if (conn) conn.release();
  }
};

// GET /dashboard/admin-stats — Estatísticas para monitor/professor
export const getAdminDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Total de usuários (perfil = 'user')
    const totalUsersRows = await conn.query(
      "SELECT COUNT(*) AS total FROM usuario WHERE perfil = 'user'"
    );
    const totalUsuarios = Number(totalUsersRows[0].total);

    // Total de monitores
    const totalMonitoresRows = await conn.query(
      "SELECT COUNT(*) AS total FROM usuario WHERE perfil = 'monitor'"
    );
    const totalMonitores = Number(totalMonitoresRows[0].total);

    // Usuários cadastrados nos últimos 7 dias
    const usuarios7DiasRows = await conn.query(
      "SELECT COUNT(*) AS total FROM usuario WHERE criado_em >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    const usuarios7Dias = Number(usuarios7DiasRows[0].total);

    // Total de quizzes, perguntas, informativos
    const totalQuizzesRows = await conn.query("SELECT COUNT(*) AS total FROM quiz");
    const totalQuizzes = Number(totalQuizzesRows[0].total);

    const totalPerguntasRows = await conn.query("SELECT COUNT(*) AS total FROM pergunta");
    const totalPerguntas = Number(totalPerguntasRows[0].total);

    const totalInformativosRows = await conn.query("SELECT COUNT(*) AS total FROM informativo");
    const totalInformativos = Number(totalInformativosRows[0].total);

    // Cadastros por dia nos últimos 7 dias (para o gráfico)
    const chartRows = await conn.query(`
      SELECT 
        DATE(criado_em) AS dia,
        COUNT(*) AS quantidade
      FROM usuario
      WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(criado_em)
      ORDER BY dia ASC
    `);

    // Build a complete 7-day array (fill missing days with 0)
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const chartData: { name: string; quantidade: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];
      const found = chartRows.find((r: any) => {
        const rDate = r.dia instanceof Date ? r.dia.toISOString().split('T')[0] : String(r.dia);
        return rDate === dateStr;
      });
      chartData.push({
        name: dayName,
        quantidade: found ? Number(found.quantidade) : 0,
      });
    }

    res.json({
      totalUsuarios,
      totalMonitores,
      usuarios7Dias,
      totalQuizzes,
      totalPerguntas,
      totalInformativos,
      chartData,
    });
  } catch (err: any) {
    console.error('Error in getAdminDashboardStats:', err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas administrativas.' });
  } finally {
    if (conn) conn.release();
  }
};
