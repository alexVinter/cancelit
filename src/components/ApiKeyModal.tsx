import React, { useState } from 'react';
import { X, ExternalLink, Key, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { saveApiKey } from '../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onKeySaved: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onKeySaved
}) => {
  const [keyInput, setKeyInput] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiKey(keyInput);
    onKeySaved(keyInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setKeyInput('');
    saveApiKey('');
    onKeySaved('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-[480px] bg-[#ffffff] border border-[#efefef] rounded-[18px] p-6 text-[#000000] shadow-[0_0_24px_rgba(0,0,0,0.08)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#efefef]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#efefef] text-[#000000] flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#000000]">Настройки Gemini Vision API</h3>
              <p className="text-[12px] text-[#969696]">Бесплатный ключ для анализа ваших картинок</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#efefef] text-[#969696] hover:text-[#000000] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div className="p-3.5 rounded-[12px] bg-[#fafafa] border border-[#efefef] text-[13px] text-[#424242] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#000000]">
              <AlertCircle className="w-4 h-4 text-[#385898]" />
              <span>Зачем нужен ключ?</span>
            </div>
            <p className="leading-relaxed text-[12px]">
              Google Gemini Vision бесплатен (15 запросов в минуту). Ключ сохраняется исключительно в локальном хранилище вашего браузера.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[12px] font-medium">
              <label htmlFor="apiKey" className="text-[#000000]">
                Ваш Gemini API Key:
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[#385898] hover:underline flex items-center gap-1 transition"
              >
                <span>Получить бесплатно</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#fafafa] border border-[#d5d5d5] rounded-full px-4 py-2.5 text-[13px] font-mono text-[#000000] placeholder:text-[#969696] focus:outline-none focus:border-[#000000]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#969696] hover:text-[#000000] p-1 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3.5 border-t border-[#efefef]">
          {keyInput ? (
            <button
              onClick={handleClear}
              className="text-[12px] font-medium text-[#969696] hover:text-[#000000] underline cursor-pointer"
            >
              Удалить ключ
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#d5d5d5] bg-[#ffffff] hover:bg-[#efefef] text-[13px] font-semibold text-[#000000] transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full bg-[#000000] hover:bg-[#1a1a1a] text-[13px] font-semibold text-[#fafafa] flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-[#fafafa]" />
                  <span>Сохранено!</span>
                </>
              ) : (
                <span>Сохранить</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
