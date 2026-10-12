import type { OffenseAnalysis } from '../types';
import { SYSTEM_PROMPT } from './prompt';
import { checkContentModeration } from './moderation';

export const GEMINI_STORAGE_KEY = 'offended_ai_gemini_key';

export function hasServerApiKey(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
}

export function getSavedApiKey(): string {
  return localStorage.getItem(GEMINI_STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function saveApiKey(key: string): void {
  if (key) {
    localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  }
}

let cachedDiscoveredModels: string[] | null = null;
const WORKING_MODEL_STORAGE_KEY = 'offended_ai_working_model';

function getSavedWorkingModel(): string {
  try {
    return sessionStorage.getItem(WORKING_MODEL_STORAGE_KEY) || localStorage.getItem(WORKING_MODEL_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function saveWorkingModel(model: string): void {
  try {
    if (model) {
      sessionStorage.setItem(WORKING_MODEL_STORAGE_KEY, model);
      localStorage.setItem(WORKING_MODEL_STORAGE_KEY, model);
    }
  } catch {}
}

function prioritizeModel(models: string[], preferred: string): string[] {
  if (!preferred || !models.includes(preferred)) return models;
  return [preferred, ...models.filter(m => m !== preferred)];
}

// Fetch the real list of available models for this specific API key
async function getSupportedModels(apiKey: string): Promise<string[]> {
  const preferred = getSavedWorkingModel();

  if (cachedDiscoveredModels && cachedDiscoveredModels.length > 0) {
    return prioritizeModel(cachedDiscoveredModels, preferred);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const models: Array<{ name: string; supportedGenerationMethods?: string[] }> = data.models || [];
      
      const contentModels = models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''))
        .filter(m => !m.includes('embedding') && !m.includes('imagen') && !m.includes('aqa'));

      // Sort priority:
      // Tier 1: Gemini 1.5 Flash (Proven speed ~10-20s, sharp vision OCR & witty sarcasm)
      // Tier 2: Gemini 2.0 Flash (Next-gen fast multimodal model)
      // Tier 3: Gemini 1.5 Pro / 2.5 Pro (Deep literary copywriting)
      // Bottom: thinking / lite / 8b kept at the very end as safety net
      contentModels.sort((a, b) => {
        const getScore = (name: string) => {
          // Thinking models spend 30-40s in reasoning tokens; keep as deep safety net
          if (name.includes('thinking')) return 10;
          // Avoid lite/8b as primary because of inferior OCR on stylized/cursive fonts
          if (name.includes('flash-lite')) return 15;
          if (name.includes('8b')) return 12;

          // Tier 1: Gemini 1.5 Flash (The proven workhorse: ~15-25s, sharp OCR, great humor)
          if (name === 'gemini-1.5-flash') return 100;
          if (name.includes('1.5-flash')) return 95;

          // Tier 2: Gemini 2.0 Flash
          if (name === 'gemini-2.0-flash') return 90;
          if (name.includes('2.0-flash')) return 85;

          // Tier 3: Gemini 1.5 Pro / 2.5 Pro (Deep literary copywriting)
          if (name === 'gemini-1.5-pro') return 80;
          if (name.includes('pro')) return 75;

          return 30;
        };
        return getScore(b) - getScore(a);
      });

      if (contentModels.length > 0) {
        cachedDiscoveredModels = contentModels;
        console.log('Discovered supported Gemini models (prioritized for quality & speed):', contentModels);
        return prioritizeModel(contentModels, preferred);
      }
    }
  } catch (e) {
    console.warn('Failed to dynamically query models:', e);
  }

  // Fallback defaults with safe tiering:
  // Proven fast 1.5 Flash first, 2.0 Flash second, literary Pro third
  const defaults = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ];
  return prioritizeModel(defaults, preferred);
}

export async function analyzeAdWithGemini(
  imageDataUrl: string | null,
  contextText: string,
  apiKey: string
): Promise<OffenseAnalysis> {
  // 1. Быстрая проверка текста на политику и чернуху на стороне клиента
  const moderationCheck = checkContentModeration(contextText);
  if (!moderationCheck.isAllowed) {
    throw new Error(moderationCheck.errorReason);
  }

  const cleanKey = apiKey?.trim();
  if (!cleanKey) {
    throw new Error('Сервис временно недоступен: серверный ключ API не настроен. Попробуйте позже или выберите готовый пример из ленты скандалов.');
  }

  const parts: Array<any> = [];

  if (imageDataUrl && imageDataUrl.startsWith('data:')) {
    const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const base64Data = match[2];
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }
  }

  parts.push({
    text: `${SYSTEM_PROMPT}\n\n${imageDataUrl ? 'ВНИМАНИЕ: К запросу прикреплено изображение рекламы/креатива. Внимательно проведи OCR всех надписей, прочитай рукописные и стилизованные шрифты на банках/упаковках, текст публикации и эмодзи, улови двусмысленности и игру слов перед формированием ответа.\n\n' : ''}КОНТЕКСТ РЕКЛАМЫ / БРЕНД / СЛОГАН:\n${contextText || 'Специальный контекст не указан, проанализируй всё визуальное содержимое самостоятельно.'}`
  });

  const payload = {
    contents: [
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      temperature: 0.85,
      responseMimeType: 'application/json'
    }
  };

  // Get models dynamically registered in this user's Google AI Studio project
  const candidateModels = await getSupportedModels(apiKey);

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const timerLabel = `[Gemini] ${model}`;

    try {
      console.log(`[Gemini] Attempting generation with model: ${model}`);
      console.time(timerLabel);

      const controller = new AbortController();
      // 25 second timeout per model attempt to prevent long hangs on overloaded models
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.timeEnd(timerLabel);

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const msg = errData?.error?.message || `HTTP ${response.status}`;

        if (response.status === 400 && msg.includes('API_KEY_INVALID')) {
          throw new Error('Указан недействительный API-ключ Gemini. Проверьте ключ в Google AI Studio.');
        }

        if (response.status === 400 && (msg.includes('location is not supported') || msg.includes('FAILED_PRECONDITION'))) {
          throw new Error('VPN_LOCATION_BLOCKED');
        }

        console.warn(`Model ${model} returned error: ${msg}. Trying next available model...`);
        continue;
      }

      const result = await response.json();
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        continue;
      }

      // Parse JSON
      const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      const parsed: any = JSON.parse(cleaned);

      // Проверка на отказ модерации от ИИ (если на картинке была политика/чернуха)
      if (parsed.rejected) {
        throw new Error(parsed.rejectionReason || 'Контент отклонён модерацией сервиса: политика и шок-контент строго запрещены.');
      }

      if (!parsed.brandOrTitle || !parsed.toxicityScore) {
        continue;
      }

      // Save known working model so subsequent queries hit it immediately
      saveWorkingModel(model);
      console.log(`[Gemini] Successfully generated verdict with model: ${model}`);

      return parsed as OffenseAnalysis;
    } catch (err: any) {
      try { console.timeEnd(timerLabel); } catch {}

      if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('VPN_LOCATION_BLOCKED') || err.message?.includes('строго запрещена') || err.message?.includes('строго запрещены') || err.message?.includes('отклонён модерацией')) {
        throw err;
      }
      console.warn(`Error on model ${model}:`, err);
      continue;
    }
  }

  throw new Error('Нажмите на кнопку ещё раз через пару секунд.');
}
