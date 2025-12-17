const STORAGE_KEY = 'custom_videos';

export const videoService = {
  getCustomVideo(programId: string, moduleId: number): string | null {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const videos = JSON.parse(saved);
    const key = `${programId}_${moduleId}`;
    return videos[key] || null;
  },

  setCustomVideo(programId: string, moduleId: number, videoUrl: string): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    const videos = saved ? JSON.parse(saved) : {};
    
    const key = `${programId}_${moduleId}`;
    videos[key] = videoUrl;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  },

  removeCustomVideo(programId: string, moduleId: number): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    
    const videos = JSON.parse(saved);
    const key = `${programId}_${moduleId}`;
    delete videos[key];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  },

  getAllCustomVideos(): Record<string, string> {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  }
};
