/**
 * Script de Validação de Contraste WCAG AA
 *
 * Verifica se as cores do design system atendem aos requisitos:
 * - Texto normal: contraste mínimo 4.5:1 (WCAG AA)
 * - Texto grande (18pt+): contraste mínimo 3:1 (WCAG AA)
 */

const { hex } = require('wcag-contrast');

// Cores do design system (modo dark)
const colors = {
  dark: {
    bg: '#0f172a',
    surface: '#111827',
    card: '#1f2937',
    text: '#e5e7eb',
    muted: '#94a3b8',
    border: '#334155',
    primary: '#38bdf8',
    primaryHover: '#0284c7',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#dc2626', // Corrigido
    info: '#60a5fa',
  },
  light: {
    bg: '#f8fafc',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
    primary: '#0369a1', // Corrigido
    primaryHover: '#075985',
    success: '#15803d', // Corrigido
    warning: '#b45309', // Corrigido
    danger: '#dc2626',
    info: '#1d4ed8',
  }
};

const results = { passed: [], failed: [] };

function checkContrast(foreground, background, label, isLargeText = false) {
  const ratio = hex(foreground, background);
  const minRatio = isLargeText ? 3 : 4.5;
  const passes = ratio >= minRatio;

  const result = { label, foreground, background, ratio: ratio.toFixed(2), minRatio, passes };

  if (passes) {
    results.passed.push(result);
  } else {
    results.failed.push(result);
  }

  return result;
}

console.log('🎨 Validando Contraste WCAG AA\n');
console.log('='.repeat(80));

// Testar modo DARK
console.log('\n📘 MODO DARK\n');
const dark = colors.dark;

checkContrast(dark.text, dark.bg, 'Texto em Background');
checkContrast(dark.text, dark.surface, 'Texto em Surface');
checkContrast(dark.text, dark.card, 'Texto em Card');
checkContrast(dark.muted, dark.bg, 'Texto Muted em Background');
checkContrast(dark.muted, dark.card, 'Texto Muted em Card');
checkContrast('#0f172a', dark.primary, 'Texto escuro em Primary Button');
checkContrast('#0f172a', dark.success, 'Texto escuro em Success Button');
checkContrast('#0f172a', dark.warning, 'Texto escuro em Warning Button');
checkContrast('#ffffff', dark.danger, 'Texto branco em Danger Button');

// Testar modo LIGHT
console.log('\n📗 MODO LIGHT\n');
const light = colors.light;

checkContrast(light.text, light.bg, 'Texto em Background (Light)');
checkContrast(light.text, light.surface, 'Texto em Surface (Light)');
checkContrast(light.text, light.card, 'Texto em Card (Light)');
checkContrast(light.muted, light.bg, 'Texto Muted em Background (Light)');
checkContrast(light.muted, light.card, 'Texto Muted em Card (Light)');
checkContrast('#ffffff', light.primary, 'Texto branco em Primary Button (Light)');
checkContrast('#ffffff', light.success, 'Texto branco em Success Button (Light)');
checkContrast('#ffffff', light.warning, 'Texto branco em Warning Button (Light)');
checkContrast('#ffffff', light.danger, 'Texto branco em Danger Button (Light)');

// Resumo
console.log('\n' + '='.repeat(80));
console.log('\n📊 RESUMO\n');

results.passed.forEach(r => {
  console.log(`✅ ${r.label}: ${r.ratio}:1 (mín: ${r.minRatio}:1)`);
});

if (results.failed.length > 0) {
  console.log('\n');
  results.failed.forEach(r => {
    console.log(`❌ ${r.label}: ${r.ratio}:1 (mín: ${r.minRatio}:1)`);
    console.log(`   Foreground: ${r.foreground} | Background: ${r.background}`);
  });
}

console.log('\n' + '='.repeat(80));
console.log(`\n✅ Passou: ${results.passed.length}`);
console.log(`❌ Falhou: ${results.failed.length}`);
console.log(`📊 Total: ${results.passed.length + results.failed.length}\n`);

process.exit(results.failed.length > 0 ? 1 : 0);
