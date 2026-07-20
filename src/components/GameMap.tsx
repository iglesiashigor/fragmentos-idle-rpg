import { MapLocation } from '../types/game';
import { Crown, Hammer, Home, Landmark, Leaf, Pickaxe, Sparkles, Sword, TreePine } from 'lucide-react';

interface GameMapProps {
  locations: MapLocation[];
  onLocationSelect: (location: MapLocation) => void;
}

export function GameMap({ locations, onLocationSelect }: GameMapProps) {
  return (
    <div className="relative aspect-[16/9] min-h-[360px] w-full overflow-hidden rounded-lg border border-emerald-900/30 bg-emerald-950 shadow-inner">
      <img
        src="/world-map.png"
        alt="Mapa do mundo"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-stone-950/10" />
      {locations.map((location) => (
        <button
          key={location.id}
          className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 p-3 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/40 ${
            location.type === 'enemy'
              ? 'bg-red-700 text-white shadow-red-950/50'
              : location.type === 'boss_lair'
                ? 'bg-purple-700 text-white shadow-purple-950/50'
              : location.type === 'event'
                ? 'bg-amber-500 text-stone-950 shadow-amber-950/30'
                : location.type === 'gathering'
                  ? 'bg-emerald-500 text-stone-950 shadow-emerald-950/30'
                  : 'bg-sky-700 text-white shadow-sky-950/40'
          }`}
          style={{ left: `${location.x}%`, top: `${location.y}%` }}
          onClick={() => onLocationSelect(location)}
          title={location.name}
        >
          {location.type === 'enemy' ? (
            <Sword className="w-6 h-6" />
          ) : location.type === 'boss_lair' ? (
            <Crown className="w-6 h-6" />
          ) : location.type === 'event' ? (
            <Sparkles className="w-6 h-6" />
          ) : location.type === 'gathering' ? (
            <GatheringIcon resourcePool={location.resourcePool} />
          ) : (
            <Home className="w-6 h-6" />
          )}
        </button>
      ))}
    </div>
  );
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
