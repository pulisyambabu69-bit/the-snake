import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer, { DUMMY_TRACKS } from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [length, setLength] = useState(3);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="header-section">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-neon-cyan flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(0,242,255,0.4)]">
            //
          </div>
          <h1 className="text-xl font-extrabold uppercase tracking-[0.2em] text-neon-cyan shadow-neon-cyan/20">
            SYNTH // SNAKE
          </h1>
        </div>
        <div className="text-[0.7rem] font-mono text-text-dim uppercase tracking-widest flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-neon-lime animate-pulse" />
            Systems Nominal
          </span>
          <span className="w-px h-3 bg-border-main" />
          <span>60 FPS</span>
        </div>
      </header>

      {/* Left Sidebar: Playlist */}
      <aside className="sidebar-section">
        <h3 className="panel-title">Queue</h3>
        <div className="flex flex-col gap-2">
          {DUMMY_TRACKS.map((track, i) => (
            <div 
              key={track.id} 
              className={`elegant-card ${i === 0 ? 'active' : ''}`}
            >
              <div className="text-sm font-semibold truncate text-text-main">{track.title}</div>
              <div className="text-[0.7rem] text-text-dim uppercase tracking-wider">{track.artist}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="text-[0.6rem] font-mono text-text-dim uppercase mb-2">System Load</div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-neon-cyan" 
              initial={{ width: 0 }}
              animate={{ width: "42%" }}
            />
          </div>
        </div>
      </aside>

      {/* Main Viewport: Game */}
      <main className="main-viewport">
        <SnakeGame 
          onScoreChange={setScore} 
          onHighScoreChange={setHighScore}
          onLengthChange={setLength}
        />
      </main>

      {/* Right Sidebar: Stats */}
      <aside className="sidebar-section border-l border-border-main">
        <h3 className="panel-title">Session Data</h3>
        
        <div className="space-y-8">
          <div className="stat-group">
            <div className="panel-title !mb-0 opacity-50">Score</div>
            <div className="text-4xl font-extrabold font-mono text-neon-cyan tracking-tighter">
              {score.toLocaleString('en-US', { minimumIntegerDigits: 5, useGrouping: false })}
            </div>
          </div>

          <div className="stat-group">
            <div className="panel-title !mb-0 opacity-50">Best</div>
            <div className="text-2xl font-bold font-mono text-text-main/80">
              {highScore.toLocaleString('en-US', { minimumIntegerDigits: 5, useGrouping: false })}
            </div>
          </div>
          
          <div className="stat-group">
            <div className="panel-title !mb-0 opacity-50">Length</div>
            <div className="text-2xl font-bold font-mono text-text-main/80">
              {length.toString().padStart(2, '0')}
            </div>
          </div>

          <div className="stat-group">
            <div className="panel-title !mb-0 opacity-50">Uptime</div>
            <div className="text-2xl font-bold font-mono text-text-main/80">
              {formatTime(seconds)}
            </div>
          </div>

          <div className="stat-group pt-8 border-t border-white/5">
            <div className="panel-title">Controls</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[0.65rem] font-mono">
                <span className="text-text-dim">NAVIGATE</span>
                <span className="text-white/80">ARROWS</span>
              </div>
              <div className="flex justify-between items-center text-[0.65rem] font-mono">
                <span className="text-text-dim">PAUSE</span>
                <span className="text-white/80">SPACE</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Footer: Music Player */}
      <footer className="footer-player-bar">
        <MusicPlayer />
      </footer>
    </div>
  );
}
