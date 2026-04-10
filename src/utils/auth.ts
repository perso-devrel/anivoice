export function mapAuthError(err: unknown, t: (key: string) => string): string {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
    return t('auth.errorWrongPassword');
  }
  if (msg.includes('auth/user-not-found')) {
    return t('auth.errorUserNotFound');
  }
  if (msg.includes('auth/email-already-in-use')) {
    return t('auth.errorEmailInUse');
  }
  if (msg.includes('auth/weak-password')) {
    return t('auth.errorWeakPassword');
  }
  if (msg.includes('auth/invalid-email')) {
    return t('auth.errorInvalidEmail');
  }
  if (msg.includes('auth/too-many-requests')) {
    return t('auth.errorTooManyRequests');
  }
  if (msg.includes('auth/popup-closed-by-user')) {
    return t('auth.errorPopupClosed');
  }

  return msg || t('common.error');
}
