import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { importarClientes, importarFornecedores, importarContas } from '../api/importacao';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Dropzone from '../components/ui/Dropzone';
import Badge from '../components/ui/Badge';
import { useToastContext } from '../components/Toaster';

export default function Importacao() {
  const [tipo, setTipo] = useState('clientes');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const toast = useToastContext();

  const handleFileChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    setLoading(true);
    setResultado(null);
    setErro(null);

    try {
      let response;
      if (tipo === 'clientes') {
        response = await importarClientes(file);
      } else if (tipo === 'fornecedores') {
        response = await importarFornecedores(file);
      } else {
        response = await importarContas(file, tipo === 'contas-pagar' ? 'pagar' : 'receber');
      }

      setResultado(response);
      toast.success('Arquivo importado com sucesso!');
    } catch (error) {
      const errorMsg = error.message || 'Erro ao importar arquivo';
      setErro(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      if (e.target) {
        e.target.value = ''; // Reset input
      }
    }
  };

  const handleDropzoneFiles = (files) => {
    const file = Array.isArray(files) ? files[0] : files;
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text">Importação CSV</h2>

      <Card>
        <div className="space-y-6">
          <Select
            label="Tipo de Importação"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            options={[
              { value: 'clientes', label: 'Clientes' },
              { value: 'fornecedores', label: 'Fornecedores' },
              { value: 'contas-pagar', label: 'Contas a Pagar' },
              { value: 'contas-receber', label: 'Contas a Receber' },
            ]}
          />

          <Dropzone
            accept=".csv"
            onFilesSelected={handleDropzoneFiles}
            className="mt-4"
          />

          <div className="p-4 bg-surface rounded-lg border border-border">
            <h3 className="text-sm font-medium text-muted mb-2">Formato esperado:</h3>
            {tipo === 'clientes' && (
              <p className="text-sm text-muted">
                CSV com colunas: nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep
              </p>
            )}
            {tipo === 'fornecedores' && (
              <p className="text-sm text-muted">
                CSV com colunas: nome, cpf_cnpj, email, telefone
              </p>
            )}
            {(tipo === 'contas-pagar' || tipo === 'contas-receber') && (
              <p className="text-sm text-muted">
                CSV com colunas: descricao, valor, data_vencimento, categoria, {tipo === 'contas-pagar' ? 'fornecedor' : 'cliente'}
              </p>
            )}
          </div>

          {resultado && (
            <div className="p-4 bg-success/20 border border-success/30 rounded-lg">
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle size={20} />
                <span className="font-medium">{resultado.message}</span>
              </div>
              {resultado.clientes && resultado.clientes.length > 0 && (
                <Badge variant="success" className="mt-2">
                  {resultado.clientes.length} registro(s) importado(s)
                </Badge>
              )}
              {resultado.fornecedores && resultado.fornecedores.length > 0 && (
                <Badge variant="success" className="mt-2">
                  {resultado.fornecedores.length} registro(s) importado(s)
                </Badge>
              )}
              {resultado.contas && resultado.contas.length > 0 && (
                <Badge variant="success" className="mt-2">
                  {resultado.contas.length} registro(s) importado(s)
                </Badge>
              )}
            </div>
          )}

          {erro && (
            <div className="p-4 bg-danger/20 border border-danger/30 rounded-lg">
              <div className="flex items-center gap-2 text-danger">
                <AlertCircle size={20} />
                <span>{erro}</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

