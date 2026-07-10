import React, { useState } from 'react';
import { 
  Sparkles, Calendar, Clock, Plus, Trash2, Edit2, Play, 
  RotateCcw, Save, AlertCircle, FileText, Compass, ChevronDown, ChevronUp, Check, Music
} from 'lucide-react';
import { Retreat, RetreatActivity, RetreatDay } from '../types';

interface DesignerViewProps {
  retreat: Retreat;
  onUpdateRetreat: (updated: Retreat) => void;
  onSetNewRetreat: (newRetreat: Retreat) => void;
}

export const DesignerView: React.FC<DesignerViewProps> = ({
  retreat,
  onUpdateRetreat,
  onSetNewRetreat
}) => {
  // Form input states
  const [formData, setFormData] = useState({
    name: '',
    type: 'Bienestar y Reconexión',
    goal: '',
    duration: 3,
    participantsCount: 15,
    participantsAge: '30 - 50 años',
    participantsProfile: 'Coaches, profesionales estresados, líderes de bienestar',
    experienceLevel: 'Principiante a Intermedio',
    locationType: 'Naturaleza (Interior/Exterior)',
    desiredEnergy: 'Serena, introspectiva pero conectada',
    expectedResults: 'Liberación de cortisol, técnicas corporales aprendidas, integración profunda'
  });

  const [activeDayTab, setActiveDayTab] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('');
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

  // Handle generation call
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return; // Prevent duplicate execution
    if (!formData.name || !formData.goal) {
      alert("Por favor ingresa un nombre y un objetivo para el retiro.");
      return;
    }

    setIsGenerating(true);
    setGenerationPhase('Sincronizando intenciones...');
    
    // Simulate beautiful breathing intervals
    const phases = [
      'Analizando perfil de los participantes...',
      'Consultando la Biblioteca oficial de Retiro Studio...',
      'Estructurando transiciones y niveles de energía...',
      'Redactando guiones de facilitación en primera persona...',
      'Consolidando la lista de materiales y suministros...'
    ];

    let phaseIndex = 0;
    const interval = setInterval(() => {
      if (phaseIndex < phases.length) {
        setGenerationPhase(phases[phaseIndex]);
        phaseIndex++;
      }
    }, 1800);

    try {
      const response = await fetch('/api/generate-retreat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      clearInterval(interval);

      if (response.ok && data.retreat) {
        onSetNewRetreat(data.retreat);
        setActiveDayTab(1);
      } else {
        alert(data.error || "No pudimos generar el retiro. Revisa la configuración de Gemini o inténtalo nuevamente.");
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      alert("No pudimos generar el retiro. Revisa la configuración de Gemini o inténtalo nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

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
      isAiSuggested: true,
      materials: materialsInput.split(',').map(m => m.trim()).filter(Boolean),
      preparation: newActivity.preparation || 'Disponer el espacio cómodamente.',
      script: newActivity.script || '',
      reflectionQuestions: questionsInput.split(',').map(q => q.trim()).filter(Boolean),
      closing: newActivity.closing || 'Respira hondo.',
      recommendedMusic: newActivity.recommendedMusic || '',
      transition: newActivity.transition || 'Cierra la sesión suavemente.'
    };

    // Find active day and update its activity array
    const updatedAgenda = retreat.agenda.map(dayBlock => {
      if (dayBlock.day === activeDayTab) {
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
      // Consolidate materials list too
      materialsList: [...retreat.materialsList, ...activityToAdd.materials]
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
    const updatedAgenda = retreat.agenda.map(dayBlock => {
      if (dayBlock.day === activeDayTab) {
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

  // Quick reset to build a new one
  const handleResetForm = () => {
    onSetNewRetreat({
      ...retreat,
      id: '',
      name: '',
      agenda: []
    });
  };

  // If we are currently designing a new retreat from scratch
  const isDesigningNew = !retreat.id;

  if (isGenerating) {
    return (
      <div id="designer-breathing-loader" className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-12 text-center animate-fade-in">
        <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#154539]">
          Co-creando tu experiencia transformacional
        </h3>
        
        {/* Breathing pranayama animation circle */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute w-44 h-44 rounded-full bg-[#154539]/10 animate-ping"></div>
          <div className="absolute w-36 h-36 rounded-full bg-[#C5A059]/20 animate-pulse"></div>
          <div className="w-28 h-28 rounded-full bg-[#154539] flex flex-col items-center justify-center shadow-lg text-white">
            <span className="text-[10px] uppercase tracking-widest font-bold">Inhala</span>
            <span className="text-[10px] uppercase tracking-widest font-bold mt-1 text-[#C5A059]">Exhala</span>
          </div>
        </div>

        <div className="space-y-1 max-w-md">
          <p className="text-sm font-semibold text-gray-800">{generationPhase}</p>
          <p className="text-xs text-gray-400 font-light italic">"Tu sabiduría interior se une a la biblioteca de Retiro Studio para diseñar el contenedor perfecto."</p>
        </div>
      </div>
    );
  }

  if (isDesigningNew) {
    return (
      <div id="designer-form-container" className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 shadow-md space-y-8 animate-fade-in">
        <div className="text-center border-b border-gray-100 pb-6">
          <div className="mx-auto w-12 h-12 bg-[#154539] text-white rounded-full flex items-center justify-center mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#154539]">Diseñador Inteligente de Retiros</h2>
          <p className="text-sm text-gray-500 font-light mt-1.5 max-w-xl mx-auto">
            Configura los parámetros de tu experiencia y nuestra IA integrará las dinámicas ideales de la biblioteca oficial.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Nombre del Retiro</label>
              <input 
                type="text" 
                placeholder="Ej: El Retorno al Origen — Retiro de Mindfulness y Enraizamiento"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Tipo de Retiro</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              >
                <option>Bienestar y Reconexión</option>
                <option>Yoga y Pranayama</option>
                <option>Desintoxicación Corporal y Ayuno</option>
                <option>Liderazgo Consciente y Negocios</option>
                <option>Terapia de Trauma y Liberación</option>
                <option>Creatividad y Escritura Intuitiva</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Duración (Días)</label>
              <select 
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              >
                <option value={2}>2 días (Fin de semana)</option>
                <option value={3}>3 días (Estándar)</option>
                <option value={4}>4 días (Profundo)</option>
                <option value={5}>5 días (Inmersión completa)</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Objetivo Principal del Retiro</label>
              <textarea 
                placeholder="¿Qué transformación deseas propiciar en el participante? Ej: Liberarse de la sobreestimulación mental de las grandes ciudades y aprender técnicas corporales de relajación profunda."
                value={formData.goal}
                onChange={e => setFormData({...formData, goal: e.target.value})}
                required
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Número de Participantes</label>
              <input 
                type="number" 
                value={formData.participantsCount}
                onChange={e => setFormData({...formData, participantsCount: Number(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Edad Aproximada</label>
              <input 
                type="text" 
                value={formData.participantsAge}
                onChange={e => setFormData({...formData, participantsAge: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Perfil del Participante</label>
              <input 
                type="text" 
                placeholder="Ej: Emprendedores cansados, terapeutas con burnout, público general buscando paz"
                value={formData.participantsProfile}
                onChange={e => setFormData({...formData, participantsProfile: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Ubicación del Retiro</label>
              <input 
                type="text" 
                placeholder="Ej: Casa de campo en bosque de pinos, salón interior con ventanales..."
                value={formData.locationType}
                onChange={e => setFormData({...formData, locationType: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Nivel de Experiencia</label>
              <select 
                value={formData.experienceLevel}
                onChange={e => setFormData({...formData, experienceLevel: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              >
                <option>Principiante (No requiere conocimientos previos)</option>
                <option>Principiante a Intermedio</option>
                <option>Intermedio (Práctica esporádica previa)</option>
                <option>Avanzado (Profesionales del rubro)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Energía Deseada</label>
              <input 
                type="text" 
                placeholder="Ej: Serena, silenciosa, introspectiva, liberadora..."
                value={formData.desiredEnergy}
                onChange={e => setFormData({...formData, desiredEnergy: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Resultados Esperados</label>
              <input 
                type="text" 
                placeholder="Ej: Desintoxicación digital, autoconocimiento, paz física"
                value={formData.expectedResults}
                onChange={e => setFormData({...formData, expectedResults: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-4 text-white rounded-xl font-semibold shadow-md flex items-center justify-center space-x-2.5 transition-all text-sm md:text-base mt-6 ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed opacity-75' 
                : 'bg-[#154539] hover:bg-[#1a5143] cursor-pointer'
            }`}
          >
            <Sparkles className={`w-5 h-5 text-[#C5A059] ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generando Estructura...' : 'Generar Estructura Inteligente con IA'}</span>
          </button>
        </form>
      </div>
    );
  }

  // Find active day data
  const currentDayBlock = retreat.agenda.find(dayBlock => dayBlock.day === activeDayTab);

  return (
    <div id="designer-agenda-visualizer" className="space-y-8 animate-fade-in">
      
      {/* Title & Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Diseño Finalizado</span>
          <h2 className="font-serif text-2xl font-bold text-[#154539]">{retreat.name}</h2>
          <p className="text-xs text-gray-500 font-light mt-1">Navega por los días del retiro para acceder a tus guiones ceremoniales.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetForm}
            className="px-4 py-2 bg-[#F7F4EC] hover:bg-beige/40 text-[#154539] hover:text-[#C5A059] rounded-xl text-xs font-semibold border border-gray-100 transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Crear otro retiro</span>
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-gray-200 pb-2">
        {retreat.agenda.map((dayBlock) => (
          <button
            key={dayBlock.day}
            onClick={() => {
              setActiveDayTab(dayBlock.day);
              setOpenActivityId(null);
            }}
            className={`px-5 py-3 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-all ${
              activeDayTab === dayBlock.day
                ? 'bg-[#154539] text-white shadow-sm -mb-2'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Día {dayBlock.day}
          </button>
        ))}
      </div>

      {/* Day Overview Banner */}
      {currentDayBlock && (
        <div className="p-5 bg-[#154539]/5 border-l-4 border-[#C5A059] rounded-r-xl">
          <span className="text-[9px] uppercase tracking-wider text-[#154539] font-bold block">Foco del Día</span>
          <h3 className="font-serif text-lg font-bold text-[#154539] mt-0.5">{currentDayBlock.focus}</h3>
        </div>
      )}

      {/* Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Agenda Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {currentDayBlock?.activities.map((activity, index) => {
            const isOpen = openActivityId === activity.id;
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
                      <div className="bg-white p-3.5 rounded-lg border border-gray-100">
                        <h5 className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold">Música Sugerida</h5>
                        <p className="text-xs text-gray-700 font-light mt-1 flex items-center">
                          <Music className="w-3.5 h-3.5 mr-1 text-[#154539]" />
                          {activity.recommendedMusic || 'Ambiente natural en silencio'}
                        </p>
                      </div>
                    </div>

                    {/* Preparation Block */}
                    <div className="space-y-1.5">
                      <h5 className="text-[11px] uppercase tracking-wider text-[#154539] font-bold">Preparación del Facilitador</h5>
                      <p className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-100 font-light leading-relaxed">
                        {activity.preparation}
                      </p>
                    </div>

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
                    {activity.reflectionQuestions.length > 0 && (
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
                        <p className="text-xs text-gray-700 font-light">{activity.materials.join(', ') || 'Ninguno'}</p>
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

          {currentDayBlock?.activities.length === 0 && (
            <div className="text-center bg-white p-12 rounded-xl border border-gray-100 text-gray-400 font-light">
              No hay actividades programadas en este día. ¡Crea una nueva a continuación!
            </div>
          )}

          {/* Button to open add activity form */}
          {!showAddActivityForm ? (
            <button
              onClick={() => setShowAddActivityForm(true)}
              className="w-full py-4 border-2 border-dashed border-[#154539]/20 hover:border-[#154539]/50 text-[#154539] hover:text-[#C5A059] rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-2 bg-white/50 hover:bg-white"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir actividad manual</span>
            </button>
          ) : (
            <form onSubmit={handleAddCustomActivity} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 animate-fade-in">
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
                    value={newActivity.recommendedMusic}
                    onChange={e => setNewActivity({...newActivity, recommendedMusic: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Transición</label>
                  <input
                    type="text"
                    placeholder="Caminata silenciosa"
                    value={newActivity.transition}
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

        {/* Right Info Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h4 className="font-serif text-lg font-bold text-[#154539] border-b border-gray-100 pb-2">Información de Diseño</h4>
            
            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Perfil Ideal</span>
                <p className="text-xs text-gray-700 font-light mt-0.5 leading-relaxed">{retreat.idealProfile}</p>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Público y Cantidad</span>
                <p className="text-xs text-gray-700 font-light mt-0.5">{retreat.participantsCount} personas — {retreat.participantsAge}</p>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Ubicación Clave</span>
                <p className="text-xs text-gray-700 font-light mt-0.5">{retreat.locationType}</p>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Resultados Prometidos</span>
                <p className="text-xs text-gray-700 font-light mt-0.5">{retreat.expectedResults}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#154539] text-[#d0e0db] rounded-xl border border-[#1d594b] space-y-2">
            <h5 className="font-serif text-sm font-bold text-[#C5A059] flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Sincronización Total
            </h5>
            <p className="text-[11px] font-light leading-relaxed">
              Las dinámicas oficiales del catálogo han sido integradas en la línea temporal. Cualquier cambio se verá reflejado inmediatamente en los sumarios del Dashboard.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
