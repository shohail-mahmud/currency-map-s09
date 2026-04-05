import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CountryCollection } from "../types/collection";

type CountryInfoPanelProps = {
  selectedCountry: CountryCollection;
  onClose: () => void;
  isAdmin: boolean;
  onUpdated: () => void;
};

export function CountryInfoPanel({ selectedCountry, onClose, isAdmin, onUpdated }: CountryInfoPanelProps) {
  const [editing, setEditing] = useState(false);
  const [coins, setCoins] = useState(selectedCountry.coins);
  const [notes, setNotes] = useState(selectedCountry.notes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("collections")
      .upsert(
        { country: selectedCountry.country, coins, notes },
        { onConflict: "country" }
      );

    if (!error) {
      onUpdated();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    await supabase.from("collections").delete().eq("country", selectedCountry.country);
    onUpdated();
    onClose();
    setSaving(false);
  };

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

      {editing ? (
        <div className="mt-2 space-y-1.5">
          <label className="flex items-center gap-2 text-[#9CA3AF]">
            Coins:
            <input
              type="number"
              min={0}
              value={coins}
              onChange={(e) => setCoins(Number(e.target.value))}
              className="w-16 border border-[#1F2933] bg-[#0F172A] px-1.5 py-0.5 text-[#E5E7EB] outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-[#9CA3AF]">
            Banknotes:
            <input
              type="number"
              min={0}
              value={notes}
              onChange={(e) => setNotes(Number(e.target.value))}
              className="w-16 border border-[#1F2933] bg-[#0F172A] px-1.5 py-0.5 text-[#E5E7EB] outline-none"
            />
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="border border-[#1F2933] bg-[#1F2933] px-2 py-0.5 text-[11px] text-[#E5E7EB] hover:bg-[#374151] disabled:opacity-50"
            >
              {saving ? "..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border border-[#1F2933] px-2 py-0.5 text-[11px] text-[#9CA3AF]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="ml-auto border border-red-900 px-2 py-0.5 text-[11px] text-red-400 hover:bg-red-900/30 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[#9CA3AF]">Coins: {selectedCountry.coins}</p>
          <p className="mt-1 text-[#9CA3AF]">Banknotes: {selectedCountry.notes}</p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setCoins(selectedCountry.coins);
                setNotes(selectedCountry.notes);
                setEditing(true);
              }}
              className="mt-2 border border-[#1F2933] px-2 py-0.5 text-[11px] text-[#9CA3AF] hover:text-[#E5E7EB]"
            >
              Edit
            </button>
          )}
        </>
      )}
    </div>
  );
}
