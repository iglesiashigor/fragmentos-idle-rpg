import { MapLocation } from '../types/game';
import { Crown, Hammer, Home, Landmark, Leaf, Pickaxe, Sparkles, Sword, TreePine } from 'lucide-react';

interface GameMapProps {
  locations: MapLocation[];
  currentLocationId?: string;
  markerStates?: Record<
    string,
    {
      status?: 'ready' | 'cooldown' | 'easy' | 'normal' | 'hard';
      label?: string;
    }
  >;
  onLocationSelect: (location: MapLocation) => void;
}

export function GameMap({
  locations,
  currentLocationId,
  markerStates = {},
  onLocationSelect,
}: GameMapProps) {
  return (
    <div className="space-y-3">
    <div className="relative aspect-[16/9] min-h-[320px] w-full overflow-hidden rounded-xl border-4 border-[#d5c7a7] bg-emerald-950 shadow-inner">
      <picture>
        <source srcSet="/world-map.webp" type="image/webp" />
        <img
          src="/world-map.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      </picture>
      <div className="absolute inset-0 bg-stone-950/10" />
      {locations.map((location) => {
        const isSelected = currentLocationId === location.id;
        const markerState = markerStates[location.id];
        const isCoolingDown = markerState?.status === 'cooldown';

        return (
          <button
            key={location.id}
            type="button"
            aria-label={`${location.name}${location.level ? `, nível ${location.level}` : ''}${markerState?.label ? `, ${markerState.label}` : ''}`}
            aria-pressed={isSelected}
            className={`group absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-200 ${
              isSelected ? 'border-white ring-4 ring-white/45' : 'border-white/80'
            } ${getMarkerTone(location.type, markerState?.status)} ${
              isCoolingDown ? 'opacity-55 grayscale' : ''
            }`}
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
            onClick={() => onLocationSelect(location)}
            title={location.name}
          >
            {location.type === 'enemy' ? (
              <Sword className="h-6 w-6" />
            ) : location.type === 'boss_lair' ? (
              <Crown className="h-6 w-6" />
            ) : location.type === 'event' ? (
              <Sparkles className="h-6 w-6" />
            ) : location.type === 'gathering' ? (
              <GatheringIcon resourcePool={location.resourcePool} />
            ) : (
              <Home className="h-6 w-6" />
            )}
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden min-w-max -translate-x-1/2 rounded-md bg-stone-950/95 px-3 py-2 text-xs font-black text-white shadow-lg group-hover:block group-focus:block">
              {location.name}
              {location.level ? ` Nv. ${location.level}` : ''}
              {markerState?.label ? ` - ${markerState.label}` : ''}
            </span>
          </button>
        );
      })}
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" aria-label="Destinos do mapa">
      {locations.map((location) => {
        const isSelected = currentLocationId === location.id;
        const state = markerStates[location.id];
        return (
          <button
            key={location.id}
            type="button"
            onClick={() => onLocationSelect(location)}
            aria-pressed={isSelected}
            className={`min-h-14 rounded-lg border px-3 py-2 text-left transition-colors ${isSelected ? 'border-amber-600 bg-amber-100 text-stone-950 shadow-sm' : 'border-stone-300 bg-white text-stone-800 hover:border-amber-500 hover:bg-amber-50'}`}
          >
            <span className="block truncate text-sm font-bold">{location.name}</span>
            <span className="block text-xs font-semibold text-stone-600">
              {location.level ? `Nv. ${location.level}` : 'Destino'}{state?.label ? ` · ${state.label}` : ''}
            </span>
          </button>
        );
      })}
    </div>
    </div>
  );
}

function getMarkerTone(
  type: MapLocation['type'],
  status?: 'ready' | 'cooldown' | 'easy' | 'normal' | 'hard'
) {
  if (type === 'enemy') {
    if (status === 'hard') return 'bg-red-900 text-white shadow-red-950/60';
    if (status === 'easy') return 'bg-orange-500 text-stone-950 shadow-orange-950/30';
    return 'bg-red-700 text-white shadow-red-950/50';
  }
  if (type === 'boss_lair') {
    if (status === 'cooldown') return 'bg-stone-500 text-white shadow-stone-950/40';
    return 'bg-purple-700 text-white shadow-purple-950/50';
  }
  if (type === 'event') return 'bg-amber-500 text-stone-950 shadow-amber-950/30';
  if (type === 'gathering') {
    if (status === 'cooldown') return 'bg-stone-500 text-white shadow-stone-950/40';
    return 'bg-emerald-500 text-stone-950 shadow-emerald-950/30';
  }
  return 'bg-sky-700 text-white shadow-sky-950/40';
}

function GatheringIcon({ resourcePool }: { resourcePool?: string }) {
  if (resourcePool === 'forest') {
    return <TreePine className="w-6 h-6" />;
  }
  if (resourcePool === 'quarry') {
    return <Pickaxe className="w-6 h-6" />;
  }
  if (resourcePool === 'grove') {
    return <Leaf className="w-6 h-6" />;
  }
  if (resourcePool === 'ruins') {
    return <Landmark className="w-6 h-6" />;
  }
  return <Hammer className="w-6 h-6" />;
}
