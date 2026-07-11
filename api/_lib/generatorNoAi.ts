import { Dynamic, Retreat, RetreatActivity, RetreatDay, MusicTrack } from "../../src/types.js";
import { OFFICIAL_DYNAMICS } from "./dynamics.js";
import { OFFICIAL_PLAYLISTS } from "../../src/data/music.js";

// Music recommendations by category
const MUSIC_BY_CATEGORY: Record<string, string[]> = {
  'Apertura': ['Cantos Ancestrales - Danit & Poranguí', 'We Are One - East Forest'],
  'Bienvenida': ['We Are One - East Forest', 'Tierra que Late - Liquid Bloom'],
  'Meditación': ['Vientos del Himalaya - Snatam Kaur', 'Agua que Fluye - Deuter'],
  'Conexión': ['Agua que Fluye - Deuter', 'We Are One - East Forest'],
  'Reflexión': ['Gratitude Prayer - Deva Premal', 'El Retorno al Silencio - Ludovico Einaudi'],
  'Liberación': ['Transmutación - Mose (Resonance Mix)', 'Tierra que Late - Liquid Bloom'],
  'Movimiento': ['Tierra que Late - Liquid Bloom & Mose', 'Transmutación - Mose'],
  'Gratitud': ['Gratitude Prayer - Deva Premal & Miten', 'El Retorno al Silencio - Ludovico Einaudi'],
  'Cierre': ['El Retorno al Silencio - Ludovico Einaudi', 'Gratitude Prayer - Deva Premal']
};

/**
 * Calculates a dynamic score for a given activity block in a specific phase.
 */
export function scoreDynamic(
  dynamic: Dynamic,
  formData: any,
  phase: string,
  previousActivityIntensity?: string
): number {
  let score = 0;
  
  const dId = dynamic.id;
  const cat = dynamic.category.toLowerCase();
  const obj = dynamic.objective.toLowerCase();
  const title = dynamic.name.toLowerCase();
  const whenUse = dynamic.whenToUse.toLowerCase();

  // Parse arrays safely
  const results = Array.isArray(formData.expectedResults)
    ? formData.expectedResults
    : (formData.expectedResults ? [formData.expectedResults] : []);

  const considerations = Array.isArray(formData.specialConsiderations)
    ? formData.specialConsiderations
    : (formData.specialConsiderations ? [formData.specialConsiderations] : []);

  // 1. HARD EXCLUSIONS (CRITICAL CONSTRAINTS)
  
  // No contact physical activities
  const hasNoContact = considerations.some((c: string) => 
    c.toLowerCase().includes("sin contacto físico") || 
    c.toLowerCase().includes("sin contacto fisico")
  );
  if (hasNoContact) {
    if (dId === 'hilo_red' || dId === 'respiracion_holotropica') {
      return -100; // Strict exclusion
    }
  }

  // No deep activities when intensity is Suave
  if (formData.emotionalIntensity === "Suave") {
    if (dynamic.intensity === "Alta" || dynamic.category === "Liberación" || dId === 'respiracion_holotropica' || dId === 'fuego_sagrado' || dId === 'danza_primordial') {
      return -100; // Strict exclusion
    }
  }

  // Physically demanding restrictions
  const hasMobilityOrPhysicalRestriction = considerations.some((c: string) => 
    c.toLowerCase().includes("movilidad") || 
    c.toLowerCase().includes("evitar actividades de alta intensidad")
  );
  if (hasMobilityOrPhysicalRestriction) {
    if (dynamic.intensity === "Alta" || dId === 'danza_primordial' || dId === 'despertar_somatico') {
      return -100; // Strict exclusion
    }
  }

  // 2. SCORING DYNAMICS

  // Coincidence with main goal
  if (formData.goal) {
    const goalWords = formData.goal.toLowerCase().split(/\s+/);
    goalWords.forEach((word: string) => {
      if (word.length > 4) {
        if (obj.includes(word)) score += 0.5;
        if (title.includes(word)) score += 0.5;
        if (whenUse.includes(word)) score += 0.5;
      }
    });
  }

  // Coincidence with expected results
  results.forEach((res: string) => {
    const resLower = res.toLowerCase();
    if (obj.includes(resLower) || whenUse.includes(resLower) || title.includes(resLower)) {
      score += 4;
    }
    // Semantic matching for expected results
    if (resLower.includes("relajación") || resLower.includes("estrés") || resLower.includes("estres")) {
      if (dId === 'caminata_consciente' || dId === 'bano_bosque' || dId === 'diario_gratitud') score += 3;
    }
    if (resLower.includes("reconexión") || resLower.includes("personal")) {
      if (dId === 'caminata_consciente' || dId === 'bano_bosque' || dId === 'circulo_bienvenida') score += 2;
    }
    if (resLower.includes("emocional") || resLower.includes("liberación") || resLower.includes("liberacion")) {
      if (dynamic.category === 'Liberación' || dId === 'rueda_palabra') score += 3;
    }
    if (resLower.includes("conexión") || resLower.includes("confianza") || resLower.includes("vínculos") || resLower.includes("vinculos") || resLower.includes("grupal")) {
      if (dynamic.category === 'Conexión' || dynamic.category === 'Integración') score += 3;
    }
    if (resLower.includes("cuerpo") || resLower.includes("consciencia corporal") || resLower.includes("corporal")) {
      if (dynamic.category === 'Cuerpo' || dId === 'caminata_consciente') score += 3;
    }
    if (resLower.includes("creatividad") || resLower.includes("inspiración") || resLower.includes("inspiracion")) {
      if (dynamic.category === 'Creatividad') score += 4;
    }
  });

  // Type of retreat
  const typeLower = (formData.type || '').toLowerCase();
  if (typeLower.includes('creativ') && dynamic.category === 'Creatividad') score += 4;
  if (typeLower.includes('yoga') && (dynamic.category === 'Meditación' || dynamic.category === 'Cuerpo')) score += 3;
  if (typeLower.includes('cuerpo') && dynamic.category === 'Cuerpo') score += 4;
  if (typeLower.includes('ayuno') && dynamic.category === 'Silencio') score += 3;
  if (typeLower.includes('libera') && dynamic.category === 'Liberación') score += 4;
  if (typeLower.includes('lidera') && (dynamic.category === 'Integración' || dynamic.category === 'Conexión')) score += 3;

  // Quantity of participants
  const count = Number(formData.participantsCount) || 15;
  if (count > 20) {
    if (dId === 'hilo_red' || dId === 'danza_primordial' || dId === 'circulo_bienvenida') {
      score += 3;
    }
    if (dId === 'respiracion_holotropica') {
      score -= 2;
    }
  } else if (count < 8) {
    if (dId === 'respiracion_holotropica' || dId === 'rueda_palabra' || dId === 'diario_gratitud') {
      score += 3;
    }
  }

  // Age suitability
  const age = (formData.participantsAge || '').toLowerCase();
  if (age.includes('60') || age.includes('70') || age.includes('mayor') || age.includes('tercera')) {
    if (dynamic.intensity === 'Alta') {
      score -= 5;
    }
    if (dynamic.intensity === 'Baja') {
      score += 2;
    }
  }

  // Level of Experience
  const exp = (formData.experienceLevel || '').toLowerCase();
  if (exp.includes('principiante')) {
    if (dId === 'respiracion_holotropica') {
      score -= 5;
    }
    if (dynamic.intensity === 'Baja') {
      score += 2;
    }
  } else if (exp.includes('avanzado') || exp.includes('profesionales')) {
    if (dId === 'respiracion_holotropica') {
      score += 3;
    }
  }

  // Location Type (Space)
  const loc = (formData.locationType || '').toLowerCase();
  const isOutdoorReq = loc.includes('bosque') || loc.includes('naturaleza') || loc.includes('aire libre') || loc.includes('exterior') || loc.includes('abierto');
  const isIndoorReq = loc.includes('salón') || loc.includes('interior') || loc.includes('hotel') || loc.includes('cerrado');

  if (isOutdoorReq) {
    if (dId === 'bano_bosque' || dId === 'caminata_consciente' || dId === 'fuego_sagrado') {
      score += 4;
    }
  }
  if (isIndoorReq) {
    if (dId === 'bano_bosque') {
      score -= 5;
    }
  }

  // Desired Energy matching
  const energy = (formData.desiredEnergy || '').toLowerCase();
  if (energy.includes('calma') || energy.includes('paz') || energy.includes('seren') || energy.includes('introspect') || energy.includes('contemplativa')) {
    if (dynamic.intensity === 'Baja') score += 4;
    if (dynamic.intensity === 'Alta') score -= 3;
  } else if (energy.includes('activa') || energy.includes('libera') || energy.includes('fuerte') || energy.includes('alta') || energy.includes('dinámic') || energy.includes('alegre') || energy.includes('expansiva')) {
    if (dynamic.intensity === 'Alta') score += 4;
    if (dynamic.intensity === 'Baja') score -= 1;
  } else if (energy.includes('equilibrada')) {
    if (dynamic.intensity === 'Media') score += 4;
    if (dynamic.intensity === 'Baja' || dynamic.intensity === 'Alta') score += 1;
  }

  // Emotional Intensity preference
  const emIntensity = formData.emotionalIntensity || "Moderada";
  if (emIntensity === "Suave") {
    if (dynamic.intensity === "Baja") score += 4;
  } else if (emIntensity === "Moderada") {
    if (dynamic.intensity === "Media") score += 4;
    if (dynamic.intensity === "Baja") score += 1;
  } else if (emIntensity === "Profunda") {
    if (dynamic.intensity === "Alta") score += 5;
    if (dynamic.intensity === "Media") score += 2;
  }

  // Participant Relationship preference
  const rel = formData.participantRelationship || "No se conocen";
  if (rel === "No se conocen") {
    if (dynamic.category === 'Conexión' || dId === 'circulo_bienvenida') score += 4;
    if (dId === 'respiracion_holotropica') score -= 3;
  } else if (rel.includes("consolidado") || rel.includes("trabajo") || rel.includes("Familia") || rel.includes("cercano")) {
    if (dynamic.category === 'Liberación' || dId === 'rueda_palabra' || dId === 'respiracion_holotropica') score += 3;
  }

  // Special considerations adjustments
  if (considerations.includes("Enfoque sensible al trauma")) {
    if (dId === 'caminata_consciente' || dId === 'bano_bosque' || dId === 'diario_gratitud') score += 3;
    if (dId === 'respiracion_holotropica') score -= 15;
    if (dId === 'danza_primordial') score -= 4;
  }
  if (considerations.includes("Participantes adultos mayores")) {
    if (dynamic.intensity === 'Baja') score += 3;
    if (dynamic.intensity === 'Alta') score -= 10;
  }
  if (considerations.includes("Participantes menores de edad")) {
    if (dynamic.category === 'Creatividad' || dynamic.category === 'Cuerpo') score += 2;
    if (dId === 'respiracion_holotropica') score -= 20;
  }

  // Phase Matching (Critical!)
  if (phase === 'Llegada y seguridad' || phase === 'Apertura') {
    if (dynamic.category === 'Conexión' || dId === 'circulo_bienvenida') score += 8;
    if (dynamic.category === 'Integración' || dId === 'hilo_red') score += 6;
  } else if (phase === 'Conexión') {
    if (dynamic.category === 'Meditación' || dynamic.category === 'Conexión' || dId === 'caminata_consciente' || dId === 'bano_bosque') score += 8;
  } else if (phase === 'Activación') {
    if (dynamic.category === 'Cuerpo' || dId === 'despertar_somatico' || dId === 'danza_primordial') score += 8;
  } else if (phase === 'Profundización') {
    if (dynamic.category === 'Liberación' || dId === 'respiracion_holotropica' || dId === 'fuego_sagrado') score += 8;
  } else if (phase === 'Reflexión') {
    if (dynamic.category === 'Creatividad' || dId === 'diario_gratitud' || dId === 'rueda_palabra') score += 8;
  } else if (phase === 'Integración') {
    if (dynamic.category === 'Creatividad' || dId === 'mapa_vision' || dId === 'rueda_palabra') score += 8;
  } else if (phase === 'Cierre') {
    if (dynamic.category === 'Integración' || dId === 'rueda_palabra' || dId === 'hilo_red') score += 8;
  }

  // Avoid consecutive intense activities
  if (previousActivityIntensity === 'Alta' && dynamic.intensity === 'Alta') {
    score -= 10;
  }

  return score;
}

/**
 * Procedural offline retreat generator based on the official guidelines.
 */
export function generateRetreatWithoutAI(formData: any, dynamics: Dynamic[] = OFFICIAL_DYNAMICS): Retreat {
  const durationDays = Number(formData.duration) || 3;
  const name = formData.name || "Retiro Despertar del Ser";
  const type = formData.type || "Bienestar y Reconexión";
  const goal = formData.goal || "Restaurar el equilibrio somático y mental.";
  
  const agenda: RetreatDay[] = [];
  const allUsedDynamicIds = new Set<string>();

  // Determine emotional intensity level
  const emotionalIntensity = formData.emotionalIntensity || 'Media';

  // Iterate over days to construct the agenda
  for (let d = 1; d <= durationDays; d++) {
    const isFirstDay = d === 1;
    const isLastDay = d === durationDays;
    const isMiddleDay = !isFirstDay && !isLastDay;

    const focus = isFirstDay 
      ? "Llegada, enraizamiento y creación del contenedor sagrado de confianza"
      : isLastDay
        ? "Cierre integrador, manifestación de propósitos y despedida"
        : `Día ${d}: Profundización del proceso, liberación somática y expansión`;

    const activities: RetreatActivity[] = [];
    let previousIntensity = 'Baja';

    // Day 1 Schedule
    if (isFirstDay) {
      // 09:00 AM - Llegada, check-in y seguridad (Phase 1)
      activities.push({
        id: `act_${d}_1`,
        time: "09:00 AM — 10:30 AM",
        title: "Recepción, Check-In & Enraizamiento",
        duration: 90,
        emotionalGoal: "Acoger a los participantes y sembrar la seguridad del espacio.",
        dynamicName: "Llegada consciente, té de bienvenida y asignación de aposentos.",
        isAiSuggested: false,
        materials: ["Té orgánico", "Bitácoras de bienvenida", "Hojas de registro"],
        preparation: "Decorar la entrada con flores frescas, encender incienso suave de sándalo y aromatizar la sala de recepción.",
        script: "Bienvenidos a este hogar temporal de paz. Deja tus maletas y tus preocupaciones afuera. Este es un santuario diseñado para tu descanso.",
        reflectionQuestions: ["¿Qué peso físico o mental decides dejar en la puerta hoy?"],
        closing: "Cerrar con una entrega de la bitácora personalizada.",
        recommendedMusic: "We Are One - East Forest",
        transition: "Transicionar en silencio con un toque suave de campana tibetana hacia el círculo principal.",
        phase: "Llegada y seguridad" as any,
        intensity: "Baja"
      });

      // 10:30 AM - Apertura (Phase 2)
      const aperturaDynamic = findBestDynamic(dynamics, formData, 'Apertura', allUsedDynamicIds, previousIntensity);
      activities.push(createActivityFromDynamic(aperturaDynamic, `act_${d}_2`, "10:30 AM — 12:00 PM", "Apertura"));
      allUsedDynamicIds.add(aperturaDynamic.id);
      previousIntensity = aperturaDynamic.intensity;

      // 12:00 PM - Descanso / Almuerzo en Silencio (Phase 6)
      const almuerzoDynamic = findBestDynamic(dynamics, formData, 'Descanso', allUsedDynamicIds, previousIntensity, 'almuerzo_silencio');
      activities.push(createActivityFromDynamic(almuerzoDynamic, `act_${d}_3`, "12:00 PM — 14:00 PM", "Descanso"));
      allUsedDynamicIds.add(almuerzoDynamic.id);
      previousIntensity = almuerzoDynamic.intensity;

      // 14:30 PM - Conexión (Phase 3)
      const conexionDynamic = findBestDynamic(dynamics, formData, 'Conexión', allUsedDynamicIds, previousIntensity);
      activities.push(createActivityFromDynamic(conexionDynamic, `act_${d}_4`, "14:30 PM — 16:30 PM", "Conexión"));
      allUsedDynamicIds.add(conexionDynamic.id);
      previousIntensity = conexionDynamic.intensity;

      // 17:00 PM - Reflexión (Phase 7)
      const reflexionDynamic = findBestDynamic(dynamics, formData, 'Reflexión', allUsedDynamicIds, previousIntensity);
      activities.push(createActivityFromDynamic(reflexionDynamic, `act_${d}_5`, "17:00 PM — 18:30 PM", "Reflexión"));
      allUsedDynamicIds.add(reflexionDynamic.id);
      previousIntensity = reflexionDynamic.intensity;

      // 19:30 PM - Cena Sagrada & Descanso Nocturno (Phase 6)
      activities.push({
        id: `act_${d}_6`,
        time: "19:30 PM — 21:00 PM",
        title: "Cena Sagrada y Descanso Reparador",
        duration: 90,
        emotionalGoal: "Favorecer la asimilación pacífica de los procesos del primer día.",
        dynamicName: "Alimentación Consciente Libre",
        isAiSuggested: false,
        materials: ["Cena saludable vegana/vegetariana"],
        preparation: "Instruir al grupo a alimentarse con quietud mental y sin pantallas.",
        script: "Que este alimento nutra no solo tu cuerpo físico, sino también tus intenciones de sanación formuladas hoy.",
        reflectionQuestions: ["¿Qué descubriste de ti en este primer día?"],
        closing: "Cerrar el comedor en absoluto silencio para invitar al descanso temprano.",
        recommendedMusic: "El Retorno al Silencio - Ludovico Einaudi",
        transition: "Retirarse a descansar en silencio absoluto para el día siguiente.",
        phase: "Descanso" as any,
        intensity: "Baja"
      });
    }

    // Day Middle (or Day 2)
    if (isMiddleDay || (durationDays === 2 && d === 2 && !isLastDay)) {
      // 07:30 AM - Activación Somática (Phase 4)
      const activeDynamic = findBestDynamic(dynamics, formData, 'Activación', allUsedDynamicIds, previousIntensity, 'despertar_somatico');
      activities.push(createActivityFromDynamic(activeDynamic, `act_${d}_1`, "07:30 AM — 08:30 AM", "Activación"));
      allUsedDynamicIds.add(activeDynamic.id);
      previousIntensity = activeDynamic.intensity;

      // 08:30 AM - Desayuno Nutritivo (Phase 6)
      activities.push({
        id: `act_${d}_2`,
        time: "08:30 AM — 09:30 AM",
        title: "Desayuno Nutritivo de Integración",
        duration: 60,
        emotionalGoal: "Nutrir y preparar el cuerpo físico para el bloque profundo.",
        dynamicName: "Desayuno",
        isAiSuggested: false,
        materials: ["Frutas frescas", "Jugos naturales", "Semillas"],
        preparation: "Disponer los alimentos orgánicos de forma estética y colorida.",
        script: "Agradecemos la abundancia de la Madre Tierra. Desayunamos con presencia, saboreando cada bocado.",
        reflectionQuestions: [],
        closing: "Levantar los utensilios con gratitud.",
        recommendedMusic: "We Are One - East Forest",
        transition: "Breve descanso antes del taller introspectivo de la mañana.",
        phase: "Descanso" as any,
        intensity: "Baja"
      });

      // 10:00 AM - Profundización (Phase 5)
      const deepDynamic = findBestDynamic(dynamics, formData, 'Profundización', allUsedDynamicIds, previousIntensity);
      activities.push(createActivityFromDynamic(deepDynamic, `act_${d}_3`, "10:00 AM — 12:30 PM", "Profundización"));
      allUsedDynamicIds.add(deepDynamic.id);
      previousIntensity = deepDynamic.intensity;

      // 13:00 PM - Almuerzo de Descanso (Phase 6)
      activities.push({
        id: `act_${d}_4`,
        time: "13:00 PM — 15:00 PM",
        title: "Almuerzo y Siesta Consciente",
        duration: 120,
        emotionalGoal: "Asentar los movimientos internos de la sesión profunda.",
        dynamicName: "Almuerzo y pausa somática",
        isAiSuggested: false,
        materials: ["Almuerzo reconfortante caliente"],
        preparation: "Asegurar que la sala de descanso esté templada.",
        script: "Permite que tu mente y tu cuerpo reposen. No intentes analizar lo vivido. Solo descansa.",
        reflectionQuestions: [],
        closing: "Toque de cuenco para reincorporarse.",
        recommendedMusic: "Agua que Fluye - Deuter",
        transition: "Caminata suave de regreso al salón de práctica.",
        phase: "Descanso" as any,
        intensity: "Baja"
      });

      // 15:30 PM - Conexión o Integración (Phase 8)
      const integDynamic = findBestDynamic(dynamics, formData, 'Integración', allUsedDynamicIds, previousIntensity);
      activities.push(createActivityFromDynamic(integDynamic, `act_${d}_5`, "15:30 PM — 17:30 PM", "Integración"));
      allUsedDynamicIds.add(integDynamic.id);
      previousIntensity = integDynamic.intensity;

      // 18:00 PM - Reflexión (Phase 7)
      const reflexDynamic2 = findBestDynamic(dynamics, formData, 'Reflexión', allUsedDynamicIds, previousIntensity);
      activities.push(createActivityFromDynamic(reflexDynamic2, `act_${d}_6`, "18:00 PM — 19:30 PM", "Reflexión"));
      allUsedDynamicIds.add(reflexDynamic2.id);
      previousIntensity = reflexDynamic2.intensity;

      // 20:00 PM - Cena y Ritual de Fuego o Liberación (Phase 5)
      const releaseDynamic = findBestDynamic(dynamics, formData, 'Profundización', allUsedDynamicIds, previousIntensity, 'fuego_sagrado');
      activities.push(createActivityFromDynamic(releaseDynamic, `act_${d}_7`, "20:00 PM — 21:30 PM", "Profundización"));
      allUsedDynamicIds.add(releaseDynamic.id);
      previousIntensity = releaseDynamic.intensity;
    }

    // Last Day Schedule (either Day 2, Day 3, 4, or 5)
    if (isLastDay) {
      // 07:30 AM - Despertar Somático o Meditación matutina (Phase 4)
      activities.push({
        id: `act_${d}_1`,
        time: "07:30 AM — 08:30 AM",
        title: "Despertar Corporal y Meditación de Cierre",
        duration: 60,
        emotionalGoal: "Preparar el canal físico y mental para despedir el proceso.",
        dynamicName: "Despertar Somático Suave",
        isAiSuggested: false,
        materials: ["Esterillas de yoga"],
        preparation: "Ventilar la sala con aromas a menta y eucalipto.",
        script: "Siente tu columna estirarse hacia el cielo y tus raíces descender hacia la tierra. Eres el puente vivo de este viaje.",
        reflectionQuestions: ["¿Qué de lo vivido te llevas en tu equipaje diario?"],
        closing: "Unión de manos en el pecho y reverencia grupal.",
        recommendedMusic: "Vientos del Himalaya - Snatam Kaur",
        transition: "Transición al comedor para el desayuno final.",
        phase: "Activación" as any,
        intensity: "Baja"
      });

      // 08:30 AM - Desayuno Final (Phase 6)
      activities.push({
        id: `act_${d}_2`,
        time: "08:30 AM — 09:30 AM",
        title: "Desayuno Nutritivo de Celebración",
        duration: 60,
        emotionalGoal: "Generar un espacio de intercambio alegre e informal.",
        dynamicName: "Desayuno compartido",
        isAiSuggested: false,
        materials: ["Desayuno completo"],
        preparation: "Colocar música de celebración de fondo.",
        script: "Buen provecho a todos. Saboreemos no solo los alimentos, sino la hermosa comunidad que hemos co-creado.",
        reflectionQuestions: [],
        closing: "Agradecimiento a los cocineros.",
        recommendedMusic: "We Are One - East Forest",
        transition: "Regresar al salón de círculo con sus diarios.",
        phase: "Descanso" as any,
        intensity: "Baja"
      });

      // 09:45 AM - Integración Final / Collage o Visión (Phase 8)
      const visionDynamic = findBestDynamic(dynamics, formData, 'Integración', allUsedDynamicIds, previousIntensity, 'mapa_vision');
      activities.push(createActivityFromDynamic(visionDynamic, `act_${d}_3`, "09:45 AM — 11:45 AM", "Integración"));
      allUsedDynamicIds.add(visionDynamic.id);
      previousIntensity = visionDynamic.intensity;

      // 12:00 PM - Círculo de Cierre Ceremonial (Phase 9)
      const cierreDynamic = findBestDynamic(dynamics, formData, 'Cierre', allUsedDynamicIds, previousIntensity, 'rueda_palabra');
      activities.push(createActivityFromDynamic(cierreDynamic, `act_${d}_4`, "12:00 PM — 13:30 PM", "Cierre"));
      allUsedDynamicIds.add(cierreDynamic.id);
      previousIntensity = cierreDynamic.intensity;

      // 13:30 PM - Comida de Clausura, fotos y abrazos (Phase 6)
      activities.push({
        id: `act_${d}_5`,
        time: "13:30 PM — 15:00 PM",
        title: "Abrazos, Ofrendas de Gratitud y Almuerzo de Despedida",
        duration: 90,
        emotionalGoal: "Anclar de forma permanente la conexión colectiva de regreso al hogar.",
        dynamicName: "Círculo de abrazos e intercambio de contactos",
        isAiSuggested: false,
        materials: ["Comida de celebración", "Tarjetas de agradecimiento"],
        preparation: "Disponer un rincón de fotos estético.",
        script: "El retiro formal termina aquí, pero el retiro del alma continúa en cada paso de tu vida diaria. Gracias infinitas por tu valentía.",
        reflectionQuestions: ["¿Qué compromiso sellas contigo mismo hoy?"],
        closing: "Toque final de gran gong ceremonial.",
        recommendedMusic: "El Retorno al Silencio - Ludovico Einaudi",
        transition: "Retorno consciente a sus hogares.",
        phase: "Cierre" as any,
        intensity: "Baja"
      });
    }

    agenda.push({
      day: d,
      focus: focus,
      activities: activities
    });
  }

  // Consolidated materials list
  const materialsList = Array.from(new Set(
    agenda.flatMap(day => day.activities.flatMap(act => act.materials || []))
  )).filter(Boolean);

  // Generate dynamic notes based on parameters
  const notes = [
    `Adaptar las pausas libres según las condiciones meteorológicas en: "${formData.locationType || 'Naturaleza'}"`,
    `Asegurar que la energía de facilitación permanezca alineada al foco: "${formData.desiredEnergy || 'Equilibrada'}"`,
    "Tener mantas extra y cuencos con agua tibia siempre disponibles para regular el sistema de contención.",
    `Hacer un seguimiento de las restricciones de los ${formData.participantsCount || 15} participantes registrados.`
  ];

  return {
    id: 'retreat_noai_' + Date.now(),
    name: name,
    type: type,
    goal: goal,
    duration: durationDays,
    participantsCount: Number(formData.participantsCount) || 15,
    participantsAge: formData.participantsAge || "30-50 años",
    participantsProfile: formData.participantsProfile || "General",
    experienceLevel: formData.experienceLevel || "Principiante a Intermedio",
    locationType: formData.locationType || "Naturaleza",
    desiredEnergy: formData.desiredEnergy || "Serena",
    expectedResults: formData.expectedResults || ["Desintoxicación mental e integración corporal"],
    emotionalIntensity: formData.emotionalIntensity || "Moderada",
    participantRelationship: formData.participantRelationship || "No se conocen",
    specialConsiderations: formData.specialConsiderations || [],
    description: `Retiro planificado mediante algoritmos de afinidad somática y diseño estructural. Optimiza el progreso de energía grupal de ${durationDays} días centrados en ${goal.toLowerCase().replace(/\.$/, '')}.`,
    idealProfile: `Público: "${formData.participantsProfile || 'Interesados en bienestar'}" de rango de edad "${formData.participantsAge || '30-50 años'}".`,
    agenda: agenda,
    materialsList: materialsList,
    participantsList: [
      { name: 'Elena Martínez', dietary: 'Vegana', restrictions: 'Alergia Nueces' },
      { name: 'Julián Rivera', dietary: 'Sin restricciones', restrictions: 'Ninguna' }
    ],
    notes: notes,
    progress: 100
  };
}

/**
 * Searches the list of dynamics for the absolute best-suited match.
 */
function findBestDynamic(
  dynamics: Dynamic[],
  formData: any,
  phase: string,
  usedIds: Set<string>,
  previousIntensity: string,
  preferredId?: string
): Dynamic {
  // If we have a specific preferredId and it's available, take it immediately
  if (preferredId) {
    const pref = dynamics.find(d => d.id === preferredId);
    if (pref) return pref;
  }

  // Find remaining un-used dynamics
  let available = dynamics.filter(d => !usedIds.has(d.id));
  if (available.length === 0) {
    // Recalculate with all dynamics if we exhausted the library
    available = dynamics;
  }

  const scored = available.map(d => ({
    dynamic: d,
    score: scoreDynamic(d, formData, phase, previousIntensity)
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.dynamic || dynamics[0];
}

/**
 * Maps a generic Dynamic into an actual RetreatActivity structure.
 */
function createActivityFromDynamic(
  dynamic: Dynamic,
  id: string,
  timeString: string,
  phase: string
): RetreatActivity {
  // Extract recommended music based on category or phase
  const musicOptions = MUSIC_BY_CATEGORY[dynamic.category] || MUSIC_BY_CATEGORY['Meditación'];
  const music = musicOptions[Math.floor(Math.random() * musicOptions.length)] || "Atmósfera Serena - Deuter";

  return {
    id: id,
    time: timeString,
    title: dynamic.name,
    duration: dynamic.duration,
    emotionalGoal: dynamic.objective,
    dynamicId: dynamic.id,
    dynamicName: dynamic.name,
    isAiSuggested: false,
    materials: dynamic.materials || [],
    preparation: dynamic.preparation || "Asegurar un espacio cómodo para la práctica.",
    script: dynamic.script || `Bienvenidos a la dinámica ${dynamic.name}.`,
    reflectionQuestions: dynamic.reflectionQuestions || [],
    closing: "Agradece a tus compañeros de círculo por el sostén mutuo.",
    recommendedMusic: music,
    transition: "Toma un vaso de agua fresca y muévete suavemente hacia el siguiente bloque.",
    phase: phase as any,
    intensity: dynamic.intensity
  } as any;
}

/**
 * No-AI Contingency Advice responses database with 3 equivalent variations per situation.
 */
export const CONTINGENCY_DATABASE: Record<string, {
  situationName: string;
  variations: {
    action: string;
    avoid: string;
    dynamic: string;
    duration: number;
    instructions: string[];
    alternatives: string;
  }[];
}> = {
  'baja participación': {
    situationName: "Baja participación o resistencia",
    variations: [
      {
        action: "Disuelve la tensión dividiendo el círculo grande en micro-parejas inmediatas.",
        avoid: "Señalar o presionar a tímidos a hablar ante todo el grupo.",
        dynamic: "Hilo de la Micro-vulnerabilidad",
        duration: 10,
        instructions: [
          "Pide caminar por el espacio y, al aplauso, emparejarse con el más cercano.",
          "Plantea: '¿Qué parte de mí teme ser juzgada hoy?'",
          "Cada uno habla 3 minutos cronometrados; el otro solo escucha en presencia pura.",
          "Regresen al círculo mayor sintiéndose más seguros."
        ],
        alternatives: "Escribir miedos de forma anónima en papeles, mezclarlos y leerlos al azar."
      },
      {
        action: "Saca al grupo del círculo principal y haz parejas aleatorias para un compartir confidencial.",
        avoid: "Forzar intervenciones directas en público o incomodar con silencios prolongados.",
        dynamic: "El Espejo Sincero en Parejas",
        duration: 10,
        instructions: [
          "Encuentra un compañero cercano y siéntense frente a frente.",
          "Miren a los ojos de manera amable por 1 minuto en silencio.",
          "Compartan por 3 minutos cada uno: '¿Qué máscara o rol estoy sosteniendo hoy?'",
          "Escuchen en silencio absoluto sin emitir consejos ni juicios."
        ],
        alternatives: "Utilizar cartas o piedras simbólicas para que cada uno elija una que represente su sentir."
      },
      {
        action: "Reduce la presión del contenedor grupal reuniendo a los participantes en parejas de confianza.",
        avoid: "Exponer individualmente a personas calladas o insistir en debates de todo el grupo.",
        dynamic: "Resonancia y Presencia",
        duration: 10,
        instructions: [
          "Formen parejas y tómense de las manos suavemente.",
          "Compartan una sola emoción o resistencia que estén sosteniendo en este instante.",
          "El compañero que escucha repite: 'Te escucho, te veo y sostengo tu proceso'.",
          "Intercambien roles y cierren con una respiración profunda conjunta."
        ],
        alternatives: "Realizar una votación o encuesta escrita rápida y anónima sobre el clima grupal."
      }
    ]
  },
  'grupo callado': {
    situationName: "Grupo callado o apagado",
    variations: [
      {
        action: "Desplaza la atención de la mente lógica al movimiento corporal rítmico.",
        avoid: "Hacer preguntas abstractas o forzar rondas de palabra.",
        dynamic: "Aplauso Resonante Express",
        duration: 5,
        instructions: [
          "Inicia un aplauso sencillo con un patrón rítmico corto.",
          "El grupo debe imitar el eco al unísono de inmediato.",
          "Pasa el liderazgo visual del ritmo a otro participante sin hablar.",
          "Cierra respirando profundo y sacudiendo manos."
        ],
        alternatives: "Dinámica silenciosa del espejo corporal en parejas."
      },
      {
        action: "Rompe el silencio mental activando el cuerpo físico con un juego de eco sónico rápido.",
        avoid: "Insistir en debates intelectuales o pedir opiniones racionales en frío.",
        dynamic: "Eco de Sonidos del Alma",
        duration: 5,
        instructions: [
          "Pónganse de pie en círculo y respiren profundo.",
          "Haz un movimiento corporal simple acompañado de un sonido vocal libre.",
          "El grupo completo debe replicar tu sonido y gesto inmediatamente al unísono.",
          "Pasa el turno con la mirada a otro participante para que proponga su eco."
        ],
        alternatives: "Juego silencioso donde todos siguen los movimientos de un líder corporal."
      },
      {
        action: "Cambia el foco del pensamiento analítico al plano somático, despertando el canal sensorial.",
        avoid: "Tratar de racionalizar o reclamar al grupo por su falta de participación.",
        dynamic: "Fricción y Calor Somático",
        duration: 5,
        instructions: [
          "Pónganse de pie con las rodillas desbloqueadas.",
          "Froten las palmas de las manos con velocidad hasta sentir calor intenso.",
          "Lleven las manos tibias al pecho y respiren profundo tres veces.",
          "Den golpecitos suaves sobre brazos y piernas para despertar la propiocepción."
        ],
        alternatives: "Caminar por la sala tocando tres superficies de diferente textura en silencio."
      }
    ]
  },
  'llanto o necesidad de contención': {
    situationName: "Catarsis emocional o llanto",
    variations: [
      {
        action: "Sostén con respiración estable, silencio y presencia física respetuosa.",
        avoid: "Interrumpir con pañuelos apurados, detener música o forzar abrazos.",
        dynamic: "Manta y Anclaje Somático",
        duration: 10,
        instructions: [
          "Coloca una manta sobre los hombros del participante como límite seguro.",
          "Indícale apoyar las palmas descalzas directo sobre el piso.",
          "Sincroniza tu exhalación audible con la suya paso a paso.",
          "Guía al grupo a exhalar juntos para sostener el espacio."
        ],
        alternatives: "Acompañamiento individual fuera de la sala por co-facilitador."
      },
      {
        action: "Crea un contenedor seguro manteniendo la calma y regulando tu propio sistema nervioso.",
        avoid: "Intentar 'reparar' el dolor de inmediato, hacer preguntas invasivas o cortar el llanto.",
        dynamic: "Sostén del Círculo Dorado",
        duration: 10,
        instructions: [
          "Mantén una distancia física respetuosa y asienta tu postura corporal.",
          "Ofrece un vaso de agua fresca colocándolo cerca, sin interrumpir.",
          "Guía a los demás participantes a poner una mano sobre su propio corazón.",
          "Sostengan el silencio permitiendo que la energía emocional drene libremente."
        ],
        alternatives: "Entonar un mantra suave o hacer sonar un cuenco de cuarzo para estabilizar la vibración."
      },
      {
        action: "Permite la liberación fisiológica natural del llanto manteniéndote como un testigo amoroso y centrado.",
        avoid: "Abrazar con fuerza restrictiva, dar explicaciones mentales o pedir explicaciones racionales.",
        dynamic: "Abrazo Terrenal de Sostén",
        duration: 10,
        instructions: [
          "Pide permiso con la mirada y coloca una mano suave en la parte alta de su espalda.",
          "Invítale a respirar imaginando que el aire sale a través de las plantas de sus pies.",
          "Recuérdale con voz suave y firme: 'Estás a salvo, puedes soltar todo aquí'.",
          "Permite que el llanto disminuya de forma natural a su propio ritmo."
        ],
        alternatives: "Declarar una pausa de silencio e integración de 5 minutos para toda la sala con música instrumental."
      }
    ]
  },
  'baja energía': {
    situationName: "Baja energía o somnolencia",
    variations: [
      {
        action: "Activa el sistema simpático con sacudidas, respiración y aromas cítricos.",
        avoid: "Seguir sentados en cojines blandos o dar explicaciones teóricas largas.",
        dynamic: "Sacudida y Suspiro de León",
        duration: 5,
        instructions: [
          "Todos de pie en círculo, pies separados al ancho de hombros.",
          "Sacudir brazo derecho, izquierdo, pierna derecha, izquierdo y tronco.",
          "Inhalar profundo levantando brazos por la nariz.",
          "Exhalar abriendo la boca y sacando lengua con rugido sonoro '¡JA!'",
          "Esparcir bruma cítrica o de menta en el salón."
        ],
        alternatives: "Caminata rápida en el exterior respirando aire fresco 3 minutos."
      },
      {
        action: "Eleva la energía vital (Prana) mediante una respiración rítmica activa y estiramiento corporal dinámico.",
        avoid: "Mantener un tono de voz monótono o prolongar posturas corporales pasivas y cerradas.",
        dynamic: "Respiración del Sol Poniente",
        duration: 5,
        instructions: [
          "Pónganse de pie con las rodillas ligeramente flexionadas.",
          "Al inhalar profundo por la nariz, eleven los brazos estirando los dedos.",
          "Al exhalar con fuerza por la boca, bajen los codos al costado con un sonido '¡HA!'.",
          "Repitan este ciclo dinámico 15 veces a ritmo constante y sacudan el cuerpo al terminar."
        ],
        alternatives: "Dinámica breve de pasos cruzados o marchar en el sitio siguiendo el ritmo de un tambor."
      },
      {
        action: "Despierta el flujo sanguíneo y la propiocepción mediante automasaje rápido y estiramiento expansivo.",
        avoid: "Arropar al grupo con mantas cálidas o continuar leyendo textos largos sentado.",
        dynamic: "Despertar del Guerrero Alegre",
        duration: 5,
        instructions: [
          "Pónganse de pie y estiren los brazos hacia el techo lo máximo posible.",
          "Den suaves palmaditas rítmicas por todo el cuerpo: brazos, pecho, abdomen y piernas.",
          "Realicen tres saltos suaves despegando los talones del suelo.",
          "Inhalen profundo y suelten una exhalación liberadora con un bostezo ruidoso."
        ],
        alternatives: "Salir al exterior y recibir luz solar directa o respirar aire fresco durante 3 minutos."
      }
    ]
  },
  'conflicto grupal': {
    situationName: "Conflicto o tensión grupal",
    variations: [
      {
        action: "Neutraliza el contenedor enfocando la atención en el centro neutral.",
        avoid: "Tomar bandos, buscar culpables o permitir debates directos.",
        dynamic: "Anclaje de la Vela Central",
        duration: 10,
        instructions: [
          "Silencio inmediato observando fijamente la llama de la vela del altar.",
          "Mano derecha al pecho sintiendo los propios latidos cardíacos.",
          "Pregunta al grupo: '¿Qué defiendo hoy que me aleja de mi paz?'",
          "Compartir individual en una palabra el sentir del momento."
        ],
        alternatives: "Pausa técnica de té y diálogo privado con los implicados."
      },
      {
        action: "Restaura el respeto relacional invitando a la autorreflexión honesta y el silencio interior.",
        avoid: "Dar discursos moralistas, fingir que no pasa nada o confrontar de forma agresiva.",
        dynamic: "El Altar del Humilde Sostén",
        duration: 10,
        instructions: [
          "Reúnanse en el círculo principal y coloquen un papel en blanco en el centro.",
          "Respiren al unísono enfocando la respiración en el centro del pecho.",
          "Invita a reflexionar en silencio: '¿Qué proyección o espejo mío estoy viendo en el otro?'",
          "Escriban brevemente su propia respuesta en un papelito personal para guardarlo."
        ],
        alternatives: "Cambiar los cojines y posiciones de sentado para reconfigurar la corriente de energía visual."
      },
      {
        action: "Drena la hostilidad relacional devolviendo la responsabilidad a la auto-observación de sensaciones.",
        avoid: "Discutir las diferencias de opinión a nivel mental o racionalizar el conflicto en el momento.",
        dynamic: "Círculo del Testigo Corporal",
        duration: 10,
        instructions: [
          "Pide cerrar los ojos y observar el mapa de sensaciones físicas.",
          "Pasen un objeto neutro; el que lo tiene comparte solo su sensación somática (ej: 'tensión', 'frío').",
          "Está prohibido mencionar nombres, hechos externos o culpas.",
          "Agradece cada compartir físico con una inhalación colectiva."
        ],
        alternatives: "Tomar una pausa de 10 minutos para caminar descalzos o respirar en la naturaleza en silencio."
      }
    ]
  },
  'retraso en la agenda': {
    situationName: "Retraso en la agenda",
    variations: [
      {
        action: "Sintetizar teoría e introducciones. Protege la práctica y el cierre.",
        avoid: "Acortar apresuradamente las reflexiones o la integración de los alumnos.",
        dynamic: "Fusión Somática Express",
        duration: 15,
        instructions: [
          "Integra la activación física inicial y la meditación en un solo bloque.",
          "Informa con calma: 'Fluyendo con el contenedor, priorizaremos la vivencia.'"
        ],
        alternatives: "Entregar los marcos teóricos impresos al final como lectura personal."
      },
      {
        action: "Optimiza los tiempos unificando las dinámicas de movimiento y de teoría en una sola experiencia interactiva.",
        avoid: "Transmitir estrés, mirar el reloj constantemente o apresurar el paso de forma ansiosa.",
        dynamic: "Caminata Contemplativa Combinada",
        duration: 15,
        instructions: [
          "Expón los conceptos esenciales mientras los participantes caminan suavemente por la sala.",
          "Intercala la caminata con preguntas directas para reflexionar en movimiento.",
          "Une la meditación activa con el marco conceptual para ahorrar tiempo."
        ],
        alternatives: "Extender la sesión de cierre un máximo de 10 minutos, únicamente tras el consenso claro del grupo."
      },
      {
        action: "Condensa al máximo las explicaciones conceptuales y prioriza el tiempo del ejercicio vivencial.",
        avoid: "Recortar el espacio sagrado de la ronda de integración o del descanso principal.",
        dynamic: "Anclaje Teórico de Tres Minutos",
        duration: 15,
        instructions: [
          "Resume el fundamento teórico en una frase corta y esencial.",
          "Pasen de inmediato a la práctica somática guiando los movimientos de forma clara.",
          "Mantén el ritmo fluido, sin prisas pero sin pausas, guiando con seguridad."
        ],
        alternatives: "Grabar un mensaje de voz explicativo posterior para el grupo o enviar un PDF con el contenido teórico."
      }
    ]
  },
  'falta de materiales': {
    situationName: "Falta de materiales o suministros",
    variations: [
      {
        action: "Rediseña la actividad hacia dinámicas somáticas o recursos naturales.",
        avoid: "Mostrar desconcierto, enojo o cancelar abruptamente.",
        dynamic: "Visualización Somática Guiada",
        duration: 15,
        instructions: [
          "Reemplaza el collage físico guiando una visualización de ojos cerrados.",
          "Pide crear su mapa o lienzo mentalmente con máximo detalle.",
          "Hacer ronda corta para describir la creación interna del alma."
        ],
        alternatives: "Utilizar hojas, piedras y ramas recolectadas afuera como símbolos."
      },
      {
        action: "Utiliza el cuerpo físico y la voz de los participantes como el único y más valioso material creativo.",
        avoid: "Pedir disculpas de manera excesiva o detener el flujo del retiro buscando materiales.",
        dynamic: "La Escultura Humana Viva",
        duration: 15,
        instructions: [
          "Dividan el grupo en pequeños equipos de tres personas.",
          "Pide que representen un concepto emocional modelando sus cuerpos como arcilla viviente.",
          "Presenten las esculturas estáticas al resto del círculo en silencio.",
          "Compartan brevemente cómo se sintió sostener la postura y presenciar al compañero."
        ],
        alternatives: "Utilizar objetos cotidianos que cada participante tenga consigo como amuletos en la dinámica."
      },
      {
        action: "Transforma la escasez de materiales en una valiosa enseñanza de minimalismo somático y conexión.",
        avoid: "Hacer notar la falta de materiales como un error del equipo organizador.",
        dynamic: "El Lienzo Invisible en la Espalda",
        duration: 15,
        instructions: [
          "Reúnanse en parejas, uno detrás del otro.",
          "El participante de atrás dibuja símbolos o palabras con el dedo en la espalda del otro de manera muy suave.",
          "El participante receptor se enfoca puramente en la sensación somática para intuir el dibujo.",
          "Intercambien roles y abran un espacio breve de diálogo sobre el tacto consciente."
        ],
        alternatives: "Reemplazar los tableros de dibujo por narradores orales que expresen sus visiones creativas."
      }
    ]
  },
  'poco tiempo disponible': {
    situationName: "Poco tiempo disponible",
    variations: [
      {
        action: "Ve directo a la esencia vivencial en un paso express.",
        avoid: "Apresurar dinámicas largas provocando estrés.",
        dynamic: "Pulso de Gratitud de una Palabra",
        duration: 3,
        instructions: [
          "Tomarse de las manos en círculo con ojos cerrados.",
          "Respirar al unísono tres veces de manera consciente.",
          "Decir una sola palabra que resuma el sentir actual, uno a uno."
        ],
        alternatives: "Dividir el grupo en parejas para una síntesis veloz de 1 minuto."
      },
      {
        action: "Simplifica al mínimo los rituales de cierre reduciendo el uso de explicaciones racionales.",
        avoid: "Terminar la sesión de forma abrupta o fría sin una exhalación final colectiva.",
        dynamic: "La Mirada Resonante del Corazón",
        duration: 3,
        instructions: [
          "Formen un círculo de pie y miren a los ojos a cada compañero con una sonrisa.",
          "Lleven ambas manos al pecho sintiendo la sintonía grupal.",
          "Inhalen profundo y suelten el aire con un largo suspiro audible de agradecimiento."
        ],
        alternatives: "Invitar a escribir una palabra clave en un papel adhesivo para pegarlo en la puerta de salida."
      },
      {
        action: "Cierra el contenedor energético con un ritual somático breve de integración y arraigo.",
        avoid: "Hacer rondas de palabra largas que dilaten la salida acordada.",
        dynamic: "Anclaje de Tres Respiraciones",
        duration: 3,
        instructions: [
          "Cierren los ojos de pie o sentados en círculo.",
          "Primera respiración profunda por uno mismo y su propio esfuerzo.",
          "Segunda respiración por los compañeros de viaje y el sostén mutuo.",
          "Tercera respiración por la tierra y el entorno. Abran los ojos compartiendo un gesto de reverencia."
        ],
        alternatives: "Realizar un zumbido colectivo de exhalación (sonido 'OM' o humm) de 1 minuto."
      }
    ]
  }
};

/**
 * Normalizes keyword searches to map user's message to one of our 8 situations.
 */
export function getAssistantFallbackReply(message: string): string {
  const query = message.toLowerCase();
  
  let key = "";
  if (query.includes("participaci") || query.includes("no habla") || query.includes("callad")) {
    if (query.includes("callad") || query.includes("silencio")) {
      key = "grupo callado";
    } else {
      key = "baja participación";
    }
  } else if (query.includes("llor") || query.includes("crisis") || query.includes("emocion") || query.includes("contenc") || query.includes("catars")) {
    key = "llanto o necesidad de contención";
  } else if (query.includes("sueño") || query.includes("cansad") || query.includes("baja energ") || query.includes("pesadez") || query.includes("fatiga")) {
    key = "baja energía";
  } else if (query.includes("conflict") || query.includes("tens") || query.includes("pelea") || query.includes("enoj")) {
    key = "conflicto grupal";
  } else if (query.includes("retraso") || query.includes("agenda") || query.includes("tarde") || query.includes("tiempo")) {
    if (query.includes("poco tiempo") || query.includes("reducido") || query.includes("acort")) {
      key = "poco tiempo disponible";
    } else {
      key = "retraso en la agenda";
    }
  } else if (query.includes("material") || query.includes("suministro") || query.includes("falta")) {
    key = "falta de materiales";
  }

  // If a specific situation is matched, return the highly-structured response with a pseudo-random variation
  if (key && CONTINGENCY_DATABASE[key]) {
    const entry = CONTINGENCY_DATABASE[key];
    // Pick one of the variations pseudo-randomly
    const varIdx = Math.floor(Math.random() * entry.variations.length);
    const data = entry.variations[varIdx];
    
    return `### 🛡️ Guía de Contingencia Experta: ${entry.situationName} (Variante ${varIdx + 1}/3)

Como tu mentor de Retiro Studio, aquí tienes una intervención inmediata basada en psicología transpersonal y facilitación corporal:

#### ⚡ ACCIÓN INMEDIATA:
${data.action}

#### ❌ QUÉ EVITAR ABSOLUTAMENTE:
${data.avoid}

#### 🌸 DINÁMICA DE REEMPLAZO RECOMENDADA:
**${data.dynamic}** (${data.duration} minutos)

**Instrucciones paso a paso para el facilitador:**
${data.instructions.map((inst, index) => `${index + 1}. ${inst}`).join("\n")}

#### 🔄 ALTERNATIVAS ADICIONALES:
${data.alternatives}

---
*Esta respuesta fue elaborada al 100% por el sistema autónomo de seguridad y contingencia de Retiro Studio (libre de IA).*`;
  }

  // General fallback response
  return `### 🕯️ Consejos de Facilitación de Retiros (Modo Autónomo)

Hola. En este momento el servidor de Gemini no está disponible o la consulta no corresponde a una de las contingencias tipificadas. Recuerda siempre los tres pilares del facilitador experto:

1. **La respiración del facilitador regula al grupo**: Si sientes tensión o dispersión, disminuye la velocidad de tu discurso y respira inflando el abdomen audiblemente. El grupo te imitará inconscientemente.
2. **El cuerpo guarda la resistencia**: Cuando las palabras fallen, pon al grupo a sacudirse libremente, a caminar descalzo o a suspirar al unísono.
3. **El círculo es soberano**: No asumas la responsabilidad de "arreglar" todo. Pon los imprevistos frente a la vela del altar y permite que el contenedor del grupo contenga y asimile lo que surja de forma colectiva.`;
}
