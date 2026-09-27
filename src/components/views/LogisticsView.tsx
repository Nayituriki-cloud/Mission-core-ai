import React, { useState } from 'react';
import { useTactical } from '../../context/TacticalContext';
import { LogisticsConvoy } from '../../types/tactical';
import { exportConvoysToCsv } from '../../utils/exportHelpers';
import {
  Truck,
  Fuel,
  Apple,
  Cross,
  Radio,
  Plus,
  Download,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export const LogisticsView: React.FC = () => {
  const { convoys, dispatchConvoy, updateConvoyStatus, canPerform } = useTactical();

  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form state
  const [callsign, setCallsign] = useState<string>('CONVOY TITAN-4');
  const [routeName, setRouteName] = useState<string>('MSR Bronze Corridor');
  const [cargoType, setCargoType] = useState<LogisticsConvoy['cargoType']>('FUEL');
  const [origin, setOrigin] = useState<string>('Logistics Base Depot 1');
  const [destination, setDestination] = useState<string>('Forward Base Alpha (Grid 8820)');
  const [eta, setEta] = useState<string>('16:00 Today (1 hr 15 min)');
  const [driver, setDriver] = useState<string>('QUARTERMASTER LEAD');
  const [escorts, setEscorts] = useState<number>(2);

  // Bulk stockpile calculations
  const totalFuelLiters = 42500;
  const totalRations = 3800;
  const totalSimRounds = 95000;
  const totalMedKits = 320;

  const filteredConvoys = convoys.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign) return;

    dispatchConvoy({
      convoyCallsign: callsign,
      routeName,
      cargoType,
      status: 'EN_ROUTE',
      originGrid: origin,
      destinationGrid: destination,
      eta,
      progressPercent: 10,
      manifestItems: [
        { name: `${cargoType} Primary Allotment`, quantity: cargoType === 'FUEL' ? 8000 : 400, unit: cargoType === 'FUEL' ? 'Liters' : 'Units' },
        { name: 'Emergency Drinking Water', quantity: 1200, unit: 'Liters' }
      ],
      fuelRemainingPercent: 95,
      escortVehicleCount: escorts,
      driverCallsign: driver
    });

    setShowDispatchModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Strategic Bulk Stockpile Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>TACTICAL FUEL (JP-8)</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {totalFuelLiters.toLocaleString()} L
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Sufficient for 68h continuous ops</div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '78%' }} />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>MRE RATIONS CACHE</span>
            <Apple className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {totalRations.toLocaleString()} PK
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">4.5 days per-capita sustainment</div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '84%' }} />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>BLANK / SIM AMMO</span>
            <ShieldAlert className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
            {totalSimRounds.toLocaleString()} RD
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Laser harness & blank munitions</div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>FIELD MEDICAL KITS</span>
            <Cross className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1">
            {totalMedKits} Units
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Triage litters & trauma supplies</div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: '95%' }} />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-zinc-400">CONVOY FILTER:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-zinc-950 border border-zinc-700 rounded py-1.5 px-3 text-zinc-200 focus:outline-none"
          >
            <option value="ALL">All Active Convoys</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="STAGED">Staged</option>
            <option value="DELIVERED">Delivered</option>
            <option value="DELAYED">Delayed / Rerouted</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportConvoysToCsv(filteredConvoys)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>EXPORT CSV</span>
          </button>

          {canPerform('DISPATCH_LOGISTICS') && (
            <button
              onClick={() => setShowDispatchModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>DISPATCH CONVOY</span>
            </button>
          )}
        </div>
      </div>

      {/* Convoy Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredConvoys.map((convoy) => (
          <div
            key={convoy.id}
            className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm text-zinc-100">{convoy.convoyCallsign}</span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                        convoy.status === 'EN_ROUTE'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : convoy.status === 'DELIVERED'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : convoy.status === 'DELAYED'
                          ? 'bg-red-950/80 text-red-400 border border-red-800'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {convoy.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                    <Navigation className="w-3 h-3 text-zinc-500" />
                    {convoy.routeName}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-[10px] text-zinc-500">ESTIMATED ARRIVAL</div>
                  <div className="text-zinc-200 font-bold">{convoy.eta}</div>
                </div>
              </div>

              {/* Transit Route & Progress */}
              <div className="my-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span className="truncate max-w-[45%] text-zinc-300">From: {convoy.originGrid}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span className="truncate max-w-[45%] text-zinc-300">To: {convoy.destinationGrid}</span>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                    <span>ROUTE TRANSIT COMPLETION</span>
                    <span className="text-amber-400 font-bold">{convoy.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        convoy.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${convoy.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Manifest Items Table */}
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80 my-3">
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1.5 flex items-center justify-between">
                  <span>LOGISTICS MANIFEST</span>
                  <span>{convoy.manifestItems.length} Commodities</span>
                </div>
                <div className="space-y-1">
                  {convoy.manifestItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-300">{item.name}</span>
                      <span className="font-mono text-amber-400 font-semibold">
                        {item.quantity.toLocaleString()} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer controls & telemetry */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3 text-[11px] font-mono">
              <div className="text-zinc-400 flex items-center gap-3">
                <span>Driver: <strong className="text-zinc-200">{convoy.driverCallsign}</strong></span>
                <span>·</span>
                <span>Escorts: <strong className="text-zinc-200">{convoy.escortVehicleCount} JLTVs</strong></span>
              </div>

              {canPerform('DISPATCH_LOGISTICS') && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateConvoyStatus(convoy.id, 'DELIVERED', 100)}
                    disabled={convoy.status === 'DELIVERED'}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 disabled:opacity-40"
                  >
                    MARK DELIVERED
                  </button>
                  <button
                    onClick={() => updateConvoyStatus(convoy.id, 'EN_ROUTE', Math.min(90, convoy.progressPercent + 25))}
                    disabled={convoy.status === 'DELIVERED'}
                    className="px-2 py-1 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-700 text-amber-300 disabled:opacity-40"
                  >
                    ADVANCE +25%
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Convoy Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                DISPATCH SUSTAINMENT CONVOY
              </span>
              <button onClick={() => setShowDispatchModal(false)} className="text-zinc-500 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">CONVOY CALLSIGN</label>
                <input
                  type="text"
                  required
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-amber-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">ROUTE / PASSAGEWAY</label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">PRIMARY CARGO</label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value as LogisticsConvoy['cargoType'])}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  >
                    <option value="FUEL">FUEL (JP-8 / F-34)</option>
                    <option value="RATIONS">RATIONS (MREs / Water)</option>
                    <option value="AMMUNITION_SIM">AMMUNITION (Blank/Sim)</option>
                    <option value="MEDICAL">MEDICAL TRIAGE GEAR</option>
                    <option value="COMMS_SPARES">COMMS & ELECTRONICS</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">ESCORT VEHICLES</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={escorts}
                    onChange={(e) => setEscorts(Number(e.target.value))}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">DESTINATION GRID</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">ESTIMATED TRANSIT TIME (ETA)</label>
                <input
                  type="text"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold"
                >
                  DISPATCH TO MSR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
