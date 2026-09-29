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

// Fetch the real list of available models for this specific API key
async function getSupportedModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
    if (res.ok) {
      const data = await res.json();
      const models: Array<{ name: string; supportedGenerationMethods?: string[] }> = data.models || [];
      
      const contentModels = models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));

      // Sort priority: flash / flash-lite first, then pro, avoid embedding/imagen
      contentModels.sort((a, b) => {
        const getScore = (name: string) => {
          if (name.includes('flash-lite')) return 3;
          if (name.includes('flash')) return 2;
          if (name.includes('pro')) return 1;
          return 0;
        };
        return getScore(b) - getScore(a);
      });

      if (contentModels.length > 0) {
        console.log('Discovered supported Gemini models:', contentModels);
        return contentModels;
      }
    }
  } catch (e) {
    console.warn('Failed to dynamically query models:', e);
  }

  // Fallback defaults
  return ['gemini-3.8-flash', 'gemini-3.8-flash-lite', 'gemini-3.8-pro'];
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
      temperature: 0.7,
      responseMimeType: 'application/json'
    }
  };

  // Get models dynamically registered in this user's Google AI Studio project
  const candidateModels = await getSupportedModels(apiKey);
  let lastErrorMsg = '';

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

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

  throw new Error(`Все доступные модели Gemini сейчас перегружены: ${lastErrorMsg}. Нажмите кнопку ещё раз через пару секунд.`);
}
