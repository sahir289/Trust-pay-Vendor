import { useRef, useState, useEffect, useCallback } from "react";

// Custom hook that provides state with callback functionality
// eslint-disable-next-line no-unused-vars
const useCallbackState = <T>(initialValue: T): readonly [T, (newValue: T, callback?: (value: T) => void) => void] => {
  const [state, setState] = useState<T>(initialValue);
  // eslint-disable-next-line no-unused-vars
  const callbackRef = useRef<((value: T) => void) | undefined>();

  // eslint-disable-next-line no-unused-vars
  const updateState = useCallback((newValue: T, callback?: (value: T) => void) => {
    setState(newValue);
    callbackRef.current = callback;
  }, []);

  useEffect(() => {
    if (callbackRef.current) {
      const callback = callbackRef.current;
      // Clear the callback before calling to prevent memory leaks
      callbackRef.current = undefined;
      callback(state);
    }
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return (): void => {
      callbackRef.current = undefined;
    };
  }, []);

  return [state, updateState] as const;
};

export default useCallbackState;
