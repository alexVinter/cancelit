import { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, X, ClipboardPaste, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import type { ChangeEvent, DragEvent } from 'react';

interface UploadZoneProps {
  imagePreview: string | null;
  contextText: string;
  isLoading: boolean;
  onImageChange: (dataUrl: string | null) => void;
  onContextChange: (text: string) => void;
  onSubmit: () => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

const LOADING_MESSAGES = [
  'Ищем микроагрессии в каждом пикселе...',
  'Опрашиваем диванных экспертов по морали...',
  'Подсчитываем количество задетых чувств...',
  'Составляем петицию на Change.org...',
  'Вызываем полицию нравов Твиттера...',
  'Изучаем позу модели на предмет угнетения...',
  'Придумываем 15 хэштегов тотальной отмены...'
];

export function UploadZone({
  imagePreview,
  contextText,
  isLoading,
  onImageChange,
  onContextChange,
  onSubmit,
  onOpenSettings,
  hasApiKey,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Global Ctrl + V paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const isReadyToSubmit = (imagePreview || contextText.trim().length > 0) && !isLoading;

  return (
    <div className="w-full space-y-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
      {!imagePreview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center p-10 sm:p-14 w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-pink-500 bg-pink-500/10 scale-[0.995]'
              : 'border-slate-700/80 hover:border-pink-500/60 hover:bg-slate-800/40 bg-slate-950/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-base sm:text-lg text-white text-center mb-1.5">
            Перетащите рекламу или нажмите для загрузки
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 text-center mb-5 max-w-md">
            Баннеры, скриншоты постов, фото упаковок или плакатов (PNG, JPG, WEBP)
          </p>
          <div className="inline-flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-1.5 text-slate-300 font-mono shadow-sm">
            <ClipboardPaste className="w-3.5 h-3.5 text-pink-400" />
            <span>Лайфхак: можно просто нажать <strong className="text-white">Ctrl + V</strong></span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border border-slate-700/80 bg-slate-950/70">
          <div className="relative w-full sm:w-56 h-48 rounded-xl overflow-hidden border border-slate-800 bg-black/60 flex items-center justify-center shrink-0">
            <img
              src={imagePreview}
              alt="Реклама для проверки"
              className="w-full h-full object-contain p-2"
            />
            <button
              onClick={() => onImageChange(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-500 text-white rounded-full transition cursor-pointer"
              title="Удалить"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 w-full space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Изображение готово к анализу</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Картинка загружена. Нейросеть проанализирует цвета, персонажей, слоганы, композицию и мельчайшие триггеры.
            </p>
            <div>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="text-xs text-pink-400 hover:text-pink-300 underline font-medium cursor-pointer"
              >
                Загрузить другую картинку
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileInputChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Context Input */}
      <div className="space-y-1.5">
        <label className="block font-mono text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          БРЕНД, СЛОГАН ИЛИ КОНТЕКСТ РЕКЛАМЫ (ОПЦИОНАЛЬНО):
        </label>
        <input
          type="text"
          value={contextText}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder="Например: Это новая реклама Авиасейлс со слоганом «Путешествовать проще»..."
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
        />
      </div>

      {/* API Key prompt if not entered */}
      {!hasApiKey && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
          <div className="flex items-center gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Для анализа <strong className="text-white">собственных картинок</strong> нужен бесплатный ключ Gemini.
            </span>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-lg transition shrink-0 cursor-pointer shadow-sm"
          >
            Ввести ключ
          </button>
        </div>
      )}

      {/* Main Submit Button */}
      <button
        onClick={onSubmit}
        disabled={!isReadyToSubmit}
        className={`w-full rounded-2xl py-4 sm:py-4.5 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-xl ${
          !isReadyToSubmit
            ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
            : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-heading font-black tracking-wider uppercase text-sm sm:text-base hover:scale-[1.008] active:scale-[0.99] shadow-pink-600/25 hover:brightness-105'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-pink-300" />
            <span className="font-heading font-semibold text-sm">
              {LOADING_MESSAGES[loadingMsgIdx]}
            </span>
          </div>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Найти повод ущемиться</span>
          </>
        )}
      </button>
    </div>
  );
}
