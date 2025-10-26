const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { wasteRecords } = require('../data/waste');
const users = require('../data/users');

// Dashboard do USUARIO
router.get('/usuario', authenticateToken, authorizeRole('USUARIO'), (req, res) => {
  const userId = req.user.id;
  const registros = wasteRecords.filter(r => r.userId === userId);

  const dashboard = {
    resumo: {
      totalPeso: 0,
      totalCredito: 0,
      totalRegistros: registros.length,
      creditoPendente: 0,
      creditoPago: 0
    },
    porCategoria: {
      RECICLAVEL: { peso: 0, credito: 0, quantidade: 0, percentual: 0 },
      ORGANICO: { peso: 0, credito: 0, quantidade: 0, percentual: 0 }
    },
    ultimosRegistros: [],
    graficoMensal: []
  };

  // Calcular resumo
  registros.forEach(r => {
    dashboard.resumo.totalPeso += r.peso;
    dashboard.resumo.totalCredito += r.credito;
    dashboard.porCategoria[r.categoria].peso += r.peso;
    dashboard.porCategoria[r.categoria].credito += r.credito;
    dashboard.porCategoria[r.categoria].quantidade += 1;

    if (r.status === 'PENDENTE_PAGAMENTO') {
      dashboard.resumo.creditoPendente += r.credito;
    } else if (r.status === 'PAGO') {
      dashboard.resumo.creditoPago += r.credito;
    }
  });

  // Calcular percentuais
  if (dashboard.resumo.totalCredito > 0) {
    dashboard.porCategoria.RECICLAVEL.percentual = 
      (dashboard.porCategoria.RECICLAVEL.credito / dashboard.resumo.totalCredito * 100).toFixed(1);
    dashboard.porCategoria.ORGANICO.percentual = 
      (dashboard.porCategoria.ORGANICO.credito / dashboard.resumo.totalCredito * 100).toFixed(1);
  }

  // Últimos 5 registros
  dashboard.ultimosRegistros = registros
    .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
    .slice(0, 5);

  // Dados para gráfico mensal (últimos 6 meses)
  const meses = ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'];
  dashboard.graficoMensal = meses.map((mes, index) => ({
    mes,
    reciclavel: Math.floor(Math.random() * 500) + 100,
    organico: Math.floor(Math.random() * 400) + 50
  }));

  res.json(dashboard);
});

// Dashboard do VALIDADOR_CREDITO
router.get('/validador', authenticateToken, authorizeRole('VALIDADOR_CREDITO'), (req, res) => {
  const dashboard = {
    resumo: {
      totalRegistros: wasteRecords.length,
      totalPeso: 0,
      totalCredito: 0,
      empresasAtivas: 0
    },
    porCategoria: {
      RECICLAVEL: { peso: 0, credito: 0 },
      ORGANICO: { peso: 0, credito: 0 }
    },
    registrosRecentes: []
  };

  wasteRecords.forEach(r => {
    dashboard.resumo.totalPeso += r.peso;
    dashboard.resumo.totalCredito += r.credito;
    dashboard.porCategoria[r.categoria].peso += r.peso;
    dashboard.porCategoria[r.categoria].credito += r.credito;
  });

  // Contar empresas únicas
  const empresasUnicas = new Set(wasteRecords.map(r => r.userId));
  dashboard.resumo.empresasAtivas = empresasUnicas.size;

  // Últimos 10 registros
  dashboard.registrosRecentes = wasteRecords
    .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
    .slice(0, 10);

  res.json(dashboard);
});

// Dashboard do ADMINISTRADOR
router.get('/admin', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => {
  const dashboard = {
    resumo: {
      totalEmpresas: users.filter(u => u.role === 'USUARIO').length,
      totalRegistros: wasteRecords.length,
      totalCredito: 0,
      pagamentosPendentes: 0,
      valorPendente: 0
    },
    empresas: [],
    pagamentosPendentes: []
  };

  // Calcular totais
  wasteRecords.forEach(r => {
    dashboard.resumo.totalCredito += r.credito;
    if (r.status === 'PENDENTE_PAGAMENTO') {
      dashboard.resumo.pagamentosPendentes += 1;
      dashboard.resumo.valorPendente += r.credito;
    }
  });

  // Agrupar por empresa
  const empresas = users.filter(u => u.role === 'USUARIO');
  dashboard.empresas = empresas.map(emp => {
    const registrosEmpresa = wasteRecords.filter(r => r.userId === emp.id);
    const creditoTotal = registrosEmpresa.reduce((sum, r) => sum + r.credito, 0);
    const creditoPendente = registrosEmpresa
      .filter(r => r.status === 'PENDENTE_PAGAMENTO')
      .reduce((sum, r) => sum + r.credito, 0);

    return {
      id: emp.id,
      nome: emp.nome,
      cnpj: emp.cnpj,
      totalRegistros: registrosEmpresa.length,
      creditoTotal,
      creditoPendente
    };
  });

  // Pagamentos pendentes
  const pendentes = wasteRecords.filter(r => r.status === 'PENDENTE_PAGAMENTO');
  console.log('📊 Dashboard Admin - Pagamentos Pendentes encontrados:', pendentes.length);
  console.log('Status dos registros:', wasteRecords.map(r => ({ id: r.id.slice(0, 8), status: r.status })));
  
  dashboard.pagamentosPendentes = pendentes
    .sort((a, b) => {
      const dateA = new Date(a.dataSolicitacaoPagamento || a.dataCriacao);
      const dateB = new Date(b.dataSolicitacaoPagamento || b.dataCriacao);
      return dateB - dateA;
    })
    .slice(0, 10);

  res.json(dashboard);
});

module.exports = router;

