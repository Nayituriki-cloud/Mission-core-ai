/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MissionProvider, useMissions } from './context/MissionContext';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { MissionsView } from './components/missions/MissionsView';
import { TasksView } from './components/tasks/TasksView';
import { AiPlannerView } from './components/ai/AiPlannerView';
import { TacticalMapView } from './components/map/TacticalMapView';
import { CalendarView } from './components/calendar/CalendarView';
import { TeamView } from './components/team/TeamView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { MissionDetailModal } from './components/missions/MissionDetailModal';
import { CreateMissionModal } from './components/missions/CreateMissionModal';
import { Mission } from './types/mission';

function MissionCoreApp() {
  const { missions } = useMissions();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [isCreateMissionModalOpen, setIsCreateMissionModalOpen] = useState(false);

  const handleSelectMission = (mission: Mission) => {
    setSelectedMissionId(mission.id);
  };

  const handleSelectMissionById = (id: string) => {
    setSelectedMissionId(id);
  };

  const handlePlanAdopted = (missionId: string) => {
    setActiveTab('missions');
    setSelectedMissionId(missionId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Command Bar */}
      <Header
        onOpenCreateMission={() => setIsCreateMissionModalOpen(true)}
        onOpenAiPlanner={() => setActiveTab('ai-planner')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectMission={handleSelectMission}
              onNavigateTab={setActiveTab}
              onOpenCreateMission={() => setIsCreateMissionModalOpen(true)}
              onOpenAiPlanner={() => setActiveTab('ai-planner')}
            />
          )}

          {activeTab === 'missions' && (
            <MissionsView
              onSelectMission={handleSelectMission}
              onOpenCreateMission={() => setIsCreateMissionModalOpen(true)}
              onOpenAiPlanner={() => setActiveTab('ai-planner')}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView onSelectMissionById={handleSelectMissionById} />
          )}

          {activeTab === 'ai-planner' && (
            <AiPlannerView onPlanAdopted={handlePlanAdopted} />
          )}

          {activeTab === 'maps' && (
            <TacticalMapView onSelectMission={handleSelectMission} />
          )}

          {activeTab === 'calendar' && (
            <CalendarView onSelectMission={handleSelectMission} />
          )}

          {activeTab === 'team' && <TeamView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modal: Mission Details */}
      {selectedMissionId && (
        <MissionDetailModal
          missionId={selectedMissionId}
          onClose={() => setSelectedMissionId(null)}
        />
      )}

      {/* Modal: Create Mission */}
      {isCreateMissionModalOpen && (
        <CreateMissionModal
          onClose={() => setIsCreateMissionModalOpen(false)}
          onOpenAiPlanner={() => setActiveTab('ai-planner')}
          onMissionCreated={(newId) => {
            setActiveTab('missions');
            setSelectedMissionId(newId);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <MissionProvider>
      <MissionCoreApp />
    </MissionProvider>
  );
}
