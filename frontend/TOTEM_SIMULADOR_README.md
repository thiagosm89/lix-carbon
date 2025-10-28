# 🗑️ Simulador de Totem - LixCarbon

## 📋 Visão Geral

O **Simulador de Totem** é uma nova funcionalidade que permite aos usuários simularem o depósito de diferentes tipos de resíduos em um totem LixCarbon, gerando tokens detalhados com informações de peso por categoria.

## 🎯 Funcionalidades

### Tipos de Resíduos Suportados

1. **Latas de Alumínio** (Reciclável)
   - Peso unitário: 15g
   - Categoria: RECICLAVEL

2. **Garrafas de Plástico** (Reciclável)
   - Peso unitário: 25g
   - Categoria: RECICLAVEL

3. **Garrafas de Vidro** (Reciclável)
   - Peso unitário: 350g
   - Categoria: RECICLAVEL

4. **Papelão** (Reciclável)
   - Peso unitário: 200g
   - Categoria: RECICLAVEL

5. **Lixo Orgânico**
   - Peso unitário: 500g
   - Categoria: ORGANICO

### Processo de Uso

1. **Selecione os Resíduos**
   - Use os botões + e - para adicionar/remover unidades de cada tipo
   - Acompanhe em tempo real:
     - Total de itens depositados
     - Peso total
     - Peso por categoria (Reciclável/Orgânico)

2. **Visualize o Resumo**
   - Cards informativos mostram:
     - Quantidade total de itens
     - Peso total em kg
     - Peso reciclável em kg
     - Peso orgânico em kg

3. **Gere o Token**
   - Clique em "Gerar Token"
   - Receba um código de 6 dígitos
   - Visualize o detalhamento completo:
     - Categoria predominante
     - Pesos por categoria
     - Lista de itens depositados
     - Data e hora da geração

4. **Use o Token**
   - Anote o código de 6 dígitos
   - Use em "Registrar Lixo" após fazer login
   - O sistema reconhece os pesos por categoria automaticamente

## 🚀 Como Acessar

### Na Landing Page
```
1. Acesse a página inicial (/)
2. Clique no botão "Simular Totem"
3. Comece a adicionar resíduos
```

### Direto pela URL
```
http://localhost:3000/totem
```

## 📊 Cálculo de Pesos

### Categoria Predominante
O token é classificado pela categoria com maior peso:
- Se `pesoReciclavel >= pesoOrganico` → RECICLAVEL
- Caso contrário → ORGANICO

### Exemplos

**Exemplo 1:** 10 latas + 5 garrafas plástico
```
Latas: 10 × 0.015kg = 0.150kg
Garrafas: 5 × 0.025kg = 0.125kg
Total: 0.275kg (RECICLAVEL)
```

**Exemplo 2:** 2 orgânicos + 1 garrafa vidro
```
Orgânico: 2 × 0.500kg = 1.000kg
Vidro: 1 × 0.350kg = 0.350kg
Total: 1.350kg (ORGANICO - predominante)
```

## 🎨 Interface

### Cores por Categoria
- **Latas:** #FF6B6B (Vermelho)
- **Garrafas Plástico:** #4ECDC4 (Azul-claro)
- **Garrafas Vidro:** #95E1D3 (Verde-água)
- **Papelão:** #F38181 (Coral)
- **Orgânico:** #7FD14B (Verde)

### Tela de Resultado
Após gerar o token, você verá:
```
┌─────────────────────────────────────────┐
│         ✓ TOKEN GERADO COM SUCESSO!     │
│                                          │
│         Seu Token: 123456                │
│                                          │
│  Detalhamento:                           │
│  • Categoria: RECICLAVEL                 │
│  • Peso Total: 0.275 kg                  │
│  • Peso Reciclável: 0.275 kg             │
│  • Peso Orgânico: 0.000 kg               │
│                                          │
│  Itens Depositados:                      │
│  • Latas de Alumínio     10x   0.150kg  │
│  • Garrafas Plástico      5x   0.125kg  │
│                                          │
│  [Fazer Novo Depósito]                   │
└─────────────────────────────────────────┘
```

## 🔄 Integração com o Backend

### Endpoint Utilizado
```
POST /api/totem/gerar-token
```

### Payload Enviado
```json
{
  "pesoReciclavel": 0.275,
  "pesoOrganico": 0.500,
  "detalhamento": [
    {
      "tipo": "Latas de Alumínio",
      "quantidade": 10,
      "pesoUnitario": 0.015,
      "pesoTotal": "0.150"
    },
    {
      "tipo": "Lixo Orgânico",
      "quantidade": 1,
      "pesoUnitario": 0.500,
      "pesoTotal": "0.500"
    }
  ]
}
```

### Resposta do Backend
```json
{
  "success": true,
  "message": "Token gerado com sucesso!",
  "token": {
    "numero": "123456",
    "categoria": "ORGANICO",
    "peso": 0.775,
    "pesoReciclavel": 0.275,
    "pesoOrganico": 0.500,
    "detalhamento": [...],
    "dataCriacao": "2025-10-27T...",
    "usado": false
  }
}
```

### Banco de Dados
O token é salvo na tabela `available_tokens`:
```sql
INSERT INTO available_tokens 
  (token, categoria, peso, usado, dataCriacao)
VALUES 
  ('123456', 'ORGANICO', 0.775, 0, NOW())
```

**Importante:** `usado = 0` significa que o token está disponível para ser registrado!

## 🔄 Integração com o Sistema

### Geração de Token
- Token de 6 dígitos aleatórios
- **Salvo no banco de dados** via API do backend
- Token marcado como **não usado** (usado = 0) na tabela `available_tokens`
- Pronto para ser registrado por qualquer usuário

### Registro no Sistema
Para usar o token gerado:
1. Faça login no sistema
2. Acesse "Registrar Lixo"
3. Digite o token de 6 dígitos
4. O sistema registra com os pesos corretos por categoria
5. Token é marcado como usado (usado = 1)

## 📱 Responsivo

O simulador é totalmente responsivo:
- **Desktop:** Layout em grid com múltiplas colunas
- **Tablet:** Grid adaptativo
- **Mobile:** Layout em coluna única

## 🛠️ Arquivos Criados

```
frontend/src/pages/TotemSimulador/
├── TotemSimulador.js      # Componente principal
└── TotemSimulador.css     # Estilos da página
```

## 🎯 Casos de Uso

### 1. Demonstração para Clientes
Use o simulador para mostrar como funciona o sistema de depósito de resíduos sem precisar de um totem físico.

### 2. Treinamento de Usuários
Permite que novos usuários pratiquem o processo antes de usar um totem real.

### 3. Testes de Integração
Desenvolvedores podem testar o fluxo completo de geração e registro de tokens.

### 4. Marketing e Vendas
Ferramenta visual para apresentações e demos comerciais.

## 🚦 Status do Projeto

- ✅ Interface completa e funcional
- ✅ Cálculo automático de pesos
- ✅ Detalhamento por tipo de resíduo
- ✅ Geração de tokens de 6 dígitos
- ✅ Design responsivo
- ✅ Integrado à landing page
- ✅ Rota pública (sem autenticação necessária)

## 🔮 Melhorias Futuras

- [ ] Integração com API do backend para salvar tokens
- [ ] Histórico de tokens gerados
- [ ] QR Code para compartilhar tokens
- [ ] Animações de depósito de resíduos
- [ ] Sons de feedback ao depositar
- [ ] Gamificação (níveis, conquistas)
- [ ] Compartilhamento em redes sociais

## 📞 Suporte

Para dúvidas ou sugestões sobre o simulador:
- Acesse a seção "Fale Conosco" na landing page
- Email: contato@lixcarbon.com

---

**LixCarbon** - Transformando resíduos em créditos de carbono! 🌱

