import React, { useState } from 'react';
import { Wifi, X, RotateCw, Check } from 'lucide-react';
import { checkVpnStatus } from '../services/vpnCheck';

interface VpnWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId?: string;
  onSuccess?: () => void;
}

export const VpnWarningModal: React.FC<VpnWarningModalProps> = ({
  isOpen,
  onClose,
  incidentId = 'fab_vpn_20261012_01M4RDAAWH3Q2QV7',
  onSuccess
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRecheckOrReload = async () => {
    setIsChecking(true);
    setStatusMessage(null);

    try {
      const result = await checkVpnStatus();
      if (!result.isBlocked) {
        setIsSuccess(true);
        setStatusMessage('VPN обнаружен! Загружаем сервис...');
        setTimeout(() => {
          setIsSuccess(false);
          setIsChecking(false);
          onSuccess?.();
          onClose();
        }, 700);
        return;
      }

      setStatusMessage('VPN всё ещё не обнаружен. Смените локацию (например, на Германию или Нидерланды) и попробуйте снова.');
    } catch {
      window.location.reload();
    } finally {
      setIsChecking(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('vpn_modal_dismissed', 'true');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in"
      onClick={handleDismiss}
    >
      <div 
        className="relative w-full max-w-[480px] bg-[#ffffff] border border-[#efefef] rounded-[24px] p-7 sm:p-9 text-[#000000] shadow-[0_16px_40px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close cross in top right corner */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-[#efefef] text-[#969696] hover:text-[#000000] flex items-center justify-center transition cursor-pointer"
          title="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Icon: Wi-Fi with red crossed badge like Ozon */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-[72px] h-[72px] rounded-full bg-[#f4f4f4] flex items-center justify-center text-[#555555]">
            <Wifi className="w-9 h-9 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#ff3b30] text-white flex items-center justify-center shadow-sm border-2 border-white">
            <X className="w-4 h-4 stroke-[3]" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[19px] sm:text-[21px] font-bold text-[#000000] tracking-tight">
          Похоже, у вас выключен VPN
        </h3>

        {/* Subtitle */}
        <p className="text-[13.5px] sm:text-[14px] text-[#737373] font-normal leading-relaxed max-w-[390px] mt-2.5">
          Включите VPN, выберите сервер в Европе (Германия, Нидерланды) или США и перезагрузите страницу. Без VPN Google Gemini не сможет сгенерировать оскорбление.
        </p>

        {/* Status feedback message if recheck failed */}
        {statusMessage && (
          <div className={`mt-3 px-3 py-1.5 rounded-lg text-[12.5px] ${
            isSuccess ? 'bg-emerald-50 text-emerald-700 font-medium' : 'bg-red-50 text-red-600'
          }`}>
            {statusMessage}
          </div>
        )}

        {/* Buttons Row (our design code: rounded-full pills, solid black primary, soft gray secondary) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full mt-6">
          <button
            onClick={handleRecheckOrReload}
            disabled={isChecking}
            className="w-full sm:w-auto min-w-[160px] h-[42px] px-5 rounded-full bg-[#000000] text-[#ffffff] font-semibold text-[13.5px] hover:bg-[#262626] active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
          >
            {isChecking ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Проверяем...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Готово</span>
              </>
            ) : (
              <>
                <RotateCw className="w-4 h-4" />
                <span>Обновить страницу</span>
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto h-[42px] px-5 rounded-full bg-[#efefef] text-[#000000] font-semibold text-[13.5px] hover:bg-[#e4e4e4] active:scale-95 transition flex items-center justify-center cursor-pointer"
          >
            Всё равно продолжить
          </button>
        </div>

        {/* Incident ID footer in fine mono print */}
        <p className="text-[11px] font-mono text-[#a3a3a3] mt-5 select-all">
          Инцидент: {incidentId}
        </p>
      </div>
    </div>
  );
};
