/**
 * Utilitário para mapear colunas do PostgreSQL (snake_case/lowercase) 
 * para camelCase do JavaScript
 */

/**
 * Mapeamento de colunas do banco de dados para camelCase
 */
const columnMappings = {
  // Lotes
  'pesomaximo': 'pesoMaximo',
  'pesoutilizado': 'pesoUtilizado',
  'quantidadetokens': 'quantidadeTokens',
  'valorpago': 'valorPago',
  'percentualempresa': 'percentualEmpresa',
  'valordistribuido': 'valorDistribuido',
  'datacriacao': 'dataCriacao',
  'datapagamentovalidadora': 'dataPagamentoValidadora',
  
  // Waste Records
  'userid': 'userId',
  'loteid': 'loteId',
  'valorproporcional': 'valorProporcional',
  'datavalidacao': 'dataValidacao',
  'datasolicitacaopagamento': 'dataSolicitacaoPagamento',
  'datapagamento': 'dataPagamento',
  
  // Users
  'criadoem': 'criadoEm',
  
  // Validadoras
  'nomeempresa': 'nomeEmpresa',
  'datacadastro': 'dataCadastro',
  
  // Tokens
  // dataCriacao já está ok
};

/**
 * Mapeia um objeto do banco de dados para camelCase
 * @param {Object} dbObject - Objeto retornado do banco de dados
 * @returns {Object} - Objeto com propriedades em camelCase
 */
function mapDbObjectToCamelCase(dbObject) {
  if (!dbObject) return dbObject;
  
  const mapped = {};
  
  for (const [key, value] of Object.entries(dbObject)) {
    const lowerKey = key.toLowerCase();
    const mappedKey = columnMappings[lowerKey] || key;
    mapped[mappedKey] = value;
  }
  
  return mapped;
}

/**
 * Mapeia um array de objetos do banco de dados para camelCase
 * @param {Array} dbArray - Array de objetos retornados do banco
 * @returns {Array} - Array com objetos em camelCase
 */
function mapDbArrayToCamelCase(dbArray) {
  if (!Array.isArray(dbArray)) return dbArray;
  return dbArray.map(item => mapDbObjectToCamelCase(item));
}

/**
 * Mapeia propriedades camelCase para lowercase (para queries)
 * @param {Object} camelCaseObject - Objeto em camelCase
 * @returns {Object} - Objeto com chaves em lowercase
 */
function mapCamelCaseToDb(camelCaseObject) {
  if (!camelCaseObject) return camelCaseObject;
  
  const mapped = {};
  const reverseMapping = {};
  
  // Criar mapeamento reverso
  for (const [dbKey, camelKey] of Object.entries(columnMappings)) {
    reverseMapping[camelKey] = dbKey;
  }
  
  for (const [key, value] of Object.entries(camelCaseObject)) {
    const mappedKey = reverseMapping[key] || key.toLowerCase();
    mapped[mappedKey] = value;
  }
  
  return mapped;
}

module.exports = {
  mapDbObjectToCamelCase,
  mapDbArrayToCamelCase,
  mapCamelCaseToDb,
  columnMappings
};

