import { MapLocation } from '../types/game';
import { Sword, Home, Sparkles } from 'lucide-react';

interface GameMapProps {
  locations: MapLocation[];
  onLocationSelect: (location: MapLocation) => void;
}

export function GameMap({ locations, onLocationSelect }: GameMapProps) {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-emerald-900/30 bg-emerald-950 shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(250,204,21,0.18),transparent_18rem),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.2),transparent_20rem)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(45deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />
      {locations.map((location) => (
        <button
          key={location.id}
          className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70 p-3 shadow-lg transition-transform hover:scale-110 ${
            location.type === 'enemy'
              ? 'bg-red-700 text-white shadow-red-950/50'
              : location.type === 'event'
                ? 'bg-amber-500 text-stone-950 shadow-amber-950/30'
                : 'bg-sky-700 text-white shadow-sky-950/40'
          }`}
          style={{ left: `${location.x}%`, top: `${location.y}%` }}
          onClick={() => onLocationSelect(location)}
          title={location.name}
        >
          {location.type === 'enemy' ? (
            <Sword className="w-6 h-6" />
          ) : location.type === 'event' ? (
            <Sparkles className="w-6 h-6" />
          ) : (
            <Home className="w-6 h-6" />
          )}
        </button>
      ))}
    </div>
  );
}
