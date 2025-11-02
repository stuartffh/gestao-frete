# 🎨 Guia de Micro-Interações

Documentação completa das micro-interações implementadas no sistema.

---

## O que são Micro-Interações?

Micro-interações são pequenas animações e feedbacks visuais que melhoram a experiência do usuário (UX), tornando a interface mais responsiva, intuitiva e agradável de usar.

**Benefícios:**
- ✅ Feedback visual imediato
- ✅ Redução da percepção de latência
- ✅ Hierarquia visual clara
- ✅ Interface mais polida e profissional
- ✅ Melhor engajamento do usuário

---

## 📦 Arquivos Implementados

### 1. CSS de Micro-Interações
**Localização:** `frontend/src/styles/micro-interactions.css`

Arquivo CSS com todas as animações e efeitos.

### 2. Hook useRipple
**Localização:** `frontend/src/hooks/useRipple.js`

Hook para adicionar efeito ripple (Material Design-like) em elementos.

### 3. Componente SuccessCheckmark
**Localização:** `frontend/src/components/ui/SuccessCheckmark.jsx`

Checkmark animado para feedback de sucesso.

---

## 🎬 Animações Disponíveis

### Ripple Effect (Material Design)

Efeito de onda ao clicar em botões.

```jsx
import useRipple from '../hooks/useRipple';

const MyComponent = () => {
  const createRipple = useRipple();

  return (
    <button
      className="ripple-container"
      onClick={(e) => {
        createRipple(e);
        handleClick();
      }}
    >
      Clique aqui
    </button>
  );
};
```

**Nota:** O componente Button já implementa ripple automaticamente!

---

### Hover Effects

#### hover-lift
Eleva o elemento ao passar o mouse.

```jsx
<div className="hover-lift">
  Passe o mouse aqui
</div>
```

#### hover-glow
Adiciona um brilho gradiente animado.

```jsx
<button className="hover-glow bg-primary">
  Botão com brilho
</button>
```

---

### Loading Animations

#### skeleton-shimmer
Animação shimmer para skeleton loading.

```jsx
<div className="h-4 w-full bg-surface rounded skeleton-shimmer" />
```

**Já implementado em:**
- `LoadingSkeleton` component

#### pulse-glow
Animação de pulso com brilho.

```jsx
<div className="pulse-glow">
  Elemento pulsando
</div>
```

#### dots-loading
Três pontos animados.

```jsx
<div className="dots-loading">
  <span></span>
  <span></span>
  <span></span>
</div>
```

---

### Success/Error Animations

#### success-checkmark
Checkmark animado (use o componente).

```jsx
import SuccessCheckmark from '../components/ui/SuccessCheckmark';

<SuccessCheckmark size={64} />
```

#### shake-error
Treme o elemento (útil para erros).

```jsx
<input className="shake-error" />
```

**Já implementado em:**
- `Input` component (quando validação falha)

---

### Slide Animations

```jsx
// Slide da direita
<div className="slide-in-right">Conteúdo</div>

// Slide da esquerda
<div className="slide-in-left">Conteúdo</div>

// Slide de baixo para cima
<div className="slide-in-up">Conteúdo</div>

// Slide de cima para baixo
<div className="slide-in-down">Conteúdo</div>
```

**Já implementado em:**
- `Modal` component (usa slide-in-up)

---

### Bounce Effects

```jsx
// Bounce in
<div className="bounce-in">Aparecer com bounce</div>

// Wiggle (balança)
<div className="wiggle">Balançar</div>
```

---

### Button Interactions

#### button-press
Reduz levemente ao clicar.

```jsx
<button className="button-press">
  Clique aqui
</button>
```

**Já implementado em:**
- `Button` component

#### button-gradient-shift
Move gradiente ao passar mouse.

```jsx
<button
  className="button-gradient-shift"
  style={{
    background: 'linear-gradient(90deg, #38bdf8, #0284c7)',
  }}
>
  Botão gradiente
</button>
```

---

### Focus Effects

```jsx
<input className="focus-ring" />
```

**Já implementado em:**
- `Button` component
- Todos os inputs

---

### Stagger Animations (Listas)

Anima itens de lista em sequência.

```jsx
<ul>
  <li className="stagger-item">Item 1</li>
  <li className="stagger-item">Item 2</li>
  <li className="stagger-item">Item 3</li>
  {/* Até 10 itens */}
</ul>
```

---

### Toast Animations

```jsx
<div className="toast-enter">Entrando</div>
<div className="toast-exit">Saindo</div>
```

---

### Progress Bar

```jsx
<div className="h-2 bg-surface rounded overflow-hidden">
  <div className="h-full progress-indeterminate" />
</div>
```

---

### Scroll Reveal

Anima elementos quando entram na viewport.

```jsx
import { useEffect, useRef } from 'react';

const MyComponent = () => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="reveal-on-scroll">
      Conteúdo que aparece ao scroll
    </div>
  );
};
```

---

### Card Interactions

```jsx
import Card from '../components/ui/Card';

<Card interactive onClick={() => navigate('/detalhes')}>
  <Card.Header>
    <Card.Title>Card Clicável</Card.Title>
  </Card.Header>
  <Card.Content>
    Passe o mouse para ver o efeito
  </Card.Content>
</Card>
```

---

### Badge Pulse (Notificações)

```jsx
<span className="badge-pulse bg-danger text-white px-2 py-1 rounded">
  3
</span>
```

---

## 🎯 Componentes Atualizados

### Button
**Micro-interações incluídas:**
- ✅ Ripple effect ao clicar
- ✅ Hover lift (primary e danger variants)
- ✅ Button press (reduz ao clicar)
- ✅ Focus ring avançado

**Props:**
```jsx
<Button
  variant="primary"
  disableRipple={false} // Desabilitar ripple se necessário
>
  Clique aqui
</Button>
```

---

### Input
**Micro-interações incluídas:**
- ✅ Shake animation ao erro de validação
- ✅ Transição suave de cores dos ícones
- ✅ Clear error on focus

```jsx
<Input
  label="Email"
  validateOnBlur
  validator={(value) => {
    if (!value.includes('@')) return 'Email inválido';
    return null;
  }}
/>
```

---

### Modal
**Micro-interações incluídas:**
- ✅ Backdrop fade-in
- ✅ Content slide-in-up
- ✅ Ripple no botão de fechar

---

### Card
**Micro-interações incluídas:**
- ✅ Hover lift + scale (quando interactive=true)
- ✅ Border color transition

```jsx
<Card interactive onClick={handleClick}>
  Conteúdo do card
</Card>
```

---

### Loading
**Micro-interações incluídas:**
- ✅ Skeleton shimmer (substitui pulse)

```jsx
import { LoadingSkeleton } from '../components/ui/Loading';

<LoadingSkeleton lines={3} />
```

---

## ♿ Acessibilidade

**TODAS as animações respeitam `prefers-reduced-motion`.**

Quando o usuário tem animações reduzidas ativadas no sistema operacional:
- Todas as animações são desabilitadas
- Transições são reduzidas para 0.01ms
- Efeitos de movimento param completamente

```css
@media (prefers-reduced-motion: reduce) {
  /* Todas as animações são automaticamente desabilitadas */
}
```

---

## 🎨 Customização

### Alterar Cores do Ripple

Edite `micro-interactions.css`:

```css
.ripple {
  background: rgba(255, 255, 255, 0.5); /* Mude aqui */
}
```

### Alterar Duração das Animações

```css
@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Mude animation-duration no elemento */
.ripple {
  animation: ripple-animation 600ms ease-out; /* Ajuste 600ms */
}
```

---

## 📊 Performance

**Otimizações implementadas:**
- ✅ Uso de `transform` e `opacity` (GPU-accelerated)
- ✅ `will-change` apenas quando necessário
- ✅ Animações removidas do DOM após conclusão
- ✅ Uso de `cubic-bezier` customizado para suavidade
- ✅ Debounce em eventos repetitivos

**Impacto:**
- 60 FPS em animações
- Sem reflows desnecessários
- Memória limpa (elementos temporários removidos)

---

## 🚀 Exemplos de Uso

### Feedback de Ação Bem-Sucedida

```jsx
const handleSave = async () => {
  try {
    await api.save(data);

    // Mostrar checkmark de sucesso
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  } catch (error) {
    // Shake no formulário
    formRef.current.classList.add('shake-error');
    setTimeout(() => formRef.current.classList.remove('shake-error'), 500);
  }
};

return (
  <div>
    <form ref={formRef}>
      {/* Formulário */}
    </form>

    {showSuccess && (
      <div className="fixed top-4 right-4 bounce-in">
        <SuccessCheckmark size={80} />
      </div>
    )}
  </div>
);
```

### Lista Animada

```jsx
const items = ['Item 1', 'Item 2', 'Item 3'];

return (
  <ul className="space-y-2">
    {items.map((item, index) => (
      <li key={index} className="stagger-item">
        <Card interactive>
          {item}
        </Card>
      </li>
    ))}
  </ul>
);
```

### Loading State Sofisticado

```jsx
{isLoading ? (
  <div className="space-y-4">
    <LoadingSkeleton lines={3} />
    <div className="flex items-center gap-2 text-muted">
      <div className="dots-loading">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span>Carregando dados...</span>
    </div>
  </div>
) : (
  <DataTable data={data} />
)}
```

---

## 📚 Referências

- [Material Design Motion](https://material.io/design/motion)
- [Framer Motion Principles](https://www.framer.com/motion/)
- [Web Animation API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [CSS Animation Performance](https://web.dev/animations-guide/)

---

**Última atualização:** 2025-11-02
**Versão:** 1.0.0
**Compatibilidade:** Todos os navegadores modernos (2020+)
