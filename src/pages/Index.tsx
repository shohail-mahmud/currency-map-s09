import { useMemo, useState } from "react";
import { CollectionPanel } from "../components/CollectionPanel";
import { ColorLegend } from "../components/ColorLegend";
import { CountryInfoPanel } from "../components/CountryInfoPanel";
import { WorldCollectionMap } from "../components/WorldCollectionMap";
import { useCollectionData } from "../hooks/useCollectionData";
import type { CountryCollection } from "../types/collection";

const Index = () => {
  const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 768;
  const [isCoinsOpen, setIsCoinsOpen] = useState(!isMobileViewport);
  const [isNotesOpen, setIsNotesOpen] = useState(!isMobileViewport);
  const [selectedCountry, setSelectedCountry] = useState<CountryCollection | null>(null);

  const { data: collectionData = [], isLoading } = useCollectionData();

  const handleCountrySelect = (country: CountryCollection) => {
    setSelectedCountry((previous) => (previous?.country === country.country ? null : country));
  };

  const countriesWithCoins = useMemo(
    () => collectionData.filter((country) => country.coins > 0).sort((a, b) => b.coins - a.coins),
    [collectionData]
  );
  const countriesWithNotes = useMemo(
    () => collectionData.filter((country) => country.notes > 0).sort((a, b) => b.notes - a.notes),
    [collectionData]
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0F172A] text-[#9CA3AF]">
        Loading collection…
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0F172A] text-[#E5E7EB]">
      <WorldCollectionMap
        collection={collectionData}
        onCountrySelect={handleCountrySelect}
        selectedCountry={selectedCountry?.country}
      />

      <CollectionPanel
        side="left"
        title="Coin Collection"
        isOpen={isCoinsOpen}
        onToggle={() => setIsCoinsOpen((prev) => !prev)}
        items={countriesWithCoins}
        type="coins"
      />

      <CollectionPanel
        side="right"
        title="Banknote Collection"
        isOpen={isNotesOpen}
        onToggle={() => setIsNotesOpen((prev) => !prev)}
        items={countriesWithNotes}
        type="notes"
      />

      {selectedCountry && (
        <CountryInfoPanel selectedCountry={selectedCountry} onClose={() => setSelectedCountry(null)} />
      )}

      <ColorLegend isRightPanelOpen={isNotesOpen} />
    </div>
  );
};

export default Index;
