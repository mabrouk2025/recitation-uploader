
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

const AudioPlayer = ({ src, className }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', loadMetadata);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', loadMetadata);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isMuted) {
        audioRef.current.volume = 0;
      }
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (src) {
        audioRef.current.load();
      }
    }
  }, [src]);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const loadMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
      const progressBarWidth = progressBar.clientWidth;
      const newTime = (clickPosition / progressBarWidth) * duration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Generate a dynamic waveform visual
  const renderWaveform = () => {
    return (
      <div className="audio-waveform">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={cn("bar h-4 origin-bottom transition-all duration-500", 
              isPlaying ? `animate-wave-${i+1}` : "h-2"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn("relative rounded-xl p-4 bg-secondary/50 backdrop-blur-sm transition-all duration-300", className)}>
      <audio ref={audioRef}>
        <source src={src} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={togglePlay}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        
        {renderWaveform()}
        
        <button 
          onClick={toggleMute}
          className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
      
      <div className="mt-3">
        <div 
          className="w-full h-1.5 bg-muted rounded-full overflow-hidden cursor-pointer" 
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-primary rounded-full transition-all" 
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
