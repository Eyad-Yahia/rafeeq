import React, { Profiler, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityContext';
import { AccessibilityUI } from '../AccessibilityWidget';

// Spies to track renders. We make them global so they can be accessed inside vi.mock
const headerRenderSpy = vi.fn();
const profilesRenderSpy = vi.fn();
const featuresRenderSpy = vi.fn();

(globalThis as any).headerRenderSpy = headerRenderSpy;
(globalThis as any).profilesRenderSpy = profilesRenderSpy;
(globalThis as any).featuresRenderSpy = featuresRenderSpy;

// A test component to trigger unrelated state changes
// `showExplanation` is NOT consumed by any plugin's isActive/currentStep,
// so it is a true "unrelated" change for memoization testing purposes.
const StateChanger = () => {
  const { showExplanation } = useAccessibility();
  return (
    <button 
      data-testid="trigger-unrelated"
      onClick={() => showExplanation('test explanation')}
    >
      Trigger Unrelated Change
    </button>
  );
};

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    useReducedMotion: () => false,
  };
});

// Mock the components
vi.mock('../components/WidgetHeader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../components/WidgetHeader')>();
  return {
    ...actual,
    WidgetHeader: React.memo((props: any) => {
      (globalThis as any).headerRenderSpy();
      return <actual.WidgetHeader {...props} />;
    })
  };
});

vi.mock('../components/ProfilesSection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../components/ProfilesSection')>();
  return {
    ...actual,
    ProfilesSection: React.memo((props: any) => {
      (globalThis as any).profilesRenderSpy();
      return <actual.ProfilesSection {...props} />;
    })
  };
});

vi.mock('../components/FeaturesGrid', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../components/FeaturesGrid')>();
  return {
    ...actual,
    FeaturesGrid: React.memo((props: any) => {
      (globalThis as any).featuresRenderSpy();
      return <actual.FeaturesGrid {...props} />;
    }, (prev, next) => {
      if (prev.features.length !== next.features.length) return false;
      return prev.features.every((f: any, i: number) => {
        const n = next.features[i];
        return (
          f.id === n.id &&
          f.active === n.active &&
          f.currentStep === n.currentStep &&
          f.badge?.text === n.badge?.text
        );
      });
    })
  };
});

describe('Performance and Memoization (Phase 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Memoized components do not re-render on unrelated state changes', async () => {
    // Render the full UI, the mocked components will report to the global spies
    render(
      <AccessibilityProvider>
        <AccessibilityUI />
        <StateChanger />
      </AccessibilityProvider>
    );
    
    // Open the widget to mount the UI components
    fireEvent.click(screen.getByLabelText(/Accessibility/i));
    
    // Wait for the modal to mount (AnimatePresence mode="wait" delays mounting)
    await screen.findByRole('dialog');
    
    // Let any delayed hooks (like useReducedMotion from framer-motion) settle
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Capture initial render counts
    const headerInitial = headerRenderSpy.mock.calls.length;
    const profilesInitial = profilesRenderSpy.mock.calls.length;
    const featuresInitial = featuresRenderSpy.mock.calls.length;
    
    expect(headerInitial).toBeGreaterThan(0);
    expect(profilesInitial).toBeGreaterThan(0);
    expect(featuresInitial).toBeGreaterThan(0);

    // Trigger an unrelated state change (explanation has no effect on any plugin's isActive)
    fireEvent.click(screen.getByTestId('trigger-unrelated'));
    
    // Assert independently that each component DID NOT RE-RENDER
    expect(headerRenderSpy.mock.calls.length, 'WidgetHeader should not re-render').toBe(headerInitial);
    expect(profilesRenderSpy.mock.calls.length, 'ProfilesSection should not re-render').toBe(profilesInitial);
    expect(featuresRenderSpy.mock.calls.length, 'FeaturesGrid should not re-render').toBe(featuresInitial);
  });
});
