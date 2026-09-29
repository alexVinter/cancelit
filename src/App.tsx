import { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { Header } from './components/Header';
import { AnalyzerSection } from './components/AnalyzerSection';
import { CancelCard } from './components/CancelCard';
import { Footer } from './components/Footer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CookieBanner } from './components/CookieBanner';
import { PrivacyModal } from './components/PrivacyModal';
import type { OffenseAnalysis, PresetCase } from './types';
import { analyzeAdWithGemini, getSavedApiKey, hasServerApiKey } from './services/gemini';
import { checkContentModeration } from './services/moderation';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [currentPage, setCurrentPage] = useState<'welcome' | 'app'>('welcome');
  const [apiKey, setApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [contextText, setContextText] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<OffenseAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'cases' | 'contacts'>('feed');

  // Sync hash routing and saved API key
  useEffect(() => {
    const key = getSavedApiKey();
    if (key) setApiKey(key);

    const updateRoute = () => {
      const hash = window.location.hash;
      if (hash === '#check' || hash === '#app' || hash === '#feed-container') {
        setCurrentPage('app');
        setActiveTab('feed');
      } else if (hash === '#presets-block' || hash === '#cases') {
        setCurrentPage('app');
        setActiveTab('cases');
      } else if (hash === '#footer-section' || hash === '#contacts') {
        setCurrentPage('app');
        setActiveTab('contacts');
        setTimeout(() => {
          const el = document.getElementById('footer-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === '#privacy' || hash === '#cookies') {
        setIsPrivacyOpen(true);
      } else if (!hash) {
        setCurrentPage('welcome');
      }
    };

    updateRoute();
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  const goToApp = () => {
    setCurrentPage('app');
    setActiveTab('feed');
    window.location.hash = '#check';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPresets = () => {
    setCurrentPage('app');
    setActiveTab('cases');
    window.location.hash = '#presets-block';
    setTimeout(() => {
      const el = document.getElementById('presets-block');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const goToWelcome = () => {
    setCurrentPage('welcome');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFeed = () => {
    setActiveTab('feed');
    window.location.hash = '#check';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCases = () => {
    setActiveTab('cases');
    window.location.hash = '#presets-block';
    const el = document.getElementById('presets-block');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToContacts = () => {
    setActiveTab('contacts');
    window.location.hash = '#footer-section';
    const el = document.getElementById('footer-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectPreset = (preset: PresetCase) => {
    setSelectedPresetId(preset.id);
    setImagePreview(preset.image);
    setContextText(preset.title);
    setAnalysis(preset.analysis);
    setErrorMessage(null);
    
    // Smooth scroll down to result card
    setTimeout(() => {
      const el = document.getElementById('result-card-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
  };

  const handleSubmit = async () => {
    if (selectedPresetId) return;

    // Быстрая проверка на ссылки и модерацию на клиенте
    const moderationCheck = checkContentModeration(contextText);
    if (!moderationCheck.isAllowed) {
      setErrorMessage(moderationCheck.errorReason || 'По ссылкам не ходим. Закинь картинку или текст креатива');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAnalysis(null);

    try {
      const result = await analyzeAdWithGemini(imagePreview, contextText, apiKey);
      setAnalysis(result);
      
      setTimeout(() => {
        const el = document.getElementById('result-card-container');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 120);
    } catch (error: any) {
      setErrorMessage(error.message || 'Ошибка при анализе');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setContextText('');
    setSelectedPresetId(null);
    setAnalysis(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`w-full text-[#000000] font-sans selection:bg-[#efefef] selection:text-[#000000] ${
      currentPage === 'welcome' ? 'min-h-screen bg-[#fafafa]' : 'min-h-screen bg-[#fafafa] flex flex-col'
    }`}>
      
      {/* PAGE 1: WELCOME SCREEN (Standalone Hero) */}
      {currentPage === 'welcome' && (
        <div className="animate-fade-in w-full min-h-screen flex flex-col bg-[#fafafa]">
          <HeroSection 
            onStartClick={goToApp}
            onPresetsClick={goToPresets}
            onOpenSettings={() => setIsSettingsOpen(true)}
            hasCustomKey={!!apiKey}
          />
        </div>
      )}

      {/* PAGE 2: FUNCTIONAL APP / ANALYZER SCREEN */}
      {currentPage === 'app' && (
        <div className="animate-fade-in flex-1 flex flex-col w-full bg-[#fafafa]">
          {/* Top Sticky App Header */}
          <Header
            hasCustomKey={!!apiKey}
            hasServerKey={hasServerApiKey()}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onGoHome={goToWelcome}
            onScrollToFeed={scrollToFeed}
            onScrollToCases={scrollToCases}
            onScrollToContacts={scrollToContacts}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="flex-1 w-full flex flex-col items-center">
            {/* Error notification if API failed */}
            {errorMessage && (
              <div className="w-full max-w-[640px] px-4 mt-4">
                <div className="w-full bg-[#ffffff] border border-[#efefef] rounded-[18px] p-4 flex items-start gap-3 shadow-[0_0_12px_rgba(0,0,0,0.03)] animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-[#385898] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[14px] font-semibold text-[#000000]">Не удалось завершить ущемление</strong>
                    <span className="text-[13px] text-[#424242] leading-relaxed">{errorMessage}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Analyzer: Threads Composer + Feed Cases */}
            <AnalyzerSection
              imagePreview={imagePreview}
              contextText={contextText}
              isLoading={isLoading}
              selectedPresetId={selectedPresetId}
              hasApiKey={!!apiKey}
              onImageChange={(img) => {
                setImagePreview(img);
                setSelectedPresetId(null);
                setAnalysis(null);
              }}
              onContextChange={(txt) => {
                setContextText(txt);
                setSelectedPresetId(null);
              }}
              onSubmit={handleSubmit}
              onSelectPreset={handleSelectPreset}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Cancel Card Result (appears when analysis is ready) */}
            {analysis && (
              <div id="result-card-container" className="w-full max-w-[640px] px-4 pb-8 scroll-mt-20">
                <CancelCard
                  analysis={analysis}
                  imageSrc={imagePreview}
                  onReset={handleReset}
                />
              </div>
            )}
          </main>

          {/* Footer: Контакты Алексея Винтера и его брата Даниила */}
          <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />
        </div>
      )}

      {/* Settings Modal for Gemini Key */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentKey={apiKey}
        onKeySaved={(newKey) => setApiKey(newKey)}
      />

      {/* Cookie Banner (Aviasales-style) */}
      <CookieBanner onOpenPrivacy={() => setIsPrivacyOpen(true)} />

      {/* Privacy Policy & Cookie Information Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}

export default App;
