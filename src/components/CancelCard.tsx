import { useRef, useState } from 'react';
import type { OffenseAnalysis } from '../types';
import { 
  Download, 
  Copy, 
  Check, 
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { VerifiedBadge } from './VerifiedBadge';

interface CancelCardProps {
  analysis: OffenseAnalysis;
  imageSrc: string | null;
  onReset: () => void;
}

const DIVERSE_FALLBACK_PERSONAS = [
  { handle: 'urban_drama', name: 'Осознанный урбанист' },
  { handle: 'kerning_police', name: 'Защитница шрифтов' },
  { handle: 'eco_fury', name: 'Веган на электросамокате' },
  { handle: 'burnout_senior', name: 'Senior Душнила' },
  { handle: 'cringe_hunter', name: 'Инспектор микроагрессий' },
  { handle: 'drain_zoomer', name: 'Травмированный зумер' },
  { handle: 'avocado_snob', name: 'Эстетический критик' },
  { handle: 'toxic_positivity', name: 'Коуч по выгоранию' },
  { handle: 'threads_tribunal', name: 'Палата нравов' },
  { handle: 'gaslight_detector', name: 'Психотерапевт из Тредса' },
  { handle: 'minimalism_victim', name: 'Жертва редизайна' },
  { handle: 'prana_warrior', name: 'Адепт осознанности' },
  { handle: 'kpi_destroyer', name: 'Бывший директор по счастью' },
  { handle: 'gluten_intolerant', name: 'Безглютеновый борец' }
];

function resolveAuthorIdentity(analysis: OffenseAnalysis) {
  let rawHandle = (analysis.fakeTweet?.handle || '').replace(/^@/, '').trim();
  let rawName = (analysis.fakeTweet?.author || '').trim();
  let rawAvatar = (analysis.fakeTweet?.avatar || '').trim();

  // If handle is missing, default, or the old repeated moral_watchdog
  if (!rawHandle || rawHandle.toLowerCase() === 'moral_watchdog') {
    const seedStr = (analysis.brandOrTitle || 'persona') + (analysis.outrageSummary || '');
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const persona = DIVERSE_FALLBACK_PERSONAS[Math.abs(hash) % DIVERSE_FALLBACK_PERSONAS.length];
    rawHandle = persona.handle;
    if (!rawName || rawName.toLowerCase() === 'палата нравов' || rawName.toLowerCase() === 'ник автора треда') {
      rawName = persona.name;
    }
  }

  if (!rawName || rawName.toLowerCase() === 'ник автора треда') {
    rawName = 'Палата нравов';
  }

  // Diverse avatar styles: notionists (minimalist hand-drawn), lorelei (modern character), avataaars (classic cartoon)
  const avatarStyles = ['notionists', 'lorelei', 'avataaars'];
  let seedNum = 0;
  for (let i = 0; i < rawHandle.length; i++) {
    seedNum = (seedNum << 5) - seedNum + rawHandle.charCodeAt(i);
    seedNum |= 0;
  }
  const chosenStyle = avatarStyles[Math.abs(seedNum) % avatarStyles.length];

  // If avatar is missing, or is the old robot bottts with seed=offended
  if (!rawAvatar || rawAvatar.includes('bottts') || rawAvatar.includes('seed=offended')) {
    rawAvatar = `https://api.dicebear.com/7.x/${chosenStyle}/svg?seed=${encodeURIComponent(rawHandle)}`;
  }

  return { authorHandle: rawHandle, authorName: rawName, authorAvatar: rawAvatar };
}

export function CancelCard({ analysis, imageSrc, onReset }: CancelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(() => {
    const raw = analysis.fakeTweet?.likes || '142K';
    return raw;
  });

  const { authorName, authorHandle, authorAvatar } = resolveAuthorIdentity(analysis);

  const handleLikeToggle = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => {
        const num = parseInt(prev.replace(/[^\d]/g, ''), 10);
        if (!isNaN(num)) {
          return `${num + 1}K`;
        }
        return `${prev} + 1`;
      });
    } else {
      setLiked(false);
      setLikesCount(analysis.fakeTweet?.likes || '142K');
    }
  };

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#fafafa',
        cacheBust: true,
      });

      const cleanName = (analysis.brandOrTitle || 'threads-post').replace(/[^a-zA-Z0-9а-яА-Я]/g, '_').toLowerCase();
      const link = document.createElement('a');
      link.download = `threads-${cleanName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert('Не удалось сохранить картинку. Пожалуйста, сделайте обычный скриншот.');
    } finally {
      setDownloading(false);
    }
  };

  // The actual single, punchy Threads post without quotes or boilerplate
  const rawPostText = analysis.fakeTweet?.text || analysis.outrageSummary || '';
  const postText = rawPostText.replace(/^«\s*|\s*»$/g, '').trim();

  const handleCopyText = async () => {
    const text = `🚨 ВЕРДИКТ В THREADS: ${analysis.brandOrTitle}\n\n💬 @${authorHandle}: ${postText}\n\nИндекс токсичности: ${analysis.toxicityScore}%\nСтатус: ${analysis.statusStamp}\n💡 Совет маркетологу: ${analysis.marketerAdvice || ''}\n\nПроверено в @Ущемись`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto my-4 flex flex-col gap-4 animate-fade-in text-[#000000]">
      
      {/* Top action bar: Pill controls */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-[#fafafa] border border-[#efefef] rounded-full shadow-[0_0_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#000000] animate-pulse" />
          <span className="text-[13px] font-semibold text-[#000000]">
            Пост с вердиктом готов
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyText}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffffff] hover:bg-[#efefef] border border-[#d5d5d5] rounded-full text-xs font-semibold text-[#000000] transition active:scale-95"
            title="Скопировать текст"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#385898]" /> : <Copy className="w-3.5 h-3.5 text-[#424242]" />}
            <span>{copied ? 'Скопировано!' : 'Скопировать'}</span>
          </button>

          <button 
            onClick={handleDownloadPng}
            disabled={downloading}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#000000] hover:bg-[#222222] text-[#fafafa] rounded-full text-xs font-semibold transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Экспорт...' : 'Скачать PNG'}</span>
          </button>
        </div>
      </div>

      {/* 1. THE PURE AUTHENTIC THREADS POST CARD */}
      <div 
        ref={cardRef} 
        className="bg-[#fafafa] border border-[#d5d5d5] rounded-[18px] p-4 sm:p-5 text-[#000000] shadow-[0_0_12px_rgba(0,0,0,0.04)]"
      >
        {/* Post Header: Avatar + Username + Meta Blue Badge + Timestamp + More Menu */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* 40px Circular Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#efefef] border border-[#d5d5d5] shrink-0 flex items-center justify-center">
              <img 
                src={authorAvatar} 
                alt={authorName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Username & Metadata */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[15px] leading-tight text-[#000000]">
                  {authorHandle}
                </span>
                <VerifiedBadge className="w-3.5 h-3.5 shrink-0" title="Подтверждённый аккаунт" />
                <span className="text-[13px] text-[#969696] font-normal">
                  · 4 мин.
                </span>
              </div>
              <span className="text-[12px] text-[#969696] font-normal leading-none mt-0.5">
                {authorName}
              </span>
            </div>
          </div>

          {/* Right: Three Dots Menu */}
          <button className="cursor-pointer text-[#969696] hover:text-[#000000] p-1 rounded-full hover:bg-[#efefef] transition">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Post Text: The Scathing Viral Take */}
        <div className="space-y-3 mb-3 pl-0 sm:pl-[52px]">
          {/* The Viral Post Take */}
          <p className="text-[15px] leading-[1.4] text-[#000000] font-normal whitespace-pre-line">
            {postText}
          </p>

          {/* Media / Ad Preview Container */}
          {imageSrc ? (
            <div className="w-full rounded-[8px] border border-[#d5d5d5] bg-[#ffffff] overflow-hidden max-h-[360px] flex items-center justify-center my-2">
              <img 
                src={imageSrc} 
                alt="Рекламный креатив" 
                className="w-full h-full object-contain max-h-[360px]"
              />
            </div>
          ) : (
            <div className="rounded-[8px] border border-[#d5d5d5] p-3.5 bg-[#ffffff] border-l-2 border-l-[#000000] my-2">
              <span className="text-[11px] uppercase font-mono tracking-wider text-[#969696] block mb-1">
                Слоган / Текст креатива:
              </span>
              <p className="text-[14px] font-medium text-[#000000] italic">
                «{analysis.brandOrTitle}»
              </p>
            </div>
          )}
        </div>

        {/* Post Engagement Bar: 4 Line Icons + Counts */}
        <div className="pt-3 border-t border-[#efefef] flex items-center justify-between pl-0 sm:pl-[52px]">
          <div className="flex items-center gap-4 text-[#969696]">
            {/* Heart / Like */}
            <button 
              onClick={handleLikeToggle}
              className={`cursor-pointer inline-flex items-center gap-1.5 transition active:scale-90 ${
                liked ? 'text-[#e50010]' : 'hover:text-[#000000]'
              }`}
              title="Нравится"
            >
              <Heart className={`w-4 h-4 stroke-[1.75] ${liked ? 'fill-[#e50010]' : ''}`} />
              <span className="text-[13px] font-normal text-[#424242]">{likesCount}</span>
            </button>

            {/* Comment */}
            <button className="cursor-pointer inline-flex items-center gap-1.5 hover:text-[#000000] transition" title="Ответить">
              <MessageCircle className="w-4 h-4 stroke-[1.75]" />
              <span className="text-[13px] font-normal text-[#424242]">
                {analysis.fakeTweet?.retweets || '3.2K'}
              </span>
            </button>

            {/* Repost */}
            <button className="cursor-pointer inline-flex items-center gap-1.5 hover:text-[#000000] transition" title="Репост">
              <Repeat2 className="w-4 h-4 stroke-[1.75]" />
              <span className="text-[13px] font-normal text-[#424242]">18.4K</span>
            </button>

            {/* Share */}
            <button 
              onClick={handleCopyText} 
              className="cursor-pointer inline-flex items-center gap-1.5 hover:text-[#000000] transition" 
              title="Поделиться"
            >
              <Send className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          <div className="text-[11px] font-normal text-[#969696]">
            @Ущемись
          </div>
        </div>

      </div>

      {/* 2. SEPARATE ANALYSIS BLOCK («ТОТАЛЬНАЯ ОТМЕНА») */}
      <div className="bg-[#ffffff] border border-[#d5d5d5] rounded-[18px] p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] space-y-4">
        
        {/* Header: Status stamp + Toxicity score (No dividing lines between sections) */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#000000]" />
            <span className="text-[14px] font-bold tracking-wide uppercase text-[#000000]">
              {analysis.statusStamp}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efefef] text-[12px] font-semibold text-[#000000]">
            <Flame className="w-3.5 h-3.5 text-[#000000]" />
            <span>{analysis.toxicityScore}% токсичности</span>
          </div>
        </div>

        {/* Content rows without dividing lines */}
        <div className="space-y-3 pt-1 text-[13px]">
          
          {/* Microaggression Trigger */}
          {analysis.microaggressions && analysis.microaggressions.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="font-semibold text-[#969696] sm:w-28 shrink-0">Триггер:</span>
              <div className="text-[#000000] leading-snug">
                <strong>{analysis.microaggressions[0].element}:</strong> {analysis.microaggressions[0].trigger}
              </div>
            </div>
          )}

          {/* Offended Groups */}
          {analysis.offendedGroups && analysis.offendedGroups.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="font-semibold text-[#969696] sm:w-28 shrink-0">Кто обиделся:</span>
              <div className="flex flex-wrap gap-1.5 text-[#000000]">
                {analysis.offendedGroups.map((g, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#efefef] text-[12px]">
                    <span>{g.icon}</span>
                    <span>{g.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Advice to Marketer */}
          {analysis.marketerAdvice && (
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="font-semibold text-[#969696] sm:w-28 shrink-0">Совет:</span>
              <div className="text-[#424242] italic leading-snug">
                {analysis.marketerAdvice}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Action to Start New Thread */}
      <div className="text-center pt-2">
        <button
          onClick={onReset}
          className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-[#ffffff] hover:bg-[#efefef] text-[#000000] border border-[#d5d5d5] rounded-full text-xs font-semibold transition active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Проверить другой креатив</span>
        </button>
      </div>

      {/* Satirical Legal Disclaimer */}
      <div className="max-w-[640px] mx-auto text-center px-4 pt-2">
        <p className="text-[11px] text-[#969696] font-normal leading-relaxed">
          <strong>Дисклеймер:</strong> публикация и вердикт сгенерированы искусственным интеллектом исключительно в сатирических и пародийных целях. Авторы проекта не разделяют сгенерированные суждения и не несут ответственности за контент нейросети.
        </p>
      </div>

    </div>
  );
}
