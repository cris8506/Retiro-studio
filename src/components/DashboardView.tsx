import React, { useState } from 'react';
import { 
  CheckCircle, Plus, Trash2, Calendar, Users, MapPin, 
  Sparkles, Music, Star, Edit, Volume2, FileText, CheckSquare, Clock 
} from 'lucide-react';
import { Retreat, MusicTrack } from '../types';

interface DashboardViewProps {
  retreat: Retreat;
  onUpdateRetreat: (updated: Retreat) => void;
  onViewChange: (view: string) => void;
  onPlayTrack: (track: MusicTrack) => void;
  activeTrack: MusicTrack | null;
  isPlaying: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  retreat,
  onUpdateRetreat,
  onViewChange,
  onPlayTrack,
  activeTrack,
  isPlaying
}) => {
  // Local state for adding materials
  const [newMaterial, setNewMaterial] = useState('');
  // Local state for adding notes
  const [newNote, setNewNote] = useState('');
  const [noteTag, setNoteTag] = useState<'IMPORTANTE' | 'LOGÍSTICA' | 'GENERAL'>('GENERAL');
  
  // Track checked materials
  const [checkedMaterials, setCheckedMaterials] = useState<Record<string, boolean>>({
    'Tapetes de Yoga Premium (20)': true,
    'Cuencos de Cuarzo': true,
  });

  // Calculate checklists completion percentage for the circular progress bar
  const totalMaterials = retreat.materialsList.length;
  const checkedCount = retreat.materialsList.filter(m => checkedMaterials[m]).length;
  const progressPercent = totalMaterials > 0 ? Math.round((checkedCount / totalMaterials) * 100) : 0;

  // Toggle material
  const handleToggleMaterial = (mat: string) => {
    setCheckedMaterials(prev => ({
      ...prev,
      [mat]: !prev[mat]
    }));
  };

  // Add material
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.trim()) return;
    
    const updatedMaterials = [...retreat.materialsList, newMaterial.trim()];
    onUpdateRetreat({
      ...retreat,
      materialsList: updatedMaterials
    });
    setNewMaterial('');
  };

  // Delete material
  const handleDeleteMaterial = (index: number) => {
    const updatedMaterials = retreat.materialsList.filter((_, i) => i !== index);
    onUpdateRetreat({
      ...retreat,
      materialsList: updatedMaterials
    });
  };

  // Add facilitation note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const prefix = noteTag === 'IMPORTANTE' ? '🔴 [IMPORTANTE] ' : noteTag === 'LOGÍSTICA' ? '⚙️ [LOGÍSTICA] ' : '📝 ';
    const formattedNote = `${prefix}${newNote.trim()}`;
    const updatedNotes = [...retreat.notes, formattedNote];
    
    onUpdateRetreat({
      ...retreat,
      notes: updatedNotes
    });
    setNewNote('');
  };

  // Delete note
  const handleDeleteNote = (index: number) => {
    const updatedNotes = retreat.notes.filter((_, i) => i !== index);
    onUpdateRetreat({
      ...retreat,
      notes: updatedNotes
    });
  };

  return (
    <div id="dashboard-view-root" className="space-y-8 animate-fade-in">
      {/* Welcome Hero Panel */}
      <div id="dashboard-hero" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#154539] to-[#0f342b] p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10">
          <Sparkles className="w-96 h-96" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C5A059] text-white uppercase tracking-wider mb-4">
            Consola del Facilitador
          </span>
          <h2 id="hero-retreat-name" className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {retreat.name}
          </h2>
          <p id="hero-retreat-desc" className="text-sm text-[#cbdad5] font-light max-w-2xl leading-relaxed mb-6">
            {retreat.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#1b5346]">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#a4c5b9]">Duración</p>
                <p className="text-sm font-semibold text-white">{retreat.duration} días</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#a4c5b9]">Participantes</p>
                <p className="text-sm font-semibold text-white">{retreat.participantsCount} personas ({retreat.participantsAge})</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#a4c5b9]">Espacio</p>
                <p className="text-sm font-semibold text-white truncate max-w-[130px]">{retreat.locationType}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#a4c5b9]">Energía Core</p>
                <p className="text-sm font-semibold text-white truncate max-w-[130px]">{retreat.desiredEnergy}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Timeline + Info, Right Side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Day 1 Timeline Block (Left Column, spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#154539]">Cronograma del Día 1</h3>
                <p className="text-xs text-gray-500 mt-1">Estructura del primer bloque del contenedor transformacional.</p>
              </div>
              <button 
                onClick={() => onViewChange('designer')}
                className="inline-flex items-center text-xs font-semibold text-[#154539] hover:text-[#C5A059] transition-colors"
              >
                <span>Ver agenda completa</span>
                <Plus className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Vertical timeline */}
            <div className="relative pl-6 border-l-2 border-gray-100 space-y-8 ml-3">
              {retreat.agenda?.[0]?.activities.map((activity, index) => {
                return (
                  <div key={activity.id || index} className="relative group">
                    {/* Circle Dot */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#154539] flex items-center justify-center transition-all group-hover:scale-125">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 bg-[#F7F4EC]/40 hover:bg-[#F7F4EC]/80 rounded-xl p-4 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center text-xs font-semibold font-mono text-[#C5A059]">
                            <Clock className="w-3 h-3 mr-1" />
                            {activity.time}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                            {activity.duration} min
                          </span>
                          {activity.isAiSuggested && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#154539] text-[#C5A059] flex items-center font-semibold">
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" /> IA
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-lg font-bold text-gray-900">{activity.title}</h4>
                        <p className="text-xs text-gray-600 font-light leading-relaxed">
                          <strong className="text-gray-800 font-medium">Enfoque:</strong> {activity.emotionalGoal}
                        </p>
                        {activity.recommendedMusic && (
                          <div className="flex items-center space-x-1.5 text-[11px] text-[#3c6755] mt-2 bg-[#154539]/5 inline-flex px-2 py-1 rounded">
                            <Music className="w-3 h-3" />
                            <span>Música: {activity.recommendedMusic}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2 md:mt-0">
                        <button 
                          onClick={() => onViewChange('designer')}
                          className="px-3 py-1.5 rounded bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 border border-gray-200 transition-colors"
                        >
                          Guion & Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Tips Box */}
            <div className="mt-8 p-4 bg-[#154539]/5 border border-[#154539]/10 rounded-xl flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-[#C5A059] flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-[#154539] uppercase tracking-wider">Tip de Facilitación Inteligente</h5>
                <p className="text-xs text-gray-700 font-light mt-1 leading-relaxed">
                  Dado que buscas canalizar una energía <strong className="text-[#154539] font-semibold">"{retreat.desiredEnergy}"</strong> en un entorno de <strong className="text-[#154539] font-semibold">{retreat.locationType}</strong>, te sugiero ralentizar las transiciones un 20%. Permite de 2 a 3 minutos de silencio antes de cambiar de bloque para que asienten la experiencia.
                </p>
                <button 
                  onClick={() => onViewChange('assistant')}
                  className="text-[11px] font-bold text-[#C5A059] hover:underline mt-2 inline-block"
                >
                  Consultar al Mentor IA sobre contingencias →
                </button>
              </div>
            </div>

          </div>

          {/* Quick Participants Block */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[#154539] mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#C5A059]" />
              Fichas de Participantes Críticos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {retreat.participantsList.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-gray-900">{p.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#C5A059]/10 text-[#C5A059] font-semibold">Dietética</span>
                  </div>
                  <p className="text-xs text-gray-600 font-light">
                    <strong className="text-gray-800 font-medium">Régimen:</strong> {p.dietary}
                  </p>
                  <p className="text-xs text-gray-600 font-light">
                    <strong className="text-gray-800 font-medium">Requerimientos:</strong> {p.restrictions}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Column Panels (Checklists, Progress, Notes) */}
        <div className="space-y-6">
          
          {/* Circular Progress Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center flex flex-col items-center">
            <h3 className="font-serif text-lg font-bold text-[#154539] mb-4">Progreso del Logística</h3>
            
            {/* Beautiful SVG circle chart */}
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#C5A059] transition-all duration-500 ease-out"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 font-mono">{progressPercent}%</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Listo</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Calculado según los materiales y suministros marcados como listos. {checkedCount} de {totalMaterials} completados.
            </p>
          </div>

          {/* Interactive Checklist of Materials */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-[#154539] flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-[#C5A059]" />
                Suministros y Materiales
              </h3>
            </div>

            <form onSubmit={handleAddMaterial} className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                placeholder="Añadir material..."
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none font-sans"
              />
              <button
                type="submit"
                className="p-1.5 bg-[#154539] hover:bg-[#1a5143] text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <ul className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {retreat.materialsList.map((material, idx) => {
                const isChecked = !!checkedMaterials[material];
                return (
                  <li 
                    key={idx} 
                    className="flex items-center justify-between group p-2 rounded-lg hover:bg-gray-50/80 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleMaterial(material)}
                      className="flex items-center space-x-2.5 text-left flex-1 cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked 
                          ? 'bg-[#154539] border-[#154539] text-white' 
                          : 'border-gray-300 text-transparent hover:border-[#154539]'
                      }`}>
                        <CheckCircle className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className={`text-xs ${isChecked ? 'line-through text-gray-400' : 'text-gray-700 font-light'}`}>
                        {material}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(idx)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                );
              })}
              {retreat.materialsList.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-400 font-light">
                  No hay materiales registrados.
                </div>
              )}
            </ul>
          </div>

          {/* Facilitation Bullet Notes Block */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#154539] mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#C5A059]" />
              Notas de Facilitación
            </h3>

            {/* Note input with tag selectors */}
            <form onSubmit={handleAddNote} className="space-y-2 mb-4">
              <input
                type="text"
                placeholder="Escribe un recordatorio..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1">
                  {(['GENERAL', 'IMPORTANTE', 'LOGÍSTICA'] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNoteTag(tag)}
                      className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                        noteTag === tag 
                          ? 'bg-[#154539] text-white' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-[#C5A059] hover:bg-[#b08b47] text-white rounded text-[10px] font-semibold flex items-center transition-colors"
                >
                  Agregar
                </button>
              </div>
            </form>

            <ul className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {retreat.notes.map((note, idx) => {
                const isImportant = note.includes('[IMPORTANTE]');
                const isLogistical = note.includes('[LOGÍSTICA]');
                
                // Clean tag prefix for rendering
                const cleanText = note
                  .replace('🔴 [IMPORTANTE] ', '')
                  .replace('⚙️ [LOGÍSTICA] ', '')
                  .replace('📝 ', '');

                return (
                  <li key={idx} className="flex items-start justify-between group bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                    <div className="space-y-1 pr-2 flex-1">
                      <div className="flex items-center space-x-1.5">
                        {isImportant && (
                          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                        {isLogistical && (
                          <span className="text-[8px] uppercase tracking-wider text-blue-600 font-bold">Logística</span>
                        )}
                        {isImportant && (
                          <span className="text-[8px] uppercase tracking-wider text-red-600 font-bold">Importante</span>
                        )}
                        {!isImportant && !isLogistical && (
                          <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Nota</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 font-light leading-relaxed break-words">{cleanText}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(idx)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0 mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                );
              })}
              {retreat.notes.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-400 font-light">
                  No hay notas de facilitación aún.
                </div>
              )}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
