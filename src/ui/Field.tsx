import type { ReactNode } from 'react';

type FieldProps = { label: string; action?: ReactNode; children: ReactNode };

export default function Field({ label, action, children }: FieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-[12px] font-medium text-white/50">{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}