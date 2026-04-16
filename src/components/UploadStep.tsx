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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 border-t border-ink pt-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
          File · Source · 素材
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-ink mt-2">
          {t('studio.uploadTitle')}
        </h2>
        <p className="text-ink-soft mt-2">{t('studio.uploadDesc')}</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center py-20 gap-5 ${
          isDragOver
            ? 'border-cinnabar bg-paper'
            : 'border-ink/40 hover:border-ink hover:bg-paper/50'
        }`}
      >
        <FileIcon className="w-10 h-10 text-ink-mute" />
        <p className="text-ink-soft text-center">{t('studio.dragDrop')}</p>
        <button
          type="button"
          className="bg-ink text-cream px-6 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-cinnabar transition-colors"
        >
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

      <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute mt-5">
        {t('studio.supportedFormats')}
      </p>
    </div>
  );
}
