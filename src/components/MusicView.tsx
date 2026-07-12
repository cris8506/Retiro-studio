import React, { useState } from 'react';
import { 
  Music, Play, Pause, Search, Sparkles, Volume2, Info, Check, Disc, 
  Star, RefreshCw, SkipForward, Square, AlertTriangle, Radio
} from 'lucide-react';
import { MusicTrack } from '../types';
import { OFFICIAL_PLAYLISTS } from '../data/music';

interface MusicViewProps {
  onPlayTrack: (track: MusicTrack) => void;
  activeTrack: MusicTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  trackDurations: Record<string, { durationStr: string; seconds: number | null }>;
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  soundIntensity: number;
  onVolumeChange: (val: number) => void;
  loopMode: 'next' | 'repeat' | 'stop';
  onLoopModeChange: (mode: 'next' | 'repeat' | 'stop') => void;
  trackError: string | null;
}

export const MusicView: React.FC<MusicViewProps> = ({
  onPlayTrack,
  activeTrack,
  isPlaying,
  onTogglePlay,
  trackDurations,
  currentTime,
  totalDuration,
  onSeek,
  soundIntensity,
  onVolumeChange,
  loopMode,
  onLoopModeChange,
  trackError
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  const categories = [
    'Todas', 
    'Bienvenida', 
    'Apertura', 
    'Meditación', 
    'Respiración', 
    'Conexión', 
    'Reflexión', 
    'Liberación', 
    'Movimiento', 
    'Gratitud', 
    'Cierre'
  ];

  // Helper to format time
  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return "00:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const pad = (num: number) => num.toString().padStart(2, '0');
    if (h > 0) {
      return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  // Filter tracks
  const filteredTracks = OFFICIAL_PLAYLISTS.filter(track => {
    const matchesSearch = 
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      track.artist.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (track.type && track.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (track.style && track.style.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'Todas' || track.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div id="music-view-root" className="space-y-8 animate-fade-in">
      
      {/* Search and Playlists Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#154539] flex items-center">
            <Music className="w-6 h-6 mr-2 text-[#C5A059]" />
            Atmósfera Sonora Inteligente
          </h2>
          <p className="text-xs text-gray-500 font-light mt-1">
            Biblioteca curada con fundamentos neuroacústicos y dinámicas de sala integradas.
          </p>
        </div>

        {/* Search track */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar pista, artista o género..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#154539] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid: Left playlists, Right details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Playlists Tracks catalog list (spans 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-[#154539]">Catálogo de Canciones</h3>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                {filteredTracks.length} pistas disponibles
              </span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredTracks.map((track) => {
                const isActive = activeTrack?.id === track.id;
                const durationInfo = trackDurations[track.id];
                const displayDuration = durationInfo ? durationInfo.durationStr : "Cargando duración...";
                
                return (
                  <div 
                    key={track.id} 
                    className={`py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all px-3 rounded-xl border border-transparent ${
                      isActive 
                        ? 'bg-[#154539]/5 border-[#C5A059]/30 border-l-4 border-l-[#C5A059]' 
                        : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4 max-w-full md:max-w-[70%]">
                      <button
                        onClick={() => onPlayTrack(track)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                          isActive && isPlaying 
                            ? 'bg-[#C5A059] text-white animate-pulse' 
                            : 'bg-gray-100 hover:bg-[#154539] hover:text-white text-gray-700'
                        }`}
                      >
                        {isActive && isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 pl-0.5" />}
                      </button>

                      <div className="truncate min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-gray-900 truncate block">{track.title}</span>
                          <span className="text-[9px] px-1.5 py-0.25 bg-[#C5A059]/10 text-[#C5A059] rounded font-medium">
                            {track.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 block truncate mt-0.5">{track.artist}</span>
                        <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                            {track.style || track.type}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium font-mono">
                            {displayDuration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end space-x-3 w-full md:w-auto">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        track.energyLevel === 'Bajo' ? 'bg-blue-50 text-blue-600' :
                        track.energyLevel === 'Medio' ? 'bg-orange-50 text-orange-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        Energía {track.energyLevel}
                      </span>
                      
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-gray-400 font-mono">
                          {track.isInstrumental || track.instrumental ? 'Instrumental' : 'Vocal'}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}

              {filteredTracks.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-light text-xs">
                  No hay pistas que coincidan con la búsqueda de esta categoría.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Active Track Details Pane & Reproductor (spans 1) */}
        <div className="space-y-6">
          
          {/* Detailed Player & Ficha Neuroacústica Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#154539] border-b border-gray-100 pb-3 flex items-center">
              <Disc className={`w-5 h-5 mr-2 text-[#C5A059] ${isPlaying && activeTrack ? 'animate-spin-slow' : ''}`} />
              Ficha & Reproductor
            </h3>

            {activeTrack ? (
              <div className="space-y-5 animate-fade-in">
                {/* Visual Audio Cover art simulation */}
                <div className="bg-gradient-to-br from-[#154539] to-[#256c5a] rounded-xl p-5 text-white flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden shadow-sm">
                  <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold">
                    {activeTrack.category}
                  </div>
                  <div className={`w-16 h-16 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center shadow-inner ${isPlaying ? 'scale-105 duration-1000 animate-pulse' : ''}`}>
                    <Radio className={`w-8 h-8 text-[#C5A059] ${isPlaying ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="space-y-1 w-full">
                    <h4 className="font-serif text-sm font-bold truncate px-2">{activeTrack.title}</h4>
                    <p className="text-[11px] text-gray-300 font-light truncate">{activeTrack.artist}</p>
                  </div>
                </div>

                {/* Real interactive Player Slider & Times */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(totalDuration || (trackDurations[activeTrack.id]?.seconds || 0))}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={totalDuration || (trackDurations[activeTrack.id]?.seconds || 100)}
                    value={currentTime}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    className="w-full accent-[#C5A059] bg-gray-100 h-1.5 rounded-full cursor-pointer hover:h-2 transition-all"
                  />
                </div>

                {/* Audio controls block */}
                <div className="flex items-center justify-center space-x-6">
                  {/* Loop mode button */}
                  <button 
                    onClick={() => {
                      const modes: ('next' | 'repeat' | 'stop')[] = ['next', 'repeat', 'stop'];
                      const nextIndex = (modes.indexOf(loopMode) + 1) % modes.length;
                      onLoopModeChange(modes[nextIndex]);
                    }}
                    title={`Modo de fin: ${loopMode === 'next' ? 'Siguiente pista' : loopMode === 'repeat' ? 'Repetir pista' : 'Detener'}`}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      loopMode === 'repeat' ? 'text-[#C5A059] bg-[#C5A059]/10' :
                      loopMode === 'stop' ? 'text-gray-400 hover:text-gray-600 bg-gray-50' :
                      'text-[#154539] hover:text-[#2c7d69] bg-gray-50'
                    }`}
                  >
                    {loopMode === 'repeat' ? (
                      <RefreshCw className="w-4.5 h-4.5" />
                    ) : loopMode === 'stop' ? (
                      <Square className="w-4.5 h-4.5" />
                    ) : (
                      <SkipForward className="w-4.5 h-4.5" />
                    )}
                  </button>

                  {/* Play / Pause */}
                  <button
                    onClick={onTogglePlay}
                    className="w-12 h-12 bg-[#154539] hover:bg-[#1f5c4d] text-white rounded-full flex items-center justify-center transition-all shadow-md transform hover:scale-105 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-0.5" />}
                  </button>

                  {/* Volume icon level display */}
                  <div className="flex items-center space-x-1.5 bg-gray-50 p-2 rounded-lg">
                    <Volume2 className="w-4 h-4 text-[#154539]" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soundIntensity}
                      onChange={(e) => onVolumeChange(Number(e.target.value))}
                      className="w-16 accent-[#154539] bg-gray-200 h-1 rounded-full cursor-pointer"
                    />
                  </div>
                </div>

                {/* Error Banner if any */}
                {trackError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-2 text-red-600 animate-pulse text-xs">
                    <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>{trackError}</span>
                  </div>
                )}

                {/* Ficha details */}
                <div className="space-y-3.5 pt-3 border-t border-gray-100">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C5A059] block">
                      Momento de Uso Recomendado
                    </span>
                    <p className="text-xs text-gray-700 font-light bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {activeTrack.recommendedMoment}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 block">
                      Fundamento Neuroacústico
                    </span>
                    <p className="text-xs text-gray-700 font-light bg-[#F7F4EC]/60 p-3 rounded-lg border border-[#F7F4EC] leading-relaxed">
                      {activeTrack.whyItFits || activeTrack.neuroacousticFoundation}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#154539] block flex items-center">
                      <Info className="w-3.5 h-3.5 mr-1" /> Configuración de Sala
                    </span>
                    <p className="text-[11px] text-gray-600 font-light leading-relaxed">
                      Pista de nivel <strong className="font-medium text-[#154539]">{activeTrack.energyLevel}</strong>. Se recomienda ambientar la sala a <strong className="font-medium text-[#154539]">{activeTrack.energyLevel === 'Bajo' ? '30%' : activeTrack.energyLevel === 'Medio' ? '55%' : '75%'}</strong> de volumen. Acompáñalo con aromas de {activeTrack.category === 'Meditación' || activeTrack.category === 'Respiración' ? 'Sándalo, Mirra o Copal' : activeTrack.category === 'Movimiento' || activeTrack.category === 'Liberación' ? 'Cítricos y Menta' : 'Lavanda o Jazmín'}.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Music className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs font-light max-w-[200px] mx-auto leading-relaxed">
                  Selecciona una canción en el catálogo para activarla en el reproductor de sala y ver su ficha neuroacústica.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-[#154539] text-[#d0e0db] rounded-xl border border-[#1d594b] space-y-2">
            <h5 className="font-serif text-sm font-bold text-[#C5A059] flex items-center">
              <Star className="w-4 h-4 mr-1.5" />
              ¿Sabías qué?
            </h5>
            <p className="text-[11px] font-light leading-relaxed">
              La música instrumental sin líricas ayuda a mantener un ritmo de baja carga cognitiva, lo que previene que el área del lenguaje active narrativas de diálogo interno, favoreciendo la relajación somática instantánea.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
