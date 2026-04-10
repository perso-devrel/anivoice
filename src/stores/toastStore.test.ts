import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useToastStore, showToast } from './toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with empty toasts', () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('addToast appends a toast with default type error', () => {
    useToastStore.getState().addToast('something broke');
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('something broke');
    expect(toasts[0].type).toBe('error');
    expect(toasts[0].id).toMatch(/^toast-/);
  });

  it('addToast respects explicit type', () => {
    useToastStore.getState().addToast('saved', 'success');
    expect(useToastStore.getState().toasts[0].type).toBe('success');
  });

  it('addToast auto-removes after 4000ms', () => {
    useToastStore.getState().addToast('temp');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(4000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('removeToast removes by id', () => {
    useToastStore.getState().addToast('a');
    useToastStore.getState().addToast('b');
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().removeToast(id);
    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe('b');
  });

  it('showToast helper adds toast via getState', () => {
    showToast('hello', 'info');
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('hello');
    expect(toasts[0].type).toBe('info');
  });

  it('multiple toasts coexist until timeout', () => {
    useToastStore.getState().addToast('first');
    vi.advanceTimersByTime(2000);
    useToastStore.getState().addToast('second');
    expect(useToastStore.getState().toasts).toHaveLength(2);
    vi.advanceTimersByTime(2000);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].message).toBe('second');
  });
});
