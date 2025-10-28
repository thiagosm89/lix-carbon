const WasteRecordRepository = require('../repositories/WasteRecordRepository');
const UserRepository = require('../repositories/UserRepository');

/**
 * Service de Dashboard
 * Camada de Business Logic
 */
class DashboardService {
  /**
   * Dashboard do USUARIO
   */
  async dashboardUsuario(userId) {
    const registros = await WasteRecordRepository.findByUserId(userId);

    const dashboard = {
      resumo: {
        totalPeso: 0,
        totalCredito: 0,
        totalRegistros: registros.length,
        creditoPendente: 0
      },
      porCategoria: {
        RECICLAVEL: { peso: 0, credito: 0, quantidade: 0, percentual: 0 },
        ORGANICO: { peso: 0, credito: 0, quantidade: 0, percentual: 0 }
      },
      ultimosRegistros: [],
      graficoMensal: []
    };

    // Calcular totais
    registros.forEach(r => {
      dashboard.resumo.totalPeso += r.peso;
      dashboard.resumo.totalCredito += r.credito;
      
      if (r.status === 'PENDENTE_PAGAMENTO') {
        dashboard.resumo.creditoPendente += r.credito;
      }

      dashboard.porCategoria[r.categoria].peso += r.peso;
      dashboard.porCategoria[r.categoria].credito += r.credito;
      dashboard.porCategoria[r.categoria].quantidade += 1;
    });

    // Calcular percentuais
    const totalCredito = dashboard.resumo.totalCredito || 1;
    dashboard.porCategoria.RECICLAVEL.percentual = ((dashboard.porCategoria.RECICLAVEL.credito / totalCredito) * 100).toFixed(1);
    dashboard.porCategoria.ORGANICO.percentual = ((dashboard.porCategoria.ORGANICO.credito / totalCredito) * 100).toFixed(1);

    // Últimos registros (últimos 10)
    dashboard.ultimosRegistros = registros.slice(0, 10);

    // Dados para gráfico mensal - últimos 6 meses
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const graficoMensal = {};
    const dataAtual = new Date();
    
    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
      const mesAno = `${mesesNomes[data.getMonth()]}/${data.getFullYear().toString().slice(-2)}`;
      graficoMensal[mesAno] = { mes: mesAno, reciclavel: 0, organico: 0 };
    }

    // Agrupar registros por mês
    registros.forEach(r => {
      const data = new Date(r.dataCriacao);
      const mesAno = `${mesesNomes[data.getMonth()]}/${data.getFullYear().toString().slice(-2)}`;
      
      if (graficoMensal[mesAno]) {
        if (r.categoria === 'RECICLAVEL') {
          graficoMensal[mesAno].reciclavel += r.peso;
        } else {
          graficoMensal[mesAno].organico += r.peso;
        }
      }
    });

    dashboard.graficoMensal = Object.values(graficoMensal);

    return dashboard;
  }

  /**
   * Dashboard do VALIDADOR_CREDITO
   */
  async dashboardValidador() {
    const registros = await WasteRecordRepository.findAll();

    const dashboard = {
      resumo: {
        totalRegistros: registros.length,
        totalCredito: 0,
        totalPeso: 0,
        aguardandoValidacao: 0
      },
      porCategoria: {
        RECICLAVEL: { peso: 0, credito: 0, quantidade: 0 },
        ORGANICO: { peso: 0, credito: 0, quantidade: 0 }
      },
      registrosRecentes: []
    };

    // Calcular totais
    // Crédito de CO2: 1 tonelada = 1 crédito
    registros.forEach(r => {
      dashboard.resumo.totalPeso += r.peso;

      dashboard.porCategoria[r.categoria].peso += r.peso;
      dashboard.porCategoria[r.categoria].quantidade += 1;
    });
    
    // Converter peso (kg) para toneladas = créditos de CO2
    dashboard.resumo.totalCredito = dashboard.resumo.totalPeso / 1000;
    dashboard.porCategoria.RECICLAVEL.credito = dashboard.porCategoria.RECICLAVEL.peso / 1000;
    dashboard.porCategoria.ORGANICO.credito = dashboard.porCategoria.ORGANICO.peso / 1000;

    // Registros recentes
    dashboard.registrosRecentes = registros.slice(0, 10);
    dashboard.ultimosRegistros = registros.slice(0, 10); // Compatibilidade

    return dashboard;
  }

  /**
   * Dashboard do ADMINISTRADOR
   */
  async dashboardAdmin() {
    const registros = await WasteRecordRepository.findAll();
    const usuarios = await UserRepository.findByRole('USUARIO');

    const dashboard = {
      resumo: {
        totalEmpresas: usuarios.length,
        totalRegistros: registros.length,
        totalPeso: 0,
        totalCredito: 0,
        pagamentosPendentes: 0,
        valorPendente: 0
      },
      empresas: [],
      pagamentosPendentes: []
    };

    // Calcular totais
    // Crédito de CO2: 1 tonelada = 1 crédito
    registros.forEach(r => {
      dashboard.resumo.totalPeso += r.peso;
      if (r.status === 'PENDENTE_PAGAMENTO') {
        dashboard.resumo.pagamentosPendentes += 1;
        dashboard.resumo.valorPendente += r.credito;
      }
    });
    
    // Converter peso total (kg) para toneladas = créditos de CO2
    dashboard.resumo.totalCredito = dashboard.resumo.totalPeso / 1000;

    // Agrupar por empresa
    dashboard.empresas = usuarios.map(emp => {
      const registrosEmpresa = registros.filter(r => r.userId === emp.id);
      const pesoTotal = registrosEmpresa.reduce((sum, r) => sum + r.peso, 0);
      const pesoPendente = registrosEmpresa
        .filter(r => r.status === 'PENDENTE_PAGAMENTO')
        .reduce((sum, r) => sum + r.peso, 0);
      
      // Converter peso (kg) para toneladas = créditos de CO2
      const creditoTotal = pesoTotal / 1000;
      const creditoPendente = pesoPendente / 1000;

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
    const pendentes = registros.filter(r => r.status === 'PENDENTE_PAGAMENTO');
    console.log('📊 Dashboard Admin - Pagamentos Pendentes encontrados:', pendentes.length);
    
    dashboard.pagamentosPendentes = pendentes
      .sort((a, b) => {
        const dateA = new Date(a.dataSolicitacaoPagamento || a.dataCriacao);
        const dateB = new Date(b.dataSolicitacaoPagamento || b.dataCriacao);
        return dateB - dateA;
      })
      .slice(0, 10);

    return dashboard;
  }
}

module.exports = new DashboardService();

