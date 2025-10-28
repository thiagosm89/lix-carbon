# 🏷️ StatusBadge Component

Componente reutilizável para exibir badges de status de registros de lixo em todo o sistema.

## 📦 Uso

```jsx
import StatusBadge from '../../components/StatusBadge/StatusBadge';

// Sem ícone (padrão)
<StatusBadge status="VALIDADO" />

// Com ícone
<StatusBadge status="PENDENTE_PAGAMENTO" showIcon={true} />
```

## 🎯 Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `status` | `string` | **obrigatório** | O status a ser exibido |
| `showIcon` | `boolean` | `false` | Se deve exibir o ícone antes do texto |

## 📊 Status Suportados

| Status | Label | Ícone | Cor |
|--------|-------|-------|-----|
| `VALIDADO` | Validado | ✓ | 🟢 Verde |
| `ENVIADO_VALIDADORA` | Enviado à Validadora | 📤 | 🔵 Azul Índigo |
| `LIBERADO_PAGAMENTO` | Liberado p/ Pagamento | ✓ | 🟣 Roxo |
| `PENDENTE_PAGAMENTO` | Pendente Pagamento | ⏱ | 🟡 Amarelo |
| `PAGO` | Pago | ✓ | 🔷 Azul Claro |

## 🎨 Estilos

O componente possui estilos próprios em `StatusBadge.css` com:
- ✅ Cores distintas para cada status
- ✅ Hover effect com elevação
- ✅ Responsivo para mobile
- ✅ Suporte a modo escuro (futuro)

## 📍 Onde é Usado

### 1. Dashboard do Usuário (`UsuarioDashboard.js`)
```jsx
<td>
  <StatusBadge status={registro.status} />
</td>
```

### 2. Histórico de Registros (`RegistroLixo.js`)
```jsx
<td>
  <StatusBadge status={registro.status} showIcon={true} />
</td>
```

## 🔄 Fluxo de Status

```
┌────────────────────────────────────────────────┐
│           FLUXO DE STATUS DO LIXO              │
└────────────────────────────────────────────────┘

1. 🟢 VALIDADO
   ↓ Registro criado e validado

2. 🔵 ENVIADO_VALIDADORA
   ↓ Enviado para a validadora processar

3. 🟣 LIBERADO_PAGAMENTO
   ↓ Validadora liberou para pagamento

4. 🟡 PENDENTE_PAGAMENTO
   ↓ Aguardando pagamento ser efetuado

5. 🔷 PAGO
   ✅ Pagamento concluído
```

## 🛠️ Personalização

Para adicionar um novo status:

1. **Edite `StatusBadge.js`:**
```jsx
const statusConfig = {
  // ... status existentes
  'NOVO_STATUS': {
    label: 'Novo Status',
    icon: '🆕',
    className: 'status-novo'
  }
};
```

2. **Edite `StatusBadge.css`:**
```css
.status-novo {
  background-color: #FEE2E2;
  color: #DC2626;
}
```

## ✨ Benefícios

1. ✅ **Reutilizável** - Um único componente para todos os status
2. ✅ **Consistente** - Visual unificado em todo o sistema
3. ✅ **Manutenível** - Alterações em um único lugar
4. ✅ **Extensível** - Fácil adicionar novos status
5. ✅ **Acessível** - Suporte a ícones e cores distintas
6. ✅ **Performático** - Componente leve e otimizado

## 🎭 Exemplos Visuais

### Sem Ícone
```
[  Validado  ]  [  Enviado à Validadora  ]  [  Pago  ]
```

### Com Ícone
```
[ ✓ Validado ]  [ 📤 Enviado à Validadora ]  [ ✓ Pago ]
```

## 🧪 Testes

Para testar o componente:

```jsx
import StatusBadge from '../../components/StatusBadge/StatusBadge';

const TestStatusBadges = () => {
  const allStatuses = [
    'VALIDADO',
    'ENVIADO_VALIDADORA',
    'LIBERADO_PAGAMENTO',
    'PENDENTE_PAGAMENTO',
    'PAGO'
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {allStatuses.map(status => (
        <div key={status}>
          <h4>Sem Ícone:</h4>
          <StatusBadge status={status} />
          
          <h4>Com Ícone:</h4>
          <StatusBadge status={status} showIcon={true} />
        </div>
      ))}
    </div>
  );
};
```

## 📝 Notas

- O componente é **totalmente controlado**, não mantém estado interno
- Se um status desconhecido for passado, exibe o status como texto com estilo padrão
- Os ícones são opcionais para maior flexibilidade de uso
- O componente usa variáveis CSS globais quando disponíveis (`var(--transition)`)

---

**LixCarbon Frontend** - Componente StatusBadge implementado! 🎉

