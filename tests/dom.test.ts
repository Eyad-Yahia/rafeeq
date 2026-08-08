import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getPageContext } from '../utils/dom';

describe('getPageContext', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should not mutate the DOM (no side effects on elements)', () => {
    const excluded = document.createElement('div');
    excluded.className = 'exclude-me';
    excluded.textContent = 'secret text';
    excluded.style.display = 'block';
    document.body.appendChild(excluded);

    getPageContext(['.exclude-me']);

    // Ensure DOM was not mutated by our function
    expect(excluded.style.display).toBe('block');
    expect(excluded.hasAttribute('aria-hidden')).toBe(false);
  });

  it('should exclude elements matching excludeSelectors from the page context', () => {
    const visible = document.createElement('p');
    visible.textContent = 'public content';

    const excluded = document.createElement('p');
    excluded.className = 'widget-ui';
    excluded.textContent = 'widget private text';

    document.body.appendChild(visible);
    document.body.appendChild(excluded);

    const context = getPageContext(['.widget-ui']);

    expect(context).toContain('public content');
    expect(context).not.toContain('widget private text');
  });

  it('should redact elements matching redactSelectors from the page context', () => {
    const publicText = document.createElement('p');
    publicText.textContent = 'Welcome to the site';

    const privateDiv = document.createElement('div');
    privateDiv.setAttribute('data-private', 'true');
    privateDiv.textContent = 'Private personal data';

    document.body.appendChild(publicText);
    document.body.appendChild(privateDiv);

    const context = getPageContext([], ['[data-private]']);

    expect(context).toContain('Welcome to the site');
    expect(context).not.toContain('Private personal data');
  });

  it('should return a fallback message when no text content exists', () => {
    const context = getPageContext([]);
    expect(context).toBe('No text content found on this page.');
  });
});

