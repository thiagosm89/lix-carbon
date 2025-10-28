# 🏷️ CategoryBadge Component

Componente reutilizável para exibir badges de categorias de lixo (Reciclável/Orgânico) em todo o sistema.

## 📦 Uso

```jsx
import CategoryBadge from '../../components/CategoryBadge/CategoryBadge';

// Com ícone (padrão)
<CategoryBadge categoria="RECICLAVEL" />

// Sem ícone
<CategoryBadge categoria="ORGANICO" showIcon={false} />
```

## 🎯 Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `categoria` | `string` | **obrigatório** | A categoria (RECICLAVEL ou ORGANICO) |
| `showIcon` | `boolean` | `true` | Se deve exibir o ícone antes do texto |

## 📊 Categorias Suportadas

| Categoria | Label | Ícone | Cor |
|-----------|-------|-------|-----|
| `RECICLAVEL` | Reciclável | ♻️ | 🟢 Verde (#059669) |
| `ORGANICO` | Orgânico | 🌿 | 🟡 Amarelo (#D97706) |

## 🎨 Estilos

O componente possui estilos próprios em `CategoryBadge.css` com:
- ✅ Cores distintas para cada categoria
- ✅ Hover effect com elevação
- ✅ Ícones emoji visíveis
- ✅ Responsivo para mobile
- ✅ Text transform uppercase

## 📍 Onde é Usado

### 1. Dashboard do Usuário (`UsuarioDashboard.js`)
```jsx
<td>
  <CategoryBadge categoria={registro.categoria} />
</td>
```

### 2. Histórico de Registros (`RegistroLixo.js`)
```jsx
<td>
  <CategoryBadge categoria={registro.categoria} />
</td>
```

## 🎨 Exemplos Visuais

### Com Ícone (padrão)
```
[ ♻️ RECICLÁVEL ]  [ 🌿 ORGÂNICO ]
```

### Sem Ícone
```
[ RECICLÁVEL ]  [ ORGÂNICO ]
```

## 🛠️ Personalização

Para adicionar uma nova categoria:

1. **Edite `CategoryBadge.js`:**
```jsx
const categoryConfig = {
  // ... categorias existentes
  'METAL': {
    label: 'Metal',
    icon: '🔧',
    className: 'category-metal'
  }
};
```

2. **Edite `CategoryBadge.css`:**
```css
.category-metal {
  background-color: #E5E7EB;
  color: #4B5563;
}
```

3. **Usar no código:**
```jsx
<CategoryBadge categoria="METAL" />
```

## ✨ Benefícios

1. ✅ **Reutilizável** - Um único componente para todas as categorias
2. ✅ **Consistente** - Visual unificado em todo o sistema
3. ✅ **Manutenível** - Alterações em um único lugar
4. ✅ **Extensível** - Fácil adicionar novas categorias
5. ✅ **Visual** - Ícones emoji melhoram identificação
6. ✅ **Acessível** - Cores distintas e alto contraste

## 🔄 Comparação Antes/Depois

### Antes (código duplicado)
```jsx
// Dashboard
<span className={`badge badge-${registro.categoria.toLowerCase()}`}>
  {registro.categoria === 'RECICLAVEL' ? 'Reciclável' : 'Orgânico'}
</span>

// Histórico
<span className={`badge badge-${registro.categoria.toLowerCase()}`}>
  {registro.categoria === 'RECICLAVEL' ? '♻️ Reciclável' : '🌿 Orgânico'}
</span>
```

### Depois (componente único)
```jsx
// Dashboard e Histórico
<CategoryBadge categoria={registro.categoria} />
```

## 📱 Responsividade

O componente se adapta automaticamente para mobile:

```css
@media (max-width: 768px) {
  .category-badge {
    font-size: 0.688rem;
    padding: 0.313rem 0.625rem;
  }
  
  .category-icon {
    font-size: 0.875rem;
  }
}
```

## 🎭 Casos de Uso

### Tabelas
```jsx
<table>
  <thead>
    <tr>
      <th>Categoria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><CategoryBadge categoria="RECICLAVEL" /></td>
    </tr>
  </tbody>
</table>
```

### Cards
```jsx
<Card>
  <h3>Tipo de Lixo</h3>
  <CategoryBadge categoria="ORGANICO" />
</Card>
```

### Listas
```jsx
<ul>
  <li>
    <CategoryBadge categoria="RECICLAVEL" />
    - 25.5kg coletados
  </li>
</ul>
```

## 🧪 Teste Visual

Para testar todas as variações:

```jsx
import CategoryBadge from '../../components/CategoryBadge/CategoryBadge';

const TestCategoryBadges = () => {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
      <div>
        <h4>Reciclável:</h4>
        <CategoryBadge categoria="RECICLAVEL" />
        <CategoryBadge categoria="RECICLAVEL" showIcon={false} />
      </div>
      
      <div>
        <h4>Orgânico:</h4>
        <CategoryBadge categoria="ORGANICO" />
        <CategoryBadge categoria="ORGANICO" showIcon={false} />
      </div>
    </div>
  );
};
```

## 🎯 Design System

Este componente faz parte do Design System LixCarbon:

- **StatusBadge** - Para status de registros (VALIDADO, PAGO, etc.)
- **CategoryBadge** - Para categorias de lixo (RECICLAVEL, ORGANICO)
- **Button** - Botões de ação
- **Card** - Containers de conteúdo

## 📝 Notas

- Os ícones são emoji nativos (♻️, 🌿) para melhor compatibilidade
- O componente é controlado, não mantém estado interno
- Categoria desconhecida exibe com estilo padrão cinza
- Suporta text-transform uppercase para consistência

---

**LixCarbon Frontend** - Componente CategoryBadge implementado! 🎉

