// app/(front)/feature/hook/useDebouncedCallback.hook.ts
import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 400,
) {
  const fnRef = useRef(fn);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pending = useRef<A | null>(null);

  useEffect(() => {
    fnRef.current = fn; 
  }, [fn]);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
    if (pending.current) {
      const args = pending.current;
      pending.current = null;
      fnRef.current(...args);
    }
  }, []);

  const debounced = useCallback(
    (...args: A) => {
      pending.current = args;
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [delay, flush],
  );

  useEffect(() => flush, [flush]);

  return [debounced, flush] as const;
}