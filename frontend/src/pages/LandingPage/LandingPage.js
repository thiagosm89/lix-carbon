import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  TrendingUp, 
  Recycle, 
  BarChart3, 
  Shield, 
  Mail,
  ArrowRight,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import Button from '../../components/Button/Button';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleContact = (e) => {
    e.preventDefault();
    if (email && message) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setEmail('');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <nav className="navbar">
          <div className="container navbar-content">
            <div className="logo">
              <img src="/logomarca.png" alt="LixCarbon" className="logo-icon" />
            </div>
            <div className="nav-buttons">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Entrar
              </Button>
              <Button variant="primary" onClick={() => navigate('/cadastro')}>
                Cadastre-se
              </Button>
            </div>
          </div>
        </nav>

        <div className="hero-content container">
          <div className="hero-text">
            <h1 className="hero-title">
              Transforme seu <span className="text-gradient">Lixo</span> em
              <br />
              <span className="text-gradient">Crédito de Carbono</span>
            </h1>
            <p className="hero-description">
              A LixCarbon conecta sustentabilidade e tecnologia para gerar valor através
              da coleta inteligente de resíduos. Cada tonelada coletada contribui para
              um planeta mais limpo e gera créditos de carbono para sua empresa.
            </p>
            <div className="hero-actions">
              <Button 
                variant="primary" 
                size="large" 
                icon={ArrowRight}
                onClick={() => navigate('/cadastro')}
              >
                Comece Agora
              </Button>
              <Button 
                variant="secondary" 
                size="large"
                icon={Smartphone}
                onClick={() => navigate('/totem')}
              >
                Simular Totem
              </Button>
              <Button 
                variant="outline" 
                size="large"
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              >
                Fale Conosco
              </Button>
            </div>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">Toneladas Coletadas</div>
              </div>
              <div className="stat">
                <div className="stat-number">50+</div>
                <div className="stat-label">Empresas Parceiras</div>
              </div>
              <div className="stat">
                <div className="stat-number">10k+</div>
                <div className="stat-label">Créditos Gerados</div>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="floating-card card-1">
              <Recycle className="card-icon" />
              <div className="card-text">
                <div className="card-title">Reciclável</div>
                <div className="card-value">150 kg</div>
              </div>
            </div>
            <div className="floating-card card-2">
              <Leaf className="card-icon" />
              <div className="card-text">
                <div className="card-title">Orgânico</div>
                <div className="card-value">200 kg</div>
              </div>
            </div>
            <div className="floating-card card-3">
              <TrendingUp className="card-icon" />
              <div className="card-text">
                <div className="card-title">Créditos</div>
                <div className="card-value">+25%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Como Funciona</h2>
          <p className="section-subtitle">
            Processo simples e transparente para gerar valor sustentável
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon icon-recycle">
                <Recycle size={32} />
              </div>
              <h3>1. Coleta Inteligente</h3>
              <p>
                Deposite seus resíduos em nossos totems inteligentes. 
                Cada categoria é pesada e registrada automaticamente.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon icon-chart">
                <BarChart3 size={32} />
              </div>
              <h3>2. Métricas em Tempo Real</h3>
              <p>
                Acompanhe suas contribuições através de dashboards detalhados
                com dados precisos de peso e categoria.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon icon-shield">
                <Shield size={32} />
              </div>
              <h3>3. Validação Certificada</h3>
              <p>
                Validadores certificados analisam e convertem seus resíduos
                em créditos de carbono oficiais.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon icon-trend">
                <TrendingUp size={32} />
              </div>
              <h3>4. Receba seus Créditos</h3>
              <p>
                Obtenha seu percentual proporcional de créditos de carbono
                por tonelada gerada e contribua com o planeta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Por Que LixCarbon?</h2>
              <ul className="benefits-list">
                <li>
                  <CheckCircle className="check-icon" />
                  <div>
                    <strong>Sustentabilidade Real</strong>
                    <p>Contribua efetivamente para a redução de emissões de carbono</p>
                  </div>
                </li>
                <li>
                  <CheckCircle className="check-icon" />
                  <div>
                    <strong>Tecnologia Avançada</strong>
                    <p>Sistema automatizado de pesagem e classificação de resíduos</p>
                  </div>
                </li>
                <li>
                  <CheckCircle className="check-icon" />
                  <div>
                    <strong>Transparência Total</strong>
                    <p>Acompanhe cada etapa do processo com métricas detalhadas</p>
                  </div>
                </li>
                <li>
                  <CheckCircle className="check-icon" />
                  <div>
                    <strong>Retorno Financeiro</strong>
                    <p>Gere receita através dos créditos de carbono conquistados</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="benefits-visual">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Total de Créditos</span>
                  <Leaf className="metric-icon" />
                </div>
                <div className="metric-value">10,250</div>
                <div className="metric-trend positive">
                  <TrendingUp size={16} />
                  <span>+18% este mês</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2 className="section-title">Entre em Contato</h2>
              <p className="section-subtitle">
                Ficou com dúvidas? Nossa equipe está pronta para ajudar sua empresa
                a começar a gerar créditos de carbono.
              </p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <Mail size={24} />
                  <div>
                    <strong>Email</strong>
                    <p>contato@lixcarbon.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <form className="contact-form" onSubmit={handleContact}>
              <h3>Envie uma Mensagem</h3>
              <input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
              <textarea
                placeholder="Sua mensagem"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows="5"
                className="form-textarea"
              />
              <Button type="submit" variant="primary" fullWidth>
                Enviar Mensagem
              </Button>
              
              {showSuccess && (
                <div className="success-message">
                  <CheckCircle size={20} />
                  Mensagem enviada com sucesso!
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <img src="/logomarca.png" alt="LixCarbon" className="logo-icon" />
            </div>
            <p className="footer-text">
              Transformando resíduos em valor sustentável.
            </p>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 LixCarbon. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

