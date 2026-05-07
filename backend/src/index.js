require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDatabase } = require('./database');
const { PORT } = require('./config');

// Garantir que a pasta data existe
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar banco de dados
initializeDatabase();

const app = express();
// Middlewares globais
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:4173'
]);

app.use(cors({
  origin(origin, callback) {
    // Permite chamadas sem origin (curl, server-to-server)
    if (!origin) return callback(null, true);

    // Electron empacotado pode enviar origem null/file://
    if (origin === 'null' || origin === 'file://') {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS bloqueado para origem: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/produtos', require('./routes/produtos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/vendas', require('./routes/vendas'));
app.use('/api/caixa', require('./routes/caixa'));
app.use('/api/estoque', require('./routes/estoque'));
app.use('/api/configuracao', require('./routes/configuracao'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/relatorios', require('./routes/relatorios'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handler de erros globais
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`NexLoja Backend rodando em http://localhost:${PORT}`);
  console.log(`Credenciais padrão: admin@nexloja.com / admin123`);
});
