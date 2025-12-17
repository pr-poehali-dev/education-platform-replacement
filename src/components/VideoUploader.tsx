import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VideoUploaderProps {
  programId: string;
  moduleId: number;
  onVideoUploaded: (videoUrl: string, videoTitle: string, videoDuration: string) => void;
}

export default function VideoUploader({ programId, moduleId, onVideoUploaded }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Пожалуйста, выберите видеофайл');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setError('Размер файла не должен превышать 500 МБ');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const getVideoDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const uploadToS3 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          
          const response = await fetch('https://functions.poehali.dev/89c05d23-56e5-4878-b517-08f8ae6a8422', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Program-Id': programId,
              'X-Module-Id': moduleId.toString(),
            },
            body: JSON.stringify({
              videoData: base64Data,
              filename: file.name
            })
          });
          
          if (!response.ok) {
            throw new Error('Upload failed');
          }
          
          const result = await response.json();
          
          if (result.success && result.url) {
            resolve(result.url);
          } else {
            reject(new Error(result.error || 'Upload failed'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('File read failed'));
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const videoDuration = await getVideoDuration(selectedFile);
      
      const videoUrl = await uploadToS3(selectedFile);
      
      onVideoUploaded(videoUrl, selectedFile.name, videoDuration);
      
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Ошибка загрузки видео. Попробуйте еще раз.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Upload" className="h-5 w-5 text-purple-600" />
          Загрузить видеоматериал
        </CardTitle>
        <CardDescription>
          Загрузите видеофайл для этого модуля (MP4, WebM, максимум 500 МБ)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <Icon name="AlertCircle" className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {!selectedFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full p-8 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-100/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="bg-purple-100 p-4 rounded-full">
                  <Icon name="Video" className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-purple-900">Нажмите для выбора видео</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    или перетащите файл сюда
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <Card className="bg-white">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Icon name="FileVideo" className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(selectedFile.size)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {selectedFile.type}
                        </Badge>
                      </div>
                    </div>
                    {!isUploading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <Icon name="X" className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Загрузка...</span>
                        <span className="font-medium">{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isUploading ? (
                    <>
                      <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" className="h-4 w-4 mr-2" />
                      Загрузить видео
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Icon name="RefreshCw" className="h-4 w-4 mr-2" />
                  Выбрать другой
                </Button>
              </div>
            </div>
          )}
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Icon name="Info" className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            После загрузки видео будет доступно для просмотра всем слушателям этого модуля.
            Рекомендуемые форматы: MP4 (H.264), WebM.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}