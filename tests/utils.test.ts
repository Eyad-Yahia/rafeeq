import { describe, it, expect } from 'vitest';
import { deepMerge } from '../utils/deepMerge';

describe('deepMerge', () => {
  it('merges nested objects', () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { b: { d: 3 }, e: 4 };
    const result = deepMerge(target, source as any);
    expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
  });

  it('overwrites primitives with objects', () => {
    const target = { a: 1 };
    const source = { a: { b: 2 } };
    const result = deepMerge(target, source as any);
    expect(result).toEqual({ a: { b: 2 } });
  });

  it('protects against prototype pollution', () => {
    const target = {};
    const maliciousSource = JSON.parse('{"__proto__":{"polluted":true}}');
    deepMerge(target, maliciousSource);
    
    // The target should not have the polluted property directly assigned
    expect((target as any).polluted).toBeUndefined();
    
    // The global Object prototype should not be polluted
    expect(({} as any).polluted).toBeUndefined();
  });
});
