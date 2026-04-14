CREATE DATABASE IF NOT EXISTS test;
USE test;

-- Drop tables if needed to restate (commented for safety)
-- DROP TABLE IF EXISTS logs, feedback, resposta, tentativa, quiz_pergunta, quiz, informativo_tag, informativo, pergunta_tag, alternativa, pergunta, usuario, tag, categoria;

CREATE TABLE IF NOT EXISTS categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao VARCHAR(255),
  status BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tag (
  id_tag INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao VARCHAR(255),
  status BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('admin', 'monitor', 'user') DEFAULT 'user',
  status BOOLEAN DEFAULT TRUE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pergunta (
  id_pergunta INT AUTO_INCREMENT PRIMARY KEY,
  enunciado TEXT NOT NULL,
  instrucoes TEXT,
  tipo VARCHAR(50),
  id_categoria INT,
  status BOOLEAN DEFAULT TRUE,
  dificuldade ENUM('facil', 'medio', 'dificil'),
  FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE IF NOT EXISTS alternativa (
  id_alternativa INT AUTO_INCREMENT PRIMARY KEY,
  id_pergunta INT,
  texto VARCHAR(255) NOT NULL,
  correta BOOLEAN DEFAULT FALSE,
  ordem INT,
  status BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_pergunta) REFERENCES pergunta(id_pergunta) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pergunta_tag (
  id_pergunta INT,
  id_tag INT,
  PRIMARY KEY (id_pergunta, id_tag),
  FOREIGN KEY (id_pergunta) REFERENCES pergunta(id_pergunta) ON DELETE CASCADE,
  FOREIGN KEY (id_tag) REFERENCES tag(id_tag) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS informativo (
  id_informativo INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  resumo VARCHAR(255),
  conteudo_md TEXT,
  autor VARCHAR(255),
  data_publicacao DATE,
  status BOOLEAN DEFAULT TRUE,
  imagem_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS informativo_tag (
  id_informativo INT,
  id_tag INT,
  PRIMARY KEY (id_informativo, id_tag),
  FOREIGN KEY (id_informativo) REFERENCES informativo(id_informativo) ON DELETE CASCADE,
  FOREIGN KEY (id_tag) REFERENCES tag(id_tag) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz (
  id_quiz INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  id_categoria INT,
  tempo_estimado_min INT,
  tentativas_max INT,
  feedback_ativo BOOLEAN DEFAULT TRUE,
  visibilidade VARCHAR(50),
  status BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE IF NOT EXISTS quiz_pergunta (
  id_quiz INT,
  id_pergunta INT,
  PRIMARY KEY (id_quiz, id_pergunta),
  FOREIGN KEY (id_quiz) REFERENCES quiz(id_quiz) ON DELETE CASCADE,
  FOREIGN KEY (id_pergunta) REFERENCES pergunta(id_pergunta) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tentativa (
  id_tentativa INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  id_quiz INT,
  inicio_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  fim_em DATETIME,
  duracao_seg INT,
  pontuacao_total FLOAT,
  status BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_quiz) REFERENCES quiz(id_quiz)
);

CREATE TABLE IF NOT EXISTS resposta (
  id_resposta INT AUTO_INCREMENT PRIMARY KEY,
  id_tentativa INT,
  id_pergunta INT,
  id_alternativa INT,
  correta BOOLEAN,
  status BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_tentativa) REFERENCES tentativa(id_tentativa),
  FOREIGN KEY (id_pergunta) REFERENCES pergunta(id_pergunta),
  FOREIGN KEY (id_alternativa) REFERENCES alternativa(id_alternativa)
);

CREATE TABLE IF NOT EXISTS feedback (
  id_feedback INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  id_questao INT,
  id_quiz INT,
  id_informativo INT,
  `desc` TEXT,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_questao) REFERENCES pergunta(id_pergunta),
  FOREIGN KEY (id_quiz) REFERENCES quiz(id_quiz),
  FOREIGN KEY (id_informativo) REFERENCES informativo(id_informativo)
);

CREATE TABLE IF NOT EXISTS logs (
  id_log INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT,
  dataHora DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- ==========================================
-- DADOS INICIAIS (MOCK DATA)
-- ==========================================

INSERT IGNORE INTO categoria (id_categoria, nome, descricao, status) VALUES
(1, 'Direito Civil', 'Categoria de Direito Civil', 1),
(2, 'Direito Penal', 'Categoria de Direito Penal', 1),
(3, 'Direito Trabalhista', 'Categoria de Direito Trabalhista', 1),
(4, 'Direito Constitucional', 'Categoria Constitucional', 1),
(5, 'Direito Administrativo', 'Categoria Administrativo', 1);

INSERT IGNORE INTO tag (id_tag, nome, descricao, status) VALUES
(1, 'Contratos', 'Tag relacionada a contratos', 1),
(2, 'Ilicitude', 'Tag relacionada a Ilicitude', 1),
(3, 'Reforma', 'Tag relacionada a Reformas', 1);

-- Inserindo alguns Informativos mocados do antigo data.ts
INSERT IGNORE INTO informativo (id_informativo, titulo, resumo, conteudo_md, autor, data_publicacao, status) VALUES
(1, 'Princípios do Direito Civil', 'Conceitos centrais de contratos e obrigações.', 'Este informativo apresenta os princípios estruturantes do Direito Civil aplicados a contratos e responsabilidade civil...', 'João Silva', '2025-10-12', 1),
(2, 'Excludentes de Ilicitude', 'Legítima defesa e estado de necessidade.', 'As excludentes de ilicitude são causas que afastam a antijuridicidade da conduta típica...', 'Maria Oliveira', '2025-11-05', 1),
(3, 'Reforma Trabalhista: Impactos', 'Principais mudanças e efeitos práticos.', 'A reforma trabalhista trouxe significativas alterações nas relações de trabalho...', 'Carlos Santos', '2025-09-18', 1);

-- Inserindo alguns Quizzes
INSERT IGNORE INTO quiz (id_quiz, titulo, descricao, id_categoria, tempo_estimado_min, tentativas_max, status) VALUES
(1, 'Quiz: Princípios do Direito Civil', 'Teste seus conhecimentos sobre contratos e obrigações.', 1, 15, 3, 1),
(2, 'Quiz: Excludentes de Ilicitude', 'Avalie seu entendimento sobre legítima defesa.', 2, 10, 3, 1),
(3, 'Quiz: Reforma Trabalhista', 'Questões sobre as mudanças nas relações de trabalho.', 3, 12, 5, 1);

-- Inserindo Usuarios (senha: Admin@123 para todos — hash BCrypt)
INSERT IGNORE INTO usuario (id_usuario, nome, email, senha_hash, perfil, status) VALUES
(1, 'cliente', 'cliente@gmail.com', '$2b$10$mY2.gb0e1ng/N7Da33iLw.VONSVSTKGVWEStY/H8giVXV/kG7JvDa', 'user', 1),
(2, 'admin', 'admin@gmail.com', '$2b$10$mY2.gb0e1ng/N7Da33iLw.VONSVSTKGVWEStY/H8giVXV/kG7JvDa', 'admin', 1),
(3, 'monitor', 'monitor@gmail.com', '$2b$10$mY2.gb0e1ng/N7Da33iLw.VONSVSTKGVWEStY/H8giVXV/kG7JvDa', 'monitor', 1);

