# 🚀 API Consultoria - Backend

Uma API REST para sistema de consultoria desenvolvida com **Node.js**, **TypeScript**, **Express** e **PostgreSQL**.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18.x ou superior) - [Download](https://nodejs.org/)
- **npm** (vem com Node.js) ou **yarn**
- **PostgreSQL** (versão 12.x ou superior) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## 🐘 Configuração do PostgreSQL

### Windows:

1. Baixe o PostgreSQL do site oficial
2. Execute o instalador e siga as instruções
3. **IMPORTANTE**: Anote a senha do usuário `postgres` que você definir
4. Mantenha a porta padrão `5432`

### Criando o Banco de Dados:

1. Abra o **pgAdmin** (vem com o PostgreSQL) ou use o terminal
2. Conecte-se com o usuário `postgres` e a senha que você definiu
3. Crie um novo banco de dados chamado `dbconsultoria`:

```sql
CREATE DATABASE dbconsultoria;
```

**Ou via terminal:**

```bash
# Conecte-se ao PostgreSQL
psql -U postgres -h localhost

# Crie o banco
CREATE DATABASE dbconsultoria;

# Sair
\q
```

## 📥 Clonagem e Configuração do Projeto

### 1. Clone o repositório:

```bash
git clone https://github.com/wessilva/api-consultoria.git
cd api-consultoria
```

### 2. Instale as dependências:

```bash
npm install
```

### 3. Configuração das Variáveis de Ambiente:

Copie o arquivo `.env.example` para `.env`:

```bash
# Windows (Prompt/PowerShell)
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### 4. Edite o arquivo `.env` com suas configurações:

Abra o arquivo `.env` e configure:

```env
# Ambiente de execução
NODE_ENV=development

# Porta do servidor
PORT=3333

# URL de conexão do PostgreSQL
# Substitua 'admin' pela senha do seu usuário postgres
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/dbconsultoria?schema=public

# Chave secreta para JWT (IMPORTANTE: Gere uma nova!)
JWT_SECRET=your-super-secret-key-with-at-least-32-characters-here-change-in-production

# Tempo de expiração do token JWT
JWT_EXPIRES_IN=7d
```

## 🔐 Gerando uma Nova Chave JWT

**IMPORTANTE**: Sempre gere uma nova chave JWT para segurança!

### Opção 1 - Via Node.js (Recomendado):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Opção 2 - Online:

- Acesse: [JWT Secret Generator](https://jwtsecret.com/)
- Copie a chave gerada

**Cole a chave gerada no seu arquivo `.env` na variável `JWT_SECRET`**

## 🗄️ Configuração do Banco de Dados

### 1. Gere o cliente Prisma:

```bash
npx prisma generate
```

### 2. Execute as migrações para criar as tabelas:

```bash
npx prisma migrate deploy
```

### 3. (Opcional) Visualize o banco de dados:

```bash
npx prisma studio
```

_Isso abrirá uma interface web em `http://localhost:5555` para visualizar os dados_

## ▶️ Executando o Projeto

### Modo Desenvolvimento (com auto-reload):

```bash
npm run dev
```

### Modo Produção:

```bash
# Build do projeto
npm run build

# Executar
npm start
```

**O servidor estará disponível em:** `http://localhost:3333`

## ✅ Testando a API

### Teste Rápido:

Acesse no navegador: `http://localhost:3333/`

Você deve ver uma mensagem de confirmação de que a API está funcionando.

### Teste Completo de Autenticação:

O projeto inclui um script de teste automático:

```bash
node test-auth.js
```

**Ou teste manualmente com curl/Postman:**

#### 1. Registrar usuário:

```bash
curl -X POST http://localhost:3333/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuario",
    "email": "teste@exemplo.com",
    "password": "senha123456"
  }'
```

#### 2. Fazer login:

```bash
curl -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123456"
  }'
```

## 📖 Documentação da API

A documentação interativa da API está disponível em:
**`http://localhost:3333/api-docs`**

## 🧪 Executando Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 📁 Estrutura do Projeto

```
api-consultoria/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Migrações do banco
├── src/
│   ├── controllers/           # Controladores da API
│   ├── services/             # Lógica de negócio
│   ├── middlewares/          # Middlewares (auth, validation, etc)
│   ├── validators/           # Validações Zod
│   ├── lib/                  # Bibliotecas (Prisma client)
│   ├── config/               # Configurações
│   ├── errors/               # Tratamento de erros
│   └── server.ts             # Servidor principal
├── scripts/                  # Scripts utilitários
├── .env                      # Variáveis de ambiente
└── README.md                 # Este arquivo
```

## 🔗 Principais Rotas da API

| Método | Rota                | Descrição                             |
| ------ | ------------------- | ------------------------------------- |
| `POST` | `/register`         | Registrar novo usuário                |
| `POST` | `/login`            | Fazer login                           |
| `GET`  | `/users/profile`    | Obter perfil do usuário (requer auth) |
| `GET`  | `/attendance-cards` | Listar cartões de atendimento         |
| `POST` | `/attendance-cards` | Criar cartão de atendimento           |
| `GET`  | `/companies`        | Listar empresas                       |
| `POST` | `/companies`        | Criar empresa                         |

_Para rotas que requerem autenticação, inclua o header:_

```
Authorization: Bearer SEU_JWT_TOKEN
```

## ❌ Problemas Comuns

### Erro de conexão com o banco:

- Verifique se o PostgreSQL está rodando
- Confirme a senha no `.env`
- Teste a conexão: `psql -U postgres -h localhost`

### Erro "Port 3333 is already in use":

- Mude a porta no `.env`: `PORT=3334`
- Ou finalize o processo que está usando a porta

### Erro nas migrações:

```bash
# Resetar migrações (CUIDADO: apaga dados!)
npx prisma migrate reset

# Aplicar migrações novamente
npx prisma migrate deploy
```

### Erro de dependências:

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC.

---

## ⚠️ IMPORTANTE para o Frontend

- A API roda na porta **3333** por padrão
- Base URL: `http://localhost:3333`
- Todas as rotas retornam JSON
- Para rotas protegidas, inclua o JWT no header `Authorization: Bearer TOKEN`
- Use o endpoint `/api-docs` para ver todas as rotas disponíveis

---

**Dúvidas?** Entre em contato com a equipe de backend!
