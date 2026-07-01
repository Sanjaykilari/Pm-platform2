import React from 'react';
import { usePpm } from '@/context/PpmContext';
import ProjectIntake from '@/components/enterprise/ProjectIntake';

const ProjectIntakePage = () => {
  const { intakeRequests, addIntakeRequest, approveIntakeRequest, declineIntakeRequest } = usePpm();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Intake</h1>
        <p className="text-muted-foreground">Submit and review incoming project proposals.</p>
      </div>
      <ProjectIntake
        intakeRequests={intakeRequests}
        addIntakeRequest={addIntakeRequest}
        approveIntakeRequest={approveIntakeRequest}
        declineIntakeRequest={declineIntakeRequest}
      />
    </div>
  );
};

export default ProjectIntakePage;
