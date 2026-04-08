import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Cadastro } from '../pages/Cadastro';
import { DashboardLayout } from '../layouts';
import { Dashboard } from '../pages/Dashboard';
import { Quizzes } from '../pages/Quizzes';
import { QuizForm } from '../pages/Quizzes/QuizForm';
import { Perguntas } from '../pages/Perguntas/Perguntas';
import { PerguntaForm } from '../pages/Perguntas/PerguntaForm';
import { Informativos, InformativoDetalhe } from '../pages/Informativos';
import { Perfil } from '../pages/Perfil';
import { Categorias } from '../pages/Categorias/Categorias';
import { CategoriaForm } from '../pages/Categorias/CategoriaForm';
import { Tags } from '../pages/Tags/Tags';
import { TagForm } from '../pages/Tags/TagForm';
import { Monitores } from '../pages/Monitores/Monitores';
import { MonitorForm } from '../pages/Monitores/MonitorForm';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="quizzes/adicionar" element={<QuizForm />} />
          <Route path="quizzes/:quizId/perguntas" element={<Perguntas />} />
          <Route path="quizzes/:quizId/perguntas/adicionar" element={<PerguntaForm />} />
          <Route path="informativos" element={<Informativos />} />
          <Route path="informativos/:id" element={<InformativoDetalhe />} />
          <Route path="informativos/questionario/:id" element={<InformativoDetalhe />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="categorias/adicionar" element={<CategoriaForm />} />
          <Route path="tags" element={<Tags />} />
          <Route path="tags/adicionar" element={<TagForm />} />
          <Route path="monitores" element={<Monitores />} />
          <Route path="monitores/adicionar" element={<MonitorForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
