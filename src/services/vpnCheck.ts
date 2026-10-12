import { getSavedApiKey } from './gemini';

export interface VpnCheckResult {
  isBlocked: boolean;
  reason?: 'ru_ip' | 'gemini_location_blocked' | 'network_error';
  country?: string;
  incidentId: string;
}

export function generateIncidentId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 18; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `fab_vpn_${year}${month}${day}${hours}${mins}${secs}_01${rand}`;
}

/**
 * Checks whether the user is located in Russia/Belarus or blocked by Google Gemini's regional restrictions.
 */
export async function checkVpnStatus(): Promise<VpnCheckResult> {
  const incidentId = generateIncidentId();

  // 1. Direct Canary check: If we have an API key, check directly with Google Gemini
  const apiKey = getSavedApiKey();
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        if (
          bodyText.includes('location is not supported') ||
          (res.status === 400 && bodyText.includes('FAILED_PRECONDITION'))
        ) {
          return { isBlocked: true, reason: 'gemini_location_blocked', incidentId };
        }
      } else {
        // Successfully connected to Google Gemini! No VPN block
        return { isBlocked: false, incidentId };
      }
    } catch (e) {
      console.warn('Canary Gemini check failed or timed out:', e);
    }
  }

  // 2. Fast GeoIP check via Cloudflare edge (country.is)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://api.country.is', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const country = data?.country?.toUpperCase();
      if (country === 'RU' || country === 'BY') {
        return { isBlocked: true, reason: 'ru_ip', country, incidentId };
      }
      return { isBlocked: false, country, incidentId };
    }
  } catch (e) {
    console.warn('Primary GeoIP check failed:', e);
  }

  // Fallback GeoIP check (ipwhois.app)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://ipwhois.app/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const countryCode = data?.country_code?.toUpperCase();
      if (countryCode === 'RU' || countryCode === 'BY') {
        return { isBlocked: true, reason: 'ru_ip', country: countryCode, incidentId };
      }
      return { isBlocked: false, country: countryCode, incidentId };
    }
  } catch (e) {
    console.warn('Fallback GeoIP check failed:', e);
  }

  return { isBlocked: false, incidentId };
}
