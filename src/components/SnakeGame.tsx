import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCcw, Play, Pause, Keyboard } from 'lucide-react';
import { Point, Direction } from '../types';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';
const GAME_SPEED = 120;

interface SnakeGameProps {
  onScoreChange?: (score: number) => void;
  onHighScoreChange?: (highScore: number) => void;
  onLengthChange?: (length: number) => void;
}

export default function SnakeGame({ onScoreChange, onHighScoreChange, onLengthChange }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setNextDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setNextDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setNextDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setNextDirection('RIGHT'); break;
        case ' ': setIsPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setDirection(nextDirection);
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (nextDirection) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setIsGameOver(true);
        return prevSnake;
      }

      // Self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            onHighScoreChange?.(newScore);
          }
          onScoreChange?.(newScore);
          return newScore;
        });
        onLengthChange?.(newSnake.length);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [nextDirection, food, isGameOver, isPaused, generateFood, highScore]);

  // Game Loop
  useEffect(() => {
    const loop = (time: number) => {
      if (time - lastUpdateRef.current > GAME_SPEED) {
        moveSnake();
        lastUpdateRef.current = time;
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [moveSnake]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellWidth = canvas.width / GRID_SIZE;
    const cellHeight = canvas.height / GRID_SIZE;

    // Board background (matches design)
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 1.5
    );
    gradient.addColorStop(0, '#111116');
    gradient.addColorStop(1, '#050507');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (very subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(canvas.width, i * cellHeight);
      ctx.stroke();
    }

    // Food (Neon Magenta)
    ctx.fillStyle = '#ff00e5';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00e5';
    ctx.beginPath();
    ctx.arc(
      food.x * cellWidth + cellWidth / 2,
      food.y * cellHeight + cellHeight / 2,
      cellWidth / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#ffffff' : '#39ff14';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#39ff14';
      
      const padding = 2;
      const r = 3; // rounded corners
      const x = segment.x * cellWidth + padding;
      const y = segment.y * cellHeight + padding;
      const w = cellWidth - padding * 2;
      const h = cellHeight - padding * 2;
      
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  }, [snake, food]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full max-w-[500px] mx-auto border-2 border-border-main shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full h-full"
        />
        
        <div className="scanline" />

        <AnimatePresence>
          {isPaused && !isGameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6 rounded-xl z-10"
            >
              <div className="text-center space-y-2">
                <h3 className="text-5xl font-black neon-text-cyan italic uppercase tracking-widest">Paused</h3>
                <p className="text-white/40 font-mono text-sm uppercase">Waiting for input...</p>
              </div>
              <button 
                onClick={() => setIsPaused(false)}
                className="group relative px-8 py-3 bg-neon-cyan text-black font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]"
              >
                Resume Protocol
                <div className="absolute inset-0 rounded-full border-2 border-neon-cyan animate-ping opacity-20 pointer-events-none" />
              </button>
            </motion.div>
          )}

          {isGameOver && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-8 rounded-xl z-20 border-2 border-neon-magenta/30"
            >
              <div className="text-center space-y-2">
                <motion.h3 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-6xl font-black neon-text-magenta italic uppercase tracking-tighter"
                >
                  GAME OVER
                </motion.h3>
                <p className="text-white/60 font-mono text-sm uppercase">Simulation Terminated</p>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-white/40 font-mono text-[10px] uppercase">Final Data</p>
                  <p className="text-4xl font-black text-white">{score}</p>
                </div>
                
                <button 
                  onClick={resetGame}
                  className="flex items-center gap-3 px-10 py-4 bg-neon-magenta text-black font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,0,255,0.4)]"
                >
                  <RefreshCcw size={20} />
                  Retry Sync
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-white/30 uppercase px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">ARROWS</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">SPACE</kbd>
            <span>Pause</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Engine v2.04</span>
          <span className="w-1 h-1 rounded-full bg-neon-cyan" />
          <span>FPS Locked</span>
        </div>
      </div>
    </div>
  );
}
