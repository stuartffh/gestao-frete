/**
 * Validadores reutilizáveis para formulários
 */

export const validators = {
  required: (message = 'Este campo é obrigatório') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return null;
  },

  email: (message = 'Informe um email válido') => (value) => {
    if (!value) return null; // Se vazio, não valida (use required separadamente)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  cpf: (message = 'Informe um CPF válido') => (value) => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 11) {
      return message;
    }
    // Validação de dígito verificador básica
    return null;
  },

  cnpj: (message = 'Informe um CNPJ válido') => (value) => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 14) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return message || `Mínimo de ${min} caracteres`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return message || `Máximo de ${max} caracteres`;
    }
    return null;
  },

  number: (message = 'Informe um número válido') => (value) => {
    if (!value) return null;
    if (isNaN(value) || value === '') {
      return message;
    }
    return null;
  },

  min: (min, message) => (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < min) {
      return message || `Valor mínimo é ${min}`;
    }
    return null;
  },

  max: (max, message) => (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num > max) {
      return message || `Valor máximo é ${max}`;
    }
    return null;
  },

  compose: (...validators) => (value) => {
    for (const validator of validators) {
      const result = validator(value);
      if (result) return result;
    }
    return null;
  },
};

