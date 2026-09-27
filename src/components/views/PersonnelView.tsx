import React, { useState } from 'react';
import { useTactical } from '../../context/TacticalContext';
import { Personnel } from '../../types/tactical';
import { exportPersonnelToCsv } from '../../utils/exportHelpers';
import {
  Users,
  Search,
  Download,
  Plus,
  Shield,
  Activity,
  CheckCircle,
  Radio
} from 'lucide-react';

export const PersonnelView: React.FC = () => {
  const { personnel, addPersonnel, updatePersonnelReadiness, canPerform } = useTactical();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);

  // New Personnel Form
  const [name, setName] = useState<string>('');
  const [rank, setRank] = useState<string>('Sergeant (E-5)');
  const [callsign, setCallsign] = useState<string>('');
  const [serviceNum, setServiceNum] = useState<string>('USA-');
  const [unitName, setUnitName] = useState<string>('1st Platoon / Alpha Company');
  const [role, setRole] = useState<string>('Infantry Team Leader');
  const [certs, setCerts] = useState<string>('Combat Marksmanship; First Aid');
  const [location, setLocation] = useState<string>('Forward Staging Base Echo');
  const [contactFreq, setContactFreq] = useState<string>('38.500 MHz');

  // Summary Metrics
  const totalCount = personnel.length;
  const deployableCount = personnel.filter((p) => p.readinessStatus === 'DEPLOYABLE').length;
  const avgReadiness = Math.round(
    personnel.reduce((acc, p) => acc + p.combatReadinessScore, 0) / (totalCount || 1)
  );
  const class1MedicalCount = personnel.filter((p) => p.medicalReadiness === 'CLASS_1').length;

  const unitsList = Array.from(new Set(personnel.map((p) => p.unitName)));

  const filteredPersonnel = personnel.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.serviceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUnit = selectedUnitFilter === 'ALL' || p.unitName === selectedUnitFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || p.readinessStatus === selectedStatusFilter;

    return matchesSearch && matchesUnit && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addPersonnel({
      serviceNumber: serviceNum,
      name,
      rank,
      callsign: callsign || name.split(' ')[1]?.toUpperCase() || 'EAGLE',
      unitId: 'unit-custom',
      unitName,
      role,
      readinessStatus: 'DEPLOYABLE',
      combatReadinessScore: 92,
      certifications: certs.split(';').map((c) => c.trim()).filter(Boolean),
      specializations: ['Tactical Operations'],
      medicalReadiness: 'CLASS_1',
      location,
      contactFreq
    });

    setShowAddModal(false);
    setName('');
    setCallsign('');
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>TOTAL ROSTER</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono mt-1">{totalCount}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Assigned service personnel</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>DEPLOYABLE</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{deployableCount}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {Math.round((deployableCount / (totalCount || 1)) * 100)}% mission qualified
          </div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>COMBAT READINESS</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{avgReadiness}%</div>
          <div className="text-[11px] text-zinc-400 mt-1">Battalion composite index</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>MEDICAL STATUS</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
            {Math.round((class1MedicalCount / (totalCount || 1)) * 100)}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Class 1 fit for field operations</div>
        </div>
      </div>

      {/* Roster Controls: Search, Filters, CSV, Add */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search callsign, rank, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedUnitFilter}
            onChange={(e) => setSelectedUnitFilter(e.target.value)}
            className="text-xs bg-zinc-950 border border-zinc-700 rounded py-1.5 px-2.5 text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Units</option>
            {unitsList.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-zinc-950 border border-zinc-700 rounded py-1.5 px-2.5 text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Readiness Status</option>
            <option value="DEPLOYABLE">Deployable</option>
            <option value="RESTRICTED">Restricted</option>
            <option value="IN_TRAINING">In Training</option>
            <option value="MEDICAL_HOLD">Medical Hold</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportPersonnelToCsv(filteredPersonnel)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>EXPORT CSV</span>
          </button>

          {canPerform('MANAGE_PERSONNEL') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ROSTER ENTRY</span>
            </button>
          )}
        </div>
      </div>

      {/* Personnel Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-mono text-[10px] border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Service # / Rank</th>
                <th className="py-3 px-4">Personnel & Callsign</th>
                <th className="py-3 px-4">Unit & Assignment</th>
                <th className="py-3 px-4">Readiness Status</th>
                <th className="py-3 px-4">Combat Score</th>
                <th className="py-3 px-4">Med Class</th>
                <th className="py-3 px-4">Location & Comms</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredPersonnel.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500 font-mono">
                    No personnel found matching query criteria.
                  </td>
                </tr>
              ) : (
                filteredPersonnel.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="font-semibold text-zinc-200">{p.rank}</div>
                      <div className="text-zinc-500 text-[10px]">{p.serviceNumber}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-100">{p.name}</div>
                      <div className="font-mono text-[10px] text-amber-400">"{p.callsign}"</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-zinc-200">{p.unitName}</div>
                      <div className="text-[11px] text-zinc-400">{p.role}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          p.readinessStatus === 'DEPLOYABLE'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : p.readinessStatus === 'RESTRICTED'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            : 'bg-red-950/80 text-red-400 border border-red-800'
                        }`}
                      >
                        {p.readinessStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-200">{p.combatReadinessScore}%</span>
                        <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.combatReadinessScore >= 90
                                ? 'bg-emerald-500'
                                : p.combatReadinessScore >= 75
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${p.combatReadinessScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span
                        className={`font-semibold ${
                          p.medicalReadiness === 'CLASS_1'
                            ? 'text-emerald-400'
                            : p.medicalReadiness === 'CLASS_2'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {p.medicalReadiness}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[11px]">
                      <div className="text-zinc-300">{p.location}</div>
                      <div className="font-mono text-zinc-500 text-[10px] flex items-center gap-1">
                        <Radio className="w-3 h-3 text-zinc-600" />
                        {p.contactFreq}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {canPerform('MANAGE_PERSONNEL') && (
                        <button
                          onClick={() => setEditingPersonnel(p)}
                          className="px-2 py-1 text-[10px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                        >
                          EDIT READINESS
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

      {/* Edit Readiness Modal */}
      {editingPersonnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="font-bold text-sm text-zinc-100">
                UPDATE READINESS: {editingPersonnel.name}
              </span>
              <button onClick={() => setEditingPersonnel(null)} className="text-zinc-500 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">READINESS STATUS</label>
                <select
                  value={editingPersonnel.readinessStatus}
                  onChange={(e) =>
                    setEditingPersonnel({
                      ...editingPersonnel,
                      readinessStatus: e.target.value as Personnel['readinessStatus']
                    })
                  }
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                >
                  <option value="DEPLOYABLE">DEPLOYABLE (Ready for Exercise)</option>
                  <option value="RESTRICTED">RESTRICTED (Duty Limitations)</option>
                  <option value="IN_TRAINING">IN TRAINING (Pending Qualification)</option>
                  <option value="MEDICAL_HOLD">MEDICAL HOLD (Non-Deployable)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>COMBAT READINESS SCORE</span>
                  <span className="text-amber-400 font-bold">{editingPersonnel.combatReadinessScore}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={editingPersonnel.combatReadinessScore}
                  onChange={(e) =>
                    setEditingPersonnel({
                      ...editingPersonnel,
                      combatReadinessScore: Number(e.target.value)
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => setEditingPersonnel(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    updatePersonnelReadiness(
                      editingPersonnel.id,
                      editingPersonnel.readinessStatus,
                      editingPersonnel.combatReadinessScore
                    );
                    setEditingPersonnel(null);
                  }}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold"
                >
                  SAVE STATUS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="font-bold text-sm text-zinc-100">ADD PERSONNEL RECORD</span>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">SERVICE NUMBER</label>
                  <input
                    type="text"
                    required
                    value={serviceNum}
                    onChange={(e) => setServiceNum(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">RANK</label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  >
                    <option value="Captain (O-3)">Captain (O-3)</option>
                    <option value="1st Lieutenant (O-2)">1st Lieutenant (O-2)</option>
                    <option value="SFC (E-7)">SFC (E-7)</option>
                    <option value="Staff Sergeant (E-6)">Staff Sergeant (E-6)</option>
                    <option value="Sergeant (E-5)">Sergeant (E-5)</option>
                    <option value="Corporal (E-4)">Corporal (E-4)</option>
                    <option value="Specialist (E-4)">Specialist (E-4)</option>
                    <option value="Private 1st Class (E-3)">Private 1st Class (E-3)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">FULL NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robert Jackson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">CALLSIGN</label>
                  <input
                    type="text"
                    placeholder="e.g. THUNDER"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">UNIT</label>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">SPECIALIZED ROLE</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">LOCATION</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">COMMS FREQUENCY</label>
                  <input
                    type="text"
                    value={contactFreq}
                    onChange={(e) => setContactFreq(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold"
                >
                  COMMIT TO ROSTER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
