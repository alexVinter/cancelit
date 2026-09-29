import { ArrowRight, Heart, MessageCircle, Repeat2, Send, MoreHorizontal } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { VerifiedBadge } from './VerifiedBadge';

interface HeroSectionProps {
  onStartClick: () => void;
  onPresetsClick: () => void;
  onOpenSettings?: () => void;
  hasCustomKey?: boolean;
}

export function HeroSection({
  onStartClick,
  onPresetsClick,
}: HeroSectionProps) {
  return (
    <section className="w-full min-h-screen flex flex-col justify-between items-center bg-[#fafafa] text-[#000000] select-none">
      
      {/* Top Navigation Bar */}
      <header className="w-full max-w-[640px] mx-auto h-[64px] px-4 flex items-center justify-between shrink-0">
        {/* Threads-style 'У' Glyph Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#000000] text-[#fafafa] flex items-center justify-center font-bold text-lg select-none shrink-0">
            <LogoIcon className="w-[22px] h-[22px] text-[#fafafa]" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-[#000000]">
            Ущемись<sup className="text-[11px] text-[#737373] font-medium ml-0.5 select-none">*</sup>
          </span>
        </div>

        <button
          onClick={onStartClick}
          className="cursor-pointer text-[13px] font-semibold text-[#000000] hover:text-[#385898] transition"
        >
          Перейти в ленту →
        </button>
      </header>

      {/* Main Center Stage */}
      <div className="w-full max-w-[640px] mx-auto px-4 py-8 flex flex-col items-center text-center my-auto">
        
        {/* Headline */}
        <h1 className="text-[34px] sm:text-[44px] md:text-[52px] font-bold tracking-tight text-[#000000] leading-[1.08] mb-4">
          Кто ущемится из-за твоей рекламы?
        </h1>

        {/* Subtitle */}
        <p className="max-w-lg text-[15px] sm:text-[16px] text-[#424242] leading-relaxed mb-8">
          Загрузи баннер или слоган — нейросеть сгенерирует яростный фейковый тред с разбором скрытых микроагрессий и покажет скандал до его запуска.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center mb-10">
          <button
            onClick={onStartClick}
            className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#000000] hover:bg-[#1a1a1a] text-[#fafafa] text-[15px] font-semibold transition active:scale-95 shadow-sm"
          >
            <span>Написать тред</span>
            <ArrowRight className="w-4 h-4 text-[#fafafa]" />
          </button>

          <button
            onClick={onPresetsClick}
            className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#ffffff] hover:bg-[#efefef] text-[#000000] text-[15px] font-semibold border border-[#d5d5d5] transition active:scale-95"
          >
            <span>Реальные кейсы отмен</span>
          </button>
        </div>

        {/* Authentic Threads Post Card Preview */}
        <div className="w-full rounded-[18px] bg-[#ffffff] border border-[#d5d5d5] p-4 sm:p-5 text-left shadow-[0_0_12px_rgba(0,0,0,0.04)]">
          {/* Post Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#efefef] border border-[#d5d5d5] shrink-0 flex items-center justify-center">
                <img 
                  src="https://api.dicebear.com/7.x/notionists/svg?seed=inspector" 
                  alt="Инспектор микроагрессий" 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[15px] leading-tight text-[#000000]">
                    cringe_inspector
                  </span>
                  <VerifiedBadge className="w-3.5 h-3.5 shrink-0" title="Подтверждённый аккаунт" />
                  <span className="text-[13px] text-[#969696] font-normal">
                    · только что
                  </span>
                </div>
                <span className="text-[12px] text-[#969696] font-normal leading-none mt-0.5">
                  Инспектор микроагрессий
                </span>
              </div>
            </div>

            <div className="text-[#969696] p-1">
              <MoreHorizontal className="w-5 h-5" />
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-3 pl-0 sm:pl-[52px]">
            <p className="text-[15px] leading-[1.4] text-[#000000] font-normal whitespace-pre-line text-left">
              Ребят, вы серьёзно утвердили этот креатив в 2026 году? Опять обесценивание, лукизм и тонна токсичности. Давайте сразу отменим...
            </p>
          </div>

          {/* Post Engagement Bar: 4 Line Icons + Counts + @Ущемись */}
          <div className="pt-3 border-t border-[#efefef] flex items-center justify-between pl-0 sm:pl-[52px]">
            <div className="flex items-center gap-4 text-[#969696]">
              {/* Heart / Like */}
              <div className="inline-flex items-center gap-1.5 hover:text-[#000000] transition">
                <Heart className="w-4 h-4 stroke-[1.75]" />
                <span className="text-[13px] font-normal text-[#424242]">1.4K</span>
              </div>

              {/* Comment */}
              <div className="inline-flex items-center gap-1.5 hover:text-[#000000] transition">
                <MessageCircle className="w-4 h-4 stroke-[1.75]" />
                <span className="text-[13px] font-normal text-[#424242]">842</span>
              </div>

              {/* Repost */}
              <div className="inline-flex items-center gap-1.5 hover:text-[#000000] transition">
                <Repeat2 className="w-4 h-4 stroke-[1.75]" />
                <span className="text-[13px] font-normal text-[#424242]">319</span>
              </div>

              {/* Share */}
              <div className="inline-flex items-center gap-1.5 hover:text-[#000000] transition">
                <Send className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>

            <div className="text-[11px] font-normal text-[#969696]">
              @Ущемись
            </div>
          </div>
        </div>

      </div>

      {/* Minimal Footer Note */}
      <footer className="w-full max-w-[640px] mx-auto px-4 py-4 flex items-center justify-between text-[12px] text-[#969696] border-t border-[#efefef] shrink-0">
        <div>
          * Сервис превентивной паранойи для маркетологов
        </div>
        <div className="flex items-center gap-2">
          <span>© 2026 Ущемись</span>
          <span>•</span>
          <a
            href="/privacy.html"
            target="_blank"
            rel="noreferrer"
            className="text-[#969696] hover:text-[#000000] underline"
          >
            Куки и приватность
          </a>
        </div>
      </footer>

    </section>
  );
}
