import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

const Breadcrumbs = ({ items = [] }) => {
  const location = useLocation();

  // Se items não for fornecido, gerar automaticamente da rota
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        path: currentPath,
        isLast: index === paths.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = items.length > 0 ? items : generateBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={crumb.path || index} className="flex items-center gap-2">
              {index === 0 ? (
                <Link
                  to={crumb.path}
                  className={cn(
                    'flex items-center gap-1 text-muted hover:text-text transition-colors',
                    isLast && 'text-text font-medium'
                  )}
                >
                  <Home size={16} />
                </Link>
              ) : (
                <>
                  <ChevronRight size={16} className="text-muted" />
                  {isLast ? (
                    <span className="text-text font-medium">{crumb.label}</span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-muted hover:text-text transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

