import { describe, it, expect } from 'vitest';
import { sanitizeProfileSettings, isSafeRedirect } from '../utils/security';
import { AccessibilityProfileSettings } from '../types';

describe('security: sanitizeProfileSettings', () => {
  it('should only permit defined keys and properly coerce their types', () => {
    // Generate a dummy object that has every possible key in AccessibilityProfileSettings,
    // plus some malicious keys.
    const maliciousSettings = {
      textSize: 250, // Above bound
      dyslexiaFont: 'true', // Invalid type
      legibleFont: true, // Valid
      highlightLinks: 1, // Invalid type
      highlightHeaders: false, // Valid
      textMagnifier: true,
      contrast: 'invalid-contrast', // Invalid enum
      saturation: 'mono', // Valid enum
      lineHeight: 5, // Above bound
      letterSpacing: -2, // Below bound
      wordSpacing: 1.5, // Should be floored
      readingRuler: true,
      readingMaskType: 'circle',
      focusRing: true,
      pauseAnimations: true,
      hideImages: false,
      muteMedia: true,
      dictionaryMode: false,
      screenReader: true,
      voiceControl: true,
      maliciousPayload: '<script>alert(1)</script>', // Should be stripped
      __proto__: { polluter: true } // Should be stripped
    };

    const sanitized = sanitizeProfileSettings(maliciousSettings);

    // Assert strictly bounded numbers
    expect(sanitized.textSize).toBe(200); // Clamped from 250 to 200
    expect(sanitized.lineHeight).toBe(3); // Clamped from 5 to 3
    expect(sanitized.letterSpacing).toBe(0); // Clamped from -2 to 0
    expect(sanitized.wordSpacing).toBe(1); // Floored from 1.5 to 1

    // Assert booleans
    expect(sanitized.dyslexiaFont).toBeUndefined(); // Was string
    expect(sanitized.legibleFont).toBe(true);
    expect(sanitized.highlightLinks).toBeUndefined(); // Was number
    expect(sanitized.highlightHeaders).toBe(false);

    // Assert enums
    expect(sanitized.contrast).toBeUndefined(); // Was invalid
    expect(sanitized.saturation).toBe('mono');
    expect(sanitized.readingMaskType).toBe('circle');

    // Assert malicious keys are stripped
    expect((sanitized as any).maliciousPayload).toBeUndefined();
    expect((sanitized as any).polluter).toBeUndefined();
  });

  it('should verify all keys from AccessibilityProfileSettings are covered', () => {
    // This test ensures that if a developer adds a new key to AccessibilityProfileSettings,
    // they don't forget to handle it in sanitizeProfileSettings.
    
    // We can't automatically reflect types at runtime, but we can check an exhaustive dummy object
    const exhaustiveDummy: Required<AccessibilityProfileSettings> = {
      textSize: 100,
      dyslexiaFont: true,
      legibleFont: true,
      highlightLinks: true,
      highlightHeaders: true,
      textMagnifier: true,
      contrast: 'invert',
      saturation: 'mono',
      lineHeight: 1,
      letterSpacing: 1,
      wordSpacing: 1,
      readingRuler: true,
      readingMaskType: 'tint',
      focusRing: true,
      pauseAnimations: true,
      hideImages: true,
      muteMedia: true,
      dictionaryMode: true,
      screenReader: true,
      voiceControl: true
    };

    const sanitized = sanitizeProfileSettings(exhaustiveDummy);
    
    // Ensure the sanitized output has all the keys that the exhaustive dummy has
    const dummyKeys = Object.keys(exhaustiveDummy).sort();
    const sanitizedKeys = Object.keys(sanitized).sort();
    
    expect(sanitizedKeys).toEqual(dummyKeys);
  });
});

describe('security: isSafeRedirect', () => {
  it('should allow standard relative paths', () => {
    expect(isSafeRedirect('/about')).toBe(true);
    expect(isSafeRedirect('/settings/profile')).toBe(true);
    expect(isSafeRedirect('#section-1')).toBe(true);
    expect(isSafeRedirect('?query=test')).toBe(true);
  });

  it('should block protocol-relative Open Redirect (//attacker.com)', () => {
    expect(isSafeRedirect('//attacker.com')).toBe(false);
    expect(isSafeRedirect('//evil.com/steal')).toBe(false);
  });

  it('should block backslash Open Redirect (/\\\\attacker.com)', () => {
    expect(isSafeRedirect('/\\attacker.com')).toBe(false);
  });

  it('should block encoded and obfuscated bypass attempts', () => {
    expect(isSafeRedirect('/%2F%2Fattacker.com')).toBe(false);
    expect(isSafeRedirect('/%5C%5Cattacker.com')).toBe(false);
    expect(isSafeRedirect('   //attacker.com')).toBe(false);
    expect(isSafeRedirect('\x00//attacker.com')).toBe(false);
  });

  it('should block empty and non-string inputs', () => {
    expect(isSafeRedirect('')).toBe(false);
    expect(isSafeRedirect(null as any)).toBe(false);
    expect(isSafeRedirect(undefined as any)).toBe(false);
  });

  it('should allow same-origin absolute URLs', () => {
    // jsdom sets window.location.origin to 'http://localhost:3000' or similar
    const sameOriginUrl = `${window.location.origin}/dashboard`;
    expect(isSafeRedirect(sameOriginUrl)).toBe(true);
  });

  it('should block cross-origin absolute URLs', () => {
    expect(isSafeRedirect('https://evil.com/steal')).toBe(false);
    expect(isSafeRedirect('http://attacker.io/')).toBe(false);
  });

  it('should block javascript: and data: protocol attempts', () => {
    expect(isSafeRedirect('javascript:alert(1)')).toBe(false);
    expect(isSafeRedirect('data:text/html,<script>alert(1)</script>')).toBe(false);
  });
});
