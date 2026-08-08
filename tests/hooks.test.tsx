import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDictionary } from '../hooks/useDictionary';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { DEFAULT_TRANSLATIONS } from '../constants/translations';
import { DictionaryProvider, AIProvider, VoiceRecognitionProvider } from '../types';

describe('useDictionary: AbortController logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should ignore the first request if a second request is fired before the first resolves', async () => {
    // Mock dictionary provider with a delayed promise
    const explainTextMock = vi.fn().mockImplementation(async (text: string) => {
      return new Promise(resolve => {
        // First request takes 1000ms, second takes 500ms
        const delay = text === 'first' ? 1000 : 500;
        setTimeout(() => resolve(`Explanation for ${text}`), delay);
      });
    });

    const mockProvider: DictionaryProvider = {
      explainText: explainTextMock
    };

    const { result } = renderHook(() => useDictionary(true, mockProvider, DEFAULT_TRANSLATIONS, 'en'));

    // Mock window.getSelection
    const getSelectionMock = vi.fn();
    vi.stubGlobal('getSelection', getSelectionMock);

    // Fire first request
    getSelectionMock.mockReturnValue({ toString: () => 'first' });
    
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 10, clientY: 10 }));
    });
    
    // Fast-forward 200ms (first request still pending)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.dictionaryTooltip?.loading).toBe(true);

    // Fire second request
    getSelectionMock.mockReturnValue({ toString: () => 'second' });
    
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 10, clientY: 10 }));
    });

    // Fast-forward 500ms (second request resolves)
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.dictionaryTooltip?.text).toBe('Explanation for second');
    expect(result.current.dictionaryTooltip?.loading).toBe(false);

    // Fast-forward 300ms more (first request finally resolves)
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // State should NOT change back to 'first' because it was aborted
    expect(result.current.dictionaryTooltip?.text).toBe('Explanation for second');
  });
});

describe('useVoiceControl: AbortController logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should ignore the first voice command if a second command is fired before the first resolves', async () => {
    const parseCommandMock = vi.fn().mockImplementation(async (command: string) => {
      return new Promise(resolve => {
        const delay = command === 'first' ? 1000 : 500;
        setTimeout(() => resolve({ actions: [{ intent: 'test', target: command }] }), delay);
      });
    });

    const mockAiProvider: AIProvider = {
      parseCommand: parseCommandMock
    };

    let triggerResult: (command: string) => void = () => {};

    const mockVoiceProvider: VoiceRecognitionProvider = {
      start: (lang, onResult) => { triggerResult = onResult; },
      stop: vi.fn(),
      abort: vi.fn(),
      isSupported: () => true
    };

    const executeVoiceAction = vi.fn();
    const setVoiceControl = vi.fn();
    const showExplanation = vi.fn();
    const speakText = vi.fn();

    renderHook(() => useVoiceControl(
      true, setVoiceControl, mockAiProvider, mockVoiceProvider, 'en', 'en', [], [],
      DEFAULT_TRANSLATIONS, showExplanation, speakText, executeVoiceAction
    ));

    // Fire first command
    act(() => {
      triggerResult('first');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Fire second command
    act(() => {
      triggerResult('second');
    });

    // Fast forward for second to resolve
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(executeVoiceAction).toHaveBeenCalledWith('test', 'second');

    // Fast forward for first to resolve
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // First command should have been aborted and its action not executed
    expect(executeVoiceAction).not.toHaveBeenCalledWith('test', 'first');
    expect(executeVoiceAction).toHaveBeenCalledTimes(1);
  });
});

describe('useVoiceControl: Input validation', () => {
  it('should reject malformed AI provider actions', async () => {
    const parseCommandMock = vi.fn().mockResolvedValue({
      actions: [
        { intent: "navigate", target: "home" }, // Valid
        { intent: {}, target: "home" }, // Invalid intent type
        { intent: "click", target: {} }, // Invalid target type
        null,
        "invalid",
      ]
    });

    const mockAiProvider: AIProvider = { parseCommand: parseCommandMock };
    let triggerResult: (command: string) => void = () => {};
    const mockVoiceProvider: VoiceRecognitionProvider = {
      start: (lang, onResult) => { triggerResult = onResult; },
      stop: vi.fn(), abort: vi.fn(), isSupported: () => true
    };
    const executeVoiceAction = vi.fn();

    renderHook(() => useVoiceControl(
      true, vi.fn(), mockAiProvider, mockVoiceProvider, 'en', 'en', [], [],
      DEFAULT_TRANSLATIONS, vi.fn(), vi.fn(), executeVoiceAction
    ));

    await act(async () => {
      triggerResult('test command');
    });

    // Only the first action has valid string types, the rest should be ignored by the validation layer
    expect(executeVoiceAction).toHaveBeenCalledTimes(1);
    expect(executeVoiceAction).toHaveBeenCalledWith('navigate', 'home');
  });
});
