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

// Prioritized fast multimodal models in Google AI Studio
const FAST_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.0-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

let cachedWorkingModel: string = localStorage.getItem('offended_ai_working_model') || '';
let cachedDiscoveredModels: string[] | null = null;

// Dynamic query to find all supported models for this specific API key
async function getDynamicModels(apiKey: string): Promise<string[]> {
  if (cachedDiscoveredModels && cachedDiscoveredModels.length > 0) {
    return cachedDiscoveredModels;
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
        .filter(m => !m.includes('embedding') && !m.includes('aqa') && !m.includes('imagen') && !m.includes('legacy'));

      contentModels.sort((a, b) => {
        const getScore = (name: string) => {
          let score = 0;
          if (name.includes('3.5')) score += 100;
          else if (name.includes('3.0')) score += 80;
          else if (name.includes('2.5')) score += 60;
          else if (name.includes('2.0')) score += 40;
          else if (name.includes('1.5')) score += 20;

          if (name.includes('flash-lite')) score += 15;
          else if (name.includes('flash')) score += 10;
          else if (name.includes('pro')) score += 2;
          return score;
        };
        return getScore(b) - getScore(a);
      });

      if (contentModels.length > 0) {
        cachedDiscoveredModels = contentModels;
        return contentModels;
      }
    }
  } catch (e) {
    console.warn('Failed to dynamically query models:', e);
  }
  return FAST_MODELS;
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

  const parts: Array<any> = [
    {
      text: `${SYSTEM_PROMPT}\n\nКОНТЕКСТ РЕКЛАМЫ / БРЕНД / СЛОГАН:\n${contextText || 'Специальный контекст не указан, проанализируй всё визуальное содержимое самостоятельно.'}`
    }
  ];

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

  const payload = {
    contents: [
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json'
    }
  };

  // Build candidate models:
  // 1. If we already know the working model from previous success, try it first!
  const candidateModels: string[] = [];
  if (cachedWorkingModel) {
    candidateModels.push(cachedWorkingModel);
  } else {
    // On the first run, discover the exact models supported by this API key
    const dynamic = await getDynamicModels(apiKey);
    for (const m of dynamic) {
      if (!candidateModels.includes(m)) {
        candidateModels.push(m);
      }
    }
  }

  // Also append FAST_MODELS as backup
  for (const m of FAST_MODELS) {
    if (!candidateModels.includes(m)) {
      candidateModels.push(m);
    }
  }

  let lastErrorMsg = '';

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const msg = errData?.error?.message || `HTTP ${response.status}`;

        if (response.status === 400 && msg.includes('API_KEY_INVALID')) {
          throw new Error('Указан недействительный API-ключ Gemini. Проверьте ключ в Google AI Studio.');
        }

        console.warn(`Model ${model} returned error: ${msg}. Trying next available model...`);
        lastErrorMsg = msg;
        continue;
      }

      const result = await response.json();
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        lastErrorMsg = 'Модель вернула пустой ответ';
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
        lastErrorMsg = 'Некорректный формат ответа';
        continue;
      }

      cachedWorkingModel = model;
      localStorage.setItem('offended_ai_working_model', model);
      return parsed as OffenseAnalysis;
    } catch (err: any) {
      if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('строго запрещена') || err.message?.includes('строго запрещены') || err.message?.includes('отклонён модерацией')) {
        throw err;
      }
      lastErrorMsg = err.message || 'Ошибка сети';
      console.warn(`Error on model ${model}:`, err);
      continue;
    }
  }

  // Fallback: try dynamic query if fast models were exhausted
  const dynamicModels = await getDynamicModels(apiKey);
  for (const model of dynamicModels) {
    if (candidateModels.includes(model)) continue;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) continue;
      const result = await response.json();
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;
      const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      const parsed: any = JSON.parse(cleaned);
      if (parsed.brandOrTitle && parsed.toxicityScore) {
        cachedWorkingModel = model;
        return parsed as OffenseAnalysis;
      }
    } catch {
      continue;
    }
  }

  throw new Error(`Все доступные модели Gemini сейчас перегружены: ${lastErrorMsg}. Нажмите кнопку ещё раз через пару секунд.`);
}
