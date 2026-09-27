import React, { useState, useMemo } from 'react';
import { useMissions } from '../../context/MissionContext';
import { Mission, MissionLocation } from '../../types/mission';
import {
  MapPin,
  Crosshair,
  Compass,
  Radio,
  Layers,
  Thermometer,
  Wind,
  Eye,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface TacticalMapViewProps {
  onSelectMission: (mission: Mission) => void;
}

export const TacticalMapView: React.FC<TacticalMapViewProps> = ({ onSelectMission }) => {
  const { missions } = useMissions();

  const [selectedMissionId, setSelectedMissionId] = useState<string>(missions[0]?.id || '');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeLayer, setActiveLayer] = useState<'tactical' | 'satellite' | 'grid'>('tactical');

  const selectedMission = missions.find((m) => m.id === selectedMissionId) || missions[0];

  // Map viewport bounds calculation based on missions
  const mapCenter = useMemo(() => {
    if (!missions.length) return { lat: 45.4215, lng: -75.6972 };
    const avgLat = missions.reduce((acc, m) => acc + m.location.coordinates[0], 0) / missions.length;
    const avgLng = missions.reduce((acc, m) => acc + m.location.coordinates[1], 0) / missions.length;
    return { lat: avgLat, lng: avgLng };
  }, [missions]);

  // Convert lat/lng to SVG X/Y (centered and scaled)
  const getCoordinatesPos = (lat: number, lng: number) => {
    // Relative to center: 45.42, -75.70
    const deltaLat = lat - 45.42;
    const deltaLng = lng - -75.70;

    // Scale to viewBox 800 x 500
    const x = 400 + deltaLng * 2800 * zoomLevel;
    const y = 250 - deltaLat * 2800 * zoomLevel;

    return { x: Math.max(50, Math.min(750, x)), y: Math.max(50, Math.min(450, y)) };
  };

  const getZoneColor = (zone: MissionLocation['zoneType']) => {
    switch (zone) {
      case 'staging_area':
        return '#06b6d4'; // cyan
      case 'active_perimeter':
        return '#f59e0b'; // amber
      case 'safe_zone':
        return '#10b981'; // emerald
      case 'restricted':
        return '#f43f5e'; // rose
      case 'logistics_hub':
        return '#8b5cf6'; // violet
      default:
        return '#06b6d4';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Geospatial Operations Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Tactical Field Map & Corridors
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time geospatial tracking of operational staging zones, relief perimeters, and field nodes.
          </p>
        </div>

        {/* Map Telemetry Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded">
            <button
              onClick={() => setActiveLayer('tactical')}
              className={`px-2 py-1 rounded transition-colors ${
                activeLayer === 'tactical' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Tactical Grid
            </button>
            <button
              onClick={() => setActiveLayer('satellite')}
              className={`px-2 py-1 rounded transition-colors ${
                activeLayer === 'satellite' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Terrain
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-1">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.3))}
              className="p-1 text-slate-400 hover:text-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.3))}
              className="p-1 text-slate-400 hover:text-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map + Right Intel Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vector SVG Tactical Radar Map */}
        <div className="lg:col-span-2 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden shadow-2xl min-h-[460px] flex flex-col justify-between select-none">
          {/* Top Overlay Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-auto flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grid Sector 45°N / 75°W</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400">{missions.length} Active Targets</span>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-[11px] font-mono text-emerald-400 pointer-events-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>GPS DGPS Fix: ±1.2m</span>
            </div>
          </div>

          {/* SVG Tactical Canvas */}
          <div className="w-full h-full min-h-[460px] flex-1 relative flex items-center justify-center">
            <svg
              className="w-full h-full absolute inset-0"
              viewBox="0 0 800 500"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Tactical grid pattern */}
                <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
                </pattern>
                {/* Secondary fine grid */}
                <pattern id="fineGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0f172a" strokeWidth="0.5" />
                </pattern>
                {/* Radar sweep glow */}
                <radialGradient id="radarCenter" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0891b2" stopOpacity="0.15" />
                  <stop offset="70%" stopColor="#0284c7" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background fill */}
              <rect width="800" height="500" fill="#030712" />
              <rect width="800" height="500" fill="url(#fineGrid)" />
              <rect width="800" height="500" fill="url(#tacticalGrid)" />
              <circle cx="400" cy="250" r="220" fill="url(#radarCenter)" />

              {/* Concentric radar rings */}
              <circle cx="400" cy="250" r="80" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="400" cy="250" r="160" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
              <circle cx="400" cy="250" r="230" fill="none" stroke="#334155" strokeWidth="1" />

              {/* Crosshairs */}
              <line x1="400" y1="20" x2="400" y2="480" stroke="#1e293b" strokeWidth="1" />
              <line x1="20" y1="250" x2="780" y2="250" stroke="#1e293b" strokeWidth="1" />

              {/* Tactical Corridor Lines between active missions */}
              {missions.slice(0, missions.length - 1).map((m, idx) => {
                const next = missions[idx + 1];
                const p1 = getCoordinatesPos(m.location.coordinates[0], m.location.coordinates[1]);
                const p2 = getCoordinatesPos(next.location.coordinates[0], next.location.coordinates[1]);
                return (
                  <g key={`corridor-${m.id}-${next.id}`}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#0891b2"
                      strokeWidth="1.5"
                      strokeDasharray="6,4"
                      strokeOpacity="0.6"
                    />
                  </g>
                );
              })}

              {/* Mission Location Perimeter Zones & Pins */}
              {missions.map((m) => {
                const pos = getCoordinatesPos(m.location.coordinates[0], m.location.coordinates[1]);
                const isSelected = m.id === selectedMission?.id;
                const zoneColor = getZoneColor(m.location.zoneType);

                return (
                  <g
                    key={m.id}
                    onClick={() => setSelectedMissionId(m.id)}
                    className="cursor-pointer group"
                  >
                    {/* Perimeter Zone Buffer Circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 42 : 28}
                      fill={zoneColor}
                      fillOpacity={isSelected ? 0.18 : 0.08}
                      stroke={zoneColor}
                      strokeWidth={isSelected ? 1.5 : 0.75}
                      strokeDasharray={isSelected ? 'none' : '3,3'}
                      className="transition-all duration-300"
                    />

                    {/* Outer Ring Pulse */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={52}
                        fill="none"
                        stroke={zoneColor}
                        strokeWidth="1"
                        strokeOpacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Center Node Target */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={7}
                      fill="#030712"
                      stroke={zoneColor}
                      strokeWidth="2.5"
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={3}
                      fill={zoneColor}
                    />

                    {/* Label Callout */}
                    <text
                      x={pos.x + 12}
                      y={pos.y + 4}
                      fill={isSelected ? '#38bdf8' : '#94a3b8'}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {m.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Map Legend */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400 z-10">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Staging Area</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Active Perimeter</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Safe Zone</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                <span>Logistics Hub</span>
              </span>
            </div>

            <div className="text-slate-500">
              Click pin to inspect operational field coordinates
            </div>
          </div>
        </div>

        {/* Right 1 Col: Selected Mission Geospatial Telemetry */}
        <div className="space-y-4">
          {selectedMission ? (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
              <div className="pb-3 border-b border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="text-cyan-400 font-bold">{selectedMission.code}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400">{selectedMission.status}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">
                    {selectedMission.title}
                  </h3>
                </div>
              </div>

              {/* Location telemetry card */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span className="text-cyan-400 uppercase font-semibold">Geospatial Target</span>
                  <span>{selectedMission.location.zoneType.replace('_', ' ').toUpperCase()}</span>
                </div>

                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{selectedMission.location.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                  <div>
                    <span className="text-slate-400">Latitude:</span>{' '}
                    <span className="text-slate-200">{selectedMission.location.coordinates[0].toFixed(4)}°N</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Longitude:</span>{' '}
                    <span className="text-slate-200">{selectedMission.location.coordinates[1].toFixed(4)}°W</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Elevation:</span>{' '}
                    <span className="text-slate-200">{selectedMission.location.elevationMeters || 65}m MSL</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Perimeter:</span>{' '}
                    <span className="text-cyan-400 font-medium">Secured</span>
                  </div>
                </div>

                {selectedMission.location.terrainOrWeather && (
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 text-slate-400 font-mono mb-0.5">
                      <Wind className="w-3 h-3 text-cyan-400" />
                      <span>Meteorological & Terrain Report:</span>
                    </div>
                    <p className="text-slate-300 leading-snug">{selectedMission.location.terrainOrWeather}</p>
                  </div>
                )}
              </div>

              {/* Execution progress */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Field Operations Progress</span>
                  <span>
                    {selectedMission.tasks.filter((t) => t.status === 'Done').length}/
                    {selectedMission.tasks.length} tasks
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{
                      width: `${
                        selectedMission.tasks.length > 0
                          ? (selectedMission.tasks.filter((t) => t.status === 'Done').length /
                              selectedMission.tasks.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <button
                onClick={() => onSelectMission(selectedMission)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/40 transition-all"
              >
                <span>Open Full Mission Briefing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
              No target selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
