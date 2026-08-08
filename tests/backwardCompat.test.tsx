import React, { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityContext';
import { VoiceRecognitionProvider } from '../types';

function TestChild({ onResultCbWrapper }: { onResultCbWrapper: { cb?: (t: string) => void } }) {
  const { setVoiceControl, setDictionaryMode } = useAccessibility();
  
  useEffect(() => {
    setVoiceControl(true);
    setDictionaryMode(true);
  }, [setVoiceControl, setDictionaryMode]);

  return null;
}

describe('Providers Configuration', () => {
  it('should use aiProvider and dictionaryProvider correctly', async () => {
    const aiProvider = {
      parseCommand: vi.fn().mockResolvedValue({ reply: 'Hello', actions: [] })
    };
    const dictionaryProvider = {
      explainText: vi.fn().mockResolvedValue('Explanation')
    };
    
    const wrapper: { cb?: (t: string) => void } = {};
    const fakeVoiceProvider: VoiceRecognitionProvider = {
      isSupported: () => true,
      start: (lang, onResult) => { wrapper.cb = onResult; },
      stop: vi.fn(),
      abort: vi.fn(),
    };

    render(
      <AccessibilityProvider
        aiProvider={aiProvider as any}
        dictionaryProvider={dictionaryProvider as any}
        voiceRecognitionProvider={fakeVoiceProvider}
      >
        <TestChild onResultCbWrapper={wrapper} />
      </AccessibilityProvider>
    );

    await act(async () => {
      if (wrapper.cb) wrapper.cb('scroll down');
    });

    expect(aiProvider.parseCommand).toHaveBeenCalledWith('scroll down', expect.any(String), expect.any(String));
    
    // Simulate dictionary text selection
    window.getSelection = vi.fn().mockReturnValue({
      toString: () => 'test word'
    } as any);

    await act(async () => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    expect(dictionaryProvider.explainText).toHaveBeenCalledWith('test word', expect.any(String));
  });
});
