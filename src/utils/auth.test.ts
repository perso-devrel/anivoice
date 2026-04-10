import { describe, it, expect } from 'vitest';
import { mapAuthError } from './auth';

const t = (key: string) => key;

describe('mapAuthError', () => {
  it('maps auth/wrong-password to errorWrongPassword', () => {
    const err = new Error('Firebase: Error (auth/wrong-password).');
    expect(mapAuthError(err, t)).toBe('auth.errorWrongPassword');
  });

  it('maps auth/invalid-credential to errorWrongPassword', () => {
    const err = new Error('Firebase: Error (auth/invalid-credential).');
    expect(mapAuthError(err, t)).toBe('auth.errorWrongPassword');
  });

  it('maps auth/user-not-found', () => {
    expect(mapAuthError(new Error('auth/user-not-found'), t)).toBe('auth.errorUserNotFound');
  });

  it('maps auth/email-already-in-use', () => {
    expect(mapAuthError(new Error('auth/email-already-in-use'), t)).toBe('auth.errorEmailInUse');
  });

  it('maps auth/weak-password', () => {
    expect(mapAuthError(new Error('auth/weak-password'), t)).toBe('auth.errorWeakPassword');
  });

  it('maps auth/invalid-email', () => {
    expect(mapAuthError(new Error('auth/invalid-email'), t)).toBe('auth.errorInvalidEmail');
  });

  it('maps auth/too-many-requests', () => {
    expect(mapAuthError(new Error('auth/too-many-requests'), t)).toBe('auth.errorTooManyRequests');
  });

  it('maps auth/popup-closed-by-user', () => {
    expect(mapAuthError(new Error('auth/popup-closed-by-user'), t)).toBe('auth.errorPopupClosed');
  });

  it('returns original message for unknown errors', () => {
    expect(mapAuthError(new Error('Network error'), t)).toBe('Network error');
  });

  it('handles non-Error values', () => {
    expect(mapAuthError('some string error', t)).toBe('some string error');
  });

  it('returns common.error for empty message', () => {
    expect(mapAuthError(new Error(''), t)).toBe('common.error');
  });
});
