import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Progress } from '@/components/ui/primitives';
import { Target, Plus, CheckCircle2 } from 'lucide-react';

export default function GoalsPage() {
  const [goals] = useState([
    { id: 'g1', title: 'Q3 Product Launch', description: 'Launch the core PPM module to all enterprise clients', progress: 75, status: 'on_track' },
    { id: 'g2', title: 'Increase User Adoption', description: 'Achieve 10k daily active users', progress: 40, status: 'at_risk' },
    { id: 'g3', title: 'Security Compliance', description: 'Pass SOC2 audit with zero critical findings', progress: 90, status: 'on_track' },
  ]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals & OKRs</h1>
          <p className="text-muted-foreground">Define and track strategic objectives</p>
        </div>
        <Button onClick={() => alert('Feature coming soon: Create New Goal')}><Plus className="w-4 h-4 mr-1" /> New Goal</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <Card key={goal.id} className="glass-card flex flex-col hover:shadow-lg transition-shadow border-border/50">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline"><Target className="w-3 h-3 mr-1" /> Objective</Badge>
                <Badge className={goal.status === 'on_track' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}>
                  {goal.status.replace('_', ' ')}
                </Badge>
              </div>
              <CardTitle>{goal.title}</CardTitle>
              <CardDescription>{goal.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2 mb-4" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>3 Key Results linked</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
