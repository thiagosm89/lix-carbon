import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button/Button';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    senha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.identifier, formData.senha);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-visual">
          <div className="visual-content">
            <div className="auth-logo">
              <img src="/logomarca.png" alt="LixCarbon" className="logo-icon" />
            </div>
            <h2>Bem-vindo de volta!</h2>
            <p>
              Acesse sua conta para gerenciar seus créditos de carbono e
              acompanhar suas contribuições sustentáveis.
            </p>
            
            <div className="visual-stats">
              <div className="visual-stat">
                <div className="stat-icon">♻️</div>
                <div>
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Toneladas</div>
                </div>
              </div>
              <div className="visual-stat">
                <div className="stat-icon">🌍</div>
                <div>
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Empresas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-form-content">
            <Link to="/" className="back-link">
              ← Voltar para home
            </Link>

            <div className="form-header">
              <h1>Entrar</h1>
              <p>Digite suas credenciais para acessar sua conta</p>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="identifier">Email ou CNPJ</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Digite seu email ou CNPJ"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="senha">Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="Digite sua senha"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="large"
                icon={LogIn}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="form-footer">
              <p>
                Ainda não tem uma conta?{' '}
                <Link to="/cadastro" className="link">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

