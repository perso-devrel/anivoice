export function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export interface TimeLabels { hours: string; minutes: string; seconds: string }

export function formatSeconds(seconds: number, labels: TimeLabels): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}${labels.hours} ${m}${labels.minutes}`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}${labels.minutes} ${s}${labels.seconds}` : `${s}${labels.seconds}`;
}

export function formatCreditTime(seconds: number, t: (key: string) => string): string {
  return formatSeconds(seconds, {
    hours: t('common.hours'),
    minutes: t('common.minutes'),
    seconds: t('common.seconds'),
  });
}

export function formatCreditTimeMs(ms: number, t: (key: string) => string): string {
  return formatCreditTime(Math.floor(ms / 1000), t);
}

export function formatChartDay(day: string): string {
  return day.slice(5);
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function getErrorMessage(err: unknown, fallback?: string): string {
  if (err instanceof Error) return err.message;
  return fallback ?? String(err);
}
