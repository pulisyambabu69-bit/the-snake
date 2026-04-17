import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../types';

export const DUMMY_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Drift',
    artist: 'SynthWave AI',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://picsum.photos/seed/neon1/400/400'
  },
  {
    id: '2',
    title: 'Cyber Pulse',
    artist: 'Future Bot',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://picsum.photos/seed/cyber/400/400'
  },
  {
    id: '3',
    title: 'Midnight Grid',
    artist: 'Digital Dream',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://picsum.photos/seed/grid/400/400'
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    setProgress(0);
  };

  const skipBackward = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    skipForward();
  };

  return (
    <div className="w-full flex items-center justify-between">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      {/* Now Playing */}
      <div className="flex items-center gap-4 w-[280px]">
        <motion.div 
          key={currentTrack.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-12 h-12 rounded bg-gradient-to-br from-neon-magenta to-neon-cyan flex-shrink-0"
        >
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title} 
            className="w-full h-full object-cover rounded opacity-80"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="flex flex-col min-w-0">
          <div className="text-sm font-bold truncate text-text-main">{currentTrack.title}</div>
          <div className="text-[0.65rem] text-text-dim uppercase tracking-widest truncate">{currentTrack.artist}</div>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
        <div className="flex items-center gap-8">
          <button 
            onClick={skipBackward}
            className="text-text-dim hover:text-text-main transition-colors"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-text-main flex items-center justify-center text-bg hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="translate-x-0.5" fill="currentColor" />}
          </button>
          
          <button 
            onClick={skipForward}
            className="text-text-dim hover:text-text-main transition-colors"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        <div className="w-full flex items-center gap-3">
          <span className="text-[0.6rem] font-mono text-text-dim w-8 text-right">0:42</span>
          <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-neon-cyan shadow-[0_0_8px_white]"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            />
          </div>
          <span className="text-[0.6rem] font-mono text-text-dim w-8">3:45</span>
        </div>
      </div>

      {/* Volume Placeholder */}
      <div className="flex items-center gap-3 w-[240px] justify-end pr-4 text-text-dim">
        <Volume2 size={16} />
        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="w-[70%] h-full bg-text-dim rounded-full" />
        </div>
      </div>
    </div>
  );
}
