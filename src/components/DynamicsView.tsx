import React, { useState } from 'react';
import { 
  BookOpen, Search, Filter, Sparkles, Plus, ChevronDown, 
  ChevronUp, Calendar, AlertTriangle, Layers, Clock, Check, Star, X, Sparkle 
} from 'lucide-react';
import { Dynamic, Retreat } from '../types';
import { OFFICIAL_DYNAMICS } from '../data/dynamics';

interface DynamicsViewProps {
  retreat: Retreat;
  onUpdateRetreat: (updated: Retreat) => void;
  onShowNotification: (message: string) => void;
}

export const DynamicsView: React.FC<DynamicsViewProps> = ({
  retreat,
  onUpdateRetreat,
  onShowNotification
}) => {
  // Database of dynamics (combining official and any user generated during this session)
  const [dynamicsDb, setDynamicsDb] = useState<Dynamic[]>(OFFICIAL_DYNAMICS);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [activeIntensity, setActiveIntensity] = useState<string>('Todas');
  const [activeDuration, setActiveDuration] = useState<string>('Todas');

  // Accordion/Expanded states
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // AI custom dynamic form state
  const [aiObjective, setAiObjective] = useState('');
  const [aiCategory, setAiCategory] = useState('Meditación');
  const [aiIntensity, setAiIntensity] = useState('Media');
  const [aiDuration, setAiDuration] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);

  // New AI Generated Dynamic modal state
  const [generatedDynamic, setGeneratedDynamic] = useState<Dynamic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['Todas', 'Meditación', 'Icebreaker', 'Creatividad', 'Silencio', 'Cuerpo', 'Liberación', 'Integración'];

  // Filter dynamics
  const filteredDynamics = dynamicsDb.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.objective.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'Todas' || d.category === activeCategory;
    
    const matchesIntensity = activeIntensity === 'Todas' || d.intensity === activeIntensity;
    
    let matchesDuration = true;
    if (activeDuration !== 'Todas') {
      if (activeDuration === 'Express (<20m)') {
        matchesDuration = d.duration < 20;
      } else if (activeDuration === 'Estándar (20-45m)') {
        matchesDuration = d.duration >= 20 && d.duration <= 45;
      } else if (activeDuration === 'Profunda (>45m)') {
        matchesDuration = d.duration > 45;
      }
    }

    return matchesSearch && matchesCategory && matchesIntensity && matchesDuration;
  });

  // Handle adding a dynamic to the active retreat agenda
  const handleAddDynamicToRetreat = (dynamic: Dynamic) => {
    if (!retreat.id) {
      onShowNotification("⚠️ Primero crea o selecciona un retiro en el Diseñador.");
      return;
    }

    // Determine target day (defaulting to Day 1 or the last day)
    const targetDay = retreat.agenda.length > 0 ? 1 : 1;
    
    // Auto-schedule time based on current activities
    const currentDayBlock = retreat.agenda.find(dayBlock => dayBlock.day === targetDay);
    let timeString = "04:30 PM — 05:00 PM";
    
    if (currentDayBlock && currentDayBlock.activities.length > 0) {
      const lastAct = currentDayBlock.activities[currentDayBlock.activities.length - 1];
      // Quick parser to advance time slightly
      if (lastAct.time.includes('PM')) {
        timeString = "05:30 PM — 06:00 PM";
      } else {
        timeString = "03:00 PM — 03:30 PM";
      }
    }

    const newActivity = {
      id: 'act_added_' + Date.now(),
      time: timeString,
      title: dynamic.name,
      duration: dynamic.duration,
      emotionalGoal: dynamic.objective,
      dynamicId: dynamic.id,
      dynamicName: dynamic.name,
      isAiSuggested: !!dynamic.isAiSuggested,
      materials: dynamic.materials,
      preparation: dynamic.preparation,
      script: dynamic.script,
      reflectionQuestions: dynamic.reflectionQuestions,
      closing: 'Respiren hondo, asentando la energía en el cuerpo.',
      recommendedMusic: dynamic.category === 'Meditación' ? 'Vientos del Himalaya' : 'We Are One',
      transition: 'Círculo de integración breve o pausa de silencio.'
    };

    const updatedAgenda = retreat.agenda.map(dayBlock => {
      if (dayBlock.day === targetDay) {
        return {
          ...dayBlock,
          activities: [...dayBlock.activities, newActivity]
        };
      }
      return dayBlock;
    });

    onUpdateRetreat({
      ...retreat,
      agenda: updatedAgenda,
      materialsList: Array.from(new Set([...retreat.materialsList, ...dynamic.materials]))
    });

    onShowNotification(`✨ "${dynamic.name}" agregada con éxito al Día 1 de tu retiro.`);
  };

  // Handle generating custom dynamic using backend Gemini API
  const handleAiGenerateDynamic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiObjective.trim()) {
      alert("Por favor detalla qué objetivo deseas lograr.");
      return;
    }

    setIsGenerating(true);
    onShowNotification("🔮 Co-creando dinámica adaptada con Inteligencia Artificial...");

    try {
      const response = await fetch('/api/generate-dynamic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: aiCategory,
          duration: aiDuration,
          intensity: aiIntensity,
          objective: aiObjective,
          groupType: retreat.participantsProfile || 'General'
        })
      });

      const data = await response.json();
      if (response.ok && data.dynamic) {
        setGeneratedDynamic(data.dynamic);
        setIsModalOpen(true);
        setAiObjective('');
        onShowNotification("✨ ¡Tu dinámica ha sido diseñada por la IA! Revisa los detalles en la pantalla.");
      } else {
        alert(data.error || "Ocurrió un error.");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar al servidor.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDynamicToLibrary = () => {
    if (!generatedDynamic) return;
    setDynamicsDb(prev => [generatedDynamic, ...prev]);
    setIsModalOpen(false);
    setExpandedId(generatedDynamic.id);
    onShowNotification(`✨ "${generatedDynamic.name}" se guardó con éxito en tu biblioteca.`);
  };

  const handleSaveDynamicToLibraryAndRetreat = () => {
    if (!generatedDynamic) return;
    setDynamicsDb(prev => [generatedDynamic, ...prev]);
    handleAddDynamicToRetreat(generatedDynamic);
    setIsModalOpen(false);
    setExpandedId(generatedDynamic.id);
  };

  return (
    <div id="dynamics-view-root" className="space-y-8 animate-fade-in">
      
      {/* Search and Quick Intro Banner */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#154539] flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-[#C5A059]" />
            Biblioteca de Dinámicas Oficiales
          </h2>
          <p className="text-xs text-gray-500 font-light mt-1">
            Recursos y metodologías probadas de Retiro Studio para estructurar tus talleres.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por nombre o palabra clave..."
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

      {/* Advanced Filters block (Intensity, Duration) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/40 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center space-x-3">
          <Layers className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
          <span className="text-xs font-bold text-[#154539] uppercase tracking-wider">Intensidad:</span>
          <div className="flex items-center space-x-1">
            {['Todas', 'Baja', 'Media', 'Alta'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setActiveIntensity(lvl)}
                className={`text-[10px] px-2.5 py-1 rounded transition-colors ${
                  activeIntensity === lvl ? 'bg-[#C5A059] text-white font-semibold' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Clock className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
          <span className="text-xs font-bold text-[#154539] uppercase tracking-wider">Duración:</span>
          <div className="flex items-center space-x-1">
            {['Todas', 'Express (<20m)', 'Estándar (20-45m)', 'Profunda (>45m)'].map(dur => (
              <button
                key={dur}
                onClick={() => setActiveDuration(dur)}
                className={`text-[10px] px-2.5 py-1 rounded transition-colors ${
                  activeDuration === dur ? 'bg-[#C5A059] text-white font-semibold' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {dur.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDynamics.map((dynamic) => {
          const isExpanded = expandedId === dynamic.id;
          return (
            <div 
              key={dynamic.id} 
              className={`bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow transition-all ${
                dynamic.isAiSuggested ? 'border-amber-200/60 bg-amber-50/5' : ''
              }`}
            >
              
              {/* Card Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    dynamic.category === 'Meditación' ? 'bg-blue-50 text-blue-600' :
                    dynamic.category === 'Cuerpo' ? 'bg-emerald-50 text-emerald-600' :
                    dynamic.category === 'Creatividad' ? 'bg-purple-50 text-purple-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {dynamic.category}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-medium text-gray-500 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {dynamic.duration} min
                    </span>
                    {dynamic.isAiSuggested && (
                      <span className="inline-flex items-center text-[9px] font-bold text-[#C5A059] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <Star className="w-2.5 h-2.5 fill-current mr-0.5" /> IA
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-gray-900">{dynamic.name}</h3>
                <p className="text-xs text-gray-600 font-light leading-relaxed truncate-2-lines">{dynamic.objective}</p>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-bold text-[#154539] uppercase tracking-wider mr-1">Intensidad:</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      dynamic.intensity === 'Baja' ? 'bg-green-50 text-green-700' :
                      dynamic.intensity === 'Media' ? 'bg-orange-50 text-orange-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {dynamic.intensity}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : dynamic.id)}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
                    >
                      {isExpanded ? 'Ocultar' : 'Instrucciones'}
                    </button>
                    <button
                      onClick={() => handleAddDynamicToRetreat(dynamic)}
                      className="px-3 py-1.5 bg-[#154539] hover:bg-[#1a5143] text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Details Block */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-[#F7F4EC]/20 p-5 space-y-4 text-xs">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-50">
                      <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-wider block">Cuándo usarla:</span>
                      <p className="text-gray-700 font-light mt-1">{dynamic.whenToUse}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-50">
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Evitar si:
                      </span>
                      <p className="text-gray-700 font-light mt-1">{dynamic.whenToAvoid}</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-50">
                    <span className="text-[9px] font-bold text-[#154539] uppercase tracking-wider block">Materiales necesarios:</span>
                    <p className="text-gray-700 font-light mt-1">{dynamic.materials.join(', ') || 'Sin materiales particulares.'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#154539] uppercase tracking-wider block">Preparación previa:</span>
                    <p className="text-gray-700 font-light bg-white p-2.5 rounded border border-gray-50">{dynamic.preparation}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#154539] uppercase tracking-wider block">Guía Paso a Paso:</span>
                    <ol className="list-decimal list-inside space-y-1.5 bg-white p-3 rounded border border-gray-50">
                      {dynamic.steps.map((step, sIdx) => (
                        <li key={sIdx} className="text-gray-700 font-light leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>

                  {dynamic.script && (
                    <div className="p-3 bg-[#154539] text-white rounded-lg">
                      <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest block mb-1">Guion sugerido facilitador:</span>
                      <p className="italic font-light leading-relaxed pl-2.5 border-l-2 border-[#C5A059]">"{dynamic.script}"</p>
                    </div>
                  )}

                  {dynamic.reflectionQuestions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#154539] uppercase tracking-wider block">Preguntas de Reflexión:</span>
                      <ul className="list-disc list-inside space-y-1 bg-white p-2.5 rounded border border-gray-50">
                        {dynamic.reflectionQuestions.map((q, qIdx) => (
                          <li key={qIdx} className="text-gray-700 font-light">{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}

        {filteredDynamics.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400 font-light">
            No encontramos dinámicas que coincidan con estos filtros.
          </div>
        )}
      </div>



      {/* AI Generated Dynamic Pop-up Modal */}
      {isModalOpen && generatedDynamic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in animate-duration-200" id="ai-dynamic-modal">
          <div className="bg-white rounded-2xl border-2 border-amber-200/80 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scale-up animate-duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50/40 to-white">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-amber-50 rounded-lg text-[#C5A059]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest block">Diseñada por IA</span>
                  <h3 className="font-serif text-xl font-bold text-[#154539]">{generatedDynamic.name}</h3>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="Cerrar sin guardar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-700">
              
              {/* Quick Info badges */}
              <div className="flex flex-wrap gap-2.5">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px]">
                  Categoría: {generatedDynamic.category}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full font-mono text-[10px] flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> {generatedDynamic.duration} minutos
                </span>
                <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full font-bold text-[10px]">
                  Intensidad: {generatedDynamic.intensity}
                </span>
              </div>

              {/* Goal / Objective block */}
              <div className="bg-gradient-to-r from-[#154539]/5 to-emerald-50/10 p-4 rounded-xl border border-[#154539]/10">
                <span className="text-[10px] font-bold text-[#154539] uppercase tracking-wider block mb-1">Objetivo del Ejercicio:</span>
                <p className="text-gray-800 font-light leading-relaxed">{generatedDynamic.objective}</p>
              </div>

              {/* When to use & When to avoid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                  <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-wider block">Momento ideal para aplicarla:</span>
                  <p className="text-gray-600 font-light mt-1">{generatedDynamic.whenToUse}</p>
                </div>
                <div className="bg-red-50/20 p-3 rounded-lg border border-red-100/30">
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Contraindicaciones:
                  </span>
                  <p className="text-gray-600 font-light mt-1">{generatedDynamic.whenToAvoid}</p>
                </div>
              </div>

              {/* Materials */}
              <div>
                <span className="text-[10px] font-bold text-[#154539] uppercase tracking-wider block mb-1">Materiales sugeridos:</span>
                <p className="text-gray-800 font-light bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {generatedDynamic.materials.join(', ') || 'Ninguno, solo presencia.'}
                </p>
              </div>

              {/* Preparation */}
              <div>
                <span className="text-[10px] font-bold text-[#154539] uppercase tracking-wider block mb-1">Preparación previa del espacio:</span>
                <p className="text-gray-800 font-light bg-gray-50 p-2.5 rounded-lg border border-gray-100">{generatedDynamic.preparation}</p>
              </div>

              {/* Steps */}
              <div>
                <span className="text-[10px] font-bold text-[#154539] uppercase tracking-wider block mb-1.5">Paso a Paso de la Dinámica:</span>
                <ol className="list-decimal list-inside space-y-2 bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                  {generatedDynamic.steps.map((step, sIdx) => (
                    <li key={sIdx} className="text-gray-800 font-light leading-relaxed pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Facilitator script */}
              {generatedDynamic.script && (
                <div className="p-4 bg-[#154539] text-white rounded-xl shadow-inner">
                  <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest block mb-1.5">Guion sugerido para el facilitador:</span>
                  <p className="italic font-light leading-relaxed pl-3 border-l-2 border-[#C5A059] text-amber-50/90">
                    "{generatedDynamic.script}"
                  </p>
                </div>
              )}

              {/* Reflection Questions */}
              {generatedDynamic.reflectionQuestions && generatedDynamic.reflectionQuestions.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#154539] uppercase tracking-wider block mb-1">Preguntas de reflexión para el círculo:</span>
                  <ul className="list-disc list-inside space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {generatedDynamic.reflectionQuestions.map((q, qIdx) => (
                      <li key={qIdx} className="text-gray-800 font-light">{q}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-500 transition-colors text-center cursor-pointer"
              >
                Descartar
              </button>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleSaveDynamicToLibrary}
                  className="px-4 py-2.5 bg-white border border-[#154539] hover:bg-emerald-50/20 text-[#154539] rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Agregar a la biblioteca</span>
                </button>
                <button
                  onClick={handleSaveDynamicToLibraryAndRetreat}
                  className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08b47] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar y Añadir al Retiro</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
