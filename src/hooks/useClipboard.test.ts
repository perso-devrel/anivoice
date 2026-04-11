import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let stateVal = false;
let setStateFn: (v: boolean) => void;
let refObj: { current: ReturnType<typeof setTimeout> | undefined };
let cleanupFn: (() => void) | undefined;

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useState: (init: boolean) => {
      stateVal = init;
      setStateFn = (v: boolean) => { stateVal = v; };
      return [stateVal, setStateFn] as const;
    },
    useCallback: (fn: unknown) => fn,
    useRef: (init: undefined) => {
      refObj = { current: init };
      return refObj;
    },
    useEffect: (fn: () => (() => void) | void) => {
      const result = fn();
      if (typeof result === 'function') cleanupFn = result;
    },
  };
});

import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    cleanupFn = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with copied=false', () => {
    const { copied } = useClipboard();
    expect(copied).toBe(false);
  });

  it('sets copied=true after copy and resets after timeout', async () => {
    const { copy } = useClipboard(1000);

    await copy('hello');
    expect(stateVal).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');

    vi.advanceTimersByTime(1000);
    expect(stateVal).toBe(false);
  });

  it('uses default 2000ms reset', async () => {
    const { copy } = useClipboard();

    await copy('test');
    expect(stateVal).toBe(true);

    vi.advanceTimersByTime(1999);
    expect(stateVal).toBe(true);

    vi.advanceTimersByTime(1);
    expect(stateVal).toBe(false);
  });

  it('clears timer on cleanup', async () => {
    const { copy } = useClipboard(1000);

    await copy('data');
    expect(stateVal).toBe(true);

    cleanupFn?.();
    vi.advanceTimersByTime(1000);
    expect(stateVal).toBe(true);
  });
});
