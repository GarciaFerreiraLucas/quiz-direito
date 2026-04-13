import { Router } from "express";
import { HomeController } from "../controllers/homeController";
import { QuizController } from "../controllers/quizController";
import { PerguntaController } from "../controllers/perguntaController";

const router = Router();

router.get("/", HomeController.index);

// Rotas de quizzes
router.get("/quizzes", QuizController.listar);
router.get("/quizzes/:id", QuizController.buscarPorId);
router.post("/quizzes", QuizController.criar);

// Rotas de perguntas
router.get("/perguntas", PerguntaController.listar);
router.get("/perguntas/:id", PerguntaController.buscarPorId);
router.post("/perguntas", PerguntaController.criar);

export default router;