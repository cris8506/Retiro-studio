import React, { useState } from 'react';
import { Music, Play, Pause, Search, Sparkles, Volume2, Info, Check, Disc, Star } from 'lucide-react';
import { MusicTrack } from '../types';
import { OFFICIAL_PLAYLISTS } from '../data/music';

interface MusicViewProps {
  onPlayTrack: (track: MusicTrack) => void;
  activeTrack: MusicTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const MusicView: React.FC<MusicViewProps> = ({
  onPlayTrack,
  activeTrack,
  isPlaying,
  onTogglePlay
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  const categories = ['Todas', 'Apertura', 'Bienvenida', 'Meditación', 'Conexión', 'Reflexión', 'Liberación', 'Movimiento', 'Gratitud', 'Cierre'];

  // Filter tracks
  const filteredTracks = OFFICIAL_PLAYLISTS.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          track.artist.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          track.type.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            Música curada con fundamentos neuroacústicos para guiar las diferentes fases del retiro.
          </p>
        </div>

        {/* Search track */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar pista, artista o género..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
            <h3 className="font-serif text-lg font-bold text-[#154539] mb-4">Pistas Recomendadas</h3>
            
            <div className="divide-y divide-gray-100">
              {filteredTracks.map((track) => {
                const isActive = activeTrack?.id === track.id;
                return (
                  <div 
                    key={track.id} 
                    className={`py-4 flex items-center justify-between group transition-all px-2.5 rounded-xl ${
                      isActive ? 'bg-[#154539]/5 border-l-4 border-[#C5A059]' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4 max-w-[70%]">
                      <button
                        onClick={() => onPlayTrack(track)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isActive && isPlaying 
                            ? 'bg-[#C5A059] text-white animate-spin-slow' 
                            : 'bg-gray-100 hover:bg-[#154539] hover:text-white text-gray-700'
                        }`}
                      >
                        {isActive && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <div className="truncate">
                        <span className="text-xs font-bold text-gray-900 block truncate">{track.title}</span>
                        <span className="text-[11px] text-gray-500 block truncate">{track.artist}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">{track.type}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">Duración: {track.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        track.energyLevel === 'Bajo' ? 'bg-blue-50 text-blue-600' :
                        track.energyLevel === 'Medio' ? 'bg-orange-50 text-orange-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        Energía {track.energyLevel}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono hidden md:inline-block">Día 1</span>
                    </div>

                  </div>
                );
              })}

              {filteredTracks.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-light text-xs">
                  No hay pistas que coincidan con la búsqueda.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Active Track Details Pane (spans 1) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#154539] border-b border-gray-100 pb-3 flex items-center">
              <Disc className="w-5 h-5 mr-2 text-[#C5A059]" />
              Ficha Neuroacústica
            </h3>

            {activeTrack ? (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold">Pista Seleccionada</span>
                  <h4 className="font-serif text-base font-bold text-gray-900 mt-1">{activeTrack.title}</h4>
                  <p className="text-xs text-gray-500 font-light">{activeTrack.artist}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 block">Momento del Retiro Recomendado</span>
                  <p className="text-xs text-gray-700 font-light bg-gray-50 p-2.5 rounded-lg border border-gray-100">{activeTrack.recommendedMoment}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 block">Fundamento y Por Qué Funciona</span>
                  <p className="text-xs text-gray-700 font-light bg-[#F7F4EC]/60 p-3 rounded-lg border border-[#F7F4EC] leading-relaxed">
                    {activeTrack.whyItFits}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#154539] block flex items-center">
                    <Info className="w-3.5 h-3.5 mr-1" /> Configuración en Sala
                  </span>
                  <p className="text-[11px] text-gray-600 font-light leading-relaxed">
                    Para esta pista de energía <strong className="font-medium text-[#154539]">{activeTrack.energyLevel}</strong>, ajusta el volumen al <strong className="font-medium text-[#154539]">{activeTrack.energyLevel === 'Bajo' ? '30%' : activeTrack.energyLevel === 'Medio' ? '55%' : '75%'}</strong>. Si utilizas difusores de aroma, acompáñalo con aceites de {activeTrack.category === 'Meditación' ? 'Sándalo o Mirra' : activeTrack.category === 'Movimiento' ? 'Naranja y Menta' : 'Lavanda silvestre'}.
                  </p>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Music className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs font-light max-w-[200px] mx-auto leading-relaxed">
                  Selecciona una pista para ver su fundamento científico y recomendaciones de sala.
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
              La música instrumental sin líricas (como Deuter o Ludovico) previene que la parte verbal de la corteza cerebral se active, permitiendo que la atención permanezca al 100% en las sensaciones físicas del participante.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
