import type { DynamicType } from './dynamics/types.js';

/**
 * Maps a modern, highly-detailed DynamicType object to the legacy Dynamic structure,
 * ensuring backward compatibility with the frontend, the UI, and the non-AI generator.
 */
export function mapDynamicToLegacy(d: DynamicType): any {
  // Map category based on the dynamic's characteristics and module
  let category: 'Meditación' | 'Icebreaker' | 'Creatividad' | 'Silencio' | 'Cuerpo' | 'Liberación' | 'Integración' | 'Conexión' = 'Conexión';
  const modLower = d.module.toLowerCase();
  
  if (modLower.includes('apertura') || modLower.includes('bienvenida')) {
    category = 'Icebreaker';
  } else if (modLower.includes('conexión') || modLower.includes('conexion')) {
    category = 'Conexión';
  } else if (modLower.includes('sanación') || modLower.includes('sanacion')) {
    category = 'Liberación';
  } else if (modLower.includes('cuerpo') || modLower.includes('movimiento')) {
    category = 'Cuerpo';
  } else if (modLower.includes('introspección') || modLower.includes('introspeccion') || modLower.includes('meditación')) {
    category = 'Meditación';
  } else if (modLower.includes('creatividad')) {
    category = 'Creatividad';
  } else if (modLower.includes('integración') || modLower.includes('integracion')) {
    category = 'Integración';
  } else if (modLower.includes('cierre')) {
    category = 'Conexión';
  }

  // Override specifically for known dynamics if necessary
  if (d.title.toLowerCase().includes('respirar') || d.title.toLowerCase().includes('meditación')) {
    category = 'Meditación';
  } else if (d.title.toLowerCase().includes('caminar')) {
    category = 'Silencio';
  }

  // Map intensity
  let intensity: 'Baja' | 'Media' | 'Alta' = 'Baja';
  if (d.emotionalIntensity === 'profunda' || d.physicalIntensity === 'alta' || d.energyLevel === 'alta') {
    intensity = 'Alta';
  } else if (d.emotionalIntensity === 'moderada' || d.physicalIntensity === 'media' || d.energyLevel === 'media') {
    intensity = 'Media';
  }

  // Fallback preparation steps
  const preparationStep = d.steps.find(s => 
    s.title.toLowerCase().includes('preparación') || 
    s.title.toLowerCase().includes('prepara')
  );
  const preparation = preparationStep ? preparationStep.description : 'Asegurar que el espacio esté limpio, ventilado y propicio para el silencio.';

  return {
    id: d.id,
    name: d.title,
    category: category,
    duration: d.durationMax || d.durationMin || 20,
    intensity: intensity,
    objective: d.intention,
    whenToUse: d.description,
    whenToAvoid: d.avoidWhen || 'No se reportan contraindicaciones particulares en el documento original.',
    materials: d.materials.length > 0 ? d.materials : ['Ninguno especial'],
    preparation: preparation,
    steps: d.steps.map(s => `Paso ${s.number} - ${s.title} (${s.duration ? `${s.duration} min` : 'sin límite'}): ${s.description}`),
    script: d.facilitatorScript || '',
    reflectionQuestions: d.reflectionQuestions.length > 0 ? d.reflectionQuestions : [],
    variations: d.suggestedAdaptation ? [d.suggestedAdaptation] : (d.noPhysicalContactVersion ? [d.noPhysicalContactVersion] : []),
    isAiSuggested: false
  };
}

/**
 * Checks if a given dynamic is compatible with the retreat rules and constraints.
 */
export function isDynamicSuitable(dynamic: DynamicType, formData: any): boolean {
  const considerations = Array.isArray(formData.specialConsiderations)
    ? formData.specialConsiderations
    : (formData.specialConsiderations ? [formData.specialConsiderations] : []);

  // 1. Physical and Mobility Exclusions
  const hasMobilityRestriction = considerations.some((c: string) => 
    c.toLowerCase().includes("movilidad") || 
    c.toLowerCase().includes("física") || 
    c.toLowerCase().includes("fisica")
  );
  if (hasMobilityRestriction && !dynamic.mobilityFriendly) {
    return false;
  }

  // 2. Physical Intensity Exclusions
  if (formData.emotionalIntensity === "Suave" && dynamic.physicalIntensity === "alta") {
    return false;
  }

  // 3. No Physical Contact Constraints
  const hasNoContact = considerations.some((c: string) => 
    c.toLowerCase().includes("sin contacto") || 
    c.toLowerCase().includes("evitar contacto")
  );
  if (hasNoContact && dynamic.requiresContact && !dynamic.noPhysicalContactVersion && !dynamic.suggestedAdaptation) {
    return false;
  }

  // 4. Participant Count Constraints
  const count = Number(formData.participantsCount);
  if (!isNaN(count) && count > 0) {
    if (dynamic.minimumParticipants && count < dynamic.minimumParticipants) {
      return false;
    }
    if (dynamic.maximumParticipants && count > dynamic.maximumParticipants) {
      return false;
    }
  }

  // 5. Facilitator specialization check
  const requiresSpecialized = dynamic.requiresSpecializedFacilitator;
  const hasSpecializedFacilitator = formData.hasSpecializedFacilitator === true || formData.hasSpecializedFacilitator === 'true';
  if (requiresSpecialized && !hasSpecializedFacilitator) {
    // If specialized facilitator is required but not present, check if we can still use it (or strict exclude)
    // For safety, let's disallow if the risk level is high
    if (dynamic.riskLevel === 'alto') {
      return false;
    }
  }

  return true;
}

/**
 * Scores a dynamic for scheduling recommendations.
 * Uses the rich metadata in DynamicType to produce a context-aware matching score.
 */
export function scoreDynamic(
  dynamic: DynamicType,
  formData: any,
  phase: string
): number {
  if (!isDynamicSuitable(dynamic, formData)) {
    return -100; // Incompatible
  }

  let score = 0;

  // 1. Goal Coincidence
  if (formData.goal) {
    const goalLower = formData.goal.toLowerCase();
    const intentionLower = dynamic.intention.toLowerCase();
    const descriptionLower = dynamic.description.toLowerCase();
    
    // Check key terms
    const keywords = goalLower.split(/\s+/).filter((w: string) => w.length > 4);
    keywords.forEach((word: string) => {
      if (intentionLower.includes(word)) score += 2;
      if (descriptionLower.includes(word)) score += 1;
    });
  }

  // 2. Location Alignment
  const loc = (formData.locationType || '').toLowerCase();
  const isOutdoor = loc.includes('bosque') || loc.includes('naturaleza') || loc.includes('aire libre') || loc.includes('exterior') || loc.includes('abierto');
  const isIndoor = loc.includes('salón') || loc.includes('interior') || loc.includes('hotel') || loc.includes('cerrado');
  
  if (isOutdoor && dynamic.locations.some(l => l === 'exterior' || l === 'naturaleza')) {
    score += 5;
  }
  if (isIndoor && dynamic.locations.some(l => l === 'interior')) {
    score += 3;
  }

  // 3. Recommended before/after sequencing bonus
  if (phase === 'Apertura' && (dynamic.module.toLowerCase().includes('apertura') || dynamic.module.toLowerCase().includes('bienvenida'))) {
    score += 15;
  }

  // 4. Experience Level matching
  const exp = (formData.experienceLevel || '').toLowerCase();
  if (exp.includes('principiante') && dynamic.experienceLevels.some(e => e === 'principiante' || e === 'todos')) {
    score += 4;
  } else if (exp.includes('intermedio') && dynamic.experienceLevels.some(e => e === 'intermedio' || e === 'todos')) {
    score += 4;
  } else if (exp.includes('avanzado') && dynamic.experienceLevels.some(e => e === 'avanzado' || e === 'todos')) {
    score += 4;
  }

  return score;
}
