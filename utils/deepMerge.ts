/**
 * Deep merges two objects. 
 * Only operates on plain objects. Arrays and other types are overwritten.
 * Protected against prototype pollution.
 */
export function deepMerge<T extends object = object>(target: T, source: Partial<T>): T {
  const output = { ...target } as T;
  
  if (isPlainObject(target) && isPlainObject(source)) {
    const sourceObj = source as Record<string, unknown>;
    const outputObj = output as Record<string, unknown>;
    
    Object.keys(sourceObj).forEach(key => {
      // Prototype pollution guard
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return;
      }
      
      const sourceValue = sourceObj[key];
      const targetValue = outputObj[key];

      if (isPlainObject(sourceValue)) {
        if (!Object.prototype.hasOwnProperty.call(outputObj, key) || !isPlainObject(targetValue)) {
          outputObj[key] = { ...sourceValue };
        } else {
          outputObj[key] = deepMerge(targetValue as object, sourceValue as object);
        }
      } else if (sourceValue !== undefined) {
        outputObj[key] = sourceValue;
      }
    });
  }
  return output;
}

function isPlainObject(item: unknown): item is Record<string, unknown> {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
  const proto = Object.getPrototypeOf(item);
  return proto === Object.prototype || proto === null;
}
