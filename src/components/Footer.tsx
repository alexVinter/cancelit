import { Send, Mail, ArrowUp, TrendingUp } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

interface FooterProps {
  onOpenPrivacy?: () => void;
}

export function Footer({ onOpenPrivacy }: FooterProps = {}) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer-section" className="scroll-mt-16 w-full bg-[#fafafa] text-[#000000] pt-12 pb-14 border-t border-[#efefef]">
      <div className="max-w-[640px] mx-auto px-4">
        
        {/* Creators Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-[20px] font-semibold text-[#000000] tracking-tight mb-1">
            Кто за этим стоит
          </h2>
          <p className="text-[13px] text-[#969696] font-normal max-w-md">
            Если хотите выразить респект или сделать что-то прикольное вместе — пишите нам напрямую.
          </p>
        </div>

        {/* 2 Creators Cards: Даниил Винтер и Алексей Винтер */}
        <div className="space-y-4 mb-8">
          
          {/* Card 1: Даниил Винтер */}
          <div className="rounded-[18px] bg-[#ffffff] border border-[#efefef] p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Threads Profile Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d5d5d5] bg-[#efefef] shrink-0 select-none">
                    <img 
                      src="/avatars/daniil.jpg" 
                      alt="Даниил Винтер" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[15px] text-[#000000] truncate">
                        Даниил Винтер
                      </span>
                      <VerifiedBadge className="w-4 h-4 shrink-0" title="Подтверждённый профиль" />
                    </div>
                    <span className="text-[12px] text-[#969696] block truncate">
                      @winter_daniil
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-[#424242] px-2.5 py-1 rounded-full bg-[#efefef] whitespace-nowrap shrink-0">
                  PR & Идея
                </span>
              </div>

              <p className="text-[13px] text-[#424242] leading-relaxed mb-4">
                Придумал концепт нейросети-ущемленца, отвечает за идею, PR, стресс-тесты креативов и ведёт канал про маркетинг.
              </p>
            </div>

            {/* Contacts Links */}
            <div className="flex items-center gap-2 pt-3 border-t border-[#efefef]">
              <a
                href="https://t.me/winter_daniil"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-[#000000] hover:bg-[#1a1a1a] text-[#fafafa] text-[13px] font-semibold transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
              <a
                href="https://t.me/rezonerw"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#ffffff] hover:bg-[#efefef] text-[#000000] text-[13px] font-semibold border border-[#d5d5d5] transition"
                title="Telegram-канал про маркетинг «Резонёр»"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#000000] shrink-0" />
                <span className="truncate">Канал про маркетинг</span>
              </a>
            </div>
          </div>

          {/* Card 2: Алексей Винтер */}
          <div className="rounded-[18px] bg-[#ffffff] border border-[#efefef] p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Threads Profile Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d5d5d5] bg-[#efefef] shrink-0 select-none">
                    <img 
                      src="/avatars/alexey.jpg" 
                      alt="Алексей Винтер" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[15px] text-[#000000] truncate">
                        Алексей Винтер
                      </span>
                      <VerifiedBadge className="w-4 h-4 shrink-0" title="Подтверждённый профиль" />
                    </div>
                    <span className="text-[12px] text-[#969696] block truncate">
                      @winteryaaa
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-[#424242] px-2.5 py-1 rounded-full bg-[#efefef] whitespace-nowrap shrink-0">
                  Разработка
                </span>
              </div>

              <p className="text-[13px] text-[#424242] leading-relaxed mb-4">
                Воплотил идею в жизнь: полностью спроектировал архитектуру сервиса, настроил интеграцию с нейросетью и разработал этот проект.
              </p>
            </div>

            {/* Contacts Links */}
            <div className="flex items-center gap-2 pt-3 border-t border-[#efefef]">
              <a
                href="https://t.me/winteryaaa"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-[#000000] hover:bg-[#1a1a1a] text-[#fafafa] text-[13px] font-semibold transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
              <a
                href="mailto:aleksejvinter51@yandex.ru"
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-[#ffffff] hover:bg-[#efefef] text-[#000000] text-[13px] font-semibold border border-[#d5d5d5] transition"
                title="aleksejvinter51@yandex.ru"
              >
                <Mail className="w-3.5 h-3.5 text-[#000000]" />
                <span>Email</span>
              </a>
            </div>
          </div>

        </div>

        {/* Partnership Callout Banner */}
        <div className="rounded-[18px] bg-[#ffffff] border border-[#efefef] p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-full bg-[#efefef] flex items-center justify-center text-lg shrink-0">
              🤝
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[#000000]">
                Хотите стать партнёром спецпроекта?
              </div>
              <div className="text-[12px] text-[#969696]">
                Интегрируем ваш бренд в алгоритмы ущемления или сделаем совместный спецпроект.
              </div>
            </div>
          </div>
          <a
            href="https://t.me/winter_daniil"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#000000] hover:bg-[#1a1a1a] text-[#fafafa] text-[13px] font-semibold transition shrink-0 no-underline"
          >
            Написать нам
          </a>
        </div>

        {/* Prominent Satirical & Legal Disclaimer */}
        <div className="rounded-[14px] bg-[#f5f5f5] border border-[#efefef] p-4 text-[12px] text-[#969696] leading-relaxed mb-8">
          <div className="font-semibold text-[#000000] mb-1">
            Дисклеймер & Отказ от ответственности
          </div>
          <p>
            Спецпроект «Ущемись» носит исключительно развлекательный, пародийный и сатирический характер. Все вердикты, оценки токсичности, поводы для ущемления, цитаты и вымышленные комментарии создаются искусственным интеллектом в автоматическом режиме. Контент может содержать иронию, сарказм или намеренно абсурдные провокации. Авторы и разработчики проекта не несут ответственности за то, что генерирует нейросеть по запросам пользователей, не разделяют сгенерированные мнения и не преследуют цели оскорбить чьи-либо чувства, группы или бренды.
          </p>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-4 border-t border-[#efefef] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[12px] text-[#969696]">
          <div className="leading-snug">
            <div>
              © 2026 Ущемись • Все совпадения с реальными скандалами намеренны и служат целям самоиронии.
            </div>
            <div className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-[11px]">
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-[#969696] hover:text-[#000000] underline cursor-pointer bg-transparent border-0 p-0"
              >
                Политика конфиденциальности и куки
              </button>
              <span>•</span>
              <a
                href="/privacy.html"
                target="_blank"
                rel="noreferrer"
                className="text-[#969696] hover:text-[#000000] underline"
              >
                Документ 152-ФЗ
              </a>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[#efefef] text-[#000000] text-[12px] font-semibold transition"
          >
            <span>Наверх</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
