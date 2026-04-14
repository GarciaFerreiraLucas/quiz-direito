import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Cadastro } from '../pages/Cadastro';
import { DashboardLayout } from '../layouts';
import { Dashboard } from '../pages/Dashboard';
import { EsqueciSenha } from '../pages/Auth/EsqueciSenha';
import { RedefinirSenha } from '../pages/Auth/RedefinirSenha';
import { Quizzes } from '../pages/Quizzes';
import { QuizForm } from '../pages/Quizzes/QuizForm';
import { FazerQuiz } from '../pages/Quizzes/FazerQuiz';
import { Perguntas } from '../pages/Perguntas/Perguntas';
import { PerguntaForm } from '../pages/Perguntas/PerguntaForm';
import { Informativos, InformativoDetalhe, InformativoForm } from '../pages/Informativos';
import { Perfil } from '../pages/Perfil';
import { Categorias } from '../pages/Categorias/Categorias';
import { CategoriaForm } from '../pages/Categorias/CategoriaForm';
import { Tags } from '../pages/Tags/Tags';
import { TagForm } from '../pages/Tags/TagForm';
import { Monitores } from '../pages/Monitores/Monitores';
import { MonitorForm } from '../pages/Monitores/MonitorForm';
import { Historico } from '../pages/Historico/Historico';
import { NotFound } from '../pages/NotFound/NotFound';
import { PrivateRoute, RequireRole, RegisteredOnly } from '../components/Guards';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/reset-password" element={<RedefinirSenha />} />

        {/* Protected routes — require authentication */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />

          {/* Quizzes — all authenticated users can view/play */}
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="quizzes/:quizId/fazer" element={<FazerQuiz />} />

          {/* Quiz management — admin/monitor only */}
          <Route path="quizzes/adicionar" element={<RequireRole roles={['professor', 'monitor']}><QuizForm /></RequireRole>} />
          <Route path="quizzes/:quizId/perguntas" element={<RequireRole roles={['professor', 'monitor']}><Perguntas /></RequireRole>} />
          <Route path="quizzes/:quizId/perguntas/adicionar" element={<RequireRole roles={['professor', 'monitor']}><PerguntaForm /></RequireRole>} />
          <Route path="quizzes/:quizId/perguntas/editar" element={<RequireRole roles={['professor', 'monitor']}><PerguntaForm /></RequireRole>} />

          {/* Informativos — all can view */}
          <Route path="informativos" element={<Informativos />} />
          <Route path="informativos/:id" element={<InformativoDetalhe />} />

          {/* Informativos management — admin/monitor only */}
          <Route path="informativos/adicionar" element={<RequireRole roles={['professor', 'monitor']}><InformativoForm /></RequireRole>} />

          {/* Perfil — only logged-in users */}
          <Route path="perfil" element={<RegisteredOnly><Perfil /></RegisteredOnly>} />
          
          {/* Histórico — only logged-in users */}
          <Route path="historico" element={<RegisteredOnly><Historico /></RegisteredOnly>} />

          {/* Categorias — admin/monitor only */}
          <Route path="categorias" element={<RequireRole roles={['professor', 'monitor']}><Categorias /></RequireRole>} />
          <Route path="categorias/adicionar" element={<RequireRole roles={['professor', 'monitor']}><CategoriaForm /></RequireRole>} />

          {/* Tags — admin/monitor only */}
          <Route path="tags" element={<RequireRole roles={['professor', 'monitor']}><Tags /></RequireRole>} />
          <Route path="tags/adicionar" element={<RequireRole roles={['professor', 'monitor']}><TagForm /></RequireRole>} />

          {/* Monitores — admin/monitor only */}
          <Route path="monitores" element={<RequireRole roles={['professor', 'monitor']}><Monitores /></RequireRole>} />
          <Route path="monitores/adicionar" element={<RequireRole roles={['professor', 'monitor']}><MonitorForm /></RequireRole>} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
