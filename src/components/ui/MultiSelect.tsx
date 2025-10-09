import { useEffect, useRef, useState } from 'react';

type Option = { id: number; name: string };

interface MultiSelectProps {
  options: Option[];
  value?: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
}

export default function MultiSelect({ options, value = [], onChange, placeholder }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('click', onDoc);
    return () => window.removeEventListener('click', onDoc);
  }, []);

  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const filtered = options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={containerRef} className="relative">
      <div
        className="min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm flex items-center gap-2 flex-wrap cursor-text"
      >
        {value.length === 0 && !query ? (
          <div className="text-gray-400">{placeholder ?? 'Select categories'}</div>
        ) : null}

        {value.map((id) => {
          const opt = options.find((o) => o.id === id);
          if (!opt) return null;
          return (
            <span key={id} className="inline-flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs">
              <span className="mr-2">{opt.name}</span>
              <button
                type="button"
                aria-label={`Remove ${opt.name}`}
                onClick={(e) => { e.stopPropagation(); toggle(id); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </span>
          );
        })}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          className="flex-1 min-w-[80px] outline-none text-sm px-1 py-1 bg-transparent"
          aria-controls="multi-select-list"
          aria-autocomplete="list"
          placeholder="Search..."
          aria-label="Search categories"
        />
      </div>

      {open && (
        <div className="absolute z-40 mt-2 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-56 overflow-auto">
          <div id="multi-select-list" role="listbox" aria-label="Categories" className="p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="text-gray-500 text-sm px-2 py-1">No results</div>
            ) : (
              filtered.map((opt) => {
                const selected = value.includes(opt.id);
                return (
                  selected ? (
                    <div
                      key={opt.id}
                      role="option"
                      aria-selected="true"
                      onClick={(e) => { e.stopPropagation(); toggle(opt.id); }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-sm bg-primary-50 text-primary-700`}
                    >
                      <span>{opt.name}</span>
                      <span className="text-xs text-primary-600">Selected</span>
                    </div>
                  ) : (
                    <div
                      key={opt.id}
                      role="option"
                      aria-selected="false"
                      onClick={(e) => { e.stopPropagation(); toggle(opt.id); }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-sm hover:bg-gray-50`}
                    >
                      <span>{opt.name}</span>
                    </div>
                  )
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
