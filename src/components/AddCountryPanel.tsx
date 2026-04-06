import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

// Full list of world countries for search
const ALL_COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Democratic Republic of the Congo","Denmark","Djibouti","Dominica",
  "Dominican Republic","East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini",
  "Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala",
  "Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait",
  "Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico",
  "Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal",
  "Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan",
  "Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
  "Romania","Russian Federation","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines",
  "Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone",
  "Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain",
  "Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo",
  "Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

type AddCountryPanelProps = {
  onClose: () => void;
  onAdded: () => void;
  existingCountries: string[];
};

export function AddCountryPanel({ onClose, onAdded, existingCountries }: AddCountryPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [coins, setCoins] = useState(0);
  const [notes, setNotes] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const existingSet = useMemo(() => new Set(existingCountries.map(c => c.toLowerCase())), [existingCountries]);

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return ALL_COUNTRIES
      .filter(c => c.toLowerCase().includes(q) && !existingSet.has(c.toLowerCase()))
      .slice(0, 6);
  }, [search, existingSet]);

  const handleSave = async () => {
    if (!selectedCountry) {
      setError("Select a country first");
      return;
    }
    if (coins < 0 || notes < 0) {
      setError("Values must be 0 or greater");
      return;
    }
    setSaving(true);
    setError("");

    const { error: dbError } = await supabase
      .from("collections")
      .upsert({ country: selectedCountry, coins, notes }, { onConflict: "country" });

    if (dbError) {
      setError(dbError.message);
    } else {
      onAdded();
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[280px] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 border border-[#1F2933] bg-[#111827] px-4 py-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[12px] font-medium text-[#E5E7EB]">Add Country</span>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 border border-[#1F2933] px-2 py-0.5 text-[11px] text-[#9CA3AF]"
        >
          Close
        </button>
      </div>

      <div className="mt-2 space-y-1.5">
        {/* Country search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search country..."
            value={selectedCountry || search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedCountry("");
            }}
            className="w-full border border-[#1F2933] bg-[#0F172A] px-2 py-1.5 text-[11px] text-[#E5E7EB] placeholder-[#6B7280] outline-none focus:border-[#374151]"
          />
          {filtered.length > 0 && !selectedCountry && (
            <ul className="absolute left-0 right-0 top-full z-10 max-h-[150px] overflow-y-auto border border-[#1F2933] bg-[#111827]">
              {filtered.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCountry(c);
                      setSearch("");
                    }}
                    className="w-full px-2 py-1.5 text-left text-[11px] text-[#E5E7EB] hover:bg-[#1F2933]"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="flex items-center gap-2 text-[11px] text-[#9CA3AF]">
          Coins:
          <input
            type="number"
            min={0}
            max={9999}
            value={coins}
            onChange={(e) => setCoins(Math.max(0, Number(e.target.value)))}
            className="w-16 border border-[#1F2933] bg-[#0F172A] px-1.5 py-0.5 text-[#E5E7EB] outline-none"
          />
        </label>
        <label className="flex items-center gap-2 text-[11px] text-[#9CA3AF]">
          Banknotes:
          <input
            type="number"
            min={0}
            max={9999}
            value={notes}
            onChange={(e) => setNotes(Math.max(0, Number(e.target.value)))}
            className="w-16 border border-[#1F2933] bg-[#0F172A] px-1.5 py-0.5 text-[#E5E7EB] outline-none"
          />
        </label>

        {error && <p className="text-[10px] text-red-400">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !selectedCountry}
          className="w-full border border-[#1F2933] bg-[#1F2933] px-2 py-1.5 text-[11px] text-[#E5E7EB] hover:bg-[#374151] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
