export const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
export type DayLabel = (typeof DAY_LABELS)[number];

function diffInDays(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / 86_400_000);
}

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function isoToday(): string {
  return iso(new Date());
}

function parseISO(s: string): Date {
  // Take only the YYYY-MM-DD part and build a LOCAL Date — never rely on
  // `new Date('YYYY-MM-DD')`, which is parsed as UTC and can shift the day.
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  const dow = r.getDay(); // 0 = Sunday
  const shift = dow === 0 ? -6 : 1 - dow;
  r.setDate(r.getDate() + shift);
  return r;
}

export function formatDueDate(dueDate: string): string {
  const due   = parseISO(dueDate);
  const today = parseISO(isoToday());
  const days  = diffInDays(due, today);

  // ماضٍ
  if (days === -1) return 'YESTERDAY';
  if (days <  -1)  return 'OVERDUE';

  // اليوم / غدًا
  if (days === 0) return 'TODAY';
  if (days === 1) return 'TOMORROW';

  // نفس الأسبوع → اسم اليوم (MON..SUN)
  // نستخدم startOfWeek لأن diffInDays < 7 لا يكفي (الجمعة → الخميس القادم = 6 أيام لكن أسبوع مختلف)
  const sameWeek =
    startOfWeek(due).getTime() === startOfWeek(today).getTime();

  if (sameWeek) {
    // getDay(): 0=Sun .. 6=Sat، أما DAY_LABELS فيبدأ بـ MON=0
    return DAY_LABELS[(due.getDay() + 6) % 7];
  }

  // تاريخ بعيد → "DEC 5"
  const month = due
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase();
  return `${month} ${due.getDate()}`;
}

export function formatCompletedLabel(completedAt: string | null): string | null {
  if (!completedAt) return null;

  const done  = parseISO(completedAt);
  const today = parseISO(isoToday());
  const days  = diffInDays(today, done);   // today - done

  if (days <= 0) return 'Completed today';
  if (days === 1) return 'Completed yesterday';
  if (days <  7)  return `Completed ${days} days ago`;

  // أقدم من أسبوع → تاريخ صريح
  const month = done.toLocaleDateString('en-US', { month: 'short' });
  return `Completed on ${month} ${done.getDate()}, ${done.getFullYear()}`;
}
const NO_DUE = Number.MAX_SAFE_INTEGER;

/**
 * قيمة رقمية لفرز المهام حسب تاريخ الاستحقاق.
 * - تاريخ موجود → timestamp (يُقرأ من parseISO لتجنّب إزاحة UTC)
 * - تاريخ فارغ → NO_DUE (يُرسل للنهاية)
 */
export function dueSortValue(dueDate: string | null | undefined): number {
  if (!dueDate) return NO_DUE;
  return parseISO(dueDate).getTime();
}