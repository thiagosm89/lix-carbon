const TokenRepository = require('../repositories/TokenRepository');

/**
 * Service de Totem
 * Camada de Business Logic
 */
class TotemService {
  /**
   * Gerar token pelo totem com dados detalhados
   */
  async gerarToken(dadosDeposito = null) {
    // Gerar token de 6 dígitos aleatórios
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    
    let peso, categoria, pesoReciclavel, pesoOrganico, detalhamento;

    if (dadosDeposito) {
      // Usar dados do simulador
      pesoReciclavel = parseFloat(dadosDeposito.pesoReciclavel) || 0;
      pesoOrganico = parseFloat(dadosDeposito.pesoOrganico) || 0;
      peso = pesoReciclavel + pesoOrganico;
      
      // Determinar categoria predominante
      categoria = pesoReciclavel >= pesoOrganico ? 'RECICLAVEL' : 'ORGANICO';
      
      detalhamento = dadosDeposito.detalhamento || [];
      
      console.log(`🎫 Token gerado pelo simulador: ${token}`);
      console.log(`   📊 Reciclável: ${pesoReciclavel}kg | Orgânico: ${pesoOrganico}kg`);
      console.log(`   📋 Itens: ${detalhamento.length} tipos diferentes`);
    } else {
      // Gerar aleatório (modo antigo)
      peso = parseFloat((Math.random() * (500 - 5) + 5).toFixed(2));
      const categorias = ['RECICLAVEL', 'ORGANICO'];
      categoria = categorias[Math.floor(Math.random() * categorias.length)];
      
      console.log(`🎫 Token gerado aleatório: ${token} | ${categoria} | ${peso}kg`);
    }
    
    // Criar token no banco de dados com usado = 0 (disponível)
    const novoToken = await TokenRepository.create({
      token,
      categoria,
      peso,
      usado: false
    });

    return {
      numero: novoToken.token,
      categoria: novoToken.categoria,
      peso: novoToken.peso,
      pesoReciclavel: dadosDeposito ? pesoReciclavel : (categoria === 'RECICLAVEL' ? peso : 0),
      pesoOrganico: dadosDeposito ? pesoOrganico : (categoria === 'ORGANICO' ? peso : 0),
      detalhamento: detalhamento || [],
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

