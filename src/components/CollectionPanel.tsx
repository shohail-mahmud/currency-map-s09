import type { CountryCollection } from "../types/collection";

type CollectionPanelProps = {
  side: "left" | "right";
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  items: CountryCollection[];
  type: "coins" | "notes";
};

export function CollectionPanel({ side, title, isOpen, onToggle, items, type }: CollectionPanelProps) {
  const panelWidth = "min(200px, 56vw)";
  const isLeft = side === "left";
  const panelPositionClass = isLeft
    ? isOpen ? "translate-x-0" : "-translate-x-full"
    : isOpen ? "translate-x-0" : "translate-x-full";

  const panelSideClass = isLeft ? "left-0 border-r" : "right-0 border-l";
  const togglePositionClass = isLeft ? "left-0" : "right-0";
  const toggleInlinePosition = isLeft
    ? { left: isOpen ? panelWidth : "0px" }
    : { right: isOpen ? panelWidth : "0px" };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        style={toggleInlinePosition}
        className={`fixed top-1/2 z-30 h-20 w-7 -translate-y-1/2 border border-[#1F2933] bg-[#111827] text-[10px] text-[#9CA3AF] transition-all duration-150 sm:h-24 sm:w-8 sm:text-[11px] ${togglePositionClass} ${
          isLeft ? "rounded-r-sm border-l-0" : "rounded-l-sm border-r-0"
        } [writing-mode:vertical-rl]`}
      >
        {isOpen ? `Hide ${type}` : `Show ${type}`}
      </button>

      <aside
        className={`fixed top-0 z-20 h-screen w-[min(200px,56vw)] overflow-y-auto border-[#1F2933] bg-[#111827] transition-transform duration-150 ${panelSideClass} ${panelPositionClass}`}
      >
        <div className="border-b border-[#1F2933] px-3 py-2.5 sm:px-4 sm:py-3">
          <h2 className="text-sm font-medium tracking-wide text-[#E5E7EB]">{title}</h2>
        </div>

        <ul className="divide-y divide-[#1F2933]">
          {items.map((country) => (
            <li key={country.country} className="px-3 py-2.5 text-sm text-[#E5E7EB] sm:px-4">
              {country.country}
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
