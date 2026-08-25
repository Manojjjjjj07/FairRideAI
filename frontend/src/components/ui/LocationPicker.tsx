'use client';

/**
 * LocationPicker — React Leaflet + Nominatim
 *
 * Features:
 * - Address search bar with 600ms debounce → Nominatim forward geocoding
 * - Leaflet map (collapsed by default, toggled via button)
 * - Draggable pin → reverse geocode on drag end
 * - Click anywhere on map → reverse geocode
 * - "Use My Location" → browser Geolocation API → reverse geocode
 * - Default center: Bengaluru (12.9716, 77.5946); overridden by geolocation on open
 *
 * Uses dynamic import (ssr:false) — see LocationPickerWrapper below.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Search, LocateFixed, MapPin, ChevronDown, ChevronUp, Loader2, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationPickerProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BENGALURU: [number, number] = [12.9716, 77.5946];
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'FairRideAI/1.0 (fairrideai.app)';

// ─── Nominatim helpers ────────────────────────────────────────────────────────

async function forwardGeocode(query: string): Promise<Suggestion[]> {
  const url =
    `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) return [];
  return res.json();
}

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const url =
    `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.display_name ?? null;
}

// ─── Inner map component (only rendered client-side) ─────────────────────────

function LocationPickerInner({ value, onChange }: LocationPickerProps) {
  // Leaflet imports — done inside component to avoid SSR issues
  const { MapContainer, TileLayer, Marker, useMapEvents } = require('react-leaflet');
  const L = require('leaflet');

  // Fix default Leaflet icon paths (webpack asset issue)
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  // ─── State ────────────────────────────────────────────────────────────────
  const [mapOpen,      setMapOpen]      = useState(false);
  const [query,        setQuery]        = useState(value);
  const [suggestions,  setSuggestions]  = useState<Suggestion[]>([]);
  const [showSuggest,  setShowSuggest]  = useState(false);
  const [pin,          setPin]          = useState<[number, number]>(BENGALURU);
  const [mapCenter,    setMapCenter]    = useState<[number, number]>(BENGALURU);
  const [locating,     setLocating]     = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markerRef   = useRef<any>(null);

  // Sync query with external value on mount
  useEffect(() => {
    if (value && value !== query) setQuery(value);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Geolocation on map open ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapOpen) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPin([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        doReverse(latitude, longitude);
      },
      () => { /* denied — use Bengaluru default */ }
    );
  }, [mapOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Reverse geocode helper ────────────────────────────────────────────────
  const doReverse = useCallback(async (lat: number, lng: number) => {
    setReverseLoading(true);
    const addr = await reverseGeocode(lat, lng);
    setReverseLoading(false);
    if (addr) {
      setQuery(addr);
      onChange(addr, lat, lng);
    }
  }, [onChange]);

  // ─── Debounced search ─────────────────────────────────────────────────────
  const handleSearchInput = (val: string) => {
    setQuery(val);
    onChange(val, pin[0], pin[1]); // keep form in sync even before geocode
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setSuggestions([]); setShowSuggest(false); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await forwardGeocode(val);
      setSuggestions(results);
      setShowSuggest(results.length > 0);
    }, 600);
  };

  // ─── Suggestion select ────────────────────────────────────────────────────
  const selectSuggestion = (s: Suggestion) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setPin([lat, lng]);
    setMapCenter([lat, lng]);
    setQuery(s.display_name);
    setSuggestions([]);
    setShowSuggest(false);
    onChange(s.display_name, lat, lng);
  };

  // ─── "Use My Location" button ─────────────────────────────────────────────
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        setPin([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        doReverse(latitude, longitude);
      },
      () => setLocating(false)
    );
  };

  // ─── Map click + marker drag handler ──────────────────────────────────────
  function MapEvents() {
    useMapEvents({
      click(e: any) {
        const { lat, lng } = e.latlng;
        setPin([lat, lng]);
        doReverse(lat, lng);
      },
    });
    return null;
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">

      {/* Search row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {reverseLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
          </div>
          <input
            type="text"
            className="input-glass w-full"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search address or pick on map…"
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
            autoComplete="off"
          />
          {/* Suggestions dropdown */}
          {showSuggest && (
            <div className="absolute z-[9999] top-full left-0 right-0 mt-1 bg-slate-900/98 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-3 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-b border-slate-800/60 last:border-0 flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Use My Location */}
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors shrink-0 disabled:opacity-50"
          title="Use my current location"
        >
          {locating
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <LocateFixed className="w-4 h-4" />
          }
          <span className="hidden sm:inline">My Location</span>
        </button>

        {/* Toggle map */}
        <button
          type="button"
          onClick={() => setMapOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition-colors shrink-0"
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">Pick on Map</span>
          {mapOpen
            ? <ChevronUp className="w-3.5 h-3.5" />
            : <ChevronDown className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Leaflet map (collapsed by default) */}
      {mapOpen && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/60 relative">
          <div className="h-[260px] sm:h-[300px] w-full relative z-0">
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              key={`${mapCenter[0]}-${mapCenter[1]}`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapEvents />
              <Marker
                position={pin}
                draggable={true}
                ref={markerRef}
                eventHandlers={{
                  dragend: () => {
                    const latlng = markerRef.current?.getLatLng();
                    if (latlng) {
                      setPin([latlng.lat, latlng.lng]);
                      doReverse(latlng.lat, latlng.lng);
                    }
                  },
                }}
              />
            </MapContainer>
          </div>

          {/* Confirmed address strip */}
          {query && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/80 border-t border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <p className="text-xs text-slate-300 font-medium truncate flex-1">{query}</p>
              <button
                type="button"
                onClick={() => { setQuery(''); onChange('', pin[0], pin[1]); }}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SSR-safe wrapper (default export) ───────────────────────────────────────

const LocationPickerDynamic = dynamic(
  () => Promise.resolve(LocationPickerInner),
  { ssr: false, loading: () => (
    <div className="input-glass flex items-center gap-2 text-slate-400 text-xs">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Loading map…</span>
    </div>
  )}
);

export default function LocationPicker(props: LocationPickerProps) {
  return <LocationPickerDynamic {...props} />;
}
