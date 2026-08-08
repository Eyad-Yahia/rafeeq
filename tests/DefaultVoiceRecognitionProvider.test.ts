import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultVoiceRecognitionProvider } from '../providers/DefaultVoiceRecognitionProvider';

describe('DefaultVoiceRecognitionProvider', () => {
  let provider: DefaultVoiceRecognitionProvider;
  let mockRecognition: any;

  beforeEach(() => {
    mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onerror: null,
      onend: null,
      onresult: null
    };

    const MockSpeechRecognition = class {
      start = mockRecognition.start;
      stop = mockRecognition.stop;
      abort = mockRecognition.abort;
      set onerror(cb: any) { mockRecognition.onerror = cb; }
      set onend(cb: any) { mockRecognition.onend = cb; }
      set onresult(cb: any) { mockRecognition.onresult = cb; }
    };
    vi.stubGlobal('SpeechRecognition', MockSpeechRecognition);
    vi.stubGlobal('webkitSpeechRecognition', MockSpeechRecognition);
    provider = new DefaultVoiceRecognitionProvider();
  });

  it('should not try to restart onend if a fatal error occurs', () => {
    const onResult = vi.fn();
    const onEnd = vi.fn();
    const onError = vi.fn();

    provider.start('en-US', onResult, onEnd, onError);

    expect(mockRecognition.start).toHaveBeenCalledTimes(1);

    // Simulate fatal error
    mockRecognition.onerror({ error: 'not-allowed' });

    // The provider should notify the consumer
    expect(onError).toHaveBeenCalledWith({ error: 'not-allowed' });

    // Simulate the stream ending as a result of the error
    mockRecognition.onend();

    // It should NOT call start again because the error was fatal
    expect(mockRecognition.start).toHaveBeenCalledTimes(1); 
    // And it should notify the consumer that the session ended
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('should try to restart onend if the error is not fatal', () => {
    const onResult = vi.fn();
    const onEnd = vi.fn();
    const onError = vi.fn();

    provider.start('en-US', onResult, onEnd, onError);

    expect(mockRecognition.start).toHaveBeenCalledTimes(1);

    // Simulate non-fatal error
    mockRecognition.onerror({ error: 'no-speech' });

    // Simulate stream end
    mockRecognition.onend();

    // It SHOULD call start again because the error was non-fatal and the session is still active
    expect(mockRecognition.start).toHaveBeenCalledTimes(2);
  });
});
