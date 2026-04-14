import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getHomeInfo } from '../controllers/homeController';
import { login, register } from '../controllers/authController';
import { forgotPassword, resetPassword } from '../controllers/passwordResetController';
import { getMe, updateProfile } from '../controllers/userController';
import { authenticate, requireAuth } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';

import { getTags, getTagById, createTag, updateTag, toggleTagStatus } from '../controllers/tagsController';
import { getCategorias, getCategoriaById, createCategoria, updateCategoria, toggleCategoriaStatus } from '../controllers/categoriasController';
import { getQuizzes, getQuizById, createQuiz, updateQuiz, toggleQuizStatus } from '../controllers/quizzesController';
import { getInformativos, getInformativoById, createInformativo, updateInformativo, toggleInformativoStatus } from '../controllers/informativosController';
import { getPerguntas, getPerguntaById, createPergunta, updatePergunta, togglePerguntaStatus } from '../controllers/perguntasController';
import { iniciarTentativa, salvarResposta, finalizarTentativa, getHistorico } from '../controllers/tentativasController';
import { getDashboardStats, getAdminDashboardStats } from '../controllers/dashboardController';
import { getMonitores, getMonitorById, createMonitor, updateMonitor, toggleMonitorStatus } from '../controllers/monitoresController';

const router = Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Muitos cadastros recentes. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Muitas solicitações de recuperação. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.get('/home', getHomeInfo);
router.post('/login', loginLimiter, login);
router.post('/auth/register', registerLimiter, register);
router.post('/auth/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/auth/reset-password', passwordResetLimiter, resetPassword);

// Protected routes (require JWT)
// Global user identification (populates req.user if token exists)
router.use(authenticate);

// Profile (requires login)
router.get('/perfil', requireAuth, getMe as any);
router.put('/perfil', requireAuth, updateProfile as any);

// Dashboard
router.get('/dashboard/stats', getDashboardStats as any); // Stats can be empty for guests
router.get('/dashboard/admin-stats', authorize('admin', 'monitor'), getAdminDashboardStats);

// Tags (read: all, write: admin/monitor only)
router.get('/tags', getTags);
router.get('/tags/:id', getTagById);
router.post('/tags', authorize('admin', 'monitor'), createTag);
router.put('/tags/:id', authorize('admin', 'monitor'), updateTag);
router.patch('/tags/:id/status', authorize('admin', 'monitor'), toggleTagStatus);

// Categorias (read: all, write: admin/monitor only)
router.get('/categorias', getCategorias);
router.get('/categorias/:id', getCategoriaById);
router.post('/categorias', authorize('admin', 'monitor'), createCategoria);
router.put('/categorias/:id', authorize('admin', 'monitor'), updateCategoria);
router.patch('/categorias/:id/status', authorize('admin', 'monitor'), toggleCategoriaStatus);

// Quizzes (read: all, write: admin/monitor only)
router.get('/quizzes', getQuizzes);
router.get('/quizzes/:id', getQuizById);
router.post('/quizzes', authorize('admin', 'monitor'), createQuiz);
router.put('/quizzes/:id', authorize('admin', 'monitor'), updateQuiz);
router.patch('/quizzes/:id/status', authorize('admin', 'monitor'), toggleQuizStatus);

// Informativos (read: all, write: admin/monitor only)
router.get('/informativos', getInformativos);
router.get('/informativos/:id', getInformativoById);
router.post('/informativos', authorize('admin', 'monitor'), createInformativo);
router.put('/informativos/:id', authorize('admin', 'monitor'), updateInformativo);
router.patch('/informativos/:id/status', authorize('admin', 'monitor'), toggleInformativoStatus);

// Perguntas (admin/monitor only)
router.get('/perguntas', getPerguntas);
router.get('/perguntas/:id', getPerguntaById);
router.post('/perguntas', authorize('admin', 'monitor'), createPergunta);
router.put('/perguntas/:id', authorize('admin', 'monitor'), updatePergunta);
router.patch('/perguntas/:id/status', authorize('admin', 'monitor'), togglePerguntaStatus);

// Monitores (admin/monitor only)
router.get('/monitores', authorize('admin', 'monitor'), getMonitores);
router.get('/monitores/:id', authorize('admin', 'monitor'), getMonitorById);
router.post('/monitores', authorize('admin', 'monitor'), createMonitor);
router.put('/monitores/:id', authorize('admin', 'monitor'), updateMonitor);
router.patch('/monitores/:id/status', authorize('admin', 'monitor'), toggleMonitorStatus);

// Tentativas (Quiz execution)
router.post('/tentativas/:id_quiz', iniciarTentativa as any);
router.post('/tentativas/:id_tentativa/responder', salvarResposta as any);
router.post('/tentativas/:id_tentativa/finalizar', finalizarTentativa as any);
router.get('/tentativas/historico', requireAuth, getHistorico as any);

export default router;

