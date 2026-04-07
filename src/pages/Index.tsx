import { useMemo, useState } from "react";
import { CollectionPanel } from "../components/CollectionPanel";
import { ColorLegend } from "../components/ColorLegend";
import { CountryInfoPanel } from "../components/CountryInfoPanel";
import { WorldCollectionMap } from "../components/WorldCollectionMap";
import { AdminLogin } from "../components/AdminLogin";
import { AddCountryPanel } from "../components/AddCountryPanel";
import { useCollectionData } from "../hooks/useCollectionData";
import { useAuth } from "../hooks/useAuth";
import type { CountryCollection } from "../types/collection";

const Index = () => {
  const [isCoinsOpen, setIsCoinsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCollection | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [zoomToCountry, setZoomToCountry] = useState<string | null>(null);

  const { data: collectionData = [], isLoading, refetch } = useCollectionData();
  const { user } = useAuth();

  const handleCountrySelect = (country: CountryCollection) => {
    setShowAddPanel(false);
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
        zoomToCountry={zoomToCountry}
      />

      <AdminLogin />

      {/* Add button - only visible when logged in */}
      {user && !showAddPanel && !selectedCountry && (
        <button
          type="button"
          onClick={() => setShowAddPanel(true)}
          className="fixed left-3 top-10 z-40 px-2 py-1 text-[10px] text-[#9CA3AF] opacity-60 hover:opacity-100 transition-opacity sm:left-4 sm:top-11 sm:text-[11px]"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          + Add
        </button>
      )}

      <CollectionPanel
        side="left"
        title="Coin Collection"
        isOpen={isCoinsOpen}
        onToggle={() => setIsCoinsOpen((prev) => !prev)}
        items={countriesWithCoins}
        type="coins"
        onCountryClick={(name) => { setZoomToCountry(null); setTimeout(() => setZoomToCountry(name), 0); }}
      />

      <CollectionPanel
        side="right"
        title="Banknote Collection"
        isOpen={isNotesOpen}
        onToggle={() => setIsNotesOpen((prev) => !prev)}
        items={countriesWithNotes}
        type="notes"
        onCountryClick={(name) => { setZoomToCountry(null); setTimeout(() => setZoomToCountry(name), 0); }}
      />

      {selectedCountry && (
        <CountryInfoPanel
          selectedCountry={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          isAdmin={!!user}
          onUpdated={() => {
            refetch();
            setSelectedCountry(null);
          }}
        />
      )}

      {showAddPanel && (
        <AddCountryPanel
          onClose={() => setShowAddPanel(false)}
          onAdded={() => refetch()}
          existingCountries={collectionData.map(c => c.country)}
        />
      )}

      <ColorLegend isRightPanelOpen={isNotesOpen} />
    </div>
  );
};

export default Index;
