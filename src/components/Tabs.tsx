const DEFAULT_TABS = ['All Tasks', 'Work', 'Personal', 'Archived'];

export default function Tabs({ active, onChange, tabs = DEFAULT_TABS }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-7">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`relative pb-3.5 text-[13.5px] font-medium transition ${
              active === tab ? 'text-white' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {tab}
            {active === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
            )}
          </button>
        ))}
      </div>
      <div className="h-px bg-white/10" />
    </div>
  );
}