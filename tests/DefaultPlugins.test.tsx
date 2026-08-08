import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityContext';
import { defaultPlugins } from '../plugins/defaultPlugins';

describe('DefaultPlugins', () => {
  it('should not allow enabling dictionary or voice control if providers are missing', async () => {
    let internalState: any;

    function StateSpy() {
      internalState = useAccessibility();
      return null;
    }

    render(
      <AccessibilityProvider>
        <StateSpy />
      </AccessibilityProvider>
    );

    const dictionaryPlugin = defaultPlugins.find(p => p.id === 'dictionary');
    const voicePlugin = defaultPlugins.find(p => p.id === 'voice_control');

    expect(dictionaryPlugin).toBeDefined();
    expect(voicePlugin).toBeDefined();

    await act(async () => {
      dictionaryPlugin!.action(internalState);
      voicePlugin!.action(internalState);
    });

    // Since providers are missing, mode should not be enabled
    expect(internalState.dictionaryMode).toBe(false);
    expect(internalState.voiceControl).toBe(false);

    // Also the plugin shouldn't be active
    expect(dictionaryPlugin!.isActive(internalState)).toBe(false);
    expect(voicePlugin!.isActive(internalState)).toBe(false);
  });
});
