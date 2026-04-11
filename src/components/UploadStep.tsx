import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FileIcon } from './icons';

interface UploadStepProps {
  onFileChange: (file: File) => void;
}

export function UploadStep({ onFileChange }: UploadStepProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileChange(file);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold gradient-text mb-2">{t('studio.uploadTitle')}</h2>
        <p className="text-surface-200/60 text-sm">{t('studio.uploadDesc')}</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center py-16 gap-4 ${
          isDragOver
            ? 'border-primary-400 bg-primary-500/10'
            : 'border-surface-700 hover:border-primary-500/50'
        }`}
      >
        <FileIcon className="w-12 h-12 text-surface-200/40" />
        <p className="text-surface-200/70 text-center">{t('studio.dragDrop')}</p>
        <button type="button" className="gradient-bg px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity">
          {t('studio.orBrowse')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileChange(file);
          }}
        />
      </div>

      <p className="text-center text-xs text-surface-200/40">{t('studio.supportedFormats')}</p>
    </div>
  );
}
