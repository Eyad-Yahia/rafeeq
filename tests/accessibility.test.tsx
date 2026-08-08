/// <reference types="vitest-axe/matchers" />
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { AccessibilityWidget } from '../AccessibilityWidget';

expect.extend(matchers);

describe('AccessibilityWidget', () => {
  it('should have no accessibility violations in the default closed state', async () => {
    const { container } = render(<AccessibilityWidget />);
    const results = await axe(container);
    // @ts-ignore
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when the modal is open', async () => {
    const { container, getByRole } = render(<AccessibilityWidget />);
    // Click the trigger button to open the modal
    const trigger = getByRole('button', { name: /accessibility options/i });
    fireEvent.click(trigger);
    const results = await axe(container);
    // @ts-ignore
    expect(results).toHaveNoViolations();
  });
});
