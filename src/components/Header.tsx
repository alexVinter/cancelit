import React from 'react';
import { LogoIcon } from './LogoIcon';

interface HeaderProps {
  hasCustomKey?: boolean;
  hasServerKey?: boolean;
  onOpenSettings?: () => void;
  onGoHome: () => void;
  onScrollToFeed?: () => void;
  onScrollToCases?: () => void;
  onScrollToContacts?: () => void;
  activeTab?: 'feed' | 'cases' | 'contacts';
  onTabChange?: (tab: 'feed' | 'cases' | 'contacts') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onScrollToFeed,
  onScrollToCases,
  onScrollToContacts,
  activeTab = 'feed',
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full h-[64px] bg-[#fafafa]/90 backdrop-blur-md border-b border-[#efefef] transition-colors">
      <div className="max-w-[640px] mx-auto h-full px-4 flex items-center justify-between">
        
        {/* Left: Threads Glyph Logo & Project Name */}
        <button
          onClick={onGoHome}
          className="cursor-pointer flex items-center gap-2.5 group transition-transform active:scale-95 text-[#000000]"
          title="На главную"
        >
          {/* Threads-style 'У' icon glyph */}
          <div className="w-8 h-8 rounded-full bg-[#000000] text-[#fafafa] flex items-center justify-center font-bold text-lg select-none shrink-0">
            <LogoIcon className="w-[22px] h-[22px] text-[#fafafa]" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-[#000000]">
            Ущемись<sup className="text-[11px] text-[#737373] font-medium ml-0.5 select-none">*</sup>
          </span>
        </button>

        {/* Navigation Tabs in Threads style */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              onTabChange?.('feed');
              onScrollToFeed?.();
            }}
            className={`cursor-pointer px-3 py-1.5 rounded-full text-[13px] font-semibold transition ${
              activeTab === 'feed'
                ? 'bg-[#efefef] text-[#000000]'
                : 'text-[#969696] hover:text-[#000000]'
            }`}
          >
            Лента
          </button>
          
          <button
            onClick={() => {
              onTabChange?.('cases');
              onScrollToCases?.();
            }}
            className={`cursor-pointer px-3 py-1.5 rounded-full text-[13px] font-semibold transition ${
              activeTab === 'cases'
                ? 'bg-[#efefef] text-[#000000]'
                : 'text-[#969696] hover:text-[#000000]'
            }`}
          >
            Скандалы
          </button>

          <button
            onClick={() => {
              onTabChange?.('contacts');
              onScrollToContacts?.();
            }}
            className={`cursor-pointer px-3 py-1.5 rounded-full text-[13px] font-semibold transition ${
              activeTab === 'contacts'
                ? 'bg-[#efefef] text-[#000000]'
                : 'text-[#969696] hover:text-[#000000]'
            }`}
          >
            Контакты
          </button>
        </div>

      </div>
    </header>
  );
};
