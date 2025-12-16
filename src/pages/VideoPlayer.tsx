import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import VideoPlayerComponent from '@/components/VideoPlayer';
import { getVideoById, getRelatedVideos } from '@/data/videoPlaylists';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface VideoPlayerPageProps {
  videoId: string;
  onBack: () => void;
  onPlayVideo: (videoId: string) => void;
}

export default function VideoPlayerPage({ videoId, onBack, onPlayVideo }: VideoPlayerPageProps) {
  const [video, setVideo] = useState(getVideoById(videoId));
  const [relatedVideos, setRelatedVideos] = useState(getRelatedVideos(videoId));
  const [videoProgress, setVideoProgress] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const newVideo = getVideoById(videoId);
    setVideo(newVideo);
    setRelatedVideos(getRelatedVideos(videoId));
    
    const savedProgress = localStorage.getItem(`video_progress_${videoId}`);
    if (savedProgress) {
      setVideoProgress(parseFloat(savedProgress));
    }

    const liked = localStorage.getItem(`video_liked_${videoId}`);
    setHasLiked(liked === 'true');
  }, [videoId]);

  const handleProgressUpdate = (progress: number) => {
    setVideoProgress(progress);
    localStorage.setItem(`video_progress_${videoId}`, progress.toString());
  };

  const handleLike = () => {
    setHasLiked(!hasLiked);
    localStorage.setItem(`video_liked_${videoId}`, (!hasLiked).toString());
  };

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <Icon name="VideoOff" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Видео не найдено</h3>
            <Button onClick={onBack}>
              <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
              Вернуться
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
              <Icon name="PlayCircle" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Просмотр видео</h1>
              <p className="text-xs text-muted-foreground">Видеобиблиотека</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayerComponent
              videoUrl={video.videoUrl}
              videoTitle={video.title}
              videoDuration={video.duration}
              initialProgress={videoProgress}
              onProgressUpdate={handleProgressUpdate}
            />

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{video.title}</CardTitle>
                    <CardDescription className="text-base">{video.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant={
                    video.difficulty === 'beginner' ? 'secondary' : 
                    video.difficulty === 'intermediate' ? 'default' : 
                    'destructive'
                  }>
                    {video.difficulty === 'beginner' ? 'Начальный уровень' : 
                     video.difficulty === 'intermediate' ? 'Средний уровень' : 
                     'Продвинутый уровень'}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Eye" className="h-4 w-4" />
                    <span>{video.views.toLocaleString()} просмотров</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Clock" className="h-4 w-4" />
                    <span>{video.duration}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant={hasLiked ? "default" : "outline"}
                    onClick={handleLike}
                    className={hasLiked ? "bg-purple-600" : ""}
                  >
                    <Icon name="ThumbsUp" className="h-4 w-4 mr-2" />
                    {video.likes + (hasLiked ? 1 : 0)}
                  </Button>
                  <Button variant="outline">
                    <Icon name="Share2" className="h-4 w-4 mr-2" />
                    Поделиться
                  </Button>
                  <Button variant="outline">
                    <Icon name="Bookmark" className="h-4 w-4 mr-2" />
                    Сохранить
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Теги</h3>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <span className="font-semibold">Комментарии (0)</span>
                    <Icon name={showComments ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
                  </Button>
                  {showComments && (
                    <div className="mt-4 p-4 bg-muted rounded-lg text-center">
                      <Icon name="MessageSquare" className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Комментарии будут доступны в следующей версии
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="PlayCircle" className="h-4 w-4" />
                  Похожие видео
                </CardTitle>
                <CardDescription>Рекомендуемые материалы</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3 pr-4">
                    {relatedVideos.length > 0 ? (
                      relatedVideos.map((relatedVideo) => (
                        <div
                          key={relatedVideo.id}
                          className="flex gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-all"
                          onClick={() => onPlayVideo(relatedVideo.id)}
                        >
                          <div className="w-32 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center shrink-0 relative">
                            <Icon name="Play" className="h-6 w-6 text-purple-600" />
                            <Badge className="absolute bottom-1 right-1 text-xs bg-black/70">
                              {relatedVideo.duration}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2 mb-1">
                              {relatedVideo.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Icon name="Eye" className="h-3 w-3" />
                                <span>{relatedVideo.views}</span>
                              </div>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {relatedVideo.difficulty === 'beginner' ? 'Начальный' : 
                                 relatedVideo.difficulty === 'intermediate' ? 'Средний' : 
                                 'Продвинутый'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Icon name="Video" className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Похожие видео не найдены
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
