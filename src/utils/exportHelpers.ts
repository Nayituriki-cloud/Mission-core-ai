import { Personnel, EquipmentItem, LogisticsConvoy, TrainingEvent } from '../types/tactical';

export function exportPersonnelToCsv(personnel: Personnel[]) {
  const headers = ['Service Number', 'Name', 'Rank', 'Callsign', 'Unit', 'Role', 'Readiness Status', 'Readiness Score (%)', 'Medical Readiness', 'Location', 'Comms Freq', 'Certifications'];
  const rows = personnel.map((p) => [
    `"${p.serviceNumber}"`,
    `"${p.name}"`,
    `"${p.rank}"`,
    `"${p.callsign}"`,
    `"${p.unitName}"`,
    `"${p.role}"`,
    `"${p.readinessStatus}"`,
    p.combatReadinessScore,
    `"${p.medicalReadiness}"`,
    `"${p.location}"`,
    `"${p.contactFreq}"`,
    `"${p.certifications.join('; ')}"`
  ]);

  downloadCsv([headers, ...rows], `personnel_roster_${new Date().toISOString().substring(0, 10)}.csv`);
}

export function exportEquipmentToCsv(equipment: EquipmentItem[]) {
  const headers = ['Serial Number', 'Name', 'Category', 'Operational Status', 'Assigned Unit', 'Condition Score (%)', 'Fuel/Battery (%)', 'Maintenance Due', 'Grid Location'];
  const rows = equipment.map((eq) => [
    `"${eq.serialNumber}"`,
    `"${eq.name}"`,
    `"${eq.category}"`,
    `"${eq.operationalStatus}"`,
    `"${eq.assignedUnitName}"`,
    eq.conditionScore,
    eq.fuelBatteryLevel,
    `"${eq.maintenanceDue}"`,
    `"${eq.locationGrid}"`
  ]);

  downloadCsv([headers, ...rows], `equipment_inventory_${new Date().toISOString().substring(0, 10)}.csv`);
}

export function exportConvoysToCsv(convoys: LogisticsConvoy[]) {
  const headers = ['Convoy Callsign', 'Route', 'Status', 'Cargo Type', 'Progress (%)', 'Origin', 'Destination', 'ETA', 'Fuel (%)', 'Escort Count', 'Manifest Summary'];
  const rows = convoys.map((c) => [
    `"${c.convoyCallsign}"`,
    `"${c.routeName}"`,
    `"${c.status}"`,
    `"${c.cargoType}"`,
    c.progressPercent,
    `"${c.originGrid}"`,
    `"${c.destinationGrid}"`,
    `"${c.eta}"`,
    c.fuelRemainingPercent,
    c.escortVehicleCount,
    `"${c.manifestItems.map((m) => `${m.name}: ${m.quantity} ${m.unit}`).join('; ')}"`
  ]);

  downloadCsv([headers, ...rows], `logistics_convoys_${new Date().toISOString().substring(0, 10)}.csv`);
}

export function exportTrainingToCsv(events: TrainingEvent[]) {
  const headers = ['Title', 'Category', 'Unit', 'Instructor', 'Scheduled Date', 'Duration (Hours)', 'Status', 'Location', 'Attendees', 'Qualification Rate (%)'];
  const rows = events.map((t) => [
    `"${t.title}"`,
    `"${t.category}"`,
    `"${t.unitName}"`,
    `"${t.instructor}"`,
    `"${t.scheduledDate}"`,
    t.durationHours,
    `"${t.status}"`,
    `"${t.location}"`,
    t.attendeeCount,
    t.qualificationRate ?? 'N/A'
  ]);

  downloadCsv([headers, ...rows], `training_events_${new Date().toISOString().substring(0, 10)}.csv`);
}

function downloadCsv(data: (string | number)[][], filename: string) {
  const csvContent = data.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
