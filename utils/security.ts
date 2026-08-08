/**
 * Validates a URL to ensure it is safe for redirection.
 * Prevents Open Redirect vulnerabilities by restricting redirects to the same origin.
 * 
 * @param url - The target URL to validate.
 * @returns True if the redirect is safe (same origin or relative path), false otherwise.
 */
export const isSafeRedirect = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Trim and strip control characters
  const cleanUrl = url.trim().replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  if (!cleanUrl) return false;

  try {
    // Decode percent-encoded characters to catch obfuscated bypasses like /%2F%2F
    const decodedUrl = decodeURIComponent(cleanUrl);
    // Strictly reject deceptive relative paths like //attacker.com or /\attacker.com
    if (decodedUrl.startsWith('//') || decodedUrl.startsWith('/\\') || decodedUrl.startsWith('\\\\')) return false;
  } catch {
    // If decodeURIComponent fails, assume it's unsafe malformed input
    return false;
  }

  // Allow standard absolute paths explicitly (e.g. /about)
  if (cleanUrl.startsWith('/')) {
    // Double check it's not a bypassed protocol relative url on the raw clean string
    if (cleanUrl.startsWith('//') || cleanUrl.startsWith('/\\') || cleanUrl.startsWith('\\\\')) return false;
    return true;
  }

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const parsed = new URL(cleanUrl, origin);
    const expectedOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && 
           parsed.origin === expectedOrigin;
  } catch {
    // If it can't be parsed and doesn't start with '/', it's not a safe relative or absolute URL
    return cleanUrl.startsWith('#') || cleanUrl.startsWith('?');
  }
};

import { AccessibilityProfileSettings, Contrast, Saturation, ReadingMaskType } from "../types";

/**
 * Validates and sanitizes Accessibility Profile settings to prevent malicious or broken configurations.
 */
export const sanitizeProfileSettings = (settings: unknown): Partial<AccessibilityProfileSettings> => {
  if (!settings || typeof settings !== 'object') return {};

  const source = settings as Record<string, unknown>;
  const safeSettings = Object.create(null) as Partial<AccessibilityProfileSettings>;

  // Numeric bounds checking (and blocking NaN/Infinity)
  if (Object.prototype.hasOwnProperty.call(source, 'textSize') && typeof source.textSize === 'number' && Number.isFinite(source.textSize)) {
    safeSettings.textSize = Math.min(Math.max(source.textSize, 50), 200); // Between 50% and 200%
  }
  if (Object.prototype.hasOwnProperty.call(source, 'lineHeight') && typeof source.lineHeight === 'number' && Number.isFinite(source.lineHeight)) {
    safeSettings.lineHeight = Math.max(0, Math.min(3, Math.floor(source.lineHeight)));
  }
  if (Object.prototype.hasOwnProperty.call(source, 'letterSpacing') && typeof source.letterSpacing === 'number' && Number.isFinite(source.letterSpacing)) {
    safeSettings.letterSpacing = Math.max(0, Math.min(3, Math.floor(source.letterSpacing)));
  }
  if (Object.prototype.hasOwnProperty.call(source, 'wordSpacing') && typeof source.wordSpacing === 'number' && Number.isFinite(source.wordSpacing)) {
    safeSettings.wordSpacing = Math.max(0, Math.min(3, Math.floor(source.wordSpacing)));
  }

  // Boolean coercions (Whitelist explicitly)
  const booleanKeys: (keyof AccessibilityProfileSettings)[] = [
    'dyslexiaFont', 'legibleFont', 'highlightLinks', 'highlightHeaders', 
    'textMagnifier', 'readingRuler', 'focusRing', 'pauseAnimations', 
    'hideImages', 'muteMedia', 'dictionaryMode', 
    'screenReader', 'voiceControl'
  ];
  booleanKeys.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === 'boolean') {
        (safeSettings as Record<string, unknown>)[key] = source[key];
      }
    }
  });

  // Strict Enum checking
  if (Object.prototype.hasOwnProperty.call(source, 'contrast') && typeof source.contrast === 'string' && ["default", "invert", "light", "yellow-black"].includes(source.contrast)) {
    safeSettings.contrast = source.contrast as Contrast;
  }
  
  if (Object.prototype.hasOwnProperty.call(source, 'saturation') && typeof source.saturation === 'string' && ["default", "mono"].includes(source.saturation)) {
    safeSettings.saturation = source.saturation as Saturation;
  }

  if (Object.prototype.hasOwnProperty.call(source, 'readingMaskType') && typeof source.readingMaskType === 'string' && ["none", "tint", "rect", "circle"].includes(source.readingMaskType)) {
    safeSettings.readingMaskType = source.readingMaskType as ReadingMaskType;
  }

  return safeSettings;
};
