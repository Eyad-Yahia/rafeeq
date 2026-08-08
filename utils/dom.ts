export const normalizeText = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ");
};

export const isExcluded = (el: Element, excludeSelectors: string[]): boolean => {
  return excludeSelectors.some(selector => {
    try {
      return el.closest(selector) !== null;
    } catch {
      return false;
    }
  });
};

export const getActiveScrollContainer = (scrollContainerSelectors: string[], excludeSelectors: string[]): HTMLElement | Window | null => {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  const overlays = Array.from(document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="Dialog"], [class*="portal"]'));
  for (let i = overlays.length - 1; i >= 0; i--) {
    const overlay = overlays[i] as HTMLElement;
    if (overlay.offsetWidth > 0 && overlay.offsetHeight > 0) {
      if (isExcluded(overlay, excludeSelectors)) continue;
      
      const innerScrollables = Array.from(overlay.querySelectorAll(scrollContainerSelectors.join(', ')));
      for (let j = innerScrollables.length - 1; j >= 0; j--) {
        const el = innerScrollables[j] as HTMLElement;
        if (el.offsetWidth > 0 && el.offsetHeight > 0 && el.scrollHeight > el.clientHeight) {
          if (!isExcluded(el, excludeSelectors)) return el;
        }
      }

      if (overlay.scrollHeight > overlay.clientHeight) {
        return overlay;
      }
    }
  }

  const scrollables = Array.from(document.querySelectorAll(scrollContainerSelectors.join(', ')));
  for (let i = scrollables.length - 1; i >= 0; i--) {
    const el = scrollables[i] as HTMLElement;
    if (el.offsetWidth > 0 && el.offsetHeight > 0 && el.scrollHeight > el.clientHeight) {
      if (!isExcluded(el, excludeSelectors)) return el;
    }
  }
  return window;
};

export const getPageContext = (excludeSelectors: string[], redactSelectors: string[] = []) => {
  try {
    if (typeof document === "undefined" || !document.body) {
      return 'No text content found on this page.';
    }

    // Walk the DOM tree to build text, skipping excluded or redacted nodes.
    const excludedSet = new Set<Element>();
    const allExcluded = [...excludeSelectors, ...redactSelectors].filter(Boolean);

    if (allExcluded.length > 0) {
      allExcluded.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => excludedSet.add(el));
        } catch {
          // ignore invalid selectors
        }
      });
    }

    const isSkipped = (node: Element): boolean => {
      let current: Element | null = node;
      while (current) {
        if (excludedSet.has(current)) return true;
        current = current.parentElement;
      }
      return false;
    };

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.parentElement) return NodeFilter.FILTER_SKIP;
          if (isSkipped(node.parentElement)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const parts: string[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = (node.textContent || '').trim();
      if (text) parts.push(text);
    }

    const text = parts.join(' ').replace(/\s+/g, ' ').trim().substring(0, 4000);
    return text || 'No text content found on this page.';
  } catch (e) {
    return 'Unable to read page context.';
  }
};
