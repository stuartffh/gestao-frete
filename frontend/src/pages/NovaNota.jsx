import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { createNota, updateNota, getNota, uploadPDF, uploadFoto } from '../api/notas';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Dropzone from '../components/ui/Dropzone';
import { useToastContext } from '../components/Toaster';

export default function NovaNota() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const [formData, setFormData] = useState({
    numero: '',
    serie: '',
    emitente: '',
    destinatario: '',
    valor: '',
    data_emissao: '',
    data_vencimento: '',
    data_pagamento: '',
    status: 'pendente',
    tipo_frete: '',
    veiculo: '',
    motorista: '',
    observacoes: '',
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const toast = useToastContext();

  useEffect(() => {
    if (id) {
      carregarNota();
    }
  }, [id]);

  const carregarNota = async () => {
    try {
      const nota = await getNota(id);
      setFormData({
        numero: nota.numero || '',
        serie: nota.serie || '',
        emitente: nota.emitente || '',
        destinatario: nota.destinatario || '',
        valor: nota.valor || '',
        data_emissao: nota.data_emissao || '',
        data_vencimento: nota.data_vencimento || '',
        data_pagamento: nota.data_pagamento || '',
        status: nota.status || 'pendente',
        tipo_frete: nota.tipo_frete || '',
        veiculo: nota.veiculo || '',
        motorista: nota.motorista || '',
        observacoes: nota.observacoes || '',
      });
      if (nota.pdf_path) setPdfPreview(nota.pdf_path);
      if (nota.foto_path) setFotoPreview(nota.foto_path);
    } catch (error) {
      console.error('Erro ao carregar nota:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePDFChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setPdfPreview(URL.createObjectURL(file));
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePDFUpload = async () => {
    if (!pdfFile || !id) return;
    try {
      setUploadingPDF(true);
      await uploadPDF(id, pdfFile);
      toast.success('PDF uploadado com sucesso!');
      setPdfFile(null);
      carregarNota();
    } catch (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      toast.error('Erro ao fazer upload do PDF');
    } finally {
      setUploadingPDF(false);
    }
  };

  const handleFotoUpload = async () => {
    if (!fotoFile || !id) return;
    try {
      setUploadingFoto(true);
      await uploadFoto(id, fotoFile);
      toast.success('Foto uploadada com sucesso!');
      setFotoFile(null);
      carregarNota();
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const notaData = {
        ...formData,
        valor: parseFloat(formData.valor) || 0,
      };

      let notaSalva;
      if (id) {
        notaSalva = await updateNota(id, notaData);
      } else {
        notaSalva = await createNota(notaData);
      }

      // Upload de arquivos após criar/atualizar
      if (pdfFile && notaSalva.id) {
        await uploadPDF(notaSalva.id, pdfFile);
      }
      if (fotoFile && notaSalva.id) {
        await uploadFoto(notaSalva.id, fotoFile);
      }

      toast.success(id ? 'Nota fiscal atualizada com sucesso!' : 'Nota fiscal criada com sucesso!');
      navigate('/notas');
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar nota fiscal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-text">
          {id ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
        </h2>
        <p className="text-muted mt-1">
          {id ? 'Atualize as informações da nota fiscal' : 'Preencha os dados da nova nota fiscal'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card padding="lg" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Número"
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            required
          />
          <Input
            label="Série"
            type="text"
            name="serie"
            value={formData.serie}
            onChange={handleChange}
          />
          <Input
            label="Emitente"
            type="text"
            name="emitente"
            value={formData.emitente}
            onChange={handleChange}
            required
          />
          <Input
            label="Destinatário"
            type="text"
            name="destinatario"
            value={formData.destinatario}
            onChange={handleChange}
          />
          <Input
            label="Valor"
            type="number"
            step="0.01"
            name="valor"
            value={formData.valor}
            onChange={handleChange}
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange({ target: { name: 'status', value: e.target.value } })}
            options={[
              { value: 'pendente', label: 'Pendente' },
              { value: 'paga', label: 'Paga' },
              { value: 'vencida', label: 'Vencida' },
            ]}
          />
          <Input
            label="Data de Emissão"
            type="date"
            name="data_emissao"
            value={formData.data_emissao}
            onChange={handleChange}
            required
          />
          <Input
            label="Data de Vencimento"
            type="date"
            name="data_vencimento"
            value={formData.data_vencimento}
            onChange={handleChange}
          />
          <Input
            label="Data de Pagamento"
            type="date"
            name="data_pagamento"
            value={formData.data_pagamento}
            onChange={handleChange}
          />
          <Input
            label="Tipo de Frete"
            type="text"
            name="tipo_frete"
            value={formData.tipo_frete}
            onChange={handleChange}
          />
          <Input
            label="Veículo"
            type="text"
            name="veiculo"
            value={formData.veiculo}
            onChange={handleChange}
          />
          <Input
            label="Motorista"
            type="text"
            name="motorista"
            value={formData.motorista}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Observações
          </label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Upload de PDF */}
        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            PDF da Nota Fiscal
          </label>
          <Dropzone
            accept="application/pdf"
            onFilesSelected={(files) => {
              const file = Array.isArray(files) ? files[0] : files;
              if (file) handlePDFChange({ target: { files: [file] } });
            }}
          />
          {pdfFile && (
            <div className="mt-2 flex items-center gap-2 text-muted text-sm">
              <FileText size={18} className="text-primary" />
              <span>{pdfFile.name}</span>
              {!id && <span className="text-xs">(será enviado após salvar)</span>}
            </div>
          )}
          {pdfPreview && id && !pdfFile && (
            <a
              href={pdfPreview.startsWith('http') ? pdfPreview : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${pdfPreview}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-primary hover:text-primary-600 flex items-center gap-1 text-sm"
            >
              <FileText size={18} />
              Ver PDF atual
            </a>
          )}
          {pdfFile && id && (
            <Button
              type="button"
              variant="primary"
              onClick={handlePDFUpload}
              disabled={uploadingPDF}
              loading={uploadingPDF}
              className="mt-2"
            >
              {uploadingPDF ? 'Enviando...' : 'Enviar PDF'}
            </Button>
          )}
        </div>

        {/* Upload de Foto */}
        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Foto da Nota Paga
          </label>
          <Dropzone
            accept="image/*"
            onFilesSelected={(files) => {
              const file = Array.isArray(files) ? files[0] : files;
              if (file) handleFotoChange({ target: { files: [file] } });
            }}
          />
          {fotoFile && (
            <div className="mt-2 flex items-center gap-2 text-muted text-sm">
              <ImageIcon size={18} className="text-info" />
              <span>{fotoFile.name}</span>
              {!id && <span className="text-xs">(será enviado após salvar)</span>}
            </div>
          )}
          {fotoPreview && !fotoFile && id && (
            <div className="mt-2">
              <img
                src={fotoPreview.startsWith('http') ? fotoPreview : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${fotoPreview}`}
                alt="Foto atual"
                className="w-16 h-16 object-cover rounded border border-border"
              />
            </div>
          )}
          {fotoFile && id && (
            <Button
              type="button"
              variant="primary"
              onClick={handleFotoUpload}
              disabled={uploadingFoto}
              loading={uploadingFoto}
              className="mt-2"
            >
              {uploadingFoto ? 'Enviando...' : 'Enviar Foto'}
            </Button>
          )}
          {fotoFile && !id && (
            <div className="mt-2 w-16 h-16">
              <img
                src={fotoPreview}
                alt="Preview"
                className="w-full h-full object-cover rounded border border-border"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
          >
            {id ? 'Atualizar' : 'Criar Nota'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/notas')}
          >
            Cancelar
          </Button>
        </div>
        </Card>
      </form>
    </div>
  );
}

