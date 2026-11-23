export const CATEGORIES = ['Work', 'Personal'] as const;
export type Category = (typeof CATEGORIES)[number];

export const GRADIENT =
  'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-lg shadow-purple-500/30';

export const FIELD =
  'w-full rounded-xl border border-white/10 bg-white/5 text-[13px] text-white outline-none transition focus:ring-2 focus:ring-[#7C3AED]/60 disabled:opacity-60';

export const ERROR_BOX = 'border border-pink-500/25 bg-pink-500/10 text-[12.5px] text-pink-300';