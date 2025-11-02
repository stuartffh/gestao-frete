import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Erro ao fazer login');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <Card padding="lg" className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/20 p-4 rounded-full">
            <LogIn className="text-primary" size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-text text-center mb-2">
          Login
        </h2>
        <p className="text-muted text-center mb-6">
          Sistema de Gestão Financeira
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/20 border border-danger/30 text-danger px-4 py-3 rounded-lg" role="alert">
              {error}
            </div>
          )}

          <Input
            label="Usuário"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Digite seu usuário"
            autoComplete="username"
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Digite sua senha"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
            className="w-full"
          >
            Entrar
          </Button>
        </form>

        <p className="text-xs text-muted text-center mt-6">
          Usuário padrão: admin / Senha: admin123
        </p>
      </Card>
    </div>
  );
}
