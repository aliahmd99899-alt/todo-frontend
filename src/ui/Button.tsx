import type { ButtonHTMLAttributes } from 'react';
import { GRADIENT } from '../constants/styles';

const VARIANTS = {
  primary: `${GRADIENT} font-semibold hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100`,
  ghost: 'border border-white/10 bg-white/5 font-medium text-white/70 hover:bg-white/10 hover:text-white',
  link: 'font-medium text-violet-300 hover:text-white',
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANTS };

export default function Button({ variant = 'ghost', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`transition disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    />
  );
}