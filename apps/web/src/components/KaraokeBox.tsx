import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Verse } from "@/types/battle";

interface KaraokeBoxProps {
  verse: Verse;
  className?: string;
}

export function KaraokeBox({ verse, className }: KaraokeBoxProps): React.JSX.Element {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actualAudioDuration, setActualAudioDuration] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Find current active line and word
  const getCurrentLyrics = () => {
    const currentTimeMs = currentTime * 1000;
    
    for (const section of verse.lyrics_sections) {
      if (section.lines && currentTimeMs >= section.start && currentTimeMs <= section.end) {
        for (const line of section.lines) {
          if (currentTimeMs >= line.start && currentTimeMs <= line.end) {
            const activeWordIndex = line.words.findIndex(
              word => currentTimeMs >= word.start && currentTimeMs <= word.end
            );
            
            return {
              section,
              line,
              activeWordIndex,
              allLines: section.lines
            };
          }
        }
      }
    }
    
    return null;
  };

  const currentLyrics = getCurrentLyrics();

  // Update time when audio plays
  useEffect(() => {
    if (isPlaying) {
      if (demoMode) {
        // Demo mode: use system time for precise lyric sync
        startTimeRef.current = Date.now() - (currentTime * 1000);
        intervalRef.current = setInterval(() => {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setCurrentTime(elapsed);
        }, 50);
      } else if (audioRef.current) {
        // Audio mode: sync with audio playback
        intervalRef.current = setInterval(() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }, 50);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, demoMode, currentTime]);

  const handlePlayPause = () => {
    if (demoMode) {
      // Demo mode: just toggle play state
      setIsPlaying(!isPlaying);
    } else if (audioRef.current) {
      // Audio mode: control actual audio
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        void audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (timeInSeconds: number) => {
    if (demoMode) {
      // Demo mode: direct time control
      setCurrentTime(timeInSeconds);
      if (isPlaying) {
        startTimeRef.current = Date.now() - (timeInSeconds * 1000);
      }
    } else if (audioRef.current) {
      // Audio mode: seek audio but allow lyrics timeline extension
      const seekTime = Math.min(timeInSeconds, actualAudioDuration || timeInSeconds);
      audioRef.current.currentTime = seekTime;
      setCurrentTime(timeInSeconds);
    }
  };

  // Get context lines (previous and next)
  const getContextLines = () => {
    if (!currentLyrics) return null;
    
    const { allLines, line: currentLine } = currentLyrics;
    const currentIndex = allLines.indexOf(currentLine);
    
    return {
      previous: currentIndex > 0 ? allLines[currentIndex - 1] : null,
      current: currentLine,
      next: currentIndex < allLines.length - 1 ? allLines[currentIndex + 1] : null
    };
  };

  const contextLines = getContextLines();
  const currentTimeMs = currentTime * 1000;

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎤 {verse.ai} - Karaoke Mode</span>
          <div className="text-sm text-muted-foreground">
            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(verse.duration / 60000)}:{Math.floor((verse.duration % 60000) / 1000).toString().padStart(2, '0')}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Audio Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={handlePlayPause}>
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </Button>
            
            <Button 
              onClick={() => {
                setDemoMode(!demoMode);
              }}
              variant={demoMode ? "default" : "outline"}
              size="sm"
            >
              {demoMode ? "🎯 Demo Mode" : "🎵 Audio Mode"}
            </Button>
            
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={verse.duration / 1000}
                value={currentTime}
                onChange={(e) => {
                handleSeek(Number(e.target.value));
              }}
                className="w-full"
              />
            </div>
          </div>
          
          {demoMode && (
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
              Demo mode uses system timer for perfect lyric sync (ignores audio duration)
            </div>
          )}
          
          {!demoMode && actualAudioDuration > 0 && actualAudioDuration < verse.duration / 1000 && (
            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
              Audio is {actualAudioDuration.toFixed(1)}s but lyrics expect {(verse.duration / 1000).toFixed(1)}s. 
              Try Demo Mode for full experience.
            </div>
          )}
        </div>

        {/* Lyrics Display */}
        <div className="min-h-[200px] p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg">
          {currentLyrics ? (
            <div className="space-y-4">
              {/* Previous line (faded) */}
              {contextLines?.previous && (
                <div className="text-muted-foreground/50 text-lg">
                  {contextLines.previous.text}
                </div>
              )}
              
              {/* Current line with word highlighting */}
              <div className="text-2xl font-bold leading-relaxed">
                {currentLyrics.line.words.map((word, index) => {
                  const isActive = index === currentLyrics.activeWordIndex;
                  const isPast = currentTimeMs > word.end;
                  const isFuture = currentTimeMs < word.start;
                  
                  return (
                    <span
                      key={index}
                      className={cn(
                        "transition-all duration-150",
                        {
                          "bg-yellow-300 dark:bg-yellow-600 text-black scale-110 shadow-lg": isActive,
                          "text-green-600 dark:text-green-400": isPast && !isActive,
                          "text-muted-foreground": isFuture
                        }
                      )}
                      style={{
                        display: "inline-block",
                        margin: "0 2px",
                        padding: isActive ? "2px 4px" : "0",
                        borderRadius: isActive ? "4px" : "0",
                        transform: isActive ? "translateY(-2px)" : "none"
                      }}
                    >
                      {word.text}
                    </span>
                  );
                })}
              </div>
              
              {/* Next line (faded) */}
              {contextLines?.next && (
                <div className="text-muted-foreground/50 text-lg">
                  {contextLines.next.text}
                </div>
              )}
              
              {/* Section indicator */}
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-4">
                {currentLyrics.section.section_type}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-2">🎵</div>
                <div>Waiting for lyrics...</div>
                <div className="text-sm mt-2">
                  {currentTimeMs < (verse.lyrics_sections[0]?.start ?? 0) ? "Track starting..." : "Instrumental section"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Jump Sections */}
        <div className="flex flex-wrap gap-2">
          {verse.lyrics_sections
            .filter(section => section.lines && section.lines.length > 0)
            .map((section, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  handleSeek(section.start / 1000);
                }}
                className={cn(
                  "capitalize",
                  currentTimeMs >= section.start && currentTimeMs <= section.end
                    ? "bg-primary text-primary-foreground"
                    : ""
                )}
              >
                {section.section_type}
              </Button>
            ))}
        </div>
      </CardContent>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={verse.url}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setActualAudioDuration(audioRef.current.duration);
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onPlay={() => {
          setIsPlaying(true);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onEnded={() => {
          setIsPlaying(false);
          // Don't reset to 0 if we're using lyrics-based timing
        }}
      />
    </Card>
  );
}
