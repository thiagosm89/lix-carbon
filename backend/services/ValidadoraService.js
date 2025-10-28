const ValidadoraRepository = require('../repositories/ValidadoraRepository');

/**
 * Service de Validadoras
 * Camada de Business Logic
 */
class ValidadoraService {
  /**
   * Listar todas as validadoras
   */
  async listar() {
    const validadoras = await ValidadoraRepository.findAll();
    const stats = await ValidadoraRepository.getStats();
    
    return {
      validadoras,
      stats
    };
  }

  /**
   * Listar validadoras ativas
   */
  async listarAtivas() {
    const validadoras = await ValidadoraRepository.findActive();
    return { validadoras };
  }

  /**
   * Buscar validadora por ID
   */
  async buscarPorId(id) {
    const validadora = await ValidadoraRepository.findById(id);
    
    if (!validadora) {
      throw new Error('Validadora não encontrada');
    }
    
    return { validadora };
  }

  /**
   * Criar nova validadora
   */
  async criar(validadoraData) {
    const { nomeEmpresa, cnpj, email, telefone, endereco, responsavel } = validadoraData;

    // Validações
    if (!nomeEmpresa || !cnpj || !email) {
      throw new Error('Nome da empresa, CNPJ e email são obrigatórios');
    }

    // Verificar se CNPJ já existe
    const cnpjExistente = await ValidadoraRepository.findByCnpj(cnpj);
    if (cnpjExistente) {
      throw new Error('CNPJ já cadastrado');
    }

    const validadora = await ValidadoraRepository.create({
      nomeEmpresa,
      cnpj,
      email,
      telefone,
      endereco,
      responsavel
    });

    return { validadora };
  }

  /**
   * Atualizar validadora
   */
  async atualizar(id, validadoraData) {
    const { nomeEmpresa, cnpj, email, telefone, endereco, responsavel, ativa } = validadoraData;

    // Validações
    if (!nomeEmpresa || !cnpj || !email) {
      throw new Error('Nome da empresa, CNPJ e email são obrigatórios');
    }

    // Verificar se validadora existe
    const validadoraExistente = await ValidadoraRepository.findById(id);
    if (!validadoraExistente) {
      throw new Error('Validadora não encontrada');
    }

    // Verificar se CNPJ já existe em outra validadora
    const cnpjOutraValidadora = await ValidadoraRepository.findByCnpj(cnpj);
    if (cnpjOutraValidadora && cnpjOutraValidadora.id !== id) {
      throw new Error('CNPJ já cadastrado em outra validadora');
    }

    const validadora = await ValidadoraRepository.update(id, {
      nomeEmpresa,
      cnpj,
      email,
      telefone,
      endereco,
      responsavel,
      ativa
    });

    return { validadora };
  }

  /**
   * Ativar/Desativar validadora
   */
  async toggleAtiva(id) {
    const validadora = await ValidadoraRepository.toggleAtiva(id);
    
    if (!validadora) {
      throw new Error('Validadora não encontrada');
    }
    
    return { validadora };
  }

  /**
   * Deletar validadora
   */
  async deletar(id) {
    const validadora = await ValidadoraRepository.delete(id);
    
    if (!validadora) {
      throw new Error('Validadora não encontrada');
    }
    
    return { success: true };
  }
}

module.exports = new ValidadoraService();

