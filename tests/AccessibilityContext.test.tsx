import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityContext';
import { DEFAULT_TRANSLATIONS } from '../constants/translations';

describe('AccessibilityContext', () => {
  it('should use translated strings for voice navigation confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => false);
    
    // Create a mock translations object
    const customTranslations = {
      ...DEFAULT_TRANSLATIONS,
      confirmNavigationTitle: 'Custom Title',
      confirmNavigationMessage: 'Custom message for {{target}}'
    };

    const mockAiProvider = {
      parseCommand: vi.fn().mockResolvedValue({
        reply: null,
        actions: [{ intent: 'navigate', target: '/test' }]
      })
    };

    const mockVoiceProvider = {
      start: (lang: string, onResult: (r: string) => void) => {
        // immediately trigger result
        setTimeout(() => onResult('navigate to test'), 0);
      },
      stop: vi.fn(),
      abort: vi.fn(),
      isSupported: () => true
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AccessibilityProvider 
        translations={customTranslations} 
        aiProvider={mockAiProvider}
        voiceRecognitionProvider={mockVoiceProvider}
      >
        {children}
      </AccessibilityProvider>
    );

    const { result } = renderHook(() => useAccessibility(), { wrapper });

    act(() => {
      // turn on voice control
      result.current.setVoiceControl(true);
    });

    // Wait for the async aiProvider call and window.confirm
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Custom message for /test');
    });

    confirmSpy.mockRestore();
  });
});
