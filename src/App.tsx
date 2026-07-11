import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DesignerView } from './components/DesignerView';
import { DynamicsView } from './components/DynamicsView';
import { AssistantView } from './components/AssistantView';
import { MusicView } from './components/MusicView';
import { Retreat, MusicTrack } from './types';
import { 
  Menu, X, Sparkles, Compass, LayoutDashboard, 
  BookOpen, MessageSquare, Music, Play, Pause, AlertCircle, HeartHandshake, Volume2
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Toast notifications state
  const [notification, setNotification] = useState<string | null>(null);

  // All retreats collection state
  const [retreats, setRetreats] = useState<Retreat[]>([]);

  // Active retreat global state
  const [activeRetreat, setActiveRetreat] = useState<Retreat>({
    id: '',
    name: '',
    type: 'Bienestar y Reconexión',
    goal: '',
    duration: 3,
    participantsCount: 15,
    participantsAge: '30 - 50 años',
    participantsProfile: 'Coaches, profesionales estresados, líderes de bienestar',
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

  // Load the seed/default retreat on mount so the dashboard isn't empty and feels instantly alive
  useEffect(() => {
    const fetchDefaultRetreat = async () => {
      try {
        const response = await fetch('/api/retreats');
        const data = await response.json();
        if (Array.isArray(data)) {
          setRetreats(data);
          if (data.length > 0) {
            // Find our pre-seeded retreat "despertar_sentidos"
            const seeded = data.find(r => r.id === 'despertar_sentidos');
            if (seeded) {
              setActiveRetreat(seeded);
            } else {
              setActiveRetreat(data[0]);
            }
          }
        }
      } catch (err) {
        console.error("No se pudo cargar el retiro pre-sembrado:", err);
      }
    };
    fetchDefaultRetreat();
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

  const handleSetNewRetreat = (newRetreat: Retreat) => {
    setActiveRetreat(newRetreat);
    setRetreats(prev => {
      const filtered = prev.filter(r => r.id !== newRetreat.id);
      return [...filtered, newRetreat];
    });
    // Keep it synced with backend memory
    fetch('/api/retreats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRetreat)
    }).catch(err => console.error("Error saving new retreat POST:", err));

    setCurrentView('dashboard');
    handleShowNotification(`🌿 ¡Felicidades! "${newRetreat.name}" generado e importado al Dashboard.`);
  };

  // Render proper view component based on active navigation tab
  const renderViewContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            retreat={activeRetreat}
            retreats={retreats}
            onSelectRetreat={setActiveRetreat}
            onUpdateRetreat={handleUpdateRetreat}
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
        retreatName={activeRetreat.name || "Crea tu primer Retiro"}
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
            {activeRetreat.id && (
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
            className="bg-[#154539] text-white border-t border-[#1b5346] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-30"
          >
            <div className="flex items-center space-x-3.5 w-full md:w-auto">
              <div className="w-10 h-10 bg-[#C5A059]/20 text-[#C5A059] rounded-lg flex items-center justify-center flex-shrink-0 animate-spin-slow">
                <Music className="w-5 h-5" />
              </div>
              <div className="truncate pr-2">
                <h5 className="text-xs font-bold text-white truncate leading-tight">{activeTrack.title}</h5>
                <p className="text-[10px] text-[#a4c5b9] truncate mt-0.5">{activeTrack.artist}</p>
              </div>
            </div>

            {/* Play controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleTogglePlay}
                className="p-3 bg-[#C5A059] hover:bg-[#b08b47] rounded-full text-white transition-all shadow-md flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-gray-300 font-mono">Simulación de sonido activo en sala...</span>
              </div>
            </div>

            {/* Sound Level control */}
            <div className="hidden md:flex items-center space-x-2.5">
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
