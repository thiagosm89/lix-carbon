const TokenRepository = require('../repositories/TokenRepository');

/**
 * Service de Totem
 * Camada de Business Logic
 */
class TotemService {
  /**
   * Gerar token pelo totem
   */
  async gerarToken() {
    // Gerar token de 6 dígitos aleatórios
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Gerar peso aleatório entre 5kg e 500kg
    const peso = parseFloat((Math.random() * (500 - 5) + 5).toFixed(2));
    
    // Categoria aleatória
    const categorias = ['RECICLAVEL', 'ORGANICO'];
    const categoria = categorias[Math.floor(Math.random() * categorias.length)];
    
    // Criar token no banco de dados
    const novoToken = await TokenRepository.create({
      token,
      categoria,
      peso,
      usado: false
    });

    console.log(`🎫 Token gerado pelo totem: ${token} | ${categoria} | ${peso}kg`);

    return {
      numero: novoToken.token,
      categoria: novoToken.categoria,
      peso: novoToken.peso,
      dataCriacao: novoToken.dataCriacao,
      usado: novoToken.usado
    };
  }

  /**
   * Verificar status do totem
   */
  async verificarStatus() {
    return {
      status: 'online',
      message: 'Totem LixCarbon operacional',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Buscar últimos tokens gerados
   */
  async buscarUltimosTokens(limit = 10) {
    const tokens = await TokenRepository.findRecent(limit);

    return {
      total: tokens.length,
      tokens: tokens.map(t => ({
        numero: t.token,
        categoria: t.categoria,
        peso: t.peso,
        usado: t.usado,
        dataCriacao: t.dataCriacao
      }))
    };
  }
}

module.exports = new TotemService();

