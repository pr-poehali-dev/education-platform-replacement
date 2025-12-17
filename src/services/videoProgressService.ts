import { VideoProgress, EmployeeVideoProgress } from '@/types/videoProgress';

const STORAGE_KEY = 'video_progress';

export const videoProgressService = {
  getEmployeeProgress(employeeId: string, programId: string): EmployeeVideoProgress | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const allProgress: EmployeeVideoProgress[] = JSON.parse(stored);
    return allProgress.find(
      (p) => p.employeeId === employeeId && p.programId === programId
    ) || null;
  },

  updateVideoProgress(
    employeeId: string,
    programId: string,
    videoId: string,
    watchedSeconds: number,
    totalSeconds: number
  ): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allProgress: EmployeeVideoProgress[] = stored ? JSON.parse(stored) : [];

    let employeeProgress = allProgress.find(
      (p) => p.employeeId === employeeId && p.programId === programId
    );

    if (!employeeProgress) {
      employeeProgress = {
        employeeId,
        programId,
        videos: {},
        overallProgress: 0,
      };
      allProgress.push(employeeProgress);
    }

    const completed = watchedSeconds >= totalSeconds * 0.9;

    employeeProgress.videos[videoId] = {
      videoId,
      watchedSeconds,
      totalSeconds,
      completed,
      lastWatchedAt: new Date().toISOString(),
    };

    const videos = Object.values(employeeProgress.videos);
    const completedCount = videos.filter((v) => v.completed).length;
    employeeProgress.overallProgress = videos.length > 0 
      ? Math.round((completedCount / videos.length) * 100)
      : 0;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  },

  getVideoProgress(employeeId: string, programId: string, videoId: string): VideoProgress | null {
    const employeeProgress = this.getEmployeeProgress(employeeId, programId);
    return employeeProgress?.videos[videoId] || null;
  },

  resetProgress(employeeId: string, programId: string): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const allProgress: EmployeeVideoProgress[] = JSON.parse(stored);
    const filtered = allProgress.filter(
      (p) => !(p.employeeId === employeeId && p.programId === programId)
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },
};
