import type { CountryCollection } from "../types/collection";

type CountryInfoPanelProps = {
  selectedCountry: CountryCollection;
  onClose: () => void;
};

export function CountryInfoPanel({ selectedCountry, onClose }: CountryInfoPanelProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[280px] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 border border-[#1F2933] bg-[#111827] px-4 py-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-[#E5E7EB]">{selectedCountry.country}</div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 border border-[#1F2933] px-2 py-0.5 text-[11px] text-[#9CA3AF]"
        >
          Close
        </button>
      </div>
      <p className="mt-2 text-[#9CA3AF]">Coins: {selectedCountry.coins}</p>
      <p className="mt-1 text-[#9CA3AF]">Banknotes: {selectedCountry.notes}</p>
    </div>
  );
}
