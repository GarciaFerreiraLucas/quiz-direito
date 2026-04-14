import { Response } from 'express';
import pool from '../database/connection';
import { AuthenticatedRequest } from '../types/express';

// POST /tentativas/:id_quiz — Inicia uma nova tentativa de quiz
export const iniciarTentativa = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const quizId = Number(req.params.id_quiz);
  const userId = (req as any).user?.id || null;

  let conn;
  try {
    conn = await pool.getConnection();

    // Verificar se o quiz existe e está ativo
    const quizRows = await conn.query(
      'SELECT id_quiz, titulo, tentativas_max, tempo_estimado_min FROM quiz WHERE id_quiz = ? AND status = true',
      [quizId]
    );

    if (quizRows.length === 0) {
      res.status(404).json({ error: 'Quiz não encontrado ou inativo.' });
      return;
    }

    const quiz = quizRows[0];

    // Verificar limite de tentativas (only if logged in)
    if (userId && quiz.tentativas_max) {
      const tentativasCount = await conn.query(
        'SELECT COUNT(*) AS total FROM tentativa WHERE id_usuario = ? AND id_quiz = ?',
        [userId, quizId]
      );
      if (tentativasCount[0].total >= quiz.tentativas_max) {
        res.status(403).json({ error: `Você atingiu o limite de ${quiz.tentativas_max} tentativas para este quiz.` });
        return;
      }
    }

    // Buscar perguntas do quiz com alternativas
    const perguntas = await conn.query(
      `SELECT p.id_pergunta, p.enunciado, p.dificuldade
       FROM pergunta p
       INNER JOIN quiz_pergunta qp ON qp.id_pergunta = p.id_pergunta
       WHERE qp.id_quiz = ? AND p.status = true`,
      [quizId]
    );

    if (perguntas.length === 0) {
      res.status(400).json({ error: 'Este quiz não possui perguntas cadastradas.' });
      return;
    }

    // Criar a tentativa (only if logged in)
    let tentativaId = 0;
    if (userId) {
      const result = await conn.query(
        'INSERT INTO tentativa (id_usuario, id_quiz) VALUES (?, ?)',
        [userId, quizId]
      );
      tentativaId = Number(result.insertId);
    } else {
      // For guests, we use a negative ID to signal "no persistence"
      tentativaId = -1;
    }

    // Montar perguntas com alternativas (sem revelar qual é a correta)
    const perguntasComAlternativas = [];
    for (const p of perguntas) {
      const alternativas = await conn.query(
        'SELECT id_alternativa, texto, ordem FROM alternativa WHERE id_pergunta = ? AND status = true ORDER BY ordem',
        [p.id_pergunta]
      );
      perguntasComAlternativas.push({
        id: p.id_pergunta,
        enunciado: p.enunciado,
        dificuldade: p.dificuldade,
        alternativas: alternativas.map((a: any) => ({
          id: a.id_alternativa,
          texto: a.texto,
          ordem: a.ordem,
        })),
      });
    }

    res.status(201).json({
      tentativaId,
      quiz: {
        id: quiz.id_quiz,
        titulo: quiz.titulo,
        tempoEstimadoMin: quiz.tempo_estimado_min,
      },
      perguntas: perguntasComAlternativas,
    });
  } catch (err: any) {
    console.error('Error in iniciarTentativa:', err);
    res.status(500).json({ error: 'Erro ao iniciar tentativa.' });
  } finally {
    if (conn) conn.release();
  }
};

// POST /tentativas/:id_tentativa/responder — Salva uma resposta individual
export const salvarResposta = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const tentativaId = Number(req.params.id_tentativa);
  const userId = (req as any).user?.id || null;
  const { perguntaId, alternativaId } = req.body;

  if (!perguntaId || !alternativaId) {
    res.status(400).json({ error: 'perguntaId e alternativaId são obrigatórios.' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Guest mode: return check without saving
    if (tentativaId === -1) {
      const altRows = await conn.query(
        'SELECT correta FROM alternativa WHERE id_alternativa = ? AND id_pergunta = ?',
        [alternativaId, perguntaId]
      );
      const correta = altRows.length > 0 ? !!altRows[0].correta : false;
      res.json({ saved: false, correta });
      return;
    }

    // Verificar se a tentativa existe e PERTENCE ao usuário
    const tentativa = await conn.query(
      'SELECT id_tentativa, id_usuario, fim_em FROM tentativa WHERE id_tentativa = ?',
      [tentativaId]
    );
    if (tentativa.length === 0) {
      res.status(404).json({ error: 'Tentativa não encontrada.' });
      return;
    }
    if (tentativa[0].id_usuario !== userId) {
      res.status(403).json({ error: 'Você não tem permissão para alterar esta tentativa.' });
      return;
    }
    if (tentativa[0].fim_em) {
      res.status(400).json({ error: 'Esta tentativa já foi finalizada.' });
      return;
    }

    // Verificar se a alternativa é a correta
    const altRows = await conn.query(
      'SELECT correta FROM alternativa WHERE id_alternativa = ? AND id_pergunta = ?',
      [alternativaId, perguntaId]
    );

    const correta = altRows.length > 0 ? !!altRows[0].correta : false;

    // Verificar se já existe resposta para essa pergunta nesta tentativa
    const existing = await conn.query(
      'SELECT id_resposta FROM resposta WHERE id_tentativa = ? AND id_pergunta = ?',
      [tentativaId, perguntaId]
    );

    if (existing.length > 0) {
      // Atualizar resposta existente
      await conn.query(
        'UPDATE resposta SET id_alternativa = ?, correta = ? WHERE id_tentativa = ? AND id_pergunta = ?',
        [alternativaId, correta, tentativaId, perguntaId]
      );
    } else {
      // Inserir nova resposta
      await conn.query(
        'INSERT INTO resposta (id_tentativa, id_pergunta, id_alternativa, correta) VALUES (?, ?, ?, ?)',
        [tentativaId, perguntaId, alternativaId, correta]
      );
    }

    res.json({ saved: true, correta });
  } catch (err: any) {
    console.error('Error in salvarResposta:', err);
    res.status(500).json({ error: 'Erro ao salvar resposta.' });
  } finally {
    if (conn) conn.release();
  }
};

// POST /tentativas/:id_tentativa/finalizar — Finaliza a tentativa e calcula pontuação
export const finalizarTentativa = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const tentativaId = Number(req.params.id_tentativa);
  const userId = (req as any).user?.id || null;

  let conn;
  try {
    conn = await pool.getConnection();

    // Guest mode finalization
    if (tentativaId === -1) {
        // For guests, they must send all answers in the body to finalize
        // or we handle this differently. 
        // Actually, if we want "not stays registered", the simplest is that 
        // the GuestQuiz logic sends its local state to be checked.
        const { respostas: guestRespostas } = req.body; // Array of {perguntaId, alternativaId}
        
        if (!guestRespostas || !Array.isArray(guestRespostas)) {
            res.status(400).json({ error: 'Respostas são obrigatórias para finalizar como convidado.' });
            return;
        }

        const detalhes = [];
        let acertos = 0;

        for (const r of guestRespostas) {
            const rows = await conn.query(
                `SELECT p.enunciado, a_escolhida.texto AS alternativa_escolhida, a_escolhida.correta,
                        a_correta.texto AS alternativa_correta
                 FROM pergunta p
                 LEFT JOIN alternativa a_escolhida ON a_escolhida.id_alternativa = ? AND a_escolhida.id_pergunta = p.id_pergunta
                 LEFT JOIN alternativa a_correta ON a_correta.id_pergunta = p.id_pergunta AND a_correta.correta = true
                 WHERE p.id_pergunta = ?`,
                [r.alternativaId, r.perguntaId]
            );

            if (rows.length > 0) {
                const row = rows[0];
                if (row.correta) acertos++;
                detalhes.push({
                    perguntaId: r.perguntaId,
                    enunciado: row.enunciado,
                    alternativaEscolhida: row.alternativa_escolhida,
                    alternativaCorreta: row.alternativa_correta,
                    acertou: !!row.correta,
                });
            }
        }

        const pontuacao = guestRespostas.length > 0 ? (acertos / guestRespostas.length) * 100 : 0;

        res.json({
            tentativaId: -1,
            pontuacao: Math.round(pontuacao * 100) / 100,
            totalPerguntas: guestRespostas.length,
            acertos,
            erros: guestRespostas.length - acertos,
            duracaoSegundos: req.body.duracaoSegundos || 0,
            detalhes,
        });
        return;
    }

    // Verificar se a tentativa existe e PERTENCE ao usuário
    const tentativa = await conn.query(
      'SELECT id_tentativa, id_usuario, id_quiz, inicio_em, fim_em FROM tentativa WHERE id_tentativa = ?',
      [tentativaId]
    );
    if (tentativa.length === 0) {
      res.status(404).json({ error: 'Tentativa não encontrada.' });
      return;
    }
    if (tentativa[0].id_usuario !== userId) {
      res.status(403).json({ error: 'Você não tem permissão para finalizar esta tentativa.' });
      return;
    }
    if (tentativa[0].fim_em) {
      res.status(400).json({ error: 'Esta tentativa já foi finalizada.' });
      return;
    }

    // Calcular pontuação
    const respostas = await conn.query(
      'SELECT id_resposta, correta FROM resposta WHERE id_tentativa = ?',
      [tentativaId]
    );

    const totalRespostas = respostas.length;
    const totalCorretas = respostas.filter((r: any) => !!r.correta).length;
    const pontuacao = totalRespostas > 0 ? (totalCorretas / totalRespostas) * 100 : 0;

    // Calcular duração em segundos
    const inicio = new Date(tentativa[0].inicio_em);
    const fim = new Date();
    const duracaoSeg = Math.round((fim.getTime() - inicio.getTime()) / 1000);

    // Atualizar tentativa
    await conn.query(
      'UPDATE tentativa SET fim_em = NOW(), duracao_seg = ?, pontuacao_total = ? WHERE id_tentativa = ?',
      [duracaoSeg, pontuacao, tentativaId]
    );

    // Buscar gabarito detalhado para feedback
    const detalhes = await conn.query(
      `SELECT r.id_pergunta, p.enunciado, r.id_alternativa, 
              a_escolhida.texto AS alternativa_escolhida, r.correta,
              a_correta.texto AS alternativa_correta
       FROM resposta r
       INNER JOIN pergunta p ON p.id_pergunta = r.id_pergunta
       INNER JOIN alternativa a_escolhida ON a_escolhida.id_alternativa = r.id_alternativa
       LEFT JOIN alternativa a_correta ON a_correta.id_pergunta = r.id_pergunta AND a_correta.correta = true
       WHERE r.id_tentativa = ?`,
      [tentativaId]
    );

    res.json({
      tentativaId,
      pontuacao: Math.round(pontuacao * 100) / 100,
      totalPerguntas: totalRespostas,
      acertos: totalCorretas,
      erros: totalRespostas - totalCorretas,
      duracaoSegundos: duracaoSeg,
      detalhes: detalhes.map((d: any) => ({
        perguntaId: d.id_pergunta,
        enunciado: d.enunciado,
        alternativaEscolhida: d.alternativa_escolhida,
        alternativaCorreta: d.alternativa_correta,
        acertou: !!d.correta,
      })),
    });
  } catch (err: any) {
    console.error('Error in finalizarTentativa:', err);
    res.status(500).json({ error: 'Erro ao finalizar tentativa.' });
  } finally {
    if (conn) conn.release();
  }
};

// GET /tentativas/historico — Histórico de tentativas do usuário logado
export const getHistorico = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;

  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      `SELECT t.id_tentativa, t.id_quiz, q.titulo AS quiz_titulo,
              t.inicio_em, t.fim_em, t.duracao_seg, t.pontuacao_total
       FROM tentativa t
       INNER JOIN quiz q ON q.id_quiz = t.id_quiz
       WHERE t.id_usuario = ?
       ORDER BY t.inicio_em DESC`,
      [userId]
    );

    res.json(
      rows.map((r: any) => ({
        tentativaId: r.id_tentativa,
        quizId: r.id_quiz,
        quizTitulo: r.quiz_titulo,
        inicioEm: r.inicio_em,
        fimEm: r.fim_em,
        duracaoSeg: r.duracao_seg,
        pontuacao: r.pontuacao_total,
        finalizada: !!r.fim_em,
      }))
    );
  } catch (err: any) {
    console.error('Error in getHistorico:', err);
    res.status(500).json({ error: 'Erro ao buscar histórico.' });
  } finally {
    if (conn) conn.release();
  }
};
