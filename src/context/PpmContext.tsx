// @ts-nocheck
import React, { createContext, useContext } from 'react';
import usePpmState from '@/hooks/usePpmState';

const PpmContext = createContext(null);

export const PpmProvider = ({ children }) => {
  const ppmState = usePpmState();

  return (
    <PpmContext.Provider value={ppmState}>
      {children}
    </PpmContext.Provider>
  );
};

export const usePpm = () => {
  const ctx = useContext(PpmContext);
  if (!ctx) throw new Error('usePpm must be within PpmProvider');
  return {
    ...ctx,
    ...(ctx.state || {})
  };
};

// Adapter for backward compatibility with pm-platform UI
export const useAuth = () => {
  const { currentUser, login, registerProfile, logout } = usePpm();
  return {
    user: currentUser,
    login,
    register: (name, email, password) => registerProfile({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] || '', username: email, email, password, role: 'Project Manager' }),
    logout,
    isLoading: false
  };
};

export const useApp = () => {
  const ppm = usePpm();
  const allTasks = ppm.projects ? ppm.projects.flatMap(p => p.tasks || []) : [];
  return {
    ...ppm,
    tasks: allTasks,
    epics: ppm.state?.epics || [],
    releases: ppm.state?.releases || [],
    sprints: [],
    comments: [],
    selectedProjectId: null,
    setSelectedProjectId: () => {},
    selectedView: 'dashboard',
    setSelectedView: () => {}
  };
};

