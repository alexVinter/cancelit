import React from 'react';
import { X, Sparkles, AlertCircle, TrendingDown, Flame, Info } from 'lucide-react';
import type { PresetCase } from '../types';
import { AppleLogo, BudLightLogo, BalenciagaLogo, GilletteLogo, PepsiLogo } from './BrandLogos';

interface CaseDetailModalProps {
  preset: PresetCase | null;
  onClose: () => void;
  onSelect: (preset: PresetCase) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  preset,
  onClose,
  onSelect,
}) => {
  if (!preset) return null;

  const renderBrandLogo = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'apple':
        return <AppleLogo className="w-5 h-5 text-[#000000]" />;
      case 'bud light':
        return <BudLightLogo className="w-7 h-7" />;
      case 'balenciaga':
        return <BalenciagaLogo className="w-[32px] h-auto text-[#000000]" />;
      case 'gillette':
        return <GilletteLogo className="w-[32px] h-auto" />;
      case 'pepsi':
        return <PepsiLogo className="w-7 h-7" />;
      default:
        return <span className="text-xs font-bold">{brand.charAt(0)}</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[560px] bg-[#ffffff] border border-[#efefef] rounded-[18px] p-6 text-[#000000] max-h-[90vh] flex flex-col shadow-[0_0_24px_rgba(0,0,0,0.08)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-[#efefef] shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fafafa] border border-[#efefef] flex items-center justify-center shrink-0">
              {renderBrandLogo(preset.brand)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-[#000000]">
                  {preset.brand}
                </span>
                <span className="text-[12px] text-[#969696]">•</span>
                <span className="text-[12px] text-[#969696]">
                  {preset.year} {preset.location ? `• ${preset.location}` : ''}
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-[#000000]">
                «{preset.title}»
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#efefef] text-[#969696] hover:text-[#000000] flex items-center justify-center transition cursor-pointer shrink-0"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Story Content */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 text-[#000000]">
          
          {/* Visual Poster Banner */}
          <div className="w-full aspect-video rounded-[8px] overflow-hidden border border-[#efefef] bg-[#fafafa] shrink-0">
            <img
              src={preset.image}
              alt={preset.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Chronicle Block 1: Что натворили */}
          <div className="p-3.5 rounded-[12px] bg-[#fafafa] border border-[#efefef] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#000000]">
              <AlertCircle className="w-4 h-4 text-[#385898]" />
              <span>Что произошло (кампания)</span>
            </div>
            <p className="text-[13px] text-[#424242] leading-relaxed">
              {preset.chronicle?.whatHappened || preset.description}
            </p>
          </div>

          {/* Chronicle Block 2: Почему разорвало соцсети */}
          <div className="p-3.5 rounded-[12px] bg-[#fafafa] border border-[#efefef] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#000000]">
              <Flame className="w-4 h-4 text-[#385898]" />
              <span>Почему разорвало соцсети</span>
            </div>
            <p className="text-[13px] text-[#424242] leading-relaxed">
              {preset.chronicle?.whyOutraged || preset.analysis.outrageSummary}
            </p>
          </div>

          {/* Chronicle Block 3: Последствия для бизнеса */}
          <div className="p-3.5 rounded-[12px] bg-[#fafafa] border border-[#efefef] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#424242]">
              <TrendingDown className="w-4 h-4 text-[#424242]" />
              <span>Последствия для бренда</span>
            </div>
            <p className="text-[13px] text-[#424242] leading-relaxed">
              {preset.chronicle?.aftermath || preset.analysis.marketerAdvice}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#efefef] flex items-center justify-between gap-3 shrink-0">
          <div
            className="flex items-center gap-1.5 text-[11px] text-[#969696] cursor-help select-none min-w-0"
            title="Материал носит информационно-просветительский характер (ст. 1274 ГК РФ) и основан на открытых публикациях в СМИ."
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Информационно-просветительский разбор (ст. 1274 ГК РФ)</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="cursor-pointer px-3 py-1.5 rounded-full bg-[#ffffff] hover:bg-[#efefef] text-[#424242] hover:text-[#000000] border border-[#d5d5d5] text-xs font-semibold transition whitespace-nowrap"
            >
              Закрыть
            </button>

            <button
              onClick={() => {
                onSelect(preset);
                onClose();
              }}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#000000] hover:bg-[#222222] text-[#fafafa] text-xs font-semibold transition active:scale-95 shadow-sm whitespace-nowrap"
            >
              <span>Открыть как тред</span>
              <Sparkles className="w-3 h-3 text-[#fafafa]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
