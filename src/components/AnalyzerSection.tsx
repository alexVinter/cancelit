import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  X, 
  Loader2, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  Info,
  AlertCircle
} from 'lucide-react';
import type { PresetCase } from '../types';
import { PRESET_CASES } from '../services/presetsData';
import { checkContentModeration } from '../services/moderation';
import { AppleLogo, BudLightLogo, BalenciagaLogo, GilletteLogo, PepsiLogo } from './BrandLogos';
import { CaseDetailModal } from './CaseDetailModal';
import { VerifiedBadge } from './VerifiedBadge';

interface AnalyzerSectionProps {
  imagePreview: string | null;
  contextText: string;
  isLoading: boolean;
  selectedPresetId: string | null;
  hasApiKey?: boolean;
  onImageChange: (file: string | null) => void;
  onContextChange: (text: string) => void;
  onSubmit: () => void;
  onSelectPreset: (preset: PresetCase) => void;
  onOpenSettings?: () => void;
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

const formatOutcome = (stamp: string) => {
  if (!stamp) return '';
  return stamp.charAt(0).toUpperCase() + stamp.slice(1).toLowerCase();
};

export function AnalyzerSection({
  imagePreview,
  contextText,
  isLoading,
  selectedPresetId,
  onImageChange,
  onContextChange,
  onSubmit,
  onSelectPreset,
}: AnalyzerSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [viewingPreset, setViewingPreset] = useState<PresetCase | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderBrandLogo = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'apple':
        return <AppleLogo className="w-4.5 h-4.5 text-[#000000]" />;
      case 'bud light':
        return <BudLightLogo className="w-6 h-6" />;
      case 'balenciaga':
        return <BalenciagaLogo className="w-[26px] h-auto text-[#000000]" />;
      case 'gillette':
        return <GilletteLogo className="w-[26px] h-auto" />;
      case 'pepsi':
        return <PepsiLogo className="w-5.5 h-5.5" />;
      default:
        return <span className="text-xs font-bold">{brand.charAt(0)}</span>;
    }
  };

  useEffect(() => {
    if (!isLoading) {
      setIsSlowLoading(false);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);

    const timer = setTimeout(() => {
      setIsSlowLoading(true);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isLoading]);

  // Global Ctrl + V paste
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

  const compressImage = (file: File, maxDim = 2048, quality = 0.92): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const compressed = await compressImage(file);
      onImageChange(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const moderationStatus = checkContentModeration(contextText);
  const isReadyToSubmit = Boolean((imagePreview || contextText.trim()) && !isLoading && moderationStatus.isAllowed);

  return (
    <section className="w-full bg-[#fafafa] text-[#000000] py-6 sm:py-8">
      <div className="max-w-[640px] mx-auto px-4">

        {/* 1. THREADS COMPOSE CARD (Social-Network Input Box) */}
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`bg-[#fafafa] border border-[#d5d5d5] rounded-[18px] p-4 sm:p-5 mb-5 shadow-[0_0_12px_rgba(0,0,0,0.04)] transition-all ${
            isDragging ? 'border-[#385898] bg-[#efefef]' : ''
          }`}
        >
          {/* Header Row: User Avatar + Text Input */}
          <div className="flex items-start gap-3">
            {/* 40px Circular Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#efefef] border border-[#d5d5d5] shrink-0 flex items-center justify-center select-none">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=marketer_vinter" 
                alt="Профиль" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Compose Area */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[15px] text-[#000000]">
                  Новый тред на отмену
                </span>
                <span className="text-[12px] text-[#969696] font-normal">
                  @Ущемись
                </span>
              </div>

              {/* Text Input */}
              <textarea
                value={contextText}
                onChange={(e) => onContextChange(e.target.value)}
                placeholder="Что проверим? Введите слоган, текст рекламы или опишите креатив..."
                rows={imagePreview ? 2 : 3}
                className="w-full bg-transparent border-0 p-0 text-[15px] leading-[1.4] text-[#000000] placeholder:text-[#969696] focus:outline-none resize-none font-normal"
              />

              {/* Attached Image Preview if uploaded */}
              {imagePreview && (
                <div className="relative rounded-[8px] border border-[#d5d5d5] overflow-hidden my-3 bg-[#ffffff] max-h-72 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Рекламный креатив"
                    className="w-full h-full object-contain max-h-72"
                  />
                  <button
                    onClick={() => onImageChange(null)}
                    className="cursor-pointer absolute top-2 right-2 p-1.5 bg-[#000000]/80 hover:bg-[#000000] text-[#fafafa] rounded-full transition"
                    title="Удалить картинку"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Drag & Drop Hint when dragging */}
              {isDragging && (
                <div className="p-3 my-2 rounded-[8px] bg-[#385898]/10 border border-dashed border-[#385898] text-center text-xs font-semibold text-[#385898]">
                  Отпустите файл, чтобы прикрепить картинку к посту
                </div>
              )}

              {/* Live Link / Moderation Warning */}
              {!moderationStatus.isAllowed && (
                <div className="flex items-center gap-2 p-2.5 my-2 rounded-[10px] bg-[#efefef] border border-[#d5d5d5] text-xs text-[#000000] animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-[#e50010] shrink-0" />
                  <span className="leading-snug">{moderationStatus.errorReason}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Toolbar: Attach Photo, Choose Preset, How It Works, Submit */}
          <div className="pt-3 border-t border-[#efefef] flex items-center justify-between gap-2 mt-3 w-full">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Photo upload button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileInputChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#424242] hover:text-[#000000] hover:bg-[#efefef] transition whitespace-nowrap shrink-0"
                title="Прикрепить картинку рекламы"
              >
                <ImageIcon className="w-4 h-4 text-[#969696] shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Фото / Баннер</span>
              </button>

              {/* Ready Presets toggle */}
              <button
                type="button"
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  showPresetsMenu ? 'bg-[#efefef] text-[#000000]' : 'text-[#424242] hover:text-[#000000] hover:bg-[#efefef]'
                }`}
                title="Выбрать готовый скандал бренда"
              >
                <Sparkles className="w-4 h-4 text-[#000000] shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Готовые кейсы</span>
                {showPresetsMenu ? <ChevronUp className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 shrink-0" />}
              </button>

              {/* How it works toggle */}
              <button
                type="button"
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  showHowItWorks ? 'bg-[#efefef] text-[#000000]' : 'text-[#969696] hover:text-[#000000] hover:bg-[#efefef]'
                }`}
                title="Как это работает"
              >
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline whitespace-nowrap">Как это работает</span>
              </button>
            </div>

            {/* Primary Submit Button: Pill shape Ink Black */}
            <button
              onClick={onSubmit}
              disabled={!isReadyToSubmit}
              className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition active:scale-95 shrink-0 whitespace-nowrap min-w-[96px] ${
                !isReadyToSubmit
                  ? 'bg-[#efefef] text-[#969696] cursor-not-allowed'
                  : 'bg-[#000000] text-[#fafafa] hover:bg-[#222222]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#fafafa] shrink-0" />
                  <span>Анализ...</span>
                </>
              ) : (
                <span>Проверить</span>
              )}
            </button>
          </div>

          {/* Dedicated loading status row */}
          {isLoading && (
            <div className="mt-3 pt-2.5 border-t border-[#efefef] flex flex-col gap-1.5 text-xs animate-fade-in">
              <div className="flex items-center gap-2 font-medium text-[#000000]">
                <Sparkles className="w-3.5 h-3.5 shrink-0 animate-spin text-[#000000]" />
                <span className="truncate text-[#000000]">{LOADING_MESSAGES[loadingMsgIdx]}</span>
              </div>
              {isSlowLoading && (
                <div className="text-[12px] text-[#737373] pl-[22px] animate-fade-in font-normal leading-snug">
                  Сложнооо. Чуть-чуть потерпите, надо подумать за что зацепиться
                </div>
              )}
            </div>
          )}

          {/* Expandable "Как это работает" Box */}
          {showHowItWorks && (
            <div className="mt-4 pt-3 border-t border-[#efefef] space-y-2.5 text-xs text-[#000000] animate-fade-in">
              <div className="font-semibold text-[13px] text-[#000000] mb-1">
                Как это работает
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#0095F6]">1.</span>
                <span><strong>Загрузи креатив или слоган.</strong> Баннер, макет из Figma, скриншот поста или текст.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#0095F6]">2.</span>
                <span><strong>ИИ сканирует микроагрессии.</strong> Нейросеть придирчиво находит скрытые обиды, лукизм и эйджизм.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#0095F6]">3.</span>
                <span><strong>Забирай пост.</strong> Готовый скриншот публикации с индексом токсичности и советом маркетологу.</span>
              </div>
              <div className="pt-2 border-t border-[#efefef] text-[11px] text-[#969696] leading-relaxed">
                <span><strong>Без политики и чернухи.</strong> Сервис предназначен строго для коммерческого маркетинга брендов. Любые темы политики, агитации и шок-контента автоматически блокируются.</span>
              </div>
            </div>
          )}

          {/* Expandable Ready Cases Dropdown inside composer */}
          {showPresetsMenu && (
            <div className="mt-4 pt-3 border-t border-[#efefef] space-y-2 animate-fade-in">
              <div className="text-[12px] font-semibold text-[#969696] mb-1">
                Кликните на кейс, чтобы загрузить его:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_CASES.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setShowPresetsMenu(false);
                    }}
                    className={`cursor-pointer p-2.5 rounded-[8px] border text-left flex items-center justify-between gap-2 transition ${
                      selectedPresetId === preset.id
                        ? 'border-[#000000] bg-[#ffffff]'
                        : 'border-[#d5d5d5] bg-[#ffffff] hover:bg-[#efefef]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="shrink-0">{renderBrandLogo(preset.brand)}</div>
                      <span className="text-[13px] font-semibold truncate text-[#000000]">
                        {preset.brand}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#969696] shrink-0 font-normal">
                      {preset.year}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 2. FEED OF BRAND SCANDALS ("Громкие скандалы брендов") */}
        <div id="presets-block" className="scroll-mt-20 bg-[#fafafa] border border-[#d5d5d5] rounded-[18px] overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.04)]">
          {/* Feed Section Title */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-[#efefef] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[15px] font-semibold text-[#000000]">
                  Громкие скандалы брендов
                </h2>
                <span
                  className="cursor-help text-[#969696] hover:text-[#000000] transition"
                  title="Материал носит информационно-просветительский характер (ст. 1274 ГК РФ) и основан на открытых публикациях в СМИ."
                >
                  <Info className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-[12px] text-[#969696] font-normal">
                Собрали старые примеры, потому что за свежие могут дать люлей
              </p>
            </div>
          </div>

          {/* Feed Posts List */}
          <div className="divide-y divide-[#efefef]">
            {PRESET_CASES.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <article 
                  key={preset.id}
                  className={`p-4 sm:p-5 transition hover:bg-[#ffffff] ${
                    isSelected ? 'bg-[#ffffff]' : ''
                  }`}
                >
                  {/* Post Header: Brand Avatar + Name + Tag + Year */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#ffffff] border border-[#d5d5d5] flex items-center justify-center shrink-0 p-1">
                        {renderBrandLogo(preset.brand)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[15px] text-[#000000] truncate">
                            {preset.brand}
                          </span>
                          <VerifiedBadge className="w-3.5 h-3.5 shrink-0" title="Подтверждённый бренд" />
                          <span className="text-[13px] text-[#969696] font-normal">
                            · {preset.year} г.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Campaign Outcome Pill */}
                    <span className="text-[11px] font-medium text-[#737373] px-2.5 py-0.5 rounded-full bg-[#efefef] shrink-0 select-none">
                      {formatOutcome(preset.analysis.statusStamp)}
                    </span>
                  </div>

                  {/* Post Content: Scandal Summary */}
                  <div className="space-y-2.5 mb-3 pl-0 sm:pl-[42px]">
                    <h3 className="font-semibold text-[15px] leading-snug text-[#000000]">
                      «{preset.title}»
                    </h3>
                    <p className="text-[14px] leading-[1.4] text-[#424242] font-normal">
                      {preset.description}
                    </p>

                    {/* Media Preview Thumbnail */}
                    <div className="rounded-[8px] border border-[#d5d5d5] overflow-hidden max-h-60 bg-[#ffffff] flex items-center justify-center">
                      <img 
                        src={preset.image} 
                        alt={preset.title}
                        className="w-full h-full object-cover max-h-60"
                      />
                    </div>
                  </div>

                  {/* Post Footer Actions: Test Case & View Chronicle */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#efefef] pl-0 sm:pl-[42px]">
                    <button
                      onClick={() => setViewingPreset(preset)}
                      className="cursor-pointer inline-flex items-center gap-1 text-[13px] text-[#385898] hover:underline font-semibold"
                    >
                      <span>Хроника скандала</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onSelectPreset(preset)}
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#000000] hover:bg-[#222222] text-[#fafafa] rounded-full text-xs font-semibold transition active:scale-95"
                    >
                      <span>Протестировать</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                </article>
              );
            })}
          </div>
        </div>

      </div>

      {/* Case Chronicle Modal */}
      <CaseDetailModal
        preset={viewingPreset}
        onClose={() => setViewingPreset(null)}
        onSelect={onSelectPreset}
      />
    </section>
  );
}
