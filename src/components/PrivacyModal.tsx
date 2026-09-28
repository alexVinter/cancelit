import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[640px] bg-[#ffffff] border border-[#efefef] rounded-[20px] p-6 text-[#000000] max-h-[85vh] flex flex-col shadow-[0_10px_35px_rgba(0,0,0,0.12)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#efefef] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#efefef] text-[#000000] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#000000] leading-tight">
                Политика конфиденциальности и куки
              </h3>
              <p className="text-[12px] text-[#969696]">
                Соглашение об обработке пользовательских данных
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#efefef] text-[#969696] hover:text-[#000000] flex items-center justify-center transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable Text */}
        <div className="overflow-y-auto py-4 pr-1 text-[13.5px] leading-relaxed text-[#333333] space-y-4">
          <div className="p-3.5 rounded-[12px] bg-[#f9fafb] border border-[#efefef] text-[13px] text-[#4b5563]">
            <strong>Главное:</strong> Сервис полностью бесплатный, не требует регистрации, авторизации, ввода каких-либо личных API-ключей, номеров телефонов или платёжных данных. Все введённые тексты и изображения обрабатываются через Google Gemini API исключительно для генерации аналитического отчёта.
          </div>

          <section>
            <h4 className="font-semibold text-[14px] text-[#000000] mb-1.5">1. Общие положения</h4>
            <p>
              Настоящее Соглашение регулирует порядок использования веб-сайта «Ущемись». Сервис представляет собой независимый авторский спецпроект, функционирующий без образования отдельного юридического лица под управлением автора и разработчика (Администрация/Оператор) с соблюдением требований Федерального закона РФ № 152-ФЗ «О персональных данных».
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-[14px] text-[#000000] mb-1.5">2. Цели обработки данных</h4>
            <p>
              Данные обрабатываются исключительно для выполнения прямого функционала сервиса — проведения нейросетевого экспресс-анализа рекламы и инфоповодов, сохранения сессионных настроек интерфейса (согласие с cookie), а также защиты сервиса от спама и нарушений.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-[14px] text-[#000000] mb-1.5">3. Собираемые данные</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Тексты и изображения:</strong> отправляются для мгновенной оценки в Google Gemini API и не используются для установления личности.</li>
              <li><strong>Технические данные:</strong> IP-адрес, тип браузера, файлы cookie для фиксации настроек сессии.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-[14px] text-[#000000] mb-1.5">4. Файлы cookie (куки)</h4>
            <p>
              Cookie-файлы используются для запоминания вашего согласия на плашке уведомления, чтобы оно не показывалось повторно, а также для сохранения текущей сессии. Вы можете удалить cookies в любой момент в настройках своего браузера.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-[14px] text-[#000000] mb-1.5">5. Контакты Администрации</h4>
            <p>
              По вопросам функционирования сервиса и обработки данных:
              <br />• Разработчик: <a href="https://t.me/winteryaaa" target="_blank" rel="noreferrer" className="text-[#000000] font-medium underline underline-offset-2 hover:opacity-75">@winteryaaa</a>
              <br />• Идея: <a href="https://t.me/winter_daniil" target="_blank" rel="noreferrer" className="text-[#000000] font-medium underline underline-offset-2 hover:opacity-75">@winter_daniil</a>
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#efefef] flex items-center justify-between shrink-0 gap-3">
          <a
            href="/privacy.html"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#000000] underline underline-offset-2 hover:opacity-75"
          >
            <span>Открыть полный документ в новой вкладке</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-1.5 rounded-full bg-[#000000] hover:bg-[#222222] text-[#fafafa] text-[13px] font-semibold transition"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
