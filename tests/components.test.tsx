import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DictionaryTooltip } from '../components/DictionaryTooltip';
import { WidgetHeader } from '../components/WidgetHeader';
import { AccessibilityContext } from '../AccessibilityContext';
import { DEFAULT_TRANSLATIONS } from '../constants/translations';

// Mock the context provider
const renderWithContext = (ui: React.ReactElement, providerProps: any) => {
  return render(
    <AccessibilityContext.Provider value={providerProps}>
      {ui}
    </AccessibilityContext.Provider>
  );
};

describe('DictionaryTooltip', () => {
  it('should clamp vertical Y position to stay within window.innerHeight', () => {
    const mockContext = {
      dictionaryTooltip: { text: 'Test', x: 10, y: 1000, loading: false },
      t: DEFAULT_TRANSLATIONS,
      isRTL: false,
    };

    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

    // Mock getBoundingClientRect
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      bottom: 1100, // 1000 (y) + 100 (height)
      height: 100,
      top: 1000,
      left: 10,
      right: 110,
      width: 100,
      x: 10,
      y: 1000,
      toJSON: () => { }
    }));

    renderWithContext(<DictionaryTooltip />, mockContext);

    const tooltip = screen.getByText('Test').closest('div.fixed');

    // It should have been adjusted to 800 (window.innerHeight) - 100 (height) - 20 = 680
    expect((tooltip as HTMLElement)?.style.top).toBe('680px');

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });
});

describe('WidgetHeader Reset Button', () => {
  it('should trigger reset immediately on click', () => {
    const resetAllMock = vi.fn();
    const setIsOpenMock = vi.fn();

    render(<WidgetHeader t={DEFAULT_TRANSLATIONS} resetAll={resetAllMock} setIsOpen={setIsOpenMock} />);

    const resetButton = screen.getByRole('button', { name: DEFAULT_TRANSLATIONS.reset });

    // Click once
    fireEvent.click(resetButton);

    // Should trigger reset immediately
    expect(resetAllMock).toHaveBeenCalledTimes(1);
  });
});
