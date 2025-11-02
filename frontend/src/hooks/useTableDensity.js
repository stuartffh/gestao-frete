import { useState, useEffect } from 'react';

const DENSITY_KEY = 'table-density';

export default function useTableDensity(defaultDensity = 'comfortable') {
  const [density, setDensity] = useState(() => {
    const saved = localStorage.getItem(DENSITY_KEY);
    return saved || defaultDensity;
  });

  useEffect(() => {
    localStorage.setItem(DENSITY_KEY, density);
  }, [density]);

  const toggleDensity = () => {
    setDensity(prev => prev === 'comfortable' ? 'compact' : 'comfortable');
  };

  return {
    density,
    setDensity,
    toggleDensity,
    isCompact: density === 'compact',
    isComfortable: density === 'comfortable',
  };
}

export const getTableDensityClasses = (density = 'comfortable') => {
  return {
    row: density === 'compact' ? 'py-2' : 'py-4',
    cell: density === 'compact' ? 'px-3 py-1.5 text-sm' : 'px-6 py-4',
    header: density === 'compact' ? 'px-3 py-2 text-xs' : 'px-6 py-3 text-sm',
  };
};

