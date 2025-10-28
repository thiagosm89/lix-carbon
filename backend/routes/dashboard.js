const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const DashboardController = require('../controllers/DashboardController');

// Dashboard do USUARIO
router.get('/usuario', authenticateToken, authorizeRole('USUARIO'), (req, res) => 
  DashboardController.dashboardUsuario(req, res)
);

// Dashboard do VALIDADOR_CREDITO
router.get('/validador', authenticateToken, authorizeRole('VALIDADOR_CREDITO'), (req, res) => 
  DashboardController.dashboardValidador(req, res)
);

// Dashboard do ADMINISTRADOR
router.get('/admin', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  DashboardController.dashboardAdmin(req, res)
);

module.exports = router;
