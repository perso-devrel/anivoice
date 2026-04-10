import { describe, it, expect, vi, beforeEach } from 'vitest';

let effectDep: boolean | undefined;

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  const refObj = { current: null as HTMLElement | null };
  const prevFocusObj = { current: null as Element | null };
  return {
    ...actual,
    useRef: (init: unknown) => {
      if (init === null && prevFocusObj.current === undefined) {
        return prevFocusObj;
      }
      return init === null ? refObj : prevFocusObj;
    },
    useEffect: (_fn: () => void, deps: unknown[]) => {
      effectDep = deps[0] as boolean;
    },
  };
});

import { useFocusTrap } from './useFocusTrap';

describe('useFocusTrap', () => {
  beforeEach(() => {
    effectDep = undefined;
  });

  it('returns a ref object', () => {
    const ref = useFocusTrap<HTMLDivElement>();
    expect(ref).toBeDefined();
    expect(ref).toHaveProperty('current');
  });

  it('does not activate when active is false', () => {
    useFocusTrap<HTMLDivElement>(false);
    expect(effectDep).toBe(false);
  });

  it('activates when active is true (default)', () => {
    useFocusTrap<HTMLDivElement>();
    expect(effectDep).toBe(true);
  });
});
