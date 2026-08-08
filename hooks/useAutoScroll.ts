import { useRef, useCallback, useEffect } from "react";
import { getActiveScrollContainer } from "../utils/dom";

export function useAutoScroll(scrollContainerSelectors: string[], excludeSelectors: string[]) {
  const scrollVelocityRef = useRef<number>(0);
  const scrollAccumulatorRef = useRef<number>(0);
  const scrollAnimationIdRef = useRef<number | null>(null);

  const startAutoScroll = useCallback((velocity: number) => {
    if (scrollAnimationIdRef.current) cancelAnimationFrame(scrollAnimationIdRef.current);
    
    scrollVelocityRef.current = velocity;
    let lastContainerCheck = 0;
    let cachedContainer: HTMLElement | Window | null = window;

    const scrollStep = () => {
      const now = performance.now();
      if (now - lastContainerCheck > 250) {
        cachedContainer = getActiveScrollContainer(scrollContainerSelectors, excludeSelectors);
        lastContainerCheck = now;
      }

      scrollAccumulatorRef.current += scrollVelocityRef.current;
      const scrollInt = Math.trunc(scrollAccumulatorRef.current);
      
      if (scrollInt !== 0) {
        scrollAccumulatorRef.current -= scrollInt;
        if (cachedContainer) {
          if (cachedContainer === window) {
            window.scrollBy(0, scrollInt);
          } else {
            (cachedContainer as HTMLElement).scrollBy(0, scrollInt);
          }
        }
      }
      scrollAnimationIdRef.current = requestAnimationFrame(scrollStep);
    };
    scrollAnimationIdRef.current = requestAnimationFrame(scrollStep);
  }, [scrollContainerSelectors, excludeSelectors]);

  const stopAutoScroll = useCallback(() => {
    if (scrollAnimationIdRef.current) {
      cancelAnimationFrame(scrollAnimationIdRef.current);
      scrollAnimationIdRef.current = null;
    }
    scrollVelocityRef.current = 0;
    scrollAccumulatorRef.current = 0;
  }, []);

  useEffect(() => stopAutoScroll, [stopAutoScroll]);

  return { startAutoScroll, stopAutoScroll };
}
