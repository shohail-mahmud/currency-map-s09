import { useState } from "react";

type ColorLegendProps = {
  isRightPanelOpen: boolean;
};

export function ColorLegend({ isRightPanelOpen }: ColorLegendProps) {
  const [isHidden, setIsHidden] = useState(false);
  const rightOffset = isRightPanelOpen ? "calc(min(200px, 56vw) + 16px)" : "16px";

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
        <li>Red: Coins only</li>
        <li>Blue: Banknotes only</li>
        <li>Yellow: Coins and banknotes</li>
        <li>Grey: No collection</li>
      </ul>
    </aside>
  );
}
