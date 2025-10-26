const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Inicializar banco de dados SQLite
const db = require('./database/db');
const seedDatabase = require('./database/seed');

const authRoutes = require('./routes/auth');
const wasteRoutes = require('./routes/waste');
const paymentRoutes = require('./routes/payment');
const dashboardRoutes = require('./routes/dashboard');
const loteRoutes = require('./routes/lote');
const totemRoutes = require('./routes/totem');
const validadoraRoutes = require('./routes/validadora');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos (para o totem.html)
app.use('/totem', express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lote', loteRoutes);
app.use('/api/totem', totemRoutes); // Endpoint público para simulação do totem
app.use('/api/validadora', validadoraRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LixCarbon API está funcionando!' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(PORT, () => {
  console.log(`🌱 Servidor LixCarbon rodando na porta ${PORT}`);
  console.log(`🚀 API disponível em: http://localhost:${PORT}`);
  console.log(`💾 Banco de dados SQLite conectado`);
  
  // Executar seed se o banco estiver vazio (com delay)
  setTimeout(() => {
    seedDatabase().catch(err => console.error('Erro no seed:', err));
  }, 1000);
});

module.exports = app;

