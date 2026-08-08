import { useRef, useEffect } from "react";

/**
 * A hook that returns a ref containing the latest value of the provided variable.
 * Useful for keeping callbacks stable while still allowing them to access the latest state.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef<T>(value);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  // Also update synchronously for immediate access during the same render cycle
  ref.current = value;

  return ref;
}
