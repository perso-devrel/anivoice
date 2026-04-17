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
        <h2 className="text-2xl text-bone font-mono uppercase tracking-widest font-bold mb-2">{t('studio.uploadTitle')}</h2>
        <p className="font-mono text-bone/40 text-sm">{t('studio.uploadDesc')}</p>
      </div>

      <div className="relative">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/30 block mb-2">FILE INPUT</span>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-void border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center py-16 gap-4 ${
            isDragOver
              ? 'border-lucy bg-lucy/10'
              : 'border-bone/20 hover:border-lucy'
          }`}
        >
          <FileIcon className="w-16 h-16 text-bone/20" />
          <p className="text-bone/70 text-center">{t('studio.dragDrop')}</p>
          <button type="button" className="bg-lucy text-void border-2 border-lucy px-5 py-2 font-mono uppercase text-sm font-medium hover:opacity-90 transition-opacity">
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
      </div>

      <p className="text-center font-mono text-[10px] tracking-wider text-bone/40">{t('studio.supportedFormats')}</p>
    </div>
  );
}
