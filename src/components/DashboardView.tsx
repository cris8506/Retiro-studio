import React, { useState } from 'react';
import { 
  CheckCircle, Plus, Trash2, Calendar, Users, MapPin, 
  Sparkles, Music, Star, Edit, Volume2, FileText, CheckSquare, Clock,
  ChevronDown, ChevronUp, Check, Compass, BookOpen, Play, Pause, VolumeX,
  AlertTriangle
} from 'lucide-react';
import { Retreat, MusicTrack, RetreatActivity, Dynamic } from '../types';
import { OFFICIAL_PLAYLISTS } from '../data/music';
import { OFFICIAL_DYNAMICS } from '../data/dynamics';

const findMatchingDynamic = (activity: RetreatActivity): Dynamic | null => {
  if (!activity) return null;
  
  // 1. Match by dynamicId
  if (activity.dynamicId) {
    const found = OFFICIAL_DYNAMICS.find(d => d.id === activity.dynamicId);
    if (found) return found;
  }
  
  // 2. Match by exact title / dynamicName
  const titleLower = (activity.title || '').toLowerCase().trim();
  const dynNameLower = (activity.dynamicName || '').toLowerCase().trim();
  
  if (titleLower) {
    const found = OFFICIAL_DYNAMICS.find(d => d.name.toLowerCase().trim() === titleLower);
    if (found) return found;
  }
  
  if (dynNameLower) {
    const found = OFFICIAL_DYNAMICS.find(d => d.name.toLowerCase().trim() === dynNameLower);
    if (found) return found;
  }
  
  // 3. Match by partial title
  if (titleLower) {
    const found = OFFICIAL_DYNAMICS.find(d => 
      titleLower.includes(d.name.toLowerCase().trim()) || 
      d.name.toLowerCase().trim().includes(titleLower)
    );
    if (found) return found;
  }
  
  return null;
};

const isMusicNeededForActivity = (activity: RetreatActivity): boolean => {
  const title = (activity.title || '').toLowerCase();
  const recommended = (activity.recommendedMusic || '').toLowerCase();
  
  if (recommended.includes('silencio') || recommended.includes('no requiere') || recommended.includes('ninguno') || recommended.includes('sin música') || recommended.includes('sin musica')) {
    return false;
  }
  
  const noMusicKeywords = [
    'desayuno', 'almuerzo', 'cena', 'comida', 'snack', 'receso', 
    'tiempo libre', 'descanso', 'dormir', 'libre', 'transición', 
    'check-in', 'registro', 'despedida individual', 'silencio absoluto'
  ];
  
  if (noMusicKeywords.some(keyword => title.includes(keyword))) {
    return false;
  }
  
  return true;
};

const findMatchingTrack = (activity: RetreatActivity): MusicTrack | null => {
  if (!isMusicNeededForActivity(activity)) return null;

  const recommendedMusic = activity.recommendedMusic || '';
  const title = activity.title || '';
  const emotionalGoal = activity.emotionalGoal || '';
  
  const musicLower = recommendedMusic.toLowerCase();
  const titleLower = title.toLowerCase();
  const goalLower = emotionalGoal.toLowerCase();
  
  // 1. Try to match by explicit track ID if present
  let match = OFFICIAL_PLAYLISTS.find(t => musicLower.includes(t.id.toLowerCase()));
  if (match) return match;

  // 2. Try to match by explicit title of the track
  match = OFFICIAL_PLAYLISTS.find(t => 
    musicLower.includes(t.title.toLowerCase()) || 
    t.title.toLowerCase().includes(musicLower)
  );
  if (match) return match;

  // 3. Try to match by artist
  match = OFFICIAL_PLAYLISTS.find(t => 
    musicLower.includes(t.artist.toLowerCase())
  );
  if (match) return match;

  // 4. Try to match by keyword in recommendedMusic, title, or emotionalGoal
  const textToSearch = `${recommendedMusic} ${title} ${emotionalGoal}`.toLowerCase();
  
  let categoryKey: MusicTrack['category'] | null = null;
  
  if (textToSearch.includes('bienvenida') || textToSearch.includes('recepción') || textToSearch.includes('registro') || textToSearch.includes('llegada')) {
    categoryKey = 'Bienvenida';
  } else if (textToSearch.includes('apertura') || textToSearch.includes('inicio') || textToSearch.includes('ceremonia') || textToSearch.includes('ritual')) {
    categoryKey = 'Apertura';
  } else if (textToSearch.includes('meditaci') || textToSearch.includes('zen') || textToSearch.includes('visualizaci') || textToSearch.includes('silencio')) {
    categoryKey = 'Meditación';
  } else if (textToSearch.includes('respiraci') || textToSearch.includes('breath') || textToSearch.includes('coherencia') || textToSearch.includes('pranayama')) {
    categoryKey = 'Respiración';
  } else if (textToSearch.includes('conexi') || textToSearch.includes('pareja') || textToSearch.includes('grupo') || textToSearch.includes('vínculo') || textToSearch.includes('amor')) {
    categoryKey = 'Conexión';
  } else if (textToSearch.includes('reflexi') || textToSearch.includes('journal') || textToSearch.includes('escritura') || textToSearch.includes('introspecci') || textToSearch.includes('sueño') || textToSearch.includes('contemplación')) {
    categoryKey = 'Reflexión';
  } else if (textToSearch.includes('liberaci') || textToSearch.includes('emocional') || textToSearch.includes('soltar') || textToSearch.includes('sanación') || textToSearch.includes('descent')) {
    categoryKey = 'Liberación';
  } else if (textToSearch.includes('movimiento') || textToSearch.includes('danza') || textToSearch.includes('baile') || textToSearch.includes('activaci') || textToSearch.includes('dance') || textToSearch.includes('alive')) {
    categoryKey = 'Movimiento';
  } else if (textToSearch.includes('gratitud') || textToSearch.includes('agradecer') || textToSearch.includes('apreciaci') || textToSearch.includes('joy')) {
    categoryKey = 'Gratitud';
  } else if (textToSearch.includes('cierre') || textToSearch.includes('despedida') || textToSearch.includes('final') || textToSearch.includes('lullaby')) {
    categoryKey = 'Cierre';
  }

  if (categoryKey) {
    const categoryTracks = OFFICIAL_PLAYLISTS.filter(t => t.category === categoryKey);
    if (categoryTracks.length > 0) {
      return categoryTracks[0];
    }
  }

  return OFFICIAL_PLAYLISTS[0];
};

interface DashboardViewProps {
  retreat: Retreat;
  retreats: Retreat[];
  onSelectRetreat: (retreat: Retreat) => void;
  onUpdateRetreat: (updated: Retreat) => void;
  onViewChange: (view: string) => void;
  onPlayTrack: (track: MusicTrack) => void;
  activeTrack: MusicTrack | null;
  isPlaying: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  retreat,
  retreats,
  onSelectRetreat,
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

  // Day Selector state for Agenda
  const [activeDayTab, setActiveDayTab] = useState<number>(1);
  const [openActivityId, setOpenActivityId] = useState<string | null>(null);
  
  // Custom activity form state
  const [showAddActivityForm, setShowAddActivityForm] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<RetreatActivity>>({
    time: '14:30 PM — 15:30 PM',
    title: '',
    duration: 60,
    emotionalGoal: '',
    dynamicName: '',
    materials: [],
    preparation: '',
    script: '',
    reflectionQuestions: [],
    closing: '',
    recommendedMusic: '',
    transition: ''
  });

  const [materialsInput, setMaterialsInput] = useState('');
  const [questionsInput, setQuestionsInput] = useState('');

  // Find active day block safely, fallback if the tab index is out of bounds
  const currentDayBlock = (retreat && retreat.agenda) 
    ? (retreat.agenda.find(dayBlock => dayBlock.day === activeDayTab) || retreat.agenda[0])
    : null;

  // Add dynamic activity to live agenda
  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title || !newActivity.time) return;

    const activityToAdd: RetreatActivity = {
      id: 'act_user_' + Date.now(),
      time: newActivity.time,
      title: newActivity.title,
      duration: Number(newActivity.duration) || 30,
      emotionalGoal: newActivity.emotionalGoal || 'Alineación',
      dynamicName: newActivity.dynamicName || newActivity.title,
      isAiSuggested: false,
      materials: materialsInput.split(',').map(m => m.trim()).filter(Boolean),
      preparation: newActivity.preparation || 'Disponer el espacio cómodamente.',
      script: newActivity.script || '',
      reflectionQuestions: questionsInput.split(',').map(q => q.trim()).filter(Boolean),
      closing: newActivity.closing || 'Respira hondo.',
      recommendedMusic: newActivity.recommendedMusic || '',
      transition: newActivity.transition || 'Cierra la sesión suavemente.'
    };

    // Find active day and update its activity array
    const targetDay = currentDayBlock?.day || 1;
    const updatedAgenda = (retreat.agenda || []).map(dayBlock => {
      if (dayBlock.day === targetDay) {
        return {
          ...dayBlock,
          activities: [...dayBlock.activities, activityToAdd]
        };
      }
      return dayBlock;
    });

    onUpdateRetreat({
      ...retreat,
      agenda: updatedAgenda,
      materialsList: Array.from(new Set([...(retreat.materialsList || []), ...activityToAdd.materials]))
    });

    // Reset Form
    setNewActivity({
      time: '14:30 PM — 15:30 PM',
      title: '',
      duration: 60,
      emotionalGoal: '',
      dynamicName: '',
      materials: [],
      preparation: '',
      script: '',
      reflectionQuestions: [],
      closing: '',
      recommendedMusic: '',
      transition: ''
    });
    setMaterialsInput('');
    setQuestionsInput('');
    setShowAddActivityForm(false);
  };

  // Delete activity from the agenda
  const handleDeleteActivity = (activityId: string) => {
    const targetDay = currentDayBlock?.day || 1;
    const updatedAgenda = (retreat.agenda || []).map(dayBlock => {
      if (dayBlock.day === targetDay) {
        return {
          ...dayBlock,
          activities: dayBlock.activities.filter(act => act.id !== activityId)
        };
      }
      return dayBlock;
    });

    onUpdateRetreat({
      ...retreat,
      agenda: updatedAgenda
    });
  };

  // Calculate checklists completion percentage for the circular progress bar
  const totalMaterials = retreat?.materialsList?.length || 0;
  const checkedCount = retreat?.materialsList?.filter(m => checkedMaterials[m]).length || 0;
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
    
    const updatedMaterials = [...(retreat.materialsList || []), newMaterial.trim()];
    onUpdateRetreat({
      ...retreat,
      materialsList: updatedMaterials
    });
    setNewMaterial('');
  };

  // Delete material
  const handleDeleteMaterial = (index: number) => {
    const updatedMaterials = (retreat.materialsList || []).filter((_, i) => i !== index);
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
    const updatedNotes = [...(retreat.notes || []), formattedNote];
    
    onUpdateRetreat({
      ...retreat,
      notes: updatedNotes
    });
    setNewNote('');
  };

  // Delete note
  const handleDeleteNote = (index: number) => {
    const updatedNotes = (retreat.notes || []).filter((_, i) => i !== index);
    onUpdateRetreat({
      ...retreat,
      notes: updatedNotes
    });
  };

  if (retreats.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4 py-8 animate-fade-in" id="dashboard-empty-state">
        <div id="welcome-card" className="max-w-4xl w-full bg-[#fcfbf9] rounded-3xl border border-[#154539]/10 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Premium Text & CTAs */}
          <div className="p-8 md:p-12 lg:p-16 md:col-span-7 flex flex-col justify-center space-y-8 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#154539]/5 border border-[#154539]/10 rounded-full text-[11px] font-medium text-[#154539] tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
                <span>Diseño Consciente</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#154539] tracking-tight leading-tight">
                Bienvenido a <br />
                <span className="text-[#C5A059]">Retiro Studio</span>
              </h2>
              <p className="text-sm md:text-base text-gray-600 font-light leading-relaxed">
                Crea tu primer retiro y comienza a diseñar experiencias transformacionales con nuestra guía e inteligencia de facilitación.
              </p>
            </div>

            {/* Subtle premium benefit tags */}
            <div className="space-y-3.5 border-t border-b border-gray-100 py-6">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 w-4 h-4 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <p className="text-xs font-medium text-gray-700">Cronogramas fluidos y adaptaciones de agenda</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 w-4 h-4 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <p className="text-xs font-medium text-gray-700">Asistente de contingencia para dinámicas en tiempo real</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 w-4 h-4 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <p className="text-xs font-medium text-gray-700">Música de inmersión y control de materiales integrado</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onViewChange('designer')}
                className="group px-6 py-4 bg-[#154539] hover:bg-[#1a5143] text-white text-xs font-bold tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center justify-center space-x-2.5 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#C5A059] group-hover:rotate-90 transition-transform duration-300" />
                <span>Crear mi primer retiro</span>
              </button>
              <button
                onClick={() => onViewChange('library')}
                className="px-6 py-4 bg-white hover:bg-gray-50 text-[#154539] border border-[#154539]/15 text-xs font-bold tracking-wider uppercase rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-[#C5A059]" />
                <span>Explorar biblioteca</span>
              </button>
            </div>
          </div>

          {/* Right Column: High-End Abstract Illustration (visible on md+) */}
          <div className="hidden md:flex md:col-span-5 bg-gradient-to-tr from-[#154539] to-[#0f342a] relative overflow-hidden items-center justify-center p-8 border-l border-[#154539]/10">
            {/* Background luxury soft circular patterns representing sun & orbits */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(197,160,89,0.15),transparent_60%)]"></div>
            
            {/* The Sun / Core of Energy */}
            <div className="absolute w-56 h-56 rounded-full bg-gradient-to-b from-[#C5A059]/20 to-transparent top-1/4 left-1/4 animate-pulse duration-[8000ms]"></div>
            
            {/* Geometric Art Composition */}
            <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center">
              {/* Outer delicate gold ring */}
              <div className="absolute inset-0 border border-[#C5A059]/20 rounded-full animate-spin-slow"></div>
              
              {/* Middle dashed orbit */}
              <div className="absolute w-[80%] h-[80%] border border-dashed border-[#a4c5b9]/25 rounded-full"></div>
              
              {/* Inner glowing core with leaf/compass abstract metaphor */}
              <div className="absolute w-[50%] h-[50%] bg-[#1c5043]/80 backdrop-blur-sm rounded-full border border-[#C5A059]/45 flex items-center justify-center shadow-lg">
                <Compass className="w-10 h-10 text-[#C5A059]" />
              </div>

              {/* Floating golden accents */}
              <div className="absolute top-2 right-12 w-2 h-2 rounded-full bg-[#C5A059] shadow-md animate-bounce"></div>
              <div className="absolute bottom-8 left-4 w-1.5 h-1.5 rounded-full bg-[#a4c5b9]"></div>
            </div>

            {/* Bottom Brand Statement */}
            <div className="absolute bottom-6 text-center left-0 right-0 px-6">
              <span className="text-[10px] tracking-widest text-[#a4c5b9] uppercase font-light">Espacio de Facilitación</span>
              <p className="text-[11px] text-[#C5A059] font-serif italic mt-0.5">Sostén, presencia y transformación</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-view-root" className="space-y-8 animate-fade-in">
      
      {/* Selector de Retiro Activo */}
      <div id="retreat-selector-bar" className="bg-white rounded-2xl border border-gray-100 p-4.5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-[#154539]/10 rounded-xl text-[#154539] flex items-center justify-center">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="text-left">
            <h4 className="font-serif text-sm font-bold text-[#154539]">Tus Retiros Guardados</h4>
            <p className="text-[11px] text-gray-500 font-light">Selecciona el retiro activo para visualizar su agenda y logística.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={retreat?.id || ''}
            onChange={(e) => {
              const selected = retreats.find(r => r.id === e.target.value);
              if (selected) {
                onSelectRetreat(selected);
                setActiveDayTab(1); // reset active day tab to 1
              }
            }}
            className="bg-[#F7F4EC] text-xs font-semibold text-[#154539] border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-[#154539] focus:outline-none min-w-[200px]"
          >
            {retreats.map(r => (
              <option key={r.id} value={r.id}>{r.name || 'Sin Nombre'}</option>
            ))}
            {retreats.length === 0 && (
              <option value="">No hay retiros creados</option>
            )}
          </select>

          <button
            onClick={() => onViewChange('designer')}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08b47] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Retiro</span>
          </button>
        </div>
      </div>

      {/* Welcome Hero Panel */}
      <div id="dashboard-hero" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#154539] to-[#0f342b] p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10">
          <Sparkles className="w-96 h-96" />
        </div>
        
        <div className="relative z-10 max-w-3xl text-left">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C5A059] text-white uppercase tracking-wider mb-4">
            Consola del Facilitador
          </span>
          <h2 id="hero-retreat-name" className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {retreat?.name || "Crea tu primer retiro"}
          </h2>
          <p id="hero-retreat-desc" className="text-sm text-[#cbdad5] font-light max-w-2xl leading-relaxed mb-6">
            {retreat?.description || "Inicia tu camino de facilitador diseñando una experiencia inmersiva única."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#1b5346]">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#a4c5b9]">Duración</p>
                <p className="text-sm font-semibold text-white">{retreat?.duration || 0} días</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#a4c5b9]">Participantes</p>
                <p className="text-sm font-semibold text-white">{retreat?.participantsCount || 0} personas ({retreat?.participantsAge || "N/A"})</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#a4c5b9]">Espacio</p>
                <p className="text-sm font-semibold text-white truncate max-w-[130px]">{retreat?.locationType || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#a4c5b9]">Energía Core</p>
                <p className="text-sm font-semibold text-white truncate max-w-[130px]">{retreat?.desiredEnergy || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Timeline + Info, Right Side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Day-by-Day Agenda Block */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="text-left">
                <h3 className="font-serif text-xl font-bold text-[#154539]">Cronograma Detallado del Retiro</h3>
                <p className="text-xs text-gray-500 mt-1">Explora cada actividad del cronograma y añade guiones personalizados.</p>
              </div>
              
              {/* Day Selector Tabs inside the card */}
              {retreat?.agenda && retreat.agenda.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {retreat.agenda.map((dayBlock) => (
                    <button
                      key={dayBlock.day}
                      onClick={() => {
                        setActiveDayTab(dayBlock.day);
                        setOpenActivityId(null);
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        (currentDayBlock?.day || 1) === dayBlock.day
                          ? 'bg-[#154539] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Día {dayBlock.day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Day Focus Header Banner */}
            {currentDayBlock && (
              <div className="p-4.5 bg-[#154539]/5 border-l-4 border-[#C5A059] rounded-r-xl text-left">
                <span className="text-[9px] uppercase tracking-wider text-[#154539] font-bold block">Foco de la Jornada</span>
                <h3 className="font-serif text-base font-bold text-[#154539] mt-0.5">{currentDayBlock.focus}</h3>
              </div>
            )}

            {/* Activities Vertical list (Timeline Accordion format) */}
            <div className="space-y-4 text-left">
              {currentDayBlock?.activities.map((activity, index) => {
                const isOpen = openActivityId === activity.id;
                const matchedDynamic = findMatchingDynamic(activity);
                return (
                  <div 
                    key={activity.id || index} 
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow transition-all"
                  >
                    {/* Accordion Header */}
                    <div 
                      onClick={() => setOpenActivityId(isOpen ? null : activity.id)}
                      className="p-4 md:p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/40 transition-colors"
                    >
                      <div className="space-y-1 max-w-[80%]">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono text-xs font-bold text-[#C5A059]">{activity.time}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{activity.duration} min</span>
                          {activity.isAiSuggested && (
                            <span className="text-[9px] px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] rounded flex items-center font-bold">
                              IA
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-base md:text-lg font-bold text-[#154539]">{activity.title}</h4>
                        <p className="text-xs text-gray-600 font-light truncate">{activity.emotionalGoal}</p>
                      </div>
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteActivity(activity.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                          title="Eliminar actividad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div>
                          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Accordion Content Details */}
                    {isOpen && (
                      <div className="border-t border-gray-100 bg-[#F7F4EC]/10 p-5 space-y-6">
                        
                        {/* Inner metadata grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-3.5 rounded-lg border border-gray-100">
                            <h5 className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold">Objetivo Emocional</h5>
                            <p className="text-xs text-gray-700 font-light mt-1">{activity.emotionalGoal}</p>
                          </div>
                          <div className="bg-white p-3.5 rounded-lg border border-gray-100 flex flex-col justify-between min-h-[70px]">
                            {(() => {
                              const track = findMatchingTrack(activity);
                              const isCurrentTrackPlaying = track && activeTrack?.id === track.id && isPlaying;
                              return (
                                <>
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold">Música Sugerida</h5>
                                    {track && (
                                      <span className="text-[8px] px-1.5 py-0.25 bg-[#154539]/10 text-[#154539] rounded font-medium">
                                        {track.category}
                                      </span>
                                    )}
                                  </div>
                                  {track ? (
                                    <div className="flex items-center justify-between mt-1 gap-2">
                                      <div className="flex items-center space-x-2 overflow-hidden flex-1">
                                        <div className={`p-1.5 rounded-lg flex items-center justify-center flex-shrink-0 ${isCurrentTrackPlaying ? 'bg-[#C5A059]/10 text-[#C5A059] animate-pulse' : 'bg-[#154539]/10 text-[#154539]'}`}>
                                          <Music className="w-4 h-4" />
                                        </div>
                                        <div className="text-left overflow-hidden">
                                          <p className="text-xs font-semibold text-gray-700 truncate" title={track.title}>{track.title}</p>
                                          <p className="text-[10px] text-gray-500 font-light truncate" title={track.artist}>{track.artist}</p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onPlayTrack(track);
                                        }}
                                        className={`p-1.5 md:p-2 rounded-full transition-all flex items-center justify-center cursor-pointer flex-shrink-0 ${
                                          isCurrentTrackPlaying 
                                            ? 'bg-red-500 text-white hover:bg-red-600' 
                                            : 'bg-[#154539] text-white hover:bg-[#1a5143] hover:scale-105 active:scale-95'
                                        }`}
                                        title={isCurrentTrackPlaying ? 'Pausar música' : 'Reproducir música'}
                                      >
                                        {isCurrentTrackPlaying ? (
                                          <Pause className="w-3.5 h-3.5" />
                                        ) : (
                                          <Play className="w-3.5 h-3.5 pl-0.5" />
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2 mt-1.5">
                                      <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 flex items-center justify-center flex-shrink-0">
                                        <VolumeX className="w-4 h-4" />
                                      </div>
                                      <div className="text-left">
                                        <p className="text-xs font-semibold text-gray-700">Silencio / Sonido natural</p>
                                        <p className="text-[10px] text-gray-500 font-light">Práctica sin música ambiental</p>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Preparation Block */}
                        <div className="space-y-1.5">
                          <h5 className="text-[11px] uppercase tracking-wider text-[#154539] font-bold">Preparación del Facilitador</h5>
                          <p className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-100 font-light leading-relaxed">
                            {activity.preparation}
                          </p>
                        </div>

                        {/* Official Dynamic Library details if matched */}
                        {matchedDynamic && (
                          <div className="bg-[#154539]/5 rounded-xl border border-[#154539]/10 p-4 md:p-5 space-y-4 text-left">
                            <div className="flex items-center space-x-2 border-b border-[#154539]/10 pb-3">
                              <BookOpen className="w-4 h-4 text-[#C5A059]" />
                              <h5 className="font-serif text-sm font-bold text-[#154539]">
                                Guía de la Dinámica Oficial: <span className="text-[#C5A059]">{matchedDynamic.name}</span>
                              </h5>
                            </div>

                            {/* Context & Avoid Warning Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                              <div className="bg-white p-3 rounded-lg border border-gray-100">
                                <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider block">Momento de Aplicación</span>
                                <p className="text-gray-700 font-light mt-1 leading-relaxed">{matchedDynamic.whenToUse}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-100">
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block flex items-center">
                                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-500" /> Evitar si (Contraindicaciones)
                                </span>
                                <p className="text-gray-700 font-light mt-1 leading-relaxed">{matchedDynamic.whenToAvoid}</p>
                              </div>
                            </div>

                            {/* Step-by-Step Instructions */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-[#154539] uppercase tracking-wider block">Paso a Paso Detallado (Instrucciones de Ejecución)</span>
                              <ol className="list-decimal list-inside space-y-2 bg-white p-4 rounded-lg border border-gray-100 text-xs">
                                {matchedDynamic.steps.map((step, sIdx) => (
                                  <li key={sIdx} className="text-gray-700 font-light leading-relaxed pl-1">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* Variations / Adaptations if present */}
                            {matchedDynamic.variations && matchedDynamic.variations.length > 0 && (
                              <div className="space-y-1 bg-white p-3 rounded-lg border border-gray-100 text-xs">
                                <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-wider block">Variaciones o Adaptaciones Sugeridas</span>
                                <ul className="list-disc list-inside space-y-1 mt-1 text-gray-700 font-light leading-relaxed">
                                  {matchedDynamic.variations.map((v, vIdx) => (
                                    <li key={vIdx}>{v}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Script Block (The First Person script highlighted in beautiful italic) */}
                        {activity.script && (
                          <div className="p-4 bg-[#154539] text-white rounded-xl space-y-2 border border-[#1b5346]">
                            <h5 className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold flex items-center">
                              <FileText className="w-3.5 h-3.5 mr-1" />
                              Guion Sugerido (En Primera Persona)
                            </h5>
                            <p className="font-serif text-sm italic font-light leading-relaxed pl-3 border-l-2 border-[#C5A059]">
                              "{activity.script}"
                            </p>
                          </div>
                        )}

                        {/* Reflection Questions */}
                        {activity.reflectionQuestions && activity.reflectionQuestions.length > 0 && (
                          <div className="space-y-1.5">
                            <h5 className="text-[11px] uppercase tracking-wider text-[#154539] font-bold">Preguntas de Indagación y Reflexión</h5>
                            <ul className="list-disc list-inside space-y-1 bg-white p-3.5 rounded-lg border border-gray-100">
                              {activity.reflectionQuestions.map((q, qIdx) => (
                                <li key={qIdx} className="text-xs text-gray-700 font-light">{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Materials, Closing, Transition */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1 bg-white p-3 rounded-lg border border-gray-100">
                            <h5 className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Materiales</h5>
                            <p className="text-xs text-gray-700 font-light">{activity.materials?.join(', ') || 'Ninguno'}</p>
                          </div>
                          <div className="space-y-1 bg-white p-3 rounded-lg border border-gray-100">
                            <h5 className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Cierre</h5>
                            <p className="text-xs text-gray-700 font-light">{activity.closing}</p>
                          </div>
                          <div className="space-y-1 bg-white p-3 rounded-lg border border-gray-100">
                            <h5 className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Transición</h5>
                            <p className="text-xs text-gray-700 font-light">{activity.transition}</p>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}

              {(!currentDayBlock || !currentDayBlock.activities || currentDayBlock.activities.length === 0) && (
                <div className="text-center bg-white py-12 rounded-xl border border-gray-100 text-gray-400 font-light">
                  No hay actividades programadas en este día. ¡Crea una nueva a continuación!
                </div>
              )}

              {/* Button to open add activity form */}
              {!showAddActivityForm ? (
                <button
                  onClick={() => setShowAddActivityForm(true)}
                  className="w-full py-4 border-2 border-dashed border-[#154539]/20 hover:border-[#154539]/50 text-[#154539] hover:text-[#C5A059] rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-2 bg-white hover:bg-white/80 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir actividad manual</span>
                </button>
              ) : (
                <form onSubmit={handleAddCustomActivity} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 animate-fade-in text-left">
                  <h4 className="font-serif text-base font-bold text-[#154539] border-b border-gray-100 pb-2">Añadir Actividad a la Agenda</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Nombre de la Actividad</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Meditación de Sonido Sagrado"
                        value={newActivity.title}
                        onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Horario / Rango de Hora</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: 04:30 PM — 05:30 PM"
                        value={newActivity.time}
                        onChange={e => setNewActivity({...newActivity, time: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Duración (minutos)</label>
                      <input
                        type="number"
                        value={newActivity.duration}
                        onChange={e => setNewActivity({...newActivity, duration: Number(e.target.value)})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Objetivo Emocional</label>
                      <input
                        type="text"
                        placeholder="Ej: Integrar emociones, asentar la vivencia"
                        value={newActivity.emotionalGoal}
                        onChange={e => setNewActivity({...newActivity, emotionalGoal: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Preparación del Facilitador</label>
                      <textarea
                        placeholder="Ej: Disponer cojines en círculo cerrado y encender sahumerios."
                        value={newActivity.preparation}
                        onChange={e => setNewActivity({...newActivity, preparation: e.target.value})}
                        rows={2}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Guion Sugerido (Primera Persona)</label>
                      <textarea
                        placeholder="Ej: 'Respiren profundamente. Dejen que el sonido del gong limpie los pensamientos...'"
                        value={newActivity.script}
                        onChange={e => setNewActivity({...newActivity, script: e.target.value})}
                        rows={2}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Materiales (separados por coma)</label>
                      <input
                        type="text"
                        placeholder="Gong, cojines, brumas"
                        value={materialsInput}
                        onChange={e => setMaterialsInput(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Preguntas de Reflexión (separadas por coma)</label>
                      <input
                        type="text"
                        placeholder="¿Qué resonó en ti?, ¿Qué vibró?"
                        value={questionsInput}
                        onChange={e => setQuestionsInput(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Música Sugerida</label>
                      <input
                        type="text"
                        placeholder="Música ambiental suave"
                        value={newActivity.recommendedMusic || ''}
                        onChange={e => setNewActivity({...newActivity, recommendedMusic: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Transición</label>
                      <input
                        type="text"
                        placeholder="Caminata silenciosa"
                        value={newActivity.transition || ''}
                        onChange={e => setNewActivity({...newActivity, transition: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddActivityForm(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#154539] hover:bg-[#1a5143] text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Añadir a la agenda</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Tips Box */}
            <div className="p-4 bg-[#154539]/5 border border-[#154539]/10 rounded-xl flex items-start space-x-3 text-left">
              <Sparkles className="w-5 h-5 text-[#C5A059] flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-[#154539] uppercase tracking-wider">Tip de Facilitación Inteligente</h5>
                <p className="text-xs text-gray-700 font-light mt-1 leading-relaxed">
                  Dado que buscas canalizar una energía <strong className="text-[#154539] font-semibold">"{retreat?.desiredEnergy || "Serena"}"</strong> en un entorno de <strong className="text-[#154539] font-semibold">{retreat?.locationType || "Naturaleza"}</strong>, te sugiero ralentizar las transiciones un 20%. Permite de 2 a 3 minutos de silencio antes de cambiar de bloque para que asienten la experiencia.
                </p>

              </div>
            </div>

          </div>

          {/* Quick Participants Block */}
          {retreat?.participantsList && retreat.participantsList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-left">
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
          )}
        </div>

        {/* Right Side Column Panels (Checklists, Progress, Notes) */}
        <div className="space-y-6">
          
          {/* Circular Progress Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center flex flex-col items-center">
            <h3 className="font-serif text-lg font-bold text-[#154539] mb-4">Progreso de Logística</h3>
            
            {/* SVG circle chart */}
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
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-left">
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
                className="p-1.5 bg-[#154539] hover:bg-[#1a5143] text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <ul className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {retreat?.materialsList?.map((material, idx) => {
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
              {(!retreat?.materialsList || retreat.materialsList.length === 0) && (
                <div className="text-center py-6 text-xs text-gray-400 font-light">
                  No hay materiales registrados.
                </div>
              )}
            </ul>
          </div>

          {/* Facilitation Bullet Notes Block */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-left">
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
                  className="px-2.5 py-1 bg-[#C5A059] hover:bg-[#b08b47] text-white rounded text-[10px] font-semibold flex items-center transition-colors cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </form>

            <ul className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {retreat?.notes?.map((note, idx) => {
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
              {(!retreat?.notes || retreat.notes.length === 0) && (
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
