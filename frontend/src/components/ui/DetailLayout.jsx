import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, ArrowLeft, Download, Share2 } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Tabs from './Tabs';
import Breadcrumbs from './Breadcrumbs';
import ConfirmModal from './ConfirmModal';
import { useToastContext } from '../components/Toaster';

const DetailLayout = ({
  title,
  subtitle,
  breadcrumbs,
  actions = [],
  onEdit,
  onDelete,
  onBack,
  tabs = [],
  children,
  metadata = [],
}) => {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const toast = useToastContext();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete();
        toast.success('Item excluído com sucesso!');
        if (onBack) {
          onBack();
        } else {
          navigate(-1);
        }
      } catch (error) {
        toast.error('Erro ao excluir item');
      }
    }
  };

  const defaultTabs = tabs.length > 0 ? tabs : [
    { id: 'resumo', label: 'Resumo', content: children },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {onBack && (
              <button
                onClick={onBack}
                className="text-muted hover:text-text transition-colors"
                aria-label="Voltar"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-3xl font-bold text-text">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-muted">{subtitle}</p>
          )}
          {metadata.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {metadata.map((meta, index) => (
                <div key={index} className="text-sm">
                  <span className="text-muted">{meta.label}:</span>{' '}
                  <span className="text-text font-medium">{meta.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {onEdit && (
            <Button variant="primary" leftIcon={Edit} onClick={onEdit}>
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              leftIcon={Trash2}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Excluir
            </Button>
          )}
          {actions.map((action, index) => (
            <Button
              key={index}
              {...action}
            />
          ))}
        </div>
      </div>

      {/* Tabs */}
      {defaultTabs.length > 1 ? (
        <Card>
          <Tabs defaultValue={defaultTabs[0].id}>
            <Tabs.List>
              {defaultTabs.map((tab) => (
                <Tabs.Trigger key={tab.id} value={tab.id}>
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {defaultTabs.map((tab) => (
              <Tabs.Content key={tab.id} value={tab.id}>
                <div className="pt-4">
                  {tab.content}
                </div>
              </Tabs.Content>
            ))}
          </Tabs>
        </Card>
      ) : (
        <Card>{children}</Card>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {onDelete && (
        <ConfirmModal
          isOpen={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={handleDelete}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
        />
      )}
    </div>
  );
};

export default DetailLayout;

