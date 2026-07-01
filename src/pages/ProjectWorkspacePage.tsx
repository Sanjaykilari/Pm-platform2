import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePpm } from '@/context/PpmContext';
import { Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, Badge, Button } from '@/components/ui/primitives';
import { ChevronLeft } from 'lucide-react';
import TaskDetailPanel from '@/components/enterprise/TaskDetailPanel';

// Import Enterprise Views
import ProjectSummaryView from '@/components/enterprise/ProjectSummaryView';
import WorkplanView from '@/components/enterprise/WorkplanView';
import RaidLogView from '@/components/enterprise/RaidLogView';
import RequirementsView from '@/features/workplan/RequirementsView';
import TargetsView from '@/features/workplan/TargetsView';
import FinancialsView from '@/components/enterprise/FinancialsView';
import DiscussionsView from '@/features/collab/DiscussionsView';

const ProjectWorkspacePage = () => {
  const { projectId } = useParams();
  const { 
    projects, resources, currentUser, profiles,
    addTask, updateTask, deleteTask, replaceTasks,
    addRisk, updateRisk, deleteRisk,
    addAssumption, updateAssumption, deleteAssumption,
    addIssue, updateIssue, deleteIssue,
    addDependency, updateDependency, deleteDependency,
    addCapexItem, deleteCapexItem,
    calculateOpex, calculateProjectCost, updateProjectDetails,
    addActionItem, updateActionItem, deleteActionItem,
    addDecision, updateDecision, deleteDecision,
    addRequirement, updateRequirement, deleteRequirement,
    addTarget, updateTarget, deleteTarget,
    addDiscussionComment
  } = usePpm();

  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [raidActiveSubTab, setRaidActiveSubTab] = useState('risks');

  const project = projects.find(p => p.id === projectId);

  if (!project) return <div>Project not found</div>;

  return (
    <div className="flex-1 overflow-y-auto h-full p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link to="/app/projects">
          <Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
      </div>

      <Tabs>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger active={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>Summary</TabsTrigger>
          <TabsTrigger active={activeTab === 'workplan'} onClick={() => setActiveTab('workplan')}>Workplan</TabsTrigger>
          <TabsTrigger active={activeTab === 'raid'} onClick={() => setActiveTab('raid')}>RAID Log</TabsTrigger>
          <TabsTrigger active={activeTab === 'requirements'} onClick={() => setActiveTab('requirements')}>Requirements</TabsTrigger>
          <TabsTrigger active={activeTab === 'targets'} onClick={() => setActiveTab('targets')}>Targets</TabsTrigger>
          <TabsTrigger active={activeTab === 'financials'} onClick={() => setActiveTab('financials')}>Financials</TabsTrigger>
          <TabsTrigger active={activeTab === 'discussions'} onClick={() => setActiveTab('discussions')}>Discussions</TabsTrigger>
        </TabsList>

        <div className="bg-card rounded-xl border border-border shadow-sm min-h-[500px]">
          {activeTab === 'summary' && (
            <ProjectSummaryView 
              item={project} 
              resources={resources}
              updateProjectDetails={updateProjectDetails}
              calculateOpex={calculateOpex} 
              calculateProjectCost={calculateProjectCost} 
            />
          )}
          {activeTab === 'workplan' && (
            <WorkplanView 
              project={project} 
              resources={resources}
              addTask={addTask} 
              updateTask={updateTask} 
              deleteTask={deleteTask}
              replaceTasks={replaceTasks}
              setSelectedTask={setSelectedTask} 
            />
          )}
          {activeTab === 'raid' && (
            <RaidLogView 
              project={project}
              activeSubTab={raidActiveSubTab}
              setActiveSubTab={setRaidActiveSubTab}
              addRisk={addRisk} updateRisk={updateRisk} deleteRisk={deleteRisk}
              addAssumption={addAssumption} updateAssumption={updateAssumption} deleteAssumption={deleteAssumption}
              addIssue={addIssue} updateIssue={updateIssue} deleteIssue={deleteIssue}
              addDependency={addDependency} updateDependency={updateDependency} deleteDependency={deleteDependency}
              addActionItem={addActionItem} updateActionItem={updateActionItem} deleteActionItem={deleteActionItem}
              addDecision={addDecision} updateDecision={updateDecision} deleteDecision={deleteDecision}
              resources={resources}
            />
          )}
          {activeTab === 'requirements' && (
            <RequirementsView 
              project={project}
              addRequirement={addRequirement}
              updateRequirement={updateRequirement}
              deleteRequirement={deleteRequirement}
            />
          )}
          {activeTab === 'targets' && (
            <TargetsView 
              project={project}
              addTarget={addTarget}
              updateTarget={updateTarget}
              deleteTarget={deleteTarget}
            />
          )}
          {activeTab === 'financials' && (
            <FinancialsView 
              project={project} 
              resources={resources}
              addCapexItem={addCapexItem} 
              deleteCapexItem={deleteCapexItem}
              calculateOpex={calculateOpex} 
              calculateProjectCost={calculateProjectCost}
            />
          )}
          {activeTab === 'discussions' && (
            <DiscussionsView 
              discussions={project.discussions}
              targetType="project"
              targetId={project.id}
              addDiscussionComment={addDiscussionComment}
              currentUser={currentUser}
            />
          )}
        </div>
      </Tabs>

      {selectedTask && (
        <TaskDetailPanel
          task={project.tasks.find((t: any) => t.id === selectedTask.id)}
          projectId={project.id}
          resources={resources}
          updateTask={updateTask}
          onClose={() => setSelectedTask(null)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default ProjectWorkspacePage;
