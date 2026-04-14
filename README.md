# Quiz Direito

Aplicacao full stack para gerenciamento e execucao de quizzes, informativos e acompanhamento de usuarios no contexto do curso de Direito.

O projeto esta dividido em dois modulos:

- `frontend`: React 19 + Vite + TypeScript
- `backend`: Node.js + Express + TypeScript + MariaDB

## Stack utilizada

- Frontend: React, React Router, Axios, Recharts, Vite, Tailwind CSS 4
- Backend: Express, MariaDB, JWT, Bcrypt, Zod, Resend
- Banco de dados: MariaDB

## Estrutura do repositorio

```text
.
|-- backend
|   |-- src
|   |-- .env.example
|   `-- package.json
|-- frontend
|   |-- src
|   |-- .env.example
|   `-- package.json
|-- docs
`-- README.md
```

## Pre-requisitos

Antes de rodar o projeto localmente, tenha instalado:

- Node.js 20 ou superior
- npm 10 ou superior
- MariaDB em execucao na maquina local

Ambiente validado durante a revisao deste repositorio:

- Node.js `v22.19.0`
- npm `11.11.0`

## Como instalar e rodar localmente

### 1. Clonar o repositorio

```bash
git clone <URL_DO_REPOSITORIO>
cd quiz-direito-main
```

### 2. Instalar as dependencias

Instale frontend e backend separadamente:

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

### 3. Configurar os arquivos `.env`

#### Backend

Crie o arquivo `backend/.env` a partir do exemplo:

PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
```

Bash:

```bash
cp backend/.env.example backend/.env
```

Exemplo recomendado para desenvolvimento local:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=troque_esta_chave_por_um_valor_forte

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=quiz_direito_local

RESEND_API_KEY=
EMAIL_FROM=onboarding@resend.dev
EMAIL_TEST_RECEIVER=
```

O que cada variavel faz:

- `PORT`: porta da API backend
- `NODE_ENV`: ambiente da aplicacao
- `FRONTEND_URL`: origem permitida no CORS e URL base do link de redefinicao de senha
- `JWT_SECRET`: chave usada para assinar os tokens JWT
- `DB_HOST`: host do MariaDB
- `DB_PORT`: porta do MariaDB
- `DB_USER`: usuario do banco
- `DB_PASSWORD`: senha do banco
- `DB_NAME`: nome do banco que sera criado/inicializado pelo script `db:init`
- `RESEND_API_KEY`: opcional; necessario apenas para testar recuperacao de senha por e-mail
- `EMAIL_FROM`: remetente usado pelo Resend
- `EMAIL_TEST_RECEIVER`: opcional; em desenvolvimento redireciona os e-mails para uma caixa de teste

Observacao:

- Se `RESEND_API_KEY` nao for configurada, o restante da aplicacao funciona normalmente.
- Sem essa chave, apenas o fluxo de "Esqueci minha senha" nao podera ser testado por e-mail.

#### Frontend

Crie o arquivo `frontend/.env` a partir do exemplo:

PowerShell:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Bash:

```bash
cp frontend/.env.example frontend/.env
```

Conteudo esperado:

```env
VITE_API_URL=http://localhost:3000/api
```

Variavel usada pelo frontend:

- `VITE_API_URL`: URL base da API consumida pelo Axios

### 4. Inicializar o banco de dados

Com o MariaDB em execucao e o `backend/.env` configurado, rode:

```bash
cd backend
npm run db:init
```

Esse comando:

- cria o banco definido em `DB_NAME`, se ele ainda nao existir
- cria as tabelas do sistema
- insere os dados iniciais de apoio

O script e idempotente, entao pode ser executado novamente sem quebrar a estrutura existente.

### 5. Subir o backend

Em um terminal:

```bash
cd backend
npm run dev
```

API disponivel em:

```text
http://localhost:3000
```

Base da API:

```text
http://localhost:3000/api
```

### 6. Subir o frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

Aplicacao disponivel em:

```text
http://localhost:5173
```

## Credenciais iniciais para teste

O script de inicializacao insere usuarios de exemplo:

- Professor: `admin@gmail.com` / `Admin@123`
- Monitor: `monitor@gmail.com` / `Admin@123`
- Usuario: `cliente@gmail.com` / `Admin@123`

Observacao:

- No banco o perfil `admin` e mapeado para `professor` no frontend.
- Tambem existe o acesso como convidado diretamente pela tela de login.

## Scripts uteis

### Backend

- `npm run dev`: sobe a API em modo desenvolvimento
- `npm run build`: gera a pasta `dist`
- `npm run start`: executa o backend compilado
- `npm run db:init`: cria o banco, tabelas e dados iniciais
- `npm run seed`: reaplica schema e dados iniciais
- `npm run db:test`: testa a conexao com o banco
- `npm run email:test`: testa o envio de e-mail via Resend
- `npm test`: executa o teste basico das validacoes Zod

### Frontend

- `npm run dev`: sobe a aplicacao em modo desenvolvimento
- `npm run build`: gera o build de producao
- `npm run preview`: sobe o build localmente
- `npm run lint`: executa o ESLint

## Fluxo recomendado apos o clone

```bash
git clone <URL_DO_REPOSITORIO>
cd quiz-direito-main
cd backend && npm install
cd ../frontend && npm install
cd ..
```

Depois:

1. Copie `backend/.env.example` para `backend/.env`
2. Copie `frontend/.env.example` para `frontend/.env`
3. Rode `npm run db:init` dentro de `backend`
4. Rode `npm run dev` dentro de `backend`
5. Rode `npm run dev` dentro de `frontend`

## Observacoes importantes

- A pasta `docs/` contem materiais de apoio e arquivos visuais, mas nao e necessaria para subir a aplicacao.
- O backend usa CORS restrito ao valor de `FRONTEND_URL`; se trocar a porta do frontend, atualize essa variavel.
- O frontend usa `VITE_API_URL`; se trocar a porta do backend, atualize essa variavel.
- O build do frontend atualmente gera um bundle principal grande. Isso nao impede o funcionamento local, mas merece otimização futura.
