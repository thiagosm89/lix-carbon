const DashboardService = require('../services/DashboardService');

/**
 * Controller de Dashboard
 * Camada de Presentation (HTTP)
 */
class DashboardController {
  /**
   * GET /api/dashboard/usuario
   */
  async dashboardUsuario(req, res) {
    try {
      const userId = req.user.id;
      const dashboard = await DashboardService.dashboardUsuario(userId);
      res.json(dashboard);
    } catch (error) {
      console.error('Erro ao buscar dashboard do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar dashboard' });
    }
  }

  /**
   * GET /api/dashboard/validador
   */
  async dashboardValidador(req, res) {
    try {
      const dashboard = await DashboardService.dashboardValidador();
      res.json(dashboard);
    } catch (error) {
      console.error('Erro ao buscar dashboard do validador:', error);
      res.status(500).json({ error: 'Erro ao buscar dashboard' });
    }
  }

  /**
   * GET /api/dashboard/admin
   */
  async dashboardAdmin(req, res) {
    try {
      const dashboard = await DashboardService.dashboardAdmin();
      res.json(dashboard);
    } catch (error) {
      console.error('Erro ao buscar dashboard do admin:', error);
      res.status(500).json({ error: 'Erro ao buscar dashboard' });
    }
  }
}

module.exports = new DashboardController();

