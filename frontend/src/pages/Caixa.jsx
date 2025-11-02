import { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import { fechamentoMensal, verificarFechamento, downloadRelatorioPDF } from '../api/caixa';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useToastContext } from '../components/Toaster';

export default function Caixa() {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [confirmFecharOpen, setConfirmFecharOpen] = useState(false);
  const toast = useToastContext();

  const handleFechamento = async () => {
    try {
      setLoading(true);
      await fechamentoMensal({ mes, ano });
      toast.success('Fechamento realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fechar:', error);
      toast.error(error.response?.data?.message || 'Erro ao fechar mês');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      await downloadRelatorioPDF(mes, ano);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao baixar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text">Caixa e Fechamento</h2>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Mês"
              min="1"
              max="12"
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="w-32"
            />
            <Input
              type="number"
              label="Ano"
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              className="w-32"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <Button
              variant="primary"
              onClick={() => setConfirmFecharOpen(true)}
              disabled={loading}
              leftIcon={Calendar}
            >
              Fechar Mês
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={loading}
              loading={loading}
              leftIcon={Download}
            >
              Baixar PDF
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmModal
        isOpen={confirmFecharOpen}
        onClose={() => setConfirmFecharOpen(false)}
        onConfirm={handleFechamento}
        title="Confirmar Fechamento Mensal"
        message={`Deseja realmente fechar o mês ${mes}/${ano}? Esta ação não pode ser desfeita.`}
        confirmLabel="Fechar Mês"
      />
    </div>
  );
}
