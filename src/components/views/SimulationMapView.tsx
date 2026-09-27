import React, { useState, useRef } from 'react';
import { useTactical } from '../../context/TacticalContext';
import { MapMarker } from '../../types/tactical';
import {
  MapPin,
  Play,
  Pause,
  Layers,
  Crosshair,
  Shield,
  Truck,
  Eye,
  Flag,
  Radio,
  Plus,
  Compass,
  CloudRain,
  Maximize2
} from 'lucide-react';

export const SimulationMapView: React.FC = () => {
  const {
    mapMarkers,
    updateMapMarkerPosition,
    addMapMarker,
    simulationClockRunning,
    toggleSimulationClock,
    selectedExercise,
    canPerform
  } = useTactical();

  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(mapMarkers[0] || null);
  const [showBlueForces, setShowBlueForces] = useState<boolean>(true);
  const [showRedOpfor, setShowRedOpfor] = useState<boolean>(true);
  const [showLogisticsRoutes, setShowLogisticsRoutes] = useState<boolean>(true);
  const [showThreatRings, setShowThreatRings] = useState<boolean>(true);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [hoverGrid, setHoverGrid] = useState<string>('32UND 8560 9180');
  const [showAddMarkerModal, setShowAddMarkerModal] = useState<boolean>(false);

  // New marker form
  const [newMarkerName, setNewMarkerName] = useState<string>('Waypoint Tango');
  const [newMarkerType, setNewMarkerType] = useState<MapMarker['type']>('WAYPOINT');
  const [newMarkerDetails, setNewMarkerDetails] = useState<string>('Rendezvous point for squad consolidation.');

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicked near an existing marker
    const clickedMarker = mapMarkers.find(
      (m) => Math.abs(m.x - clickX) < 4 && Math.abs(m.y - clickY) < 4
    );

    if (clickedMarker) {
      setSelectedMarker(clickedMarker);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    // Calculate simulated MGRS coordinates based on x/y
    const easting = 8400 + Math.round(xPct * 70);
    const northing = 9000 + Math.round((100 - yPct) * 50);
    setHoverGrid(`32UND ${easting} ${northing}`);
  };

  const handleAddMarkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMapMarker({
      name: newMarkerName,
      type: newMarkerType,
      x: 50 + (Math.random() * 20 - 10),
      y: 50 + (Math.random() * 20 - 10),
      status: 'NEWLY DESIGNATED',
      details: newMarkerDetails,
      gridMGRS: hoverGrid
    });
    setShowAddMarkerModal(false);
  };

  const getMarkerColor = (type: MapMarker['type']) => {
    switch (type) {
      case 'BLUE_FORCE':
        return 'bg-sky-500 border-sky-300 text-zinc-950 shadow-sky-500/50';
      case 'RED_SIM':
        return 'bg-red-500 border-red-300 text-zinc-950 shadow-red-500/50';
      case 'NEUTRAL_LOGISTICS':
        return 'bg-amber-400 border-amber-200 text-zinc-950 shadow-amber-500/50';
      case 'FORWARD_BASE':
        return 'bg-emerald-500 border-emerald-300 text-zinc-950 shadow-emerald-500/50';
      case 'OBJECTIVE_FLAG':
        return 'bg-purple-500 border-purple-300 text-zinc-950 shadow-purple-500/50';
      default:
        return 'bg-zinc-400 border-zinc-200 text-zinc-950 shadow-zinc-500/50';
    }
  };

  const getMarkerIcon = (type: MapMarker['type']) => {
    switch (type) {
      case 'BLUE_FORCE':
        return <Shield className="w-3.5 h-3.5" />;
      case 'RED_SIM':
        return <Crosshair className="w-3.5 h-3.5" />;
      case 'NEUTRAL_LOGISTICS':
        return <Truck className="w-3.5 h-3.5" />;
      case 'FORWARD_BASE':
        return <Radio className="w-3.5 h-3.5" />;
      case 'OBJECTIVE_FLAG':
        return <Flag className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Compass className="w-4 h-4" />
            <span>SECTOR 7 TACTICAL SIMULATION GRID</span>
          </div>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="text-zinc-400 font-bold hidden sm:inline">MGRS: {hoverGrid}</span>
        </div>

        {/* Playback Controls & Layers */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSimulationClock}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold"
          >
            {simulationClockRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
            <span>{simulationClockRunning ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <div className="flex items-center p-0.5 bg-zinc-950 rounded border border-zinc-800 text-[10px]">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2 py-0.5 rounded ${simSpeed === spd ? 'bg-zinc-800 text-amber-400 font-bold' : 'text-zinc-400'}`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {canPerform('EDIT_MISSION') && (
            <button
              onClick={() => setShowAddMarkerModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD PIN</span>
            </button>
          )}
        </div>
      </div>

      {/* Layer Visibility Toggles */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 cursor-pointer">
          <input
            type="checkbox"
            checked={showBlueForces}
            onChange={(e) => setShowBlueForces(e.target.checked)}
            className="accent-sky-500"
          />
          <span className="text-sky-300">Blue Force ({mapMarkers.filter((m) => m.type === 'BLUE_FORCE').length})</span>
        </label>

        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 cursor-pointer">
          <input
            type="checkbox"
            checked={showRedOpfor}
            onChange={(e) => setShowRedOpfor(e.target.checked)}
            className="accent-red-500"
          />
          <span className="text-red-300">Sim OPFOR ({mapMarkers.filter((m) => m.type === 'RED_SIM').length})</span>
        </label>

        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 cursor-pointer">
          <input
            type="checkbox"
            checked={showLogisticsRoutes}
            onChange={(e) => setShowLogisticsRoutes(e.target.checked)}
            className="accent-amber-500"
          />
          <span className="text-amber-300">Logistics Routes (MSR)</span>
        </label>

        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 cursor-pointer">
          <input
            type="checkbox"
            checked={showThreatRings}
            onChange={(e) => setShowThreatRings(e.target.checked)}
            className="accent-purple-500"
          />
          <span className="text-purple-300">Threat Rings</span>
        </label>

        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 cursor-pointer">
          <input
            type="checkbox"
            checked={showWeatherOverlay}
            onChange={(e) => setShowWeatherOverlay(e.target.checked)}
            className="accent-emerald-500"
          />
          <span className="text-emerald-300">Weather & Dust Sim</span>
        </label>
      </div>

      {/* The Interactive Tactical Map Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Viewport (8 Cols) */}
        <div
          ref={mapContainerRef}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          className="lg:col-span-8 relative aspect-[16/10] bg-zinc-950 rounded-lg border-2 border-zinc-800 overflow-hidden select-none cursor-crosshair shadow-2xl"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(24, 24, 27, 0.4) 0%, rgba(9, 9, 11, 0.95) 100%),
              linear-gradient(to right, rgba(63, 63, 70, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(63, 63, 70, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 8% 8%, 8% 8%'
          }}
        >
          {/* Simulated Topographic Elevation Contour Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 50,150 Q 200,80 400,120 T 700,90 T 950,220"
              fill="none"
              stroke="#e4e4e7"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <path
              d="M 20,300 Q 250,240 500,280 T 800,210 T 1100,350"
              fill="none"
              stroke="#e4e4e7"
              strokeWidth="1.2"
            />
            <path
              d="M 100,450 Q 350,380 600,420 T 900,360 T 1150,480"
              fill="none"
              stroke="#e4e4e7"
              strokeWidth="1.2"
              strokeDasharray="8 4"
            />
          </svg>

          {/* Logistics MSR Routes (Vectors) */}
          {showLogisticsRoutes && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* MSR Bronze Route Line */}
              <polyline
                points="280,210 390,270 480,175 620,325"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="opacity-70"
              />
              <text x="320" y="240" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                MSR BRONZE
              </text>
            </svg>
          )}

          {/* Threat Range Rings */}
          {showThreatRings && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="74%"
                cy="38%"
                r="70"
                fill="rgba(239, 68, 68, 0.08)"
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x="74%" y="30%" fill="#ef4444" fontSize="9" fontFamily="monospace" textAnchor="middle">
                SIM OPFOR DETECTION ZONE (3.5KM)
              </text>
            </svg>
          )}

          {/* Weather / Dust Cloud Overlay */}
          {showWeatherOverlay && (
            <div className="absolute inset-0 pointer-events-none bg-amber-500/10 backdrop-blur-[0.5px] flex items-center justify-center">
              <div className="font-mono text-xs text-amber-300 font-bold bg-zinc-950/80 px-3 py-1 rounded border border-amber-500/40">
                SIMULATED DUST STORM // VISIBILITY REDUCED TO 1.5KM
              </div>
            </div>
          )}

          {/* Tactical Grid Labels */}
          <div className="absolute top-2 left-2 font-mono text-[9px] text-zinc-500 pointer-events-none">
            GRID NORTH 32U
          </div>
          <div className="absolute bottom-2 right-2 font-mono text-[9px] text-zinc-500 pointer-events-none">
            SCALE: 1:50,000 (1 GRID = 1000m)
          </div>

          {/* Unit Markers */}
          {mapMarkers.map((marker) => {
            if (marker.type === 'BLUE_FORCE' && !showBlueForces) return null;
            if (marker.type === 'RED_SIM' && !showRedOpfor) return null;

            const isSelected = selectedMarker?.id === marker.id;

            return (
              <div
                key={marker.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMarker(marker);
                }}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Marker Pin */}
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center border shadow-lg transition-transform ${
                    isSelected ? 'scale-125 ring-2 ring-amber-400' : 'hover:scale-110'
                  } ${getMarkerColor(marker.type)}`}
                >
                  {getMarkerIcon(marker.type)}
                </div>

                {/* Micro Label */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-950/90 border border-zinc-800 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-200 pointer-events-none">
                  {marker.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Unit Telemetry Sidebar (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono flex flex-col justify-between">
          {selectedMarker ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">{selectedMarker.type.replace('_', ' ')}</span>
                  <h3 className="font-bold text-zinc-100 text-sm mt-0.5">{selectedMarker.name}</h3>
                </div>
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center ${getMarkerColor(
                    selectedMarker.type
                  )}`}
                >
                  {getMarkerIcon(selectedMarker.type)}
                </div>
              </div>

              <div className="space-y-2.5 font-sans">
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-xs">
                  <div className="text-[10px] text-zinc-500 uppercase">OPERATIONAL STATUS</div>
                  <div className="text-amber-400 font-bold mt-0.5">{selectedMarker.status}</div>
                </div>

                <div className="text-zinc-300 text-xs leading-relaxed">
                  {selectedMarker.details}
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                  <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block text-[9px]">MGRS GRID</span>
                    <span className="font-bold text-zinc-200">{selectedMarker.gridMGRS}</span>
                  </div>

                  <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block text-[9px]">UNIT STRENGTH</span>
                    <span className="font-bold text-emerald-400">
                      {selectedMarker.unitStrength ? `${selectedMarker.unitStrength} Personnel` : 'Tactical Node'}
                    </span>
                  </div>

                  {selectedMarker.speedKmh !== undefined && (
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[9px]">VELOCITY</span>
                      <span className="font-bold text-zinc-200">{selectedMarker.speedKmh} km/h</span>
                    </div>
                  )}

                  {selectedMarker.headingDeg !== undefined && (
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[9px]">HEADING</span>
                      <span className="font-bold text-zinc-200">{selectedMarker.headingDeg}° True</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500">
              Click any tactical marker on the map to inspect telemetry.
            </div>
          )}

          <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500">
            Coordinates: WGS-84 / MGRS Datum. Real-time telemetry feed encrypted.
          </div>
        </div>
      </div>

      {/* Add Marker Modal */}
      {showAddMarkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                DEPLOY TACTICAL MAP PIN
              </span>
              <button onClick={() => setShowAddMarkerModal(false)} className="text-zinc-500 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMarkerSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">MARKER DESIGNATION</label>
                <input
                  type="text"
                  required
                  value={newMarkerName}
                  onChange={(e) => setNewMarkerName(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">MARKER TYPE</label>
                <select
                  value={newMarkerType}
                  onChange={(e) => setNewMarkerType(e.target.value as MapMarker['type'])}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                >
                  <option value="WAYPOINT">WAYPOINT (Nav Point)</option>
                  <option value="BLUE_FORCE">BLUE FORCE (Friendly Platoon)</option>
                  <option value="RED_SIM">RED SIMULATED OPFOR</option>
                  <option value="NEUTRAL_LOGISTICS">LOGISTICS CONVOY</option>
                  <option value="OBJECTIVE_FLAG">TACTICAL OBJECTIVE</option>
                  <option value="FORWARD_BASE">FORWARD BASE / FAS</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">TACTICAL BRIEFING / NOTES</label>
                <textarea
                  rows={3}
                  value={newMarkerDetails}
                  onChange={(e) => setNewMarkerDetails(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddMarkerModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold"
                >
                  DEPLOY TO MAP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
