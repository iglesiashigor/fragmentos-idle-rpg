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
    <div className="relative aspect-[16/9] min-h-[360px] w-full overflow-hidden rounded-lg border border-emerald-900/30 bg-emerald-950 shadow-inner">
      <picture>
        <source srcSet="/world-map.webp" type="image/webp" />
        <img
          src="/world-map.png"
          alt="Mapa do mundo"
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
            className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-3 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/40 ${
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
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden min-w-max -translate-x-1/2 rounded-md bg-stone-950/90 px-2 py-1 text-xs font-black text-white shadow-lg group-hover:block">
              {location.name}
              {location.level ? ` Nv. ${location.level}` : ''}
              {markerState?.label ? ` - ${markerState.label}` : ''}
            </span>
          </button>
        );
      })}
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
