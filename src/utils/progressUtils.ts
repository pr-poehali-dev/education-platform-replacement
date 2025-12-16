interface ModuleProgress {
  moduleId: number;
  completed: boolean;
  topicsCompleted: number[];
  timeSpent: number;
  lastAccessed: string;
}

interface ProgramProgress {
  programId: string;
  modules: ModuleProgress[];
  overallProgress: number;
  startedAt: string;
  lastAccessed: string;
}

export function getProgramProgress(listenerId: string, programId: string): ProgramProgress | null {
  const saved = localStorage.getItem(`module_progress_${listenerId}_${programId}`);
  return saved ? JSON.parse(saved) : null;
}

export function getAllProgramsProgress(listenerId: string, programIds: string[]): Map<string, number> {
  const progressMap = new Map<string, number>();
  
  programIds.forEach(programId => {
    const progress = getProgramProgress(listenerId, programId);
    if (progress) {
      progressMap.set(programId, progress.overallProgress);
    } else {
      progressMap.set(programId, 0);
    }
  });
  
  return progressMap;
}

export function getModuleProgress(
  listenerId: string, 
  programId: string, 
  moduleId: number
): { completed: boolean; progress: number; topicsCompleted: number } {
  const programProgress = getProgramProgress(listenerId, programId);
  
  if (!programProgress) {
    return { completed: false, progress: 0, topicsCompleted: 0 };
  }
  
  const moduleProgress = programProgress.modules.find(m => m.moduleId === moduleId);
  
  if (!moduleProgress) {
    return { completed: false, progress: 0, topicsCompleted: 0 };
  }
  
  return {
    completed: moduleProgress.completed,
    progress: moduleProgress.topicsCompleted.length,
    topicsCompleted: moduleProgress.topicsCompleted.length
  };
}

export function isProgramCompleted(listenerId: string, programId: string): boolean {
  const progress = getProgramProgress(listenerId, programId);
  if (!progress) return false;
  
  return progress.modules.every(m => m.completed);
}

export function getCompletedModulesCount(listenerId: string, programId: string): number {
  const progress = getProgramProgress(listenerId, programId);
  if (!progress) return 0;
  
  return progress.modules.filter(m => m.completed).length;
}

export function getTotalTimeSpent(listenerId: string, programId: string): number {
  const progress = getProgramProgress(listenerId, programId);
  if (!progress) return 0;
  
  return progress.modules.reduce((total, m) => total + m.timeSpent, 0);
}

export function getLastAccessedDate(listenerId: string, programId: string): Date | null {
  const progress = getProgramProgress(listenerId, programId);
  if (!progress) return null;
  
  return new Date(progress.lastAccessed);
}

export function getProgramStatus(listenerId: string, programId: string): 'not-started' | 'in-progress' | 'completed' {
  const progress = getProgramProgress(listenerId, programId);
  
  if (!progress || progress.overallProgress === 0) {
    return 'not-started';
  }
  
  if (progress.overallProgress === 100) {
    return 'completed';
  }
  
  return 'in-progress';
}

export function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} ч ${minutes} мин`;
  }
  
  return `${minutes} мин`;
}

export function getNextModuleToComplete(listenerId: string, programId: string): number | null {
  const progress = getProgramProgress(listenerId, programId);
  
  if (!progress) return 0;
  
  const nextModule = progress.modules.findIndex(m => !m.completed);
  return nextModule !== -1 ? nextModule : null;
}
