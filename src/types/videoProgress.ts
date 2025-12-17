export interface VideoProgress {
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface EmployeeVideoProgress {
  employeeId: string;
  programId: string;
  videos: Record<string, VideoProgress>;
  overallProgress: number;
}
