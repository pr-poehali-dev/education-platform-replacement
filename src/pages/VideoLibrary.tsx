import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { videoPlaylists, getRecommendedPlaylists, searchVideos, type Playlist, type VideoItem } from '@/data/videoPlaylists';

interface VideoLibraryProps {
  onBack: () => void;
  onPlayVideo: (videoId: string) => void;
}

export default function VideoLibrary({ onBack, onPlayVideo }: VideoLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<VideoItem[]>([]);

  const recommendedPlaylists = getRecommendedPlaylists();
  
  const categories = ['Все категории', ...new Set(videoPlaylists.map(p => p.category))];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchVideos(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const filteredPlaylists = selectedCategory === 'all' 
    ? videoPlaylists 
    : videoPlaylists.filter(p => p.category === selectedCategory);

  const totalVideos = videoPlaylists.reduce((acc, p) => acc + p.videos.length, 0);
  const totalViews = videoPlaylists.reduce((acc, p) => 
    acc + p.videos.reduce((sum, v) => sum + v.views, 0), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                <Icon name="PlayCircle" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Видеобиблиотека
                </h1>
                <p className="text-xs text-muted-foreground">Учебные материалы и плейлисты</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                <Icon name="Video" className="h-3 w-3 mr-1" />
                {totalVideos} видео
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Icon name="Eye" className="h-3 w-3 mr-1" />
                {totalViews.toLocaleString()} просмотров
              </Badge>
            </div>
          </div>

          <div className="mt-4 relative">
            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск видео по названию, описанию или тегам..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {searchQuery && searchResults.length > 0 ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Результаты поиска</h2>
              <p className="text-muted-foreground">Найдено {searchResults.length} видео</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((video) => (
                <VideoCard key={video.id} video={video} onPlay={onPlayVideo} />
              ))}
            </div>
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="SearchX" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
              <p className="text-muted-foreground">Попробуйте изменить запрос</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="all">Все</TabsTrigger>
              {categories.slice(1).map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-8">
              {recommendedPlaylists.length > 0 && selectedCategory === 'all' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Star" className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-2xl font-bold">Рекомендуемые плейлисты</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {recommendedPlaylists.map((playlist) => (
                      <PlaylistCard key={playlist.id} playlist={playlist} onPlayVideo={onPlayVideo} />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                  {selectedCategory === 'all' ? 'Все плейлисты' : selectedCategory}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPlaylists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} onPlayVideo={onPlayVideo} />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function PlaylistCard({ playlist, onPlayVideo }: { playlist: Playlist; onPlayVideo: (videoId: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex gap-3 flex-1">
            <div className={`bg-gradient-to-br ${playlist.color} p-3 rounded-xl`}>
              <Icon name={playlist.icon} className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{playlist.title}</CardTitle>
                {playlist.isRecommended && (
                  <Badge className="bg-yellow-500">
                    <Icon name="Star" className="h-3 w-3 mr-1" />
                    Рекомендуем
                  </Badge>
                )}
              </div>
              <CardDescription>{playlist.description}</CardDescription>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary" className="text-xs">
                  <Icon name="PlayCircle" className="h-3 w-3 mr-1" />
                  {playlist.videos.length} видео
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Icon name="Clock" className="h-3 w-3 mr-1" />
                  {playlist.totalDuration}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expanded ? (
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {playlist.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-all"
                    onClick={() => onPlayVideo(video.id)}
                  >
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{video.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{video.duration}</span>
                        <Badge variant="outline" className="text-xs">
                          {video.difficulty === 'beginner' ? 'Начальный' : video.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                        </Badge>
                      </div>
                    </div>
                    <Icon name="Play" className="h-4 w-4 text-purple-600" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="space-y-2">
              {playlist.videos.slice(0, 2).map((video, index) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-all"
                  onClick={() => onPlayVideo(video.id)}
                >
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{video.title}</p>
                    <span className="text-xs text-muted-foreground">{video.duration}</span>
                  </div>
                  <Icon name="Play" className="h-4 w-4 text-purple-600" />
                </div>
              ))}
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} className="h-4 w-4 mr-2" />
            {expanded ? 'Свернуть' : `Показать все ${playlist.videos.length} видео`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoCard({ video, onPlay }: { video: VideoItem; onPlay: (videoId: string) => void }) {
  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => onPlay(video.id)}>
      <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-purple-600 rounded-full p-4 group-hover:scale-110 transition-transform">
            <Icon name="Play" className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <Badge className="bg-black/70 text-white">{video.duration}</Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
        <CardDescription className="line-clamp-2">{video.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="Eye" className="h-3 w-3" />
              <span>{video.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="ThumbsUp" className="h-3 w-3" />
              <span>{video.likes}</span>
            </div>
          </div>
          <Badge variant={
            video.difficulty === 'beginner' ? 'secondary' : 
            video.difficulty === 'intermediate' ? 'default' : 
            'destructive'
          } className="text-xs">
            {video.difficulty === 'beginner' ? 'Начальный' : video.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {video.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
