import { CATEGORIES, GRADIENT, type Category } from '../constants/styles';

type CategoryPickerProps = {
  value: Category;
  onChange: (c: Category) => void;
  disabled?: boolean;
};

export default function CategoryPicker({ value, onChange, disabled = false }: CategoryPickerProps) {
  return (
    <div className="flex gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          disabled={disabled}
          className={`flex-1 rounded-xl px-3 py-2.5 text-[12.5px] font-medium transition disabled:opacity-60 ${
            value === c
              ? GRADIENT
              : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}