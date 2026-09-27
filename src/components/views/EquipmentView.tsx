import React, { useState } from 'react';
import { useTactical } from '../../context/TacticalContext';
import { EquipmentItem } from '../../types/tactical';
import { exportEquipmentToCsv } from '../../utils/exportHelpers';
import {
  Package,
  Wrench,
  Download,
  CheckCircle,
  AlertTriangle,
  BatteryCharging,
  Radio,
  Truck,
  Eye,
  ShieldAlert
} from 'lucide-react';

export const EquipmentView: React.FC = () => {
  const { equipment, updateEquipmentStatus, canPerform } = useTactical();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<EquipmentItem | null>(null);
  const [editStatus, setEditStatus] = useState<EquipmentItem['operationalStatus']>('FULLY_MISSION_CAPABLE');
  const [editNotes, setEditNotes] = useState<string>('');

  // Calculations
  const totalCount = equipment.length;
  const fmcCount = equipment.filter((e) => e.operationalStatus === 'FULLY_MISSION_CAPABLE').length;
  const fmcRate = Math.round((fmcCount / (totalCount || 1)) * 100);
  const maintenanceCount = equipment.filter(
    (e) => e.operationalStatus === 'MAINTENANCE_REQUIRED' || e.operationalStatus === 'DEPOT_OVERHAUL'
  ).length;

  const filteredEquipment = equipment.filter((eq) => {
    const matchesCat = categoryFilter === 'ALL' || eq.category === categoryFilter;
    const matchesStat = statusFilter === 'ALL' || eq.operationalStatus === statusFilter;
    return matchesCat && matchesStat;
  });

  const getCategoryIcon = (cat: EquipmentItem['category']) => {
    switch (cat) {
      case 'TACTICAL_VEHICLE':
        return <Truck className="w-4 h-4 text-amber-400" />;
      case 'COMMUNICATIONS':
        return <Radio className="w-4 h-4 text-sky-400" />;
      case 'SURVEILLANCE_UAV':
        return <Eye className="w-4 h-4 text-emerald-400" />;
      case 'ARMORY_SIM':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'MEDICAL_GEAR':
        return <Package className="w-4 h-4 text-rose-400" />;
      default:
        return <Package className="w-4 h-4 text-zinc-400" />;
    }
  };

  const handleSaveStatus = () => {
    if (!selectedItemForEdit) return;
    updateEquipmentStatus(selectedItemForEdit.id, editStatus, editNotes);
    setSelectedItemForEdit(null);
    setEditNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>FMC READINESS RATE</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{fmcRate}%</div>
          <div className="text-[11px] text-zinc-400 mt-1">Fully Mission Capable (Target: 90%+)</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>SERIALIZED INVENTORY</span>
            <Package className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono mt-1">{totalCount}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Tracked high-value defense assets</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>MAINTENANCE WORK ORDERS</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{maintenanceCount}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Units requiring field servicing</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>AVERAGE POWER / FUEL</span>
            <BatteryCharging className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1">83%</div>
          <div className="text-[11px] text-zinc-400 mt-1">Battery packs & vehicle tanks</div>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-zinc-950 border border-zinc-700 rounded py-1.5 px-3 text-zinc-200 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="TACTICAL_VEHICLE">Tactical Vehicles</option>
            <option value="COMMUNICATIONS">Communications & C4ISR</option>
            <option value="SURVEILLANCE_UAV">Surveillance & UAVs</option>
            <option value="ARMORY_SIM">Armory & MILES Laser Gear</option>
            <option value="MEDICAL_GEAR">Medical Field Gear</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-zinc-950 border border-zinc-700 rounded py-1.5 px-3 text-zinc-200 focus:outline-none"
          >
            <option value="ALL">All Operational Statuses</option>
            <option value="FULLY_MISSION_CAPABLE">Fully Mission Capable (FMC)</option>
            <option value="PARTIALLY_MISSION_CAPABLE">Partially Mission Capable (PMC)</option>
            <option value="MAINTENANCE_REQUIRED">Maintenance Required</option>
            <option value="DEPOT_OVERHAUL">Depot Overhaul</option>
          </select>
        </div>

        <button
          onClick={() => exportEquipmentToCsv(filteredEquipment)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>EXPORT CSV</span>
        </button>
      </div>

      {/* Equipment Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-mono text-[10px] border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Serial #</th>
                <th className="py-3 px-4">Equipment Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Fuel / Battery</th>
                <th className="py-3 px-4">Assigned Unit & Grid</th>
                <th className="py-3 px-4">Maintenance Schedule</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-500 font-mono">
                    No equipment found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-amber-400">
                      {eq.serialNumber}
                    </td>

                    <td className="py-3 px-4 font-medium text-zinc-100">{eq.name}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-300">
                        {getCategoryIcon(eq.category)}
                        <span>{eq.category.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          eq.operationalStatus === 'FULLY_MISSION_CAPABLE'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : eq.operationalStatus === 'PARTIALLY_MISSION_CAPABLE'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            : 'bg-red-950/80 text-red-400 border border-red-800'
                        }`}
                      >
                        {eq.operationalStatus === 'FULLY_MISSION_CAPABLE'
                          ? 'FMC'
                          : eq.operationalStatus === 'PARTIALLY_MISSION_CAPABLE'
                          ? 'PMC'
                          : 'MAINT'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-zinc-200">
                      {eq.conditionScore}%
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-300">{eq.fuelBatteryLevel}%</span>
                        <div className="w-12 bg-zinc-800 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              eq.fuelBatteryLevel > 50 ? 'bg-sky-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${eq.fuelBatteryLevel}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[11px]">
                      <div className="text-zinc-200">{eq.assignedUnitName}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{eq.locationGrid}</div>
                    </td>

                    <td className="py-3 px-4 text-[11px] font-mono text-zinc-400">
                      {eq.maintenanceDue}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {canPerform('UPDATE_EQUIPMENT') && (
                        <button
                          onClick={() => {
                            setSelectedItemForEdit(eq);
                            setEditStatus(eq.operationalStatus);
                          }}
                          className="px-2 py-1 text-[10px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                        >
                          SERVICING
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Equipment Servicing Modal */}
      {selectedItemForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-400" />
                MAINTENANCE WORK ORDER
              </span>
              <button onClick={() => setSelectedItemForEdit(null)} className="text-zinc-500 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[11px]">
                <div className="font-bold text-zinc-200">{selectedItemForEdit.name}</div>
                <div className="text-amber-400">SN: {selectedItemForEdit.serialNumber}</div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">OPERATIONAL STATUS</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as EquipmentItem['operationalStatus'])}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                >
                  <option value="FULLY_MISSION_CAPABLE">FULLY MISSION CAPABLE (FMC)</option>
                  <option value="PARTIALLY_MISSION_CAPABLE">PARTIALLY MISSION CAPABLE (PMC)</option>
                  <option value="MAINTENANCE_REQUIRED">MAINTENANCE REQUIRED (NMC)</option>
                  <option value="DEPOT_OVERHAUL">DEPOT OVERHAUL / REBUILD</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">TECHNICIAN SERVICING NOTES</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record inspections, part replacement, fluid top-up..."
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => setSelectedItemForEdit(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveStatus}
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold"
                >
                  RECORD INSPECTION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
