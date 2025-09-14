'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  BookOpen,
  CheckCircle,
  Clock,
  User,
  Star,
  Download,
  Share2,
  MessageSquare,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  instructor: string;
  thumbnail: string;
  videoUrl: string;
  transcriptUrl?: string;
  resources: Array<{
    title: string;
    url: string;
    type: 'pdf' | 'link' | 'code';
  }>;
  chapters: Array<{
    title: string;
    startTime: number;
    description: string;
  }>;
  completed: boolean;
  rating: number;
  enrolledCount: number;
  tags: string[];
}

interface VoiceOverSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  language: string;
}

const SAMPLE_TUTORIALS: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Shoplytics',
    description: 'Learn the basics of setting up your Shopify analytics dashboard and connecting your store.',
    duration: 480, // 8 minutes
    difficulty: 'Beginner',
    category: 'Setup',
    instructor: 'Sarah Chen',
    thumbnail: '/tutorials/getting-started-thumb.jpg',
    videoUrl: '/tutorials/getting-started.mp4',
    transcriptUrl: '/tutorials/getting-started-transcript.txt',
    resources: [
      { title: 'Setup Checklist', url: '/resources/setup-checklist.pdf', type: 'pdf' },
      { title: 'API Documentation', url: '/docs/api', type: 'link' },
    ],
    chapters: [
      { title: 'Introduction', startTime: 0, description: 'Overview of Shoplytics features' },
      { title: 'Account Setup', startTime: 60, description: 'Creating your account and basic configuration' },
      { title: 'Store Connection', startTime: 180, description: 'Connecting your Shopify store' },
      { title: 'First Dashboard', startTime: 300, description: 'Creating your first analytics dashboard' },
      { title: 'Next Steps', startTime: 420, description: 'What to do after setup' },
    ],
    completed: false,
    rating: 4.8,
    enrolledCount: 2847,
    tags: ['setup', 'beginner', 'shopify', 'dashboard']
  },
  {
    id: 'advanced-analytics',
    title: 'Advanced Analytics and Custom Reports',
    description: 'Master advanced analytics features, create custom reports, and leverage AI insights.',
    duration: 720, // 12 minutes
    difficulty: 'Advanced',
    category: 'Analytics',
    instructor: 'Michael Torres',
    thumbnail: '/tutorials/advanced-analytics-thumb.jpg',
    videoUrl: '/tutorials/advanced-analytics.mp4',
    resources: [
      { title: 'Custom Report Templates', url: '/resources/report-templates.zip', type: 'code' },
      { title: 'Analytics Best Practices', url: '/guides/analytics-best-practices', type: 'link' },
    ],
    chapters: [
      { title: 'Advanced Metrics', startTime: 0, description: 'Understanding complex analytics metrics' },
      { title: 'Custom Reports', startTime: 180, description: 'Building custom report dashboards' },
      { title: 'AI Insights', startTime: 360, description: 'Leveraging AI for predictive analytics' },
      { title: 'Data Export', startTime: 540, description: 'Exporting and sharing your data' },
      { title: 'Automation', startTime: 600, description: 'Setting up automated reports' },
    ],
    completed: false,
    rating: 4.9,
    enrolledCount: 1523,
    tags: ['advanced', 'analytics', 'reports', 'ai', 'automation']
  },
  {
    id: 'customer-segmentation',
    title: 'Customer Segmentation and Targeting',
    description: 'Learn how to segment your customers effectively and create targeted marketing campaigns.',
    duration: 600, // 10 minutes
    difficulty: 'Intermediate',
    category: 'Marketing',
    instructor: 'Emily Rodriguez',
    thumbnail: '/tutorials/customer-segmentation-thumb.jpg',
    videoUrl: '/tutorials/customer-segmentation.mp4',
    resources: [
      { title: 'Segmentation Guide', url: '/resources/segmentation-guide.pdf', type: 'pdf' },
      { title: 'Campaign Templates', url: '/resources/campaign-templates.zip', type: 'code' },
    ],
    chapters: [
      { title: 'Segmentation Basics', startTime: 0, description: 'Understanding customer segmentation' },
      { title: 'Creating Segments', startTime: 120, description: 'Building custom customer segments' },
      { title: 'Behavioral Analysis', startTime: 300, description: 'Analyzing customer behavior patterns' },
      { title: 'Targeted Campaigns', startTime: 450, description: 'Creating targeted marketing campaigns' },
    ],
    completed: true,
    rating: 4.7,
    enrolledCount: 1847,
    tags: ['intermediate', 'customers', 'segmentation', 'marketing', 'targeting']
  }
];

const VOICE_OPTIONS = [
  { id: 'sarah', name: 'Sarah (English US)', language: 'en-US', gender: 'female' },
  { id: 'john', name: 'John (English US)', language: 'en-US', gender: 'male' },
  { id: 'emma', name: 'Emma (English UK)', language: 'en-GB', gender: 'female' },
  { id: 'alex', name: 'Alex (English AU)', language: 'en-AU', gender: 'male' },
];

export default function TutorialsPage() {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [voiceOverSettings, setVoiceOverSettings] = useState<VoiceOverSettings>({
    voice: 'sarah',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    language: 'en-US'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const categories = ['all', ...Array.from(new Set(SAMPLE_TUTORIALS.map(t => t.category)))];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredTutorials = SAMPLE_TUTORIALS.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && playerRef.current) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = speechSynthesis.getVoices().find(v => v.name.includes(voiceOverSettings.voice));
      
      if (voice) utterance.voice = voice;
      utterance.rate = voiceOverSettings.speed;
      utterance.pitch = voiceOverSettings.pitch;
      utterance.volume = voiceOverSettings.volume;
      utterance.lang = voiceOverSettings.language;
      
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [selectedTutorial]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
                Shoplytics Academy
              </h1>
              <p className="mt-2 text-gray-600">Master e-commerce analytics with our comprehensive video tutorials</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => speakText('Welcome to Shoplytics Academy. Here you can learn everything about e-commerce analytics.')}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Voice Guide
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedTutorial ? (
          // Tutorial Library View
          <div>
            {/* Search and Filters */}
            <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tutorials, topics, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty === 'all' ? 'All Levels' : difficulty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tutorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTutorials.map((tutorial) => (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTutorial(tutorial)}
                >
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {formatTime(tutorial.duration)}
                    </div>
                    {tutorial.completed && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tutorial.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        tutorial.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tutorial.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{tutorial.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{tutorial.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tutorial.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        {tutorial.instructor}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {tutorial.rating}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tutorial.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          // Video Player View
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Video Player */}
            <div className="xl:col-span-3">
              <div ref={playerRef} className="bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full aspect-video"
                  poster={selectedTutorial.thumbnail}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                >
                  <source src={selectedTutorial.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Controls */}
                <div className="bg-gray-900 text-white p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <button onClick={handlePlayPause} className="hover:text-blue-400 transition-colors">
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </button>
                    <button className="hover:text-blue-400 transition-colors">
                      <SkipBack className="h-5 w-5" />
                    </button>
                    <button className="hover:text-blue-400 transition-colors">
                      <SkipForward className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={toggleMute} className="hover:text-blue-400 transition-colors">
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                    <span className="text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <div className="flex-1"></div>
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="hover:text-blue-400 transition-colors"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <button onClick={toggleFullscreen} className="hover:text-blue-400 transition-colors">
                      {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>

              {/* Tutorial Info */}
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedTutorial.title}</h1>
                    <p className="text-gray-600 mb-4">{selectedTutorial.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {selectedTutorial.instructor}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(selectedTutorial.duration)}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {selectedTutorial.rating} ({selectedTutorial.enrolledCount} enrolled)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Resources
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Transcript */}
              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 bg-white rounded-lg shadow-sm p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">Transcript</h3>
                    <div className="prose max-w-none text-sm text-gray-700 max-h-64 overflow-y-auto">
                      <p>Welcome to this tutorial on {selectedTutorial.title.toLowerCase()}. In this video, we'll cover...</p>
                      <p>First, let's start by understanding the basics of {selectedTutorial.category.toLowerCase()}...</p>
                      <p>Throughout this tutorial, you'll learn how to implement these concepts in your own analytics workflow...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Chapters */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Chapters</h3>
                <div className="space-y-2">
                  {selectedTutorial.chapters.map((chapter, index) => (
                    <button
                      key={index}
                      onClick={() => handleSeek(chapter.startTime)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>
                          <span className="text-xs text-gray-400">{formatTime(chapter.startTime)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <div className="space-y-2">
                  {selectedTutorial.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="bg-green-100 text-green-600 rounded-lg p-2">
                        <Download className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{resource.title}</h4>
                        <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Voice Settings */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Voice Guide Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Voice</label>
                    <select
                      value={voiceOverSettings.voice}
                      onChange={(e) => setVoiceOverSettings({...voiceOverSettings, voice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {VOICE_OPTIONS.map(voice => (
                        <option key={voice.id} value={voice.id}>{voice.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Speed: {voiceOverSettings.speed}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceOverSettings.speed}
                      onChange={(e) => setVoiceOverSettings({...voiceOverSettings, speed: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={() => speakText(`This is a sample of the selected voice at ${voiceOverSettings.speed} times speed.`)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Test Voice
                  </button>
                </div>
              </div>

              {/* Back to Library */}
              <button
                onClick={() => setSelectedTutorial(null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back to Library
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
