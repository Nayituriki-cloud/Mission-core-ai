import React, { useState } from 'react';
import { useMissions } from '../../context/MissionContext';
import {
  X,
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  Boxes,
  Plus,
} from 'lucide-react';
import { MissionPriority, MissionCategory, MissionResource } from '../../types/mission';

interface CreateMissionModalProps {
  onClose: () => void;
  onOpenAiPlanner: () => void;
  onMissionCreated?: (id: string) => void;
}

export const CreateMissionModal: React.FC<CreateMissionModalProps> = ({
  onClose,
  onOpenAiPlanner,
  onMissionCreated,
}) => {
  const { createMission, users, currentUser } = useMissions();

  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [category, setCategory] = useState<MissionCategory>('Field Operations');
  const [priority, setPriority] = useState<MissionPriority>('High');
  const [leadId, setLeadId] = useState(currentUser.id);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [locationName, setLocationName] = useState('Sector Alpha Staging Ground');
  const [coordinatesLat, setCoordinatesLat] = useState('45.4215');
  const [coordinatesLng, setCoordinatesLng] = useState('-75.6972');
  const [zoneType, setZoneType] = useState<any>('staging_area');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !objective.trim()) return;

    const lat = parseFloat(coordinatesLat) || 45.4215;
    const lng = parseFloat(coordinatesLng) || -75.6972;

    const created = createMission({
      title: title.trim(),
      objective: objective.trim(),
      category,
      priority,
      leadId,
      assignedTeamIds: [leadId],
      deadline: new Date(deadline).toISOString(),
      location: {
        name: locationName.trim(),
        coordinates: [lat, lng],
        zoneType,
        terrainOrWeather: 'Operational perimeter established',
      },
      status: 'Planned',
      requiredResources: [
        { id: `res-init-1`, name: 'Tactical Radio Units', category: 'Comms', allocated: 2, needed: 4, unit: 'transceivers' },
        { id: `res-init-2`, name: 'First Response Vehicle', category: 'Vehicles', allocated: 1, needed: 1, unit: 'unit' },
      ],
      tasks: [
        {
          id: `tsk-init-1`,
          missionId: '',
          title: 'Conduct initial area perimeter sweep & radio check',
          description: 'Establish baseline communications with command dispatch.',
          assigneeId: leadId,
          status: 'Pending',
          priority: 'High',
          estimatedHours: 4,
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          checklist: [
            { id: 'chk-i1', text: 'Confirm grid coordinates', done: false },
            { id: 'chk-i2', text: 'Check emergency battery packs', done: false },
          ],
        },
      ],
      milestones: [
        { id: 'mls-init-1', title: 'Perimeter Established', dueDate: new Date(Date.now() + 86400000).toISOString(), completed: false, order: 1 },
        { id: 'mls-init-2', title: 'Operational Handover', dueDate: new Date(deadline).toISOString(), completed: false, order: 2 },
      ],
      risks: [
        { id: 'rsk-init-1', description: 'Weather change or transport delay', impact: 'Medium', mitigation: 'Maintain emergency standby equipment.' },
      ],
    });

    if (onMissionCreated) {
      onMissionCreated(created.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              Manual Mission Dispatch
            </div>
            <h2 className="text-lg font-bold text-slate-100">Initialize Operational Mission</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Helper Callout */}
        <div className="px-5 py-3 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Prefer an auto-generated breakdown with milestones & risks?</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAiPlanner();
            }}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline shrink-0"
          >
            Use AI Architect →
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Mission Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Operation Swift Shelter: Relief Depot Deployment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Operational Objective</label>
            <textarea
              rows={3}
              required
              placeholder="State the measurable end-state, target populations or assets, and success criteria..."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MissionCategory)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100"
              >
                <option value="Field Operations">Field Operations</option>
                <option value="Crisis Response">Crisis Response</option>
                <option value="Emergency Preparedness">Emergency Preparedness</option>
                <option value="Logistics & Supply">Logistics & Supply</option>
                <option value="Infrastructure Resilience">Infrastructure Resilience</option>
                <option value="Community Initiative">Community Initiative</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MissionPriority)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono"
              >
                <option value="Critical">Critical Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Mission Lead</label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.callsign})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Location Parameters */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
              Geospatial Operations Parameters
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Location Name / Facility</label>
              <input
                type="text"
                required
                placeholder="e.g., North Basin Outpost #2"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-mono text-[10px] mb-1">Latitude</label>
                <input
                  type="text"
                  value={coordinatesLat}
                  onChange={(e) => setCoordinatesLat(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-mono text-[10px] mb-1">Longitude</label>
                <input
                  type="text"
                  value={coordinatesLng}
                  onChange={(e) => setCoordinatesLng(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-mono text-[10px] mb-1">Zone Type</label>
                <select
                  value={zoneType}
                  onChange={(e) => setZoneType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                >
                  <option value="staging_area">Staging Area</option>
                  <option value="safe_zone">Safe Zone</option>
                  <option value="active_perimeter">Active Perimeter</option>
                  <option value="logistics_hub">Logistics Hub</option>
                  <option value="restricted">Restricted Zone</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/50"
            >
              Confirm & Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
