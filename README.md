# Full Stack Application

Este é um projeto full stack configurado com React (TypeScript + Tailwind CSS) no frontend e Node.js (Express + TypeScript + MariaDB) no backend.

## Estrutura do Projeto

O projeto é dividido em duas pastas principais:

- `/frontend`: Aplicação React criada com Vite, pronta para crescimento e estilização moderna com Tailwind CSS. 
- `/backend`: API RESTful baseada em Node.js e Express, configurada para conectar-se ao MariaDB e possuindo arquitetura escalável (rotas, controllers, services, middlewares etc).

## Como rodar o projeto

### Backend
1. Navegue até a pasta `/backend`
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente copiando o arquivo `.env.example` para `.env` e ajustando as credenciais do banco de dados (MariaDB).
4. Execute o ambiente de desenvolvimento: `npm run dev`

A API por padrão subirá em `http://localhost:3000`.

### Frontend
1. Navegue até a pasta `/frontend`
2. Instale as dependências: `npm install`
3. Inicie o servidor Vite: `npm run dev`

O frontend por padrão subirá em `http://localhost:5173`. Quando você acessa essa página, deverá ver uma comunicação com o backend em funcionamento.

---

> Esse projeto suporta expansões futuras e segue boas práticas arquiteturais separando camadas de responsabilidade com injeção de independência através de módulos pequenos e testáveis.
