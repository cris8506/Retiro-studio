import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DesignerView } from './components/DesignerView';
import { DynamicsView } from './components/DynamicsView';
import { AssistantView } from './components/AssistantView';
import { MusicView } from './components/MusicView';
import { Retreat, MusicTrack } from './types';
import { OFFICIAL_PLAYLISTS } from './data/music';
import { NeuroacousticSynth } from './lib/audioSynth';
import { 
  Menu, X, Sparkles, Compass, LayoutDashboard, 
  BookOpen, MessageSquare, Music, Play, Pause, AlertCircle, HeartHandshake, Volume2,
  RefreshCw, SkipForward, Square, AlertTriangle
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Toast notifications state
  const [notification, setNotification] = useState<string | null>(null);

  // All retreats collection state
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [retreatsStatus, setRetreatsStatus] = useState<'loading' | 'empty' | 'loaded' | 'error'>('loading');

  // Active retreat global state
  const [activeRetreat, setActiveRetreat] = useState<Retreat>({
    id: '',
    name: '',
    type: 'Bienestar y Reconexión',
    goal: '',
    duration: 3,
    participantsCount: 15,
    participantsAge: '30 - 50 años',
    participantsProfile: 'Coaches',
    experienceLevel: 'Principiante a Intermedio',
    locationType: 'Naturaleza (Bosque templado)',
    desiredEnergy: 'Serena, introspectiva pero conectada',
    expectedResults: 'Liberación de cortisol, técnicas corporales aprendidas, integración profunda',
    description: '',
    idealProfile: '',
    agenda: [],
    materialsList: [],
    participantsList: [],
    notes: [],
    progress: 0
  });

  // Global music player states
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundIntensity, setSoundIntensity] = useState<number>(60);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [loopMode, setLoopMode] = useState<'next' | 'repeat' | 'stop'>('next');
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackDurations, setTrackDurations] = useState<Record<string, { durationStr: string; seconds: number | null }>>({});

  const [isUsingSynth, setIsUsingSynth] = useState<boolean>(false);

  const EMPTY_TRACK_IDS = useRef<Set<string>>(new Set([]));

  const synthRef = useRef<NeuroacousticSynth | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevTrackIdRef = useRef<string | null>(null);
  const handleTrackEndedRef = useRef<() => void>(() => {});
  const handleAudioErrorRef = useRef<() => void>(() => {});

  // Initialize synth on mount
  useEffect(() => {
    synthRef.current = new NeuroacousticSynth();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  // Formatting helper for duration/time
  const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return "Cargando duración...";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (num: number) => num.toString().padStart(2, '0');
    if (h > 0) {
      return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  // Pre-load durations of all tracks
  useEffect(() => {
    OFFICIAL_PLAYLISTS.forEach(track => {
      if (EMPTY_TRACK_IDS.current.has(track.id)) {
        setTrackDurations(prev => ({
          ...prev,
          [track.id]: { durationStr: "05:00", seconds: 300 }
        }));
        return;
      }

      if (!track.audioUrl) return;
      const audioObj = new Audio();
      audioObj.src = encodeURI(track.audioUrl);
      audioObj.preload = "metadata";
      
      const handleMeta = () => {
        const secs = audioObj.duration;
        const durationStr = formatDuration(secs);
        setTrackDurations(prev => ({
          ...prev,
          [track.id]: { durationStr, seconds: secs }
        }));
      };

      const handleErr = () => {
        setTrackDurations(prev => ({
          ...prev,
          [track.id]: { durationStr: "05:00", seconds: 300 }
        }));
      };

      audioObj.addEventListener('loadedmetadata', handleMeta);
      audioObj.addEventListener('error', handleErr);
    });
  }, []);

  // Set up standard Audio element and its event listeners once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleMeta = () => {
      setTotalDuration(audio.duration);
      setTrackError(null);
    };

    const handleEnded = () => {
      handleTrackEndedRef.current();
    };

    const handleErr = () => {
      const err = audio.error;
      // Code 1 is MEDIA_ERR_ABORTED. We MUST ignore it!
      if (err && err.code === 1) {
        return;
      }
      if (audio.src && audio.src !== window.location.href) {
        console.error("Audio player loading error:", err ? `Code ${err.code}: ${err.message}` : "unknown", "Switching to synthesized atmosphere fallback.");
        handleAudioErrorRef.current();
      }
    };

    audio.addEventListener('timeupdate', handleTime);
    audio.addEventListener('loadedmetadata', handleMeta);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleErr);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener('timeupdate', handleTime);
      audio.removeEventListener('loadedmetadata', handleMeta);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleErr);
    };
  }, []);

  // Update dynamic audio error closure ref
  useEffect(() => {
    handleAudioErrorRef.current = () => {
      setIsUsingSynth(true);
      setTotalDuration(300);
      if (synthRef.current && isPlaying && activeTrack) {
        synthRef.current.start(activeTrack.category, soundIntensity / 100);
      }
    };
  }, [isPlaying, activeTrack, soundIntensity]);

  // Main Audio & Synthesizer action coordinator
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activeTrack) {
      if (synthRef.current) {
        synthRef.current.stop();
      }
      audio.pause();
      audio.src = "";
      setIsUsingSynth(false);
      setCurrentTime(0);
      setTotalDuration(0);
      setTrackError(null);
      prevTrackIdRef.current = null;
      return;
    }

    const isSynth = EMPTY_TRACK_IDS.current.has(activeTrack.id);
    const trackChanged = prevTrackIdRef.current !== activeTrack.id;
    prevTrackIdRef.current = activeTrack.id;

    if (trackChanged) {
      // Set the synth state only when track actually changes
      setIsUsingSynth(isSynth);

      if (synthRef.current) {
        synthRef.current.stop();
      }
      audio.pause();

      if (isSynth) {
        audio.src = "";
        setCurrentTime(0);
        setTotalDuration(300); // 5 minutes virtual track
        setTrackError(null);

        if (isPlaying && synthRef.current) {
          synthRef.current.start(activeTrack.category, soundIntensity / 100);
        }
      } else {
        const encodedUrl = encodeURI(activeTrack.audioUrl || '');
        audio.src = encodedUrl;
        audio.load();
        audio.volume = soundIntensity / 100;
        setCurrentTime(0);
        setTotalDuration(0);
        setTrackError(null);

        if (isPlaying) {
          audio.play().catch(err => {
            console.warn("Playback blocked by autoplay policies or loading delay.", err);
          });
        }
      }
    } else {
      // Same track, only isPlaying state changed
      if (isUsingSynth) {
        if (isPlaying) {
          if (synthRef.current) {
            synthRef.current.start(activeTrack.category, soundIntensity / 100);
          }
        } else {
          if (synthRef.current) {
            synthRef.current.stop();
          }
        }
        audio.pause();
      } else {
        if (synthRef.current) {
          synthRef.current.stop();
        }

        if (isPlaying) {
          audio.volume = soundIntensity / 100;
          audio.play().catch(err => {
            console.warn("Playback failed on toggle play.", err);
          });
        } else {
          audio.pause();
        }
      }
    }
  }, [activeTrack, isPlaying, isUsingSynth]);

  // Handle virtual ticker for synthesized play sessions
  useEffect(() => {
    if (!isUsingSynth || !isPlaying) return;

    const ticker = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 1;
        const maxDuration = totalDuration || 300;
        if (next >= maxDuration) {
          setTimeout(() => handleTrackEnded(), 10);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [isUsingSynth, isPlaying, totalDuration, activeTrack]);

  // Sync volume changes dynamically
  useEffect(() => {
    const vol = soundIntensity / 100;
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (synthRef.current && isUsingSynth) {
      synthRef.current.setVolume(vol);
    }
  }, [soundIntensity, isUsingSynth]);

  // Helper to seek/scrub through the track
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (!isUsingSynth && audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleTrackEnded = () => {
    if (loopMode === 'repeat') {
      setCurrentTime(0);
      if (!isUsingSynth && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.error("Repeat failed:", err));
      }
    } else if (loopMode === 'next') {
      if (activeTrack) {
        const currentIndex = OFFICIAL_PLAYLISTS.findIndex(t => t.id === activeTrack.id);
        const nextTrack = (currentIndex !== -1 && currentIndex < OFFICIAL_PLAYLISTS.length - 1)
          ? OFFICIAL_PLAYLISTS[currentIndex + 1]
          : OFFICIAL_PLAYLISTS[0];
        setActiveTrack(nextTrack);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  // Keep handleTrackEndedRef updated with the latest function closure
  useEffect(() => {
    handleTrackEndedRef.current = handleTrackEnded;
  }, [handleTrackEnded]);

  const fetchRetreats = async () => {
    setRetreatsStatus('loading');
    try {
      const response = await fetch('/api/retreats');
      if (!response.ok) {
        throw new Error("No fue posible cargar tus retiros.");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setRetreats(data);
        if (data.length > 0) {
          // If we have retreats, select the most recent one (last in list)
          const lastRetreat = data[data.length - 1];
          setActiveRetreat(lastRetreat);
          setRetreatsStatus('loaded');
        } else {
          setRetreatsStatus('empty');
        }
      } else {
        setRetreatsStatus('error');
      }
    } catch (err) {
      console.error("Error fetching retreats:", err);
      setRetreatsStatus('error');
    }
  };

  // Load retreats on mount
  useEffect(() => {
    fetchRetreats();
  }, []);

  const handlePlayTrack = (track: MusicTrack) => {
    if (activeTrack?.id === track.id) {
      setIsPlaying(prev => !prev);
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleShowNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleUpdateRetreat = (updated: Retreat) => {
    setActiveRetreat(updated);
    setRetreats(prev => prev.map(r => r.id === updated.id ? updated : r));
    // Keep it synced with backend memory
    if (updated.id) {
      fetch('/api/retreats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(err => console.error("Error syncing retreat POST:", err));
    }
  };

  const handleSetNewRetreat = async (newRetreat: Retreat) => {
    try {
      const response = await fetch('/api/retreats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRetreat)
      });
      if (!response.ok) {
        throw new Error("No se pudo guardar el retiro.");
      }
      setActiveRetreat(newRetreat);
      setRetreats(prev => {
        const filtered = prev.filter(r => r.id !== newRetreat.id);
        return [...filtered, newRetreat];
      });
      setRetreatsStatus('loaded');
      setCurrentView('dashboard');
      handleShowNotification(`🌿 ¡Felicidades! "${newRetreat.name}" generado e importado al Dashboard.`);
    } catch (err) {
      console.error("Error saving new retreat:", err);
      handleShowNotification("⚠️ Ocurrió un error al guardar tu retiro.");
    }
  };

  const handleDeleteRetreat = async (id: string) => {
    try {
      const response = await fetch(`/api/retreats?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error("No se pudo eliminar el retiro.");
      }
      const updatedRetreats = retreats.filter(r => r.id !== id);
      setRetreats(updatedRetreats);
      if (updatedRetreats.length > 0) {
        setActiveRetreat(updatedRetreats[updatedRetreats.length - 1]);
        setRetreatsStatus('loaded');
      } else {
        setRetreatsStatus('empty');
        setActiveRetreat({
          id: '',
          name: '',
          type: 'Bienestar y Reconexión',
          goal: '',
          duration: 3,
          participantsCount: 15,
          participantsAge: '30 - 50 años',
          participantsProfile: 'Coaches',
          experienceLevel: 'Principiante a Intermedio',
          locationType: 'Naturaleza (Bosque templado)',
          desiredEnergy: 'Serena, introspectiva pero conectada',
          expectedResults: 'Liberación de cortisol, técnicas corporales aprendidas, integración profunda',
          description: '',
          idealProfile: '',
          agenda: [],
          materialsList: [],
          participantsList: [],
          notes: [],
          progress: 0
        });
      }
      handleShowNotification("🌿 El retiro ha sido eliminado correctamente.");
    } catch (err) {
      console.error("Error deleting retreat:", err);
      handleShowNotification("⚠️ No se pudo eliminar el retiro.");
    }
  };

  // Render proper view component based on active navigation tab
  const renderViewContent = () => {
    switch (currentView) {
      case 'dashboard':
        if (retreatsStatus === 'loading') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <div className="w-10 h-10 border-4 border-[#154539] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-light">Cargando tus retiros...</p>
            </div>
          );
        }
        if (retreatsStatus === 'error') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 bg-white p-8 rounded-2xl border border-red-100 max-w-md mx-auto text-center animate-fade-in">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-gray-900">Error de Conexión</h3>
              <p className="text-sm text-gray-600 font-light">No fue posible cargar tus retiros. Inténtalo nuevamente.</p>
              <button
                onClick={fetchRetreats}
                className="px-5 py-2.5 bg-[#154539] hover:bg-[#1a5143] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          );
        }
        return (
          <DashboardView 
            retreat={activeRetreat}
            retreats={retreats}
            onSelectRetreat={setActiveRetreat}
            onUpdateRetreat={handleUpdateRetreat}
            onDeleteRetreat={handleDeleteRetreat}
            onViewChange={setCurrentView}
            onPlayTrack={handlePlayTrack}
            activeTrack={activeTrack}
            isPlaying={isPlaying}
          />
        );
      case 'designer':
        return (
          <DesignerView 
            retreat={activeRetreat}
            onUpdateRetreat={handleUpdateRetreat}
            onSetNewRetreat={handleSetNewRetreat}
          />
        );
      case 'library':
        return (
          <DynamicsView 
            retreat={activeRetreat}
            onUpdateRetreat={handleUpdateRetreat}
            onShowNotification={handleShowNotification}
          />
        );
      case 'assistant':
        return (
          <AssistantView 
            retreat={activeRetreat}
          />
        );
      case 'music':
        return (
          <MusicView 
            onPlayTrack={handlePlayTrack}
            activeTrack={activeTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            trackDurations={trackDurations}
            currentTime={currentTime}
            totalDuration={totalDuration}
            onSeek={handleSeek}
            soundIntensity={soundIntensity}
            onVolumeChange={setSoundIntensity}
            loopMode={loopMode}
            onLoopModeChange={setLoopMode}
            trackError={trackError}
          />
        );
      default:
        return (
          <div className="py-12 text-center text-gray-500 font-light">
            Selecciona una opción en el menú lateral.
          </div>
        );
    }
  };

  return (
    <div id="retiro-studio-app" className="flex h-screen bg-[#F7F4EC] font-sans overflow-hidden">
      
      {/* Sidebar - Desktop Layout */}
      <Sidebar 
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }}
        retreatName={retreatsStatus === 'loaded' ? (activeRetreat.name || "Sin nombre") : "Aún no has creado un retiro"}
        activeTrack={activeTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Toast Notification Banner */}
        {notification && (
          <div 
            id="toast-notification"
            className="fixed top-5 right-5 z-50 bg-[#154539] text-white border border-[#C5A059] px-4.5 py-3 rounded-xl shadow-lg flex items-center space-x-2.5 animate-slide-in text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>{notification}</span>
          </div>
        )}

        {/* Top App Bar (Mobile + Screen width Adaptability) */}
        <header id="top-app-bar" className="bg-[#154539] text-white p-4 flex items-center justify-between md:bg-[#F7F4EC] md:text-gray-900 md:border-b md:border-gray-200/60 md:px-8 py-5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 hover:bg-white/10 md:hidden rounded-lg transition-colors flex items-center justify-center"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block md:hidden">Retiro Studio AI</span>
              <h2 className="font-serif text-sm md:text-xl font-bold tracking-tight text-white md:text-[#154539]">
                {currentView === 'dashboard' ? 'Consola del Facilitador' :
                 currentView === 'designer' ? 'Diseñador Inteligente' :
                 currentView === 'library' ? 'Biblioteca de Dinámicas' :
                 currentView === 'assistant' ? 'Mentor en Tiempo Real' :
                 'Atmósfera Sonora Inteligente'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {retreatsStatus === 'loaded' && activeRetreat.id && (
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#154539]/10 text-[#154539]">
                <HeartHandshake className="w-3.5 h-3.5 mr-1.5" />
                {activeRetreat.name}
              </span>
            )}
            <div className="text-[10px] uppercase tracking-widest font-bold font-mono text-[#C5A059] md:text-[#154539]/60">
              Retiro Studio AI
            </div>
          </div>
        </header>

        {/* Mobile Slide-out Menu Panel */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-40 bg-[#154539]/95 text-white p-6 space-y-6 flex flex-col md:hidden animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h1 className="font-serif text-lg font-bold">RETIRO STUDIO</h1>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {[
                { id: 'dashboard', name: 'Dashboard de Control', icon: LayoutDashboard },
                { id: 'designer', name: 'Diseñador de Retiros', icon: Compass },
                { id: 'library', name: 'Biblioteca de Dinámicas', icon: BookOpen },
                { id: 'assistant', name: 'Asistente IA (Mentor)', icon: MessageSquare },
                { id: 'music', name: 'Biblioteca Musical', icon: Music },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    currentView === item.id 
                      ? 'bg-[#C5A059] text-white shadow' 
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            {activeTrack && (
              <div className="p-4 bg-black/20 rounded-xl flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="text-[10px] text-[#C5A059] block uppercase">Reproduciendo</span>
                  <span className="text-xs font-bold block truncate">{activeTrack.title}</span>
                </div>
                <button 
                  onClick={handleTogglePlay}
                  className="p-2 bg-[#C5A059] rounded-full flex items-center justify-center text-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dynamic View Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-16">
            {renderViewContent()}
          </div>
        </main>

        {/* Global Floating Music Player (Bottom Bar) */}
        {activeTrack && (
          <div 
            id="global-music-player-bar"
            className="bg-[#154539] text-white border-t border-[#1b5346] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-30 shadow-lg"
          >
            {/* Left: Track Info */}
            <div className="flex items-center space-x-3.5 w-full md:w-1/4">
              <div className="w-10 h-10 bg-[#C5A059]/20 text-[#C5A059] rounded-lg flex items-center justify-center flex-shrink-0 animate-spin-slow">
                <Music className="w-5 h-5" />
              </div>
              <div className="truncate pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h5 className="text-xs font-bold text-white truncate leading-tight">{activeTrack.title}</h5>
                  <span className="text-[9px] px-1.5 py-0.25 bg-[#C5A059]/20 text-[#C5A059] rounded font-medium">
                    {activeTrack.category}
                  </span>
                  {isUsingSynth && (
                    <span className="text-[8px] px-1 py-0.25 bg-[#C5A059]/30 text-yellow-200 border border-[#C5A059]/40 rounded font-medium animate-pulse" title="Sintetizado en tiempo real por el motor de audio">
                      Sintetizador
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#a4c5b9] truncate mt-0.5">{activeTrack.artist}</p>
              </div>
            </div>

            {/* Middle: Playback Controls & Progress bar */}
            <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
              <div className="flex items-center space-x-4">
                {/* Loop Mode toggle */}
                <button
                  onClick={() => {
                    const modes: ('next' | 'repeat' | 'stop')[] = ['next', 'repeat', 'stop'];
                    const nextIndex = (modes.indexOf(loopMode) + 1) % modes.length;
                    setLoopMode(modes[nextIndex]);
                  }}
                  title={`Modo de fin: ${loopMode === 'next' ? 'Siguiente pista' : loopMode === 'repeat' ? 'Repetir pista' : 'Detener'}`}
                  className="p-1.5 rounded transition-colors text-xs flex items-center space-x-1 cursor-pointer text-[#a4c5b9] hover:text-white"
                >
                  {loopMode === 'repeat' ? (
                    <RefreshCw className="w-3.5 h-3.5" />
                  ) : loopMode === 'stop' ? (
                    <Square className="w-3.5 h-3.5" />
                  ) : (
                    <SkipForward className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[9px] uppercase font-bold">{loopMode === 'repeat' ? 'Bucle' : loopMode === 'stop' ? 'Stop' : 'Sigue'}</span>
                </button>

                {/* Play/Pause */}
                <button
                  onClick={handleTogglePlay}
                  className="p-2.5 bg-[#C5A059] hover:bg-[#b08b47] rounded-full text-white transition-all shadow-md flex items-center justify-center cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 pl-0.5" />}
                </button>

                <span className="text-[10px] text-gray-300 font-mono">
                  Energía {activeTrack.energyLevel}
                </span>
              </div>

              {/* Progress Bar & scrubbing */}
              <div className="flex items-center space-x-3 w-full">
                <span className="text-[9px] text-[#a4c5b9] font-mono w-10 text-right">{formatDuration(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={totalDuration || (trackDurations[activeTrack.id]?.seconds || 100)}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="flex-1 accent-[#C5A059] bg-[#1a5143] h-1 rounded-full cursor-pointer hover:h-1.5 transition-all"
                />
                <span className="text-[9px] text-[#a4c5b9] font-mono w-10 text-left">
                  {formatDuration(totalDuration || (trackDurations[activeTrack.id]?.seconds || 0))}
                </span>
              </div>
            </div>

            {/* Right: Sound Level control */}
            <div className="hidden md:flex items-center justify-end space-x-2.5 w-full md:w-1/4">
              <Volume2 className="w-4 h-4 text-gray-300" />
              <input
                type="range"
                min="0"
                max="100"
                value={soundIntensity}
                onChange={(e) => setSoundIntensity(Number(e.target.value))}
                className="w-24 accent-[#C5A059] bg-[#1a5143] h-1 rounded-full cursor-pointer"
              />
              <span className="text-[10px] text-gray-300 font-mono w-6 text-right">{soundIntensity}%</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
