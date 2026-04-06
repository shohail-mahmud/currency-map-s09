import { useEffect, useState } from "react";

type ColorLegendProps = {
  isRightPanelOpen: boolean;
};

const LEGEND_ITEMS = [
  { color: "#EF4444", label: "Coins only" },
  { color: "#3B82F6", label: "Banknotes only" },
  { color: "#EAB308", label: "Coins and banknotes" },
  { color: "#374151", label: "No collection" },
];

const AUTO_HIDE_MS = 10_000;

export function ColorLegend({ isRightPanelOpen }: ColorLegendProps) {
  const [isHidden, setIsHidden] = useState(false);
  const rightOffset = isRightPanelOpen ? "calc(min(160px, 42vw) + 16px)" : "16px";

  useEffect(() => {
    if (isHidden) return;
    const timer = setTimeout(() => setIsHidden(true), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [isHidden]);

  if (isHidden) {
    return (
      <button
        type="button"
        style={{ right: rightOffset }}
        onClick={() => setIsHidden(false)}
        className="fixed top-4 z-30 border border-[#1F2933] bg-[#111827] px-2 py-1 text-[10px] text-[#9CA3AF]"
      >
        Show guide
      </button>
    );
  }

  return (
    <aside
      style={{ right: rightOffset }}
      className="fixed top-4 z-30 w-[140px] border border-[#1F2933] bg-[#111827] px-2 py-1.5 text-[10px] leading-4 sm:w-[160px]"
    >
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[11px] font-medium text-[#E5E7EB]">Map Guide</h2>
        <button
          type="button"
          onClick={() => setIsHidden(true)}
          className="text-[10px] text-[#9CA3AF] hover:text-[#E5E7EB]"
        >
          Hide
        </button>
      </div>
      <ul className="space-y-1 text-[#9CA3AF]">
        {LEGEND_ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
