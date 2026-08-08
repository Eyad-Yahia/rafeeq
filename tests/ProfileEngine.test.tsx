import React, { useEffect, useRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityContext';
import { AccessibilityProfile } from '../types';

describe('ProfileEngine Snapshot Logic (Rapid Switching)', () => {
  it('should correctly restore base state when rapidly switching from A to B synchronously', () => {
    const profileA: AccessibilityProfile = {
      id: 'a',
      label: () => 'A',
      icon: 'test',
      settings: { textSize: 200 } // Changes textSize
    };

    const profileB: AccessibilityProfile = {
      id: 'b',
      label: () => 'B',
      icon: 'test',
      settings: { contrast: 'invert' } // Changes contrast
    };

    let textSizeResult = 100;
    let contrastResult = 'default';

    const TestComponent = () => {
      const { setProfile, textSize, contrast } = useAccessibility();
      
      const isFirstRender = useRef(true);

      useEffect(() => {
        textSizeResult = textSize;
        contrastResult = contrast;
      }, [textSize, contrast]);

      useEffect(() => {
        if (isFirstRender.current) {
          isFirstRender.current = false;
          // Synchronously rapid-switch A then B
          setProfile(profileA);
          setProfile(profileB);
        }
      }, [setProfile]);

      return (
        <div>
          <button data-testid="off" onClick={() => setProfile(null)}>Turn Off</button>
        </div>
      );
    };

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // After the initial render and rapid switch, 
    // the state should reflect Profile B's overrides ONLY.
    // Profile A's modifications should have been completely reverted.
    // Base textSize should be 100, contrast should be invert.
    expect(textSizeResult).toBe(100);
    expect(contrastResult).toBe('invert');

    // Turn off Profile B
    act(() => {
      screen.getByTestId('off').click();
    });

    // The state should return to the original pre-A values
    expect(textSizeResult).toBe(100);
    expect(contrastResult).toBe('default');
  });
});
