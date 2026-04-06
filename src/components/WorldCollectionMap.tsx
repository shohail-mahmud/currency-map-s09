import { geoNaturalEarth1, geoPath } from "d3-geo";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { CountryCollection } from "../types/collection";

type MapFeature = Feature<Geometry, { name?: string }>;

type WorldCollectionMapProps = {
  collection: CountryCollection[];
  selectedCountry?: string;
  onCountrySelect: (country: CountryCollection) => void;
};

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const COUNTRY_NAMES_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.tsv";
const MAP_WIDTH = 1400;
const MAP_HEIGHT = 900;
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

function parseCountryNames(tsv: string) {
  const lines = tsv.trim().split("\n");
  const nameMap = new Map<string, string>();

  for (let index = 1; index < lines.length; index += 1) {
    const [id, name] = lines[index].split("\t");
    if (id && name) {
      nameMap.set(id, name);
    }
  }

  return nameMap;
}

function brightenHex(hex: string, amount: number) {
  const sanitizedHex = hex.replace("#", "");
  const value = Number.parseInt(sanitizedHex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  const nextR = Math.min(255, Math.round(r + (255 - r) * amount));
  const nextG = Math.min(255, Math.round(g + (255 - g) * amount));
  const nextB = Math.min(255, Math.round(b + (255 - b) * amount));

  return `#${((1 << 24) + (nextR << 16) + (nextG << 8) + nextB).toString(16).slice(1).toUpperCase()}`;
}

export function WorldCollectionMap({ collection, selectedCountry, onCountrySelect }: WorldCollectionMapProps) {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPanGesture, setIsPanGesture] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 640);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  const clampPan = (nextPan: { x: number; y: number }, targetZoom: number) => {
    const minX = MAP_WIDTH - MAP_WIDTH * targetZoom;
    const minY = MAP_HEIGHT - MAP_HEIGHT * targetZoom;

    return {
      x: Math.min(0, Math.max(minX, nextPan.x)),
      y: Math.min(0, Math.max(minY, nextPan.y)),
    };
  };

  const getSvgPointFromClient = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) {
      return { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };
    }

    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * MAP_WIDTH,
      y: ((clientY - rect.top) / rect.height) * MAP_HEIGHT,
    };
  };

  const zoomBy = (delta: number, point: { x: number; y: number }) => {
    setZoom((currentZoom) => {
      const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + delta));
      if (clampedZoom === currentZoom) {
        return currentZoom;
      }

      setPan((currentPan) => {
        const worldX = (point.x - currentPan.x) / currentZoom;
        const worldY = (point.y - currentPan.y) / currentZoom;

        return clampPan(
          {
            x: point.x - worldX * clampedZoom,
            y: point.y - worldY * clampedZoom,
          },
          clampedZoom
        );
      });

      return clampedZoom;
    });
  };

  useEffect(() => {
    async function loadWorld() {
      const [topologyResponse, namesResponse] = await Promise.all([
        fetch(GEO_URL),
        fetch(COUNTRY_NAMES_URL),
      ]);

      const topology = await topologyResponse.json();
      const nameMap = parseCountryNames(await namesResponse.text());
      const converted = feature(topology, topology.objects.countries) as unknown;

      if (
        converted &&
        typeof converted === "object" &&
        "features" in converted &&
        Array.isArray((converted as { features: unknown[] }).features)
      ) {
        const normalizedFeatures = (converted as FeatureCollection<Geometry, { name?: string }>).features.map(
          (country) => {
            const countryId = String(country.id ?? "");
            const resolvedName = country.properties?.name ?? nameMap.get(countryId) ?? "Unknown";

            return {
              ...country,
              properties: {
                ...(country.properties ?? {}),
                name: resolvedName,
              },
            };
          }
        );

        setFeatures(normalizedFeatures);
      }
    }

    void loadWorld();
  }, []);

  const collectionMap = useMemo(() => {
    return new Map(collection.map((item) => [item.country.toLowerCase(), item]));
  }, [collection]);

  const projection = useMemo(() => {
    const projectionScale = geoNaturalEarth1();
    if (features.length > 0) {
      projectionScale.fitSize([MAP_WIDTH, MAP_HEIGHT], { type: "FeatureCollection", features });
    }
    return projectionScale;
  }, [features]);

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const getCountryData = (countryName: string) => {
    const existing = collectionMap.get(countryName.toLowerCase());
    return existing ?? { country: countryName, coins: 0, notes: 0 };
  };

  const getCountryFill = (countryName: string) => {
    const countryData = getCountryData(countryName);
    const hasCoins = countryData.coins > 0;
    const hasNotes = countryData.notes > 0;

    let baseColor = "#374151";
    if (hasCoins && hasNotes) {
      baseColor = "#EAB308";
    } else if (hasCoins && !hasNotes) {
      baseColor = "#EF4444";
    } else if (!hasCoins && hasNotes) {
      baseColor = "#3B82F6";
    }

    return hoveredCountry === countryName ? brightenHex(baseColor, 0.14) : baseColor;
  };

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const pointer = getSvgPointFromClient(event.clientX, event.clientY);
    zoomBy(event.deltaY < 0 ? 0.15 : -0.15, pointer);
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    panStartRef.current = pan;
    setIsPanGesture(false);
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;

    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      setIsPanGesture(true);
    }
    setPan(clampPan({ x: panStartRef.current.x + deltaX, y: panStartRef.current.y + deltaY }, zoom));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-0 bg-[#0F172A]">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="h-full w-full touch-none select-none"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
          <text
            x={MAP_WIDTH / 2}
            y={34}
            textAnchor="middle"
            fill="#E5E7EB"
            fontSize={isMobile ? "22" : "18"}
            letterSpacing="0.06em"
            fontFamily='"Playfair Display", Georgia, "Times New Roman", serif'
            fontWeight="600"
            pointerEvents="none"
            style={{ userSelect: "none" }}
          >
            Currency Map by S09
          </text>

          {features.map((country) => {
            const countryName = country.properties?.name ?? "Unknown";
            const countryPath = pathGenerator(country as never);

            if (!countryPath) return null;

            return (
              <path
                key={`${country.id}-${countryName}`}
                d={countryPath}
                fill={getCountryFill(countryName)}
                stroke={selectedCountry === countryName ? "#E5E7EB" : "#0F172A"}
                strokeWidth={selectedCountry === countryName ? 0.9 : 0.5}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredCountry(countryName)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={(event) => {
                  if (isPanGesture) return;
                  event.stopPropagation();

                  const fallbackCountryName =
                    countryName !== "Unknown" ? countryName : `Country ${String(country.id ?? "")}`;

                  onCountrySelect(getCountryData(fallbackCountryName));
                }}
              />
            );
          })}
        </g>
      </svg>

      <div className="fixed bottom-3 right-3 z-30 flex gap-2 sm:bottom-4 sm:right-4">
        <button
          type="button"
          onClick={() => {
            const svg = svgRef.current;
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            const centerPoint = getSvgPointFromClient(rect.left + rect.width / 2, rect.top + rect.height / 2);
            zoomBy(-0.25, centerPoint);
          }}
          className="h-10 w-10 border border-[#1F2933] bg-[#111827] text-lg leading-none text-[#9CA3AF] sm:h-8 sm:w-8 sm:text-base"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => {
            const svg = svgRef.current;
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            const centerPoint = getSvgPointFromClient(rect.left + rect.width / 2, rect.top + rect.height / 2);
            zoomBy(0.25, centerPoint);
          }}
          className="h-10 w-10 border border-[#1F2933] bg-[#111827] text-lg leading-none text-[#9CA3AF] sm:h-8 sm:w-8 sm:text-base"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="h-10 border border-[#1F2933] bg-[#111827] px-3 text-xs text-[#9CA3AF] sm:h-8"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
