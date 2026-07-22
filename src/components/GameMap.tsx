import { MapLocation } from '../types/game';
import { Crown, Hammer, Home, Landmark, Leaf, Pickaxe, Sparkles, Sword, TreePine } from 'lucide-react';

interface GameMapProps {
  locations: MapLocation[];
  currentLocationId?: string;
  onLocationSelect: (location: MapLocation) => void;
}

export function GameMap({ locations, currentLocationId, onLocationSelect }: GameMapProps) {
  return (
    <div className="relative aspect-[16/9] min-h-[360px] w-full overflow-hidden rounded-lg border border-emerald-900/30 bg-emerald-950 shadow-inner">
      <img
        src="/world-map.png"
        alt="Mapa do mundo"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-stone-950/10" />
      {locations.map((location) => {
        const isSelected = currentLocationId === location.id;

        return (
          <button
            key={location.id}
            className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-3 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/40 ${
              isSelected ? 'border-white ring-4 ring-white/45' : 'border-white/80'
            } ${getMarkerTone(location.type)}`}
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
            </span>
          </button>
        );
      })}
    </div>
  );
}

function getMarkerTone(type: MapLocation['type']) {
  if (type === 'enemy') return 'bg-red-700 text-white shadow-red-950/50';
  if (type === 'boss_lair') return 'bg-purple-700 text-white shadow-purple-950/50';
  if (type === 'event') return 'bg-amber-500 text-stone-950 shadow-amber-950/30';
  if (type === 'gathering') return 'bg-emerald-500 text-stone-950 shadow-emerald-950/30';
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
