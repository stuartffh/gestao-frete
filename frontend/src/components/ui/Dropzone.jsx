import { useState, useRef } from 'react';
import { Upload, X, File } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from './Button';

const Dropzone = ({
  accept,
  maxSize,
  multiple = false,
  onFilesSelected,
  children,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file) => {
    if (maxSize && file.size > maxSize) {
      return `Arquivo ${file.name} excede o tamanho máximo de ${maxSize / 1024 / 1024}MB`;
    }
    if (accept && !accept.split(',').some((type) => file.type.includes(type.replace('*', '').replace('.', '')))) {
      return `Arquivo ${file.name} não é um tipo permitido`;
    }
    return null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (fileList) => {
    const validFiles = [];
    const errors = [];

    fileList.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
    }

    if (validFiles.length > 0) {
      const filesToSet = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(filesToSet);
      onFilesSelected?.(multiple ? filesToSet : filesToSet[0]);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected?.(multiple ? newFiles : newFiles[0] || null);
  };

  return (
    <div className={className}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50',
          error && 'border-danger'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {children || (
          <>
            <Upload className="mx-auto mb-4 text-muted" size={32} />
            <p className="text-sm text-muted mb-2">
              Arraste arquivos aqui ou{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
              >
                clique para selecionar
              </button>
            </p>
            {accept && (
              <p className="text-xs text-muted">Formatos aceitos: {accept}</p>
            )}
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-surface rounded border border-border"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File size={16} className="text-muted flex-shrink-0" />
                <span className="text-sm text-text truncate">{file.name}</span>
                <span className="text-xs text-muted flex-shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-danger hover:text-red-600 p-1"
                aria-label="Remover arquivo"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropzone;

