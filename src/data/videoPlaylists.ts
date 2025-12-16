export interface VideoItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail?: string;
  videoUrl?: string;
  programId: string;
  moduleId: number;
  views: number;
  likes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  videos: VideoItem[];
  category: string;
  isRecommended?: boolean;
  totalDuration: string;
  completedVideos?: number;
}

export const videoPlaylists: Playlist[] = [
  {
    id: 'heights-basics',
    title: 'Основы работы на высоте',
    description: 'Базовый курс для новичков по безопасной работе на высоте',
    icon: 'Mountain',
    color: 'from-orange-500 to-red-500',
    category: 'Работа на высоте',
    isRecommended: true,
    totalDuration: '2ч 15м',
    videos: [
      {
        id: 'wah-intro',
        title: 'Введение в работу на высоте',
        description: 'Основные понятия, определения и требования законодательства',
        duration: '15:30',
        programId: 'work-at-height',
        moduleId: 1,
        views: 1245,
        likes: 98,
        difficulty: 'beginner',
        tags: ['законодательство', 'основы', 'требования']
      },
      {
        id: 'wah-equipment',
        title: 'СИЗ от падения с высоты',
        description: 'Виды средств индивидуальной защиты, правила выбора и проверки',
        duration: '25:45',
        programId: 'work-at-height',
        moduleId: 3,
        views: 1089,
        likes: 87,
        difficulty: 'beginner',
        tags: ['СИЗ', 'оборудование', 'проверка']
      },
      {
        id: 'wah-harness',
        title: 'Правильное надевание страховочной привязи',
        description: 'Пошаговая инструкция по надеванию и регулировке привязи',
        duration: '18:20',
        programId: 'work-at-height',
        moduleId: 3,
        views: 2156,
        likes: 145,
        difficulty: 'beginner',
        tags: ['привязь', 'инструкция', 'практика']
      },
      {
        id: 'wah-anchors',
        title: 'Анкерные точки и их проверка',
        description: 'Типы анкерных устройств и методы проверки прочности',
        duration: '22:10',
        programId: 'work-at-height',
        moduleId: 3,
        views: 876,
        likes: 72,
        difficulty: 'intermediate',
        tags: ['анкеры', 'проверка', 'безопасность']
      },
      {
        id: 'wah-rescue',
        title: 'Спасательные операции на высоте',
        description: 'Методы спасения пострадавшего и самоспасения',
        duration: '28:40',
        programId: 'work-at-height',
        moduleId: 5,
        views: 654,
        likes: 89,
        difficulty: 'advanced',
        tags: ['спасение', 'эвакуация', 'первая помощь']
      }
    ]
  },
  {
    id: 'electrical-safety-basics',
    title: 'Основы электробезопасности',
    description: 'Базовые знания для работы с электроустановками',
    icon: 'Zap',
    color: 'from-yellow-500 to-orange-500',
    category: 'Электробезопасность',
    isRecommended: true,
    totalDuration: '1ч 45м',
    videos: [
      {
        id: 'es-theory',
        title: 'Теория электричества',
        description: 'Основные понятия: ток, напряжение, сопротивление',
        duration: '20:15',
        programId: 'electrical-safety',
        moduleId: 1,
        views: 1567,
        likes: 112,
        difficulty: 'beginner',
        tags: ['теория', 'основы', 'физика']
      },
      {
        id: 'es-danger',
        title: 'Опасность электрического тока',
        description: 'Воздействие тока на организм человека',
        duration: '18:30',
        programId: 'electrical-safety',
        moduleId: 3,
        views: 1234,
        likes: 95,
        difficulty: 'beginner',
        tags: ['опасность', 'здоровье', 'травмы']
      },
      {
        id: 'es-protection',
        title: 'Средства защиты в электроустановках',
        description: 'Диэлектрические перчатки, боты, коврики',
        duration: '22:45',
        programId: 'electrical-safety',
        moduleId: 5,
        views: 987,
        likes: 78,
        difficulty: 'intermediate',
        tags: ['защита', 'СИЗ', 'диэлектрики']
      },
      {
        id: 'es-firstaid',
        title: 'Первая помощь при электротравме',
        description: 'Освобождение от тока и реанимация пострадавшего',
        duration: '25:20',
        programId: 'electrical-safety',
        moduleId: 7,
        views: 1456,
        likes: 134,
        difficulty: 'advanced',
        tags: ['первая помощь', 'реанимация', 'спасение']
      }
    ]
  },
  {
    id: 'fire-safety-basics',
    title: 'Пожарная безопасность для начинающих',
    description: 'Основные правила пожарной безопасности на предприятии',
    icon: 'Flame',
    color: 'from-red-500 to-pink-500',
    category: 'Пожарная безопасность',
    isRecommended: false,
    totalDuration: '1ч 30м',
    videos: [
      {
        id: 'fs-basics',
        title: 'Основы пожарной безопасности',
        description: 'Законодательство и общие требования',
        duration: '16:40',
        programId: 'fire-safety',
        moduleId: 1,
        views: 2134,
        likes: 167,
        difficulty: 'beginner',
        tags: ['законодательство', 'основы', 'требования']
      },
      {
        id: 'fs-combustion',
        title: 'Процесс горения и его прекращение',
        description: 'Теория горения и методы тушения пожаров',
        duration: '19:25',
        programId: 'fire-safety',
        moduleId: 2,
        views: 1876,
        likes: 142,
        difficulty: 'beginner',
        tags: ['горение', 'теория', 'тушение']
      },
      {
        id: 'fs-extinguishers',
        title: 'Типы огнетушителей и их применение',
        description: 'Порошковые, углекислотные, пенные огнетушители',
        duration: '21:15',
        programId: 'fire-safety',
        moduleId: 5,
        views: 2567,
        likes: 198,
        difficulty: 'intermediate',
        tags: ['огнетушители', 'типы', 'применение']
      },
      {
        id: 'fs-evacuation',
        title: 'Эвакуация при пожаре',
        description: 'Порядок действий и планы эвакуации',
        duration: '17:50',
        programId: 'fire-safety',
        moduleId: 6,
        views: 1654,
        likes: 128,
        difficulty: 'beginner',
        tags: ['эвакуация', 'действия', 'безопасность']
      }
    ]
  },
  {
    id: 'advanced-heights',
    title: 'Продвинутые техники высотных работ',
    description: 'Для опытных специалистов по промышленному альпинизму',
    icon: 'Mountain',
    color: 'from-blue-500 to-purple-500',
    category: 'Работа на высоте',
    isRecommended: false,
    totalDuration: '2ч 45м',
    videos: [
      {
        id: 'wah-rope-access',
        title: 'Системы канатного доступа',
        description: 'Основы промышленного альпинизма',
        duration: '32:15',
        programId: 'work-at-height',
        moduleId: 4,
        views: 456,
        likes: 67,
        difficulty: 'advanced',
        tags: ['альпинизм', 'канаты', 'техника']
      },
      {
        id: 'wah-knots',
        title: 'Узлы для высотных работ',
        description: 'Виды узлов и их применение',
        duration: '28:40',
        programId: 'work-at-height',
        moduleId: 4,
        views: 523,
        likes: 78,
        difficulty: 'advanced',
        tags: ['узлы', 'техника', 'безопасность']
      },
      {
        id: 'wah-vertical',
        title: 'Передвижение по вертикали',
        description: 'Техника подъема и спуска по канатам',
        duration: '35:20',
        programId: 'work-at-height',
        moduleId: 4,
        views: 398,
        likes: 54,
        difficulty: 'advanced',
        tags: ['подъем', 'спуск', 'техника']
      }
    ]
  },
  {
    id: 'labor-protection',
    title: 'Охрана труда для руководителей',
    description: 'Комплексный курс по организации системы охраны труда',
    icon: 'Briefcase',
    color: 'from-blue-500 to-indigo-500',
    category: 'Охрана труда',
    isRecommended: true,
    totalDuration: '3ч 10м',
    videos: [
      {
        id: 'lp-legislation',
        title: 'Законодательство об охране труда',
        description: 'Трудовой кодекс и нормативные акты',
        duration: '24:30',
        programId: 'labor-protection',
        moduleId: 1,
        views: 1987,
        likes: 156,
        difficulty: 'beginner',
        tags: ['законодательство', 'ТК РФ', 'нормативы']
      },
      {
        id: 'lp-suot',
        title: 'Система управления охраной труда',
        description: 'Создание и внедрение СУОТ на предприятии',
        duration: '38:45',
        programId: 'labor-protection',
        moduleId: 2,
        views: 1456,
        likes: 124,
        difficulty: 'intermediate',
        tags: ['СУОТ', 'управление', 'организация']
      },
      {
        id: 'lp-risks',
        title: 'Оценка профессиональных рисков',
        description: 'Методы выявления и управления рисками',
        duration: '31:20',
        programId: 'labor-protection',
        moduleId: 4,
        views: 1234,
        likes: 98,
        difficulty: 'intermediate',
        tags: ['риски', 'оценка', 'управление']
      },
      {
        id: 'lp-training',
        title: 'Организация обучения персонала',
        description: 'Инструктажи и проверка знаний',
        duration: '27:15',
        programId: 'labor-protection',
        moduleId: 5,
        views: 1678,
        likes: 142,
        difficulty: 'intermediate',
        tags: ['обучение', 'инструктажи', 'проверка']
      }
    ]
  }
];

export function getPlaylistById(id: string): Playlist | undefined {
  return videoPlaylists.find(playlist => playlist.id === id);
}

export function getRecommendedPlaylists(): Playlist[] {
  return videoPlaylists.filter(playlist => playlist.isRecommended);
}

export function getPlaylistsByCategory(category: string): Playlist[] {
  return videoPlaylists.filter(playlist => playlist.category === category);
}

export function getVideoById(videoId: string): VideoItem | undefined {
  for (const playlist of videoPlaylists) {
    const video = playlist.videos.find(v => v.id === videoId);
    if (video) return video;
  }
  return undefined;
}

export function getRelatedVideos(videoId: string, limit: number = 4): VideoItem[] {
  const currentVideo = getVideoById(videoId);
  if (!currentVideo) return [];

  const allVideos: VideoItem[] = [];
  videoPlaylists.forEach(playlist => {
    allVideos.push(...playlist.videos);
  });

  return allVideos
    .filter(v => 
      v.id !== videoId && 
      (v.programId === currentVideo.programId || 
       v.tags.some(tag => currentVideo.tags.includes(tag)))
    )
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export function searchVideos(query: string): VideoItem[] {
  const lowercaseQuery = query.toLowerCase();
  const allVideos: VideoItem[] = [];
  
  videoPlaylists.forEach(playlist => {
    allVideos.push(...playlist.videos);
  });

  return allVideos.filter(video =>
    video.title.toLowerCase().includes(lowercaseQuery) ||
    video.description.toLowerCase().includes(lowercaseQuery) ||
    video.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}
