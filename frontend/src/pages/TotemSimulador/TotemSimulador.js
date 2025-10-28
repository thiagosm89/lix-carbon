import React, { useState } from 'react';
import { Package, Trash2, Leaf, Wine, Check, RotateCcw } from 'lucide-react';
import Button from '../../components/Button/Button';
import api from '../../services/api';
import './TotemSimulador.css';

const TotemSimulador = () => {
  const [depositos, setDepositos] = useState({
    latas: 0,
    garrafasPlastico: 0,
    garrafasVidro: 0,
    papelao: 0,
    organico: 0
  });

  const [pesosPorItem] = useState({
    latas: 0.015, // 15g por lata
    garrafasPlastico: 0.025, // 25g por garrafa plástica
    garrafasVidro: 0.350, // 350g por garrafa de vidro
    papelao: 0.200, // 200g por papelão
    organico: 0.500 // 500g por unidade de orgânico
  });

  const [tokenGerado, setTokenGerado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const tiposLixo = [
    {
      id: 'latas',
      nome: 'Latas de Alumínio',
      icone: Package,
      cor: '#FF6B6B',
      categoria: 'RECICLAVEL',
      descricao: '15g por unidade'
    },
    {
      id: 'garrafasPlastico',
      nome: 'Garrafas Plástico',
      icone: Wine,
      cor: '#4ECDC4',
      categoria: 'RECICLAVEL',
      descricao: '25g por unidade'
    },
    {
      id: 'garrafasVidro',
      nome: 'Garrafas de Vidro',
      icone: Wine,
      cor: '#95E1D3',
      categoria: 'RECICLAVEL',
      descricao: '350g por unidade'
    },
    {
      id: 'papelao',
      nome: 'Papelão',
      icone: Package,
      cor: '#F38181',
      categoria: 'RECICLAVEL',
      descricao: '200g por unidade'
    },
    {
      id: 'organico',
      nome: 'Lixo Orgânico',
      icone: Leaf,
      cor: '#7FD14B',
      categoria: 'ORGANICO',
      descricao: '500g por unidade'
    }
  ];

  const incrementar = (tipo) => {
    setDepositos(prev => ({
      ...prev,
      [tipo]: prev[tipo] + 1
    }));
    setMensagem('');
  };

  const decrementar = (tipo) => {
    if (depositos[tipo] > 0) {
      setDepositos(prev => ({
        ...prev,
        [tipo]: prev[tipo] - 1
      }));
    }
  };

  const calcularPesos = () => {
    const pesos = {
      RECICLAVEL: 0,
      ORGANICO: 0
    };

    Object.keys(depositos).forEach(tipo => {
      const quantidade = depositos[tipo];
      const pesoUnitario = pesosPorItem[tipo];
      const pesoTotal = quantidade * pesoUnitario;
      
      const tipoInfo = tiposLixo.find(t => t.id === tipo);
      if (tipoInfo) {
        pesos[tipoInfo.categoria] += pesoTotal;
      }
    });

    return pesos;
  };

  const calcularDetalhamento = () => {
    return Object.keys(depositos)
      .filter(tipo => depositos[tipo] > 0)
      .map(tipo => {
        const tipoInfo = tiposLixo.find(t => t.id === tipo);
        return {
          tipo: tipoInfo.nome,
          quantidade: depositos[tipo],
          pesoUnitario: pesosPorItem[tipo],
          pesoTotal: (depositos[tipo] * pesosPorItem[tipo]).toFixed(3)
        };
      });
  };

  const gerarToken = async () => {
    const totalItens = Object.values(depositos).reduce((sum, val) => sum + val, 0);
    
    if (totalItens === 0) {
      setMensagem('Adicione pelo menos um item antes de gerar o token!');
      return;
    }

    setLoading(true);
    setMensagem('');

    try {
      const pesos = calcularPesos();
      const detalhamento = calcularDetalhamento();
      
      // Chamar API do backend para gerar token no banco de dados
      const response = await api.post('/totem/gerar-token', {
        pesoReciclavel: pesos.RECICLAVEL,
        pesoOrganico: pesos.ORGANICO,
        detalhamento: detalhamento
      });

      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar token');
      }

      const tokenData = data.token;
      const pesoTotal = pesos.RECICLAVEL + pesos.ORGANICO;

      setTokenGerado({
        numero: tokenData.numero,
        categoria: tokenData.categoria,
        pesoTotal: pesoTotal.toFixed(3),
        pesoReciclavel: pesos.RECICLAVEL.toFixed(3),
        pesoOrganico: pesos.ORGANICO.toFixed(3),
        detalhamento: detalhamento,
        dataCriacao: new Date(tokenData.dataCriacao).toLocaleString('pt-BR')
      });

      setMensagem('Token gerado com sucesso e salvo no banco de dados!');
      console.log('✅ Token salvo no banco:', tokenData.numero);
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      setMensagem('Erro ao gerar token. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const resetar = () => {
    setDepositos({
      latas: 0,
      garrafasPlastico: 0,
      garrafasVidro: 0,
      papelao: 0,
      organico: 0
    });
    setTokenGerado(null);
    setMensagem('');
  };

  const totalItens = Object.values(depositos).reduce((sum, val) => sum + val, 0);
  const pesos = calcularPesos();
  const pesoTotal = pesos.RECICLAVEL + pesos.ORGANICO;

  return (
    <div className="totem-simulador-page">
      <div className="totem-container">
        <div className="totem-header">
          <div className="totem-logo">
            <Trash2 size={48} className="totem-icon" />
            <div>
              <h1>Totem LixCarbon</h1>
              <p>Simulador de Depósito de Resíduos</p>
            </div>
          </div>
        </div>

        {!tokenGerado ? (
          <>
            <div className="totem-info">
              <div className="info-card">
                <div className="info-label">Total de Itens</div>
                <div className="info-value">{totalItens}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Peso Total</div>
                <div className="info-value">{pesoTotal.toFixed(3)} kg</div>
              </div>
              <div className="info-card">
                <div className="info-label">Reciclável</div>
                <div className="info-value green">{pesos.RECICLAVEL.toFixed(3)} kg</div>
              </div>
              <div className="info-card">
                <div className="info-label">Orgânico</div>
                <div className="info-value orange">{pesos.ORGANICO.toFixed(3)} kg</div>
              </div>
            </div>

            <div className="totem-tipos">
              <h2>Selecione o tipo de resíduo</h2>
              <div className="tipos-grid">
                {tiposLixo.map(tipo => {
                  const Icon = tipo.icone;
                  return (
                    <div key={tipo.id} className="tipo-card">
                      <div className="tipo-header" style={{ borderColor: tipo.cor }}>
                        <Icon size={32} style={{ color: tipo.cor }} />
                        <div className="tipo-info">
                          <h3>{tipo.nome}</h3>
                          <p>{tipo.descricao}</p>
                        </div>
                      </div>
                      <div className="tipo-contador">
                        <button 
                          className="contador-btn"
                          onClick={() => decrementar(tipo.id)}
                          disabled={depositos[tipo.id] === 0}
                        >
                          -
                        </button>
                        <div className="contador-valor">
                          <span className="contador-numero">{depositos[tipo.id]}</span>
                          <span className="contador-label">unidades</span>
                          <span className="contador-peso">
                            {(depositos[tipo.id] * pesosPorItem[tipo.id]).toFixed(3)} kg
                          </span>
                        </div>
                        <button 
                          className="contador-btn"
                          onClick={() => incrementar(tipo.id)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {mensagem && (
              <div className={`totem-mensagem ${mensagem.includes('Erro') ? 'erro' : 'info'}`}>
                {mensagem}
              </div>
            )}

            <div className="totem-actions">
              <Button
                variant="secondary"
                icon={RotateCcw}
                onClick={resetar}
                disabled={totalItens === 0 || loading}
              >
                Resetar
              </Button>
              <Button
                variant="primary"
                icon={Check}
                onClick={gerarToken}
                disabled={totalItens === 0 || loading}
                size="large"
              >
                {loading ? 'Gerando...' : 'Gerar Token'}
              </Button>
            </div>
          </>
        ) : (
          <div className="token-resultado">
            <div className="token-sucesso">
              <div className="sucesso-icon">
                <Check size={64} />
              </div>
              <h2>Token Gerado com Sucesso!</h2>
              <p>Anote o código abaixo para registrar seus resíduos</p>
            </div>

            <div className="token-codigo">
              <div className="codigo-label">Seu Token:</div>
              <div className="codigo-valor">{tokenGerado.numero}</div>
            </div>

            <div className="token-detalhes">
              <h3>Detalhamento do Depósito</h3>
              
              <div className="detalhe-resumo">
                <div className="detalhe-item">
                  <span className="detalhe-label">Categoria Predominante:</span>
                  <span className={`detalhe-badge ${tokenGerado.categoria.toLowerCase()}`}>
                    {tokenGerado.categoria}
                  </span>
                </div>
                <div className="detalhe-item">
                  <span className="detalhe-label">Peso Total:</span>
                  <span className="detalhe-valor">{tokenGerado.pesoTotal} kg</span>
                </div>
                <div className="detalhe-item">
                  <span className="detalhe-label">Peso Reciclável:</span>
                  <span className="detalhe-valor green">{tokenGerado.pesoReciclavel} kg</span>
                </div>
                <div className="detalhe-item">
                  <span className="detalhe-label">Peso Orgânico:</span>
                  <span className="detalhe-valor orange">{tokenGerado.pesoOrganico} kg</span>
                </div>
              </div>

              <div className="detalhe-itens">
                <h4>Itens Depositados:</h4>
                <div className="itens-lista">
                  {tokenGerado.detalhamento.map((item, index) => (
                    <div key={index} className="item-linha">
                      <span className="item-nome">{item.tipo}</span>
                      <span className="item-quantidade">{item.quantidade}x</span>
                      <span className="item-peso">{item.pesoTotal} kg</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detalhe-data">
                Gerado em: {tokenGerado.dataCriacao}
              </div>
            </div>

            <Button
              variant="primary"
              icon={RotateCcw}
              onClick={resetar}
              fullWidth
              size="large"
            >
              Fazer Novo Depósito
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TotemSimulador;

