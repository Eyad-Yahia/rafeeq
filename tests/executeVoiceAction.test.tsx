import React, { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityContext';

vi.mock('../utils/dom', () => ({
  getActiveScrollContainer: () => window,
  getPageContext: () => 'context',
  normalizeText: (t: string) => t,
  isExcluded: () => false
}));

describe('executeVoiceAction', () => {
  it('should dispatch scroll intent correctly', async () => {
    // We can just render the provider and test side effects
    // Because scrollBy is on window, we can mock it
    const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => setTimeout(cb, 16)));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id) => clearTimeout(id)));

    let executeVoiceActionRef: any;

    function TestChild() {
      const state = useAccessibility();
      // Wait we don't expose executeVoiceAction. 
      // How does executeVoiceAction get triggered? Through voiceRecognitionProvider onResult.
      return null;
    }

    const wrapper: { cb?: (t: string) => void } = {};
    const fakeVoiceProvider = {
      isSupported: () => true,
      start: (lang: any, onResult: any) => { wrapper.cb = onResult; },
      stop: vi.fn(),
      abort: vi.fn(),
    };
    
    const fakeAiProvider = {
      parseCommand: vi.fn().mockResolvedValue({ actions: [{ intent: 'scroll_down', target: 'none' }] })
    };

    function Trigger() {
      const { setVoiceControl } = useAccessibility();
      useEffect(() => setVoiceControl(true), [setVoiceControl]);
      return null;
    }

    render(
      <AccessibilityProvider aiProvider={fakeAiProvider} voiceRecognitionProvider={fakeVoiceProvider}>
        <Trigger />
      </AccessibilityProvider>
    );

    await act(async () => {
      if (wrapper.cb) wrapper.cb('test command');
    });

    // Check if auto scroll started. It uses window.scrollBy
    expect(window.requestAnimationFrame).toHaveBeenCalled();
    scrollBySpy.mockRestore();
  });

  it('should not toggle dark mode if it is already dark mode', async () => {
    let internalState: any;

    function StateSpy() {
      internalState = useAccessibility();
      return null;
    }

    const wrapper: { cb?: (t: string) => void } = {};
    const fakeVoiceProvider = {
      isSupported: () => true,
      start: (lang: any, onResult: any) => { wrapper.cb = onResult; },
      stop: vi.fn(),
      abort: vi.fn(),
    };
    
    // Setup AI to return "change_setting" with "dark_mode"
    const fakeAiProvider = {
      parseCommand: vi.fn().mockResolvedValue({ actions: [{ intent: 'change_setting', target: 'dark_mode' }] })
    };

    function Trigger() {
      const { setVoiceControl, toggleTheme } = useAccessibility();
      useEffect(() => {
        setVoiceControl(true);
        // Ensure it's dark mode initially
        document.documentElement.classList.add('acc-invert'); 
      }, [setVoiceControl]);
      return null;
    }

    // Mock toggleTheme behavior inside the provider? We just need to spy if it's called
    // Wait, toggleTheme is internal. We can observe if dark mode gets toggled off.

    const onThemeChangeSpy = vi.fn();

    render(
      <AccessibilityProvider aiProvider={fakeAiProvider} voiceRecognitionProvider={fakeVoiceProvider} isDarkMode={true} onThemeChange={onThemeChangeSpy}>
        <StateSpy />
        <Trigger />
      </AccessibilityProvider>
    );

    expect(internalState.isDarkMode).toBe(true);

    await act(async () => {
      if (wrapper.cb) wrapper.cb('test command');
    });

    // Dark mode should still be true (idempotent), and toggleTheme should not have tried to call onThemeChange(false)
    expect(internalState.isDarkMode).toBe(true);
    expect(onThemeChangeSpy).not.toHaveBeenCalled();
  });
});
