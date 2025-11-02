import { FileX, Search } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon = FileX, 
  title = 'Nenhum item encontrado',
  description,
  action,
  actionLabel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-surface p-6 rounded-full mb-4">
        <Icon className="text-muted" size={48} />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      {description && (
        <p className="text-muted mb-6 max-w-md">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

