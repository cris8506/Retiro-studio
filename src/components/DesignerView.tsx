import React, { useState } from 'react';
import { 
  Sparkles, Calendar, Clock, Compass, AlertCircle
} from 'lucide-react';
import { Retreat } from '../types';

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
    participantsProfile: 'Coaches',
    experienceLevel: 'Principiante a Intermedio',
    locationType: 'Mixto',
    desiredEnergy: 'Serena y contemplativa',
    emotionalIntensity: 'Moderada',
    participantRelationship: 'No se conocen'
  });

  const [expectedResults, setExpectedResults] = useState<string[]>(['Reconexión personal']);
  const [otherResultText, setOtherResultText] = useState("");

  const [specialConsiderations, setSpecialConsiderations] = useState<string[]>([]);
  const [otherConsiderationText, setOtherConsiderationText] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('');
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle generation call
  const handleGenerate = async (e: React.FormEvent, useAIOverride?: boolean) => {
    if (e) e.preventDefault();
    if (isGenerating) return; // Prevent duplicate execution

    // Run strict validations
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Por favor ingresa el nombre del retiro.";
    if (!formData.type) newErrors.type = "Por favor selecciona el tipo de retiro.";
    if (!formData.duration) newErrors.duration = "Por favor selecciona la duración.";
    if (!formData.goal.trim()) newErrors.goal = "Por favor ingresa el objetivo principal.";
    if (!formData.participantsCount || formData.participantsCount <= 0) {
      newErrors.participantsCount = "Por favor ingresa un número de participantes válido.";
    }
    if (!formData.participantsAge) newErrors.participantsAge = "Por favor selecciona la edad aproximada.";
    if (!formData.participantsProfile.trim()) newErrors.participantsProfile = "Por favor ingresa el perfil del participante.";
    if (!formData.locationType) newErrors.locationType = "Por favor selecciona la ubicación.";
    if (!formData.experienceLevel) newErrors.experienceLevel = "Por favor selecciona el nivel de experiencia.";
    if (!formData.desiredEnergy) newErrors.desiredEnergy = "Por favor selecciona la energía deseada.";
    if (!formData.emotionalIntensity) newErrors.emotionalIntensity = "Por favor selecciona la intensidad emocional.";
    if (!formData.participantRelationship) newErrors.participantRelationship = "Por favor selecciona la relación entre participantes.";
    
    if (expectedResults.length === 0) {
      newErrors.expectedResults = "Por favor selecciona al menos un resultado esperado (máximo 3).";
    } else if (expectedResults.includes("Otro resultado personalizado") && !otherResultText.trim()) {
      newErrors.otherResultText = "Por favor escribe el resultado personalizado.";
    }
    
    if (specialConsiderations.includes("Otra consideración") && !otherConsiderationText.trim()) {
      newErrors.otherConsiderationText = "Por favor escribe la consideración especial.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll first error element into view
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});
    setGeminiError(null);
    const activeUseAI = useAIOverride !== undefined ? useAIOverride : false;

    setIsGenerating(true);
    setGenerationPhase('Reuniendo todos los datos para armar el retiro...');
    
    // Simulate beautiful breathing intervals during the 4 seconds of "thinking"
    const phases = activeUseAI ? [
      'Recopilando datos del formulario y perfil de participantes...',
      'Analizando intenciones y objetivo principal del contenedor...',
      'Consultando la Biblioteca oficial de Retiro Studio para seleccionar dinámicas perfectas...',
      'Estructurando la agenda de actividades y equilibrando curvas de energía...',
      'Consolidando guiones de facilitación, lista de materiales y suministros...'
    ] : [
      'Compilando parámetros del formulario sin conexión...',
      'Calculando curvas de intensidad emocional de cada jornada...',
      'Asignando recursos e instrumentos de la biblioteca local...',
      'Programando pausas, alimentación y tiempos de integración...',
      'Estructurando propuesta de agenda autónoma y lista de materiales...'
    ];

    let phaseIndex = 0;
    const interval = setInterval(() => {
      if (phaseIndex < phases.length) {
        setGenerationPhase(phases[phaseIndex]);
        phaseIndex++;
      }
    }, 800); // 800ms * 5 phases = 4000ms

    try {
      const finalExpectedResults = expectedResults.map(res => 
        res === "Otro resultado personalizado" ? otherResultText.trim() : res
      );

      const finalSpecialConsiderations = specialConsiderations.map(con => 
        con === "Otra consideración" ? otherConsiderationText.trim() : con
      );

      // Esperamos al menos 4 segundos para dar la sensación de que procesa y reúne toda la información
      const [response] = await Promise.all([
        fetch('/api/generate-retreat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            expectedResults: finalExpectedResults,
            specialConsiderations: finalSpecialConsiderations,
            useAI: activeUseAI
          })
        }),
        new Promise(resolve => setTimeout(resolve, 4000))
      ]);

      const data = await response.json();
      clearInterval(interval);

      if (!response.ok) {
        throw new Error(data.error || "La función de generación no está disponible en el servidor.");
      }

      if (data.success && data.retreat) {
        onSetNewRetreat(data.retreat);
      } else if (data.canGenerateWithoutAI) {
        setGeminiError(data.error || "Gemini no está disponible en este momento.");
      } else {
        throw new Error(data.error || "La respuesta generada no tenía el formato esperado.");
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setGeminiError(err.message || "No pudimos conectar con el servidor para la generación inteligente.");
    } finally {
      setIsGenerating(false);
    }
  };

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

  return (
    <div id="designer-form-container" className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 shadow-md space-y-8 animate-fade-in">
      <div className="text-center border-b border-gray-100 pb-6">
        <div className="mx-auto w-12 h-12 bg-[#154539] text-white rounded-full flex items-center justify-center mb-3">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#154539]">Diseñador de Retiros</h2>
        <p className="text-sm text-gray-500 font-light mt-1.5 max-w-xl mx-auto text-center">
          Configura los parámetros de tu experiencia y nuestro sistema integrará las dinámicas ideales de la biblioteca oficial en una agenda organizada.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          <div id="field-name" className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Nombre del Retiro</label>
            <input 
              type="text" 
              placeholder="Ej: El Retorno al Origen — Retiro de Mindfulness y Enraizamiento"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            />
            {errors.name && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.name}</p>}
          </div>

          <div id="field-type" className="space-y-1.5">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Tipo de Retiro</label>
            <select 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.type ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            >
              <option>Bienestar y Reconexión</option>
              <option>Yoga y Pranayama</option>
              <option>Desintoxicación Corporal y Ayuno</option>
              <option>Liderazgo Consciente y Negocios</option>
              <option>Terapia de Trauma y Liberación</option>
              <option>Creatividad y Escritura Intuitiva</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.type}</p>}
          </div>

          <div id="field-duration" className="space-y-1.5">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Duración (Días)</label>
            <select 
              value={formData.duration}
              onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
              className={`w-full bg-gray-50 border ${errors.duration ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            >
              <option value={2}>2 días (Fin de semana)</option>
              <option value={3}>3 días (Estándar)</option>
              <option value={4}>4 días (Profundo)</option>
              <option value={5}>5 días (Inmersión completa)</option>
            </select>
            {errors.duration && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.duration}</p>}
          </div>

          <div id="field-goal" className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Objetivo Principal del Retiro</label>
            <textarea 
              placeholder="¿Qué transformación deseas propiciar en el participante? Ej: Liberarse de la sobreestimulación mental de las grandes ciudades y aprender técnicas corporales de relajación profunda."
              value={formData.goal}
              onChange={e => setFormData({...formData, goal: e.target.value})}
              rows={3}
              className={`w-full bg-gray-50 border ${errors.goal ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none font-sans`}
            />
            {errors.goal && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.goal}</p>}
          </div>

          <div id="field-participantsCount" className="space-y-1.5">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Número de Participantes</label>
            <input 
              type="number" 
              value={formData.participantsCount}
              onChange={e => setFormData({...formData, participantsCount: Number(e.target.value)})}
              className={`w-full bg-gray-50 border ${errors.participantsCount ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            />
            {errors.participantsCount && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.participantsCount}</p>}
          </div>

          <div id="field-participantsAge" className="space-y-1.5">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Edad Aproximada</label>
            <select 
              value={formData.participantsAge}
              onChange={e => setFormData({...formData, participantsAge: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.participantsAge ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            >
              <option value="20 - 30 años">20 - 30 años</option>
              <option value="30 - 50 años">30 - 50 años</option>
              <option value="50 - 70 años">50 - 70 años</option>
            </select>
            {errors.participantsAge && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.participantsAge}</p>}
          </div>

          <div id="field-participantsProfile" className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">PERFIL DE LOS PARTICIPANTES</label>
            <select 
              value={formData.participantsProfile}
              onChange={e => setFormData({...formData, participantsProfile: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.participantsProfile ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            >
              <option value="Coaches">Coaches</option>
              <option value="Terapeutas">Terapeutas</option>
              <option value="Mujeres emprendedoras">Mujeres emprendedoras</option>
              <option value="Personas con altos niveles de estrés">Personas con altos niveles de estrés</option>
              <option value="Sin experiencia en retiros">Sin experiencia en retiros</option>
              <option value="Personas en búsqueda de crecimiento personal">Personas en búsqueda de crecimiento personal</option>
              <option value="Líderes y emprendedores">Líderes y emprendedores</option>
              <option value="Profesionales con alto nivel de estrés laboral">Profesionales con alto nivel de estrés laboral</option>
            </select>
            {errors.participantsProfile && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.participantsProfile}</p>}
          </div>

          <div id="field-locationType" className="space-y-1.5">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Ubicación del Retiro</label>
            <select 
              value={formData.locationType}
              onChange={e => setFormData({...formData, locationType: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.locationType ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            >
              <option value="Espacio cerrado">Espacio cerrado</option>
              <option value="Espacio abierto">Espacio abierto</option>
              <option value="Mixto">Mixto</option>
            </select>
            {errors.locationType && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.locationType}</p>}
          </div>

          <div id="field-experienceLevel" className="space-y-1.5">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">NIVEL DE EXPERIENCIA DEL FACILITADOR</label>
            <select 
              value={formData.experienceLevel}
              onChange={e => setFormData({...formData, experienceLevel: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.experienceLevel ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            >
              <option>Principiante (No requiere conocimientos previos)</option>
              <option>Principiante a Intermedio</option>
              <option>Intermedio (Práctica esporádica previa)</option>
              <option>Avanzado (Profesionales del rubro)</option>
            </select>
            {errors.experienceLevel && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.experienceLevel}</p>}
          </div>

          <div id="field-desiredEnergy" className="space-y-1.5">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Energía Deseada</label>
            <select 
              value={formData.desiredEnergy}
              onChange={e => setFormData({...formData, desiredEnergy: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.desiredEnergy ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            >
              <option value="Serena y contemplativa">Serena y contemplativa</option>
              <option value="Alegre y dinámica">Alegre y dinámica</option>
              <option value="Íntima y emocional">Íntima y emocional</option>
              <option value="Espiritual y reflexiva">Espiritual y reflexiva</option>
              <option value="Activa y motivadora">Activa y motivadora</option>
              <option value="Creativa y expansiva">Creativa y expansiva</option>
              <option value="Equilibrada">Equilibrada</option>
              <option value="Transformadora y profunda">Transformadora y profunda</option>
            </select>
            {errors.desiredEnergy && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.desiredEnergy}</p>}
          </div>

          <div id="field-emotionalIntensity" className="space-y-1.5">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Intensidad Emocional</label>
            <select 
              value={formData.emotionalIntensity}
              onChange={e => setFormData({...formData, emotionalIntensity: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.emotionalIntensity ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            >
              <option value="Suave">Suave</option>
              <option value="Moderada">Moderada</option>
              <option value="Profunda">Profunda</option>
            </select>
            {errors.emotionalIntensity && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.emotionalIntensity}</p>}
          </div>

          <div id="field-participantRelationship" className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider">Relación entre Participantes</label>
            <select 
              value={formData.participantRelationship}
              onChange={e => setFormData({...formData, participantRelationship: e.target.value})}
              className={`w-full bg-gray-50 border ${errors.participantRelationship ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
            >
              <option value="No se conocen">No se conocen</option>
              <option value="Algunos participantes se conocen">Algunos participantes se conocen</option>
              <option value="La mayoría se conoce">La mayoría se conoce</option>
              <option value="Grupo consolidado">Grupo consolidado</option>
              <option value="Equipo de trabajo">Equipo de trabajo</option>
              <option value="Familia o grupo cercano">Familia o grupo cercano</option>
            </select>
            {errors.participantRelationship && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.participantRelationship}</p>}
          </div>

          <div id="field-expectedResults" className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider font-serif">Resultados Esperados (Máx. 3)</label>
            <div className="space-y-3">
              <select 
                value="" 
                onChange={e => {
                  const val = e.target.value;
                  if (val && !expectedResults.includes(val) && expectedResults.length < 3) {
                    setExpectedResults([...expectedResults, val]);
                  }
                }}
                disabled={expectedResults.length >= 3}
                className={`w-full bg-gray-50 border ${errors.expectedResults ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
              >
                <option value="">{expectedResults.length >= 3 ? "Límite de 3 resultados alcanzado" : "-- Selecciona un resultado esperado --"}</option>
                {[
                  "Relajación y reducción del estrés",
                  "Reconexión personal",
                  "Claridad mental y propósito",
                  "Fortalecimiento de la autoestima",
                  "Liberación y regulación emocional",
                  "Conexión y confianza grupal",
                  "Mejora de la comunicación",
                  "Desarrollo de liderazgo",
                  "Integración cuerpo, mente y emociones",
                  "Aprendizaje de herramientas de bienestar",
                  "Cierre de ciclos y renovación personal",
                  "Fortalecimiento de vínculos",
                  "Mayor consciencia corporal",
                  "Creatividad e inspiración",
                  "Crecimiento espiritual",
                  "Otro resultado personalizado"
                ].map(opt => (
                  <option key={opt} value={opt} disabled={expectedResults.includes(opt)}>
                    {opt}
                  </option>
                ))}
              </select>
              
              <p className="text-[11px] text-gray-400 mt-1">Seleccione hasta 3 resultados esperados.</p>
              {errors.expectedResults && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.expectedResults}</p>}
              
              {expectedResults.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {expectedResults.map(res => (
                    <span 
                      key={res} 
                      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#154539]/10 text-[#154539] border border-[#154539]/20 rounded-full text-xs font-medium"
                    >
                      <span>{res}</span>
                      <button 
                        type="button" 
                        onClick={() => setExpectedResults(expectedResults.filter(r => r !== res))}
                        className="w-4 h-4 rounded-full hover:bg-[#154539]/20 flex items-center justify-center text-[10px] font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {expectedResults.includes("Otro resultado personalizado") && (
                <div id="field-otherResultText" className="mt-3 space-y-1.5 animate-fade-in">
                  <label className="text-xs font-semibold text-[#154539]">Especifica el resultado personalizado</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Conexión intergeneracional y sanación de linaje familiar"
                    value={otherResultText}
                    onChange={e => setOtherResultText(e.target.value)}
                    className={`w-full bg-gray-50 border ${errors.otherResultText ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
                  />
                  {errors.otherResultText && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.otherResultText}</p>}
                </div>
              )}
            </div>
          </div>

          <div id="field-specialConsiderations" className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#154539] uppercase tracking-wider font-serif">Consideraciones Especiales (Opcional)</label>
            <div className="space-y-3">
              <select 
                value="" 
                onChange={e => {
                  const val = e.target.value;
                  if (!val) return;
                  if (val === "Ninguna") {
                    setSpecialConsiderations(["Ninguna"]);
                  } else {
                    const updated = specialConsiderations.filter(c => c !== "Ninguna");
                    if (!updated.includes(val)) {
                      setSpecialConsiderations([...updated, val]);
                    }
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none"
              >
                <option value="">-- Selecciona consideración especial --</option>
                {[
                  "Movilidad reducida",
                  "Actividades sin contacto físico",
                  "Enfoque sensible al trauma",
                  "Evitar actividades de alta intensidad física",
                  "Participantes adultos mayores",
                  "Participantes menores de edad",
                  "Restricciones culturales o religiosas",
                  "Necesidades de accesibilidad",
                  "Ninguna",
                  "Otra consideración"
                ].map(opt => (
                  <option key={opt} value={opt} disabled={specialConsiderations.includes(opt)}>
                    {opt}
                  </option>
                ))}
              </select>

              {specialConsiderations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialConsiderations.map(con => (
                    <span 
                      key={con} 
                      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 rounded-full text-xs font-medium"
                    >
                      <span>{con}</span>
                      <button 
                        type="button" 
                        onClick={() => setSpecialConsiderations(specialConsiderations.filter(c => c !== con))}
                        className="w-4 h-4 rounded-full hover:bg-[#C5A059]/20 flex items-center justify-center text-[10px] font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {specialConsiderations.includes("Otra consideración") && (
                <div id="field-otherConsiderationText" className="mt-3 space-y-1.5 animate-fade-in">
                  <label className="text-xs font-semibold text-[#154539]">Especifica la consideración especial</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Dieta ayurvédica estricta o espacio adaptado para meditación sentada prolongada"
                    value={otherConsiderationText}
                    onChange={e => setOtherConsiderationText(e.target.value)}
                    className={`w-full bg-gray-50 border ${errors.otherConsiderationText ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#154539] focus:outline-none`}
                  />
                  {errors.otherConsiderationText && <p className="text-red-500 text-xs font-semibold mt-1 block animate-fade-in">{errors.otherConsiderationText}</p>}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Fallback Banner if Gemini is unavailable */}
        {geminiError && (
          <div className="bg-amber-50/75 border border-[#C5A059]/30 rounded-xl p-5 space-y-3 animate-fade-in text-left">
            <div className="flex items-start space-x-3 text-[#154539]">
              <AlertCircle className="w-5 h-5 mt-0.5 text-[#C5A059] flex-shrink-0" />
              <div>
                <h4 className="font-serif font-bold text-sm text-[#154539]">Biblioteca de Contingencia</h4>
                <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                  Gemini no está disponible en este momento. Puedes crear el retiro automáticamente utilizando nuestra biblioteca y sistema de planificación.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={(e) => handleGenerate(e, false)}
                className="px-5 py-2.5 bg-[#154539] hover:bg-[#1a5143] text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Generar sin IA</span>
              </button>
            </div>
          </div>
        )}

        {/* Generation Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={(e) => handleGenerate(e, false)}
            disabled={isGenerating}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white bg-[#154539] hover:bg-[#1a5143] shadow-md transition-all text-sm flex items-center justify-center space-x-2 ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Compass className="w-5 h-5 text-[#C5A059]" />
            <span>Generar Retiro</span>
          </button>
        </div>
      </form>
    </div>
  );
};
