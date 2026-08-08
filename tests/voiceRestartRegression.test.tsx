import React, { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityContext';
import { VoiceRecognitionProvider, AIProvider } from '../types';

function TestChild({ onRender }: { onRender: () => void }) {
  const { setVoiceControl, showExplanation } = useAccessibility();
  
  useEffect(() => {
    setVoiceControl(true);
  }, [setVoiceControl]);

  useEffect(() => {
    onRender();
  });

  return (
    <button onClick={() => showExplanation('Triggering explanation')}>Trigger</button>
  );
}

describe('Voice Restart Regression', () => {
  it('should not restart voice recognition when explanation changes', async () => {
    const startSpy = vi.fn();
    const abortSpy = vi.fn();
    
    const fakeVoiceProvider: VoiceRecognitionProvider = {
      isSupported: () => true,
      start: startSpy,
      stop: vi.fn(),
      abort: abortSpy,
    };

    // Required so the aiProvider guard in useVoiceControl passes
    const mockAiProvider: AIProvider = {
      parseCommand: vi.fn().mockResolvedValue({ actions: [] }),
    };

    const onRender = vi.fn();

    const { getByText } = render(
      <AccessibilityProvider voiceRecognitionProvider={fakeVoiceProvider} aiProvider={mockAiProvider}>
        <TestChild onRender={onRender} />
      </AccessibilityProvider>
    );

    expect(startSpy).toHaveBeenCalledTimes(1);

    // Clear history to isolate the update phase
    startSpy.mockClear();
    abortSpy.mockClear();

    await act(async () => {
      getByText('Trigger').click();
    });

    expect(onRender.mock.calls.length).toBeGreaterThan(1);

    // Voice provider start/abort should NOT have been called again
    expect(startSpy).toHaveBeenCalledTimes(0);
    expect(abortSpy).toHaveBeenCalledTimes(0);
  });
});
