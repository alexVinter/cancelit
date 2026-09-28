import React, { useState, useEffect } from 'react';

interface CookieBannerProps {
  onOpenPrivacy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already accepted cookies
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small timeout for smooth appearance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Уведомление об использовании cookie-файлов"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#ffffff]/95 backdrop-blur-md border-t border-[#efefef] px-4 py-3 sm:py-3.5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] animate-slide-up"
    >
      <div className="max-w-[1040px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 text-center sm:text-left">
        
        {/* Banner Text with Links */}
        <p className="text-[13.5px] sm:text-[14px] text-[#1a1a1a] font-normal leading-relaxed m-0">
          Мы используем{' '}
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-[#000000] underline underline-offset-4 decoration-[#a3a3a3] hover:decoration-[#000000] font-medium cursor-pointer bg-transparent border-0 p-0 inline transition-colors"
          >
            куки
          </button>{' '}
          и{' '}
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-[#000000] underline underline-offset-4 decoration-[#a3a3a3] hover:decoration-[#000000] font-medium cursor-pointer bg-transparent border-0 p-0 inline transition-colors"
          >
            рекомендательные технологии
          </button>{' '}
          — чтобы сервис работал быстро и ничего не слетало
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAccept}
          className="cursor-pointer inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#000000] hover:bg-[#1a1a1a] text-[#ffffff] text-[13.5px] font-semibold transition shadow-sm active:scale-95 shrink-0"
        >
          Хорошо, без проблем
        </button>

      </div>
    </div>
  );
};
