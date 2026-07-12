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
    c.toLowerCase().includes("fisica") ||
    c.toLowerCase().includes("lesión") ||
    c.toLowerCase().includes("lesion")
  );
  if (hasMobilityRestriction && !dynamic.mobilityFriendly) {
    return false;
  }

  // 2. Physical and Emotional Intensity Exclusions
  const reqIntensity = (formData.emotionalIntensity || '').toLowerCase();
  if (reqIntensity === "suave") {
    if (dynamic.physicalIntensity === "alta" || dynamic.emotionalIntensity === "profunda") {
      return false;
    }
  }

  // 3. No Physical Contact Constraints
  const hasNoContact = considerations.some((c: string) => 
    c.toLowerCase().includes("sin contacto") || 
    c.toLowerCase().includes("evitar contacto") ||
    c.toLowerCase().includes("no contacto")
  );
  if (hasNoContact && dynamic.requiresContact) {
    return false;
  }

  // Experience Level Exclusions
  const exp = (formData.experienceLevel || '').toLowerCase();
  if (exp) {
    if (exp.includes('principiante')) {
      if (!dynamic.experienceLevels.some(e => e === 'principiante' || e === 'todos')) {
        return false;
      }
    } else if (exp.includes('intermedio')) {
      if (!dynamic.experienceLevels.some(e => e === 'intermedio' || e === 'todos')) {
        return false;
      }
    } else if (exp.includes('avanzado')) {
      if (!dynamic.experienceLevels.some(e => e === 'avanzado' || e === 'todos')) {
        return false;
      }
    }
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

  const considerations = Array.isArray(formData.specialConsiderations)
    ? formData.specialConsiderations
    : (formData.specialConsiderations ? [formData.specialConsiderations] : []);

  const dId = dynamic.id;
  const title = dynamic.title.toLowerCase();
  const intention = dynamic.intention.toLowerCase();
  const description = dynamic.description.toLowerCase();

  // 1. Goal Coincidence
  if (formData.goal) {
    const goalLower = formData.goal.toLowerCase();
    
    // Check key terms
    const keywords = goalLower.split(/\s+/).filter((w: string) => w.length > 4);
    keywords.forEach((word: string) => {
      if (intention.includes(word)) score += 3;
      if (description.includes(word)) score += 1;
    });

    // Handle specific connection, listening, or trust goals
    if (goalLower.includes("conexión") || goalLower.includes("conexion") || goalLower.includes("confianza") || goalLower.includes("escucha")) {
      if (dynamic.module === "Conexión Grupal" || dynamic.phases.includes("conexion")) {
        score += 8;
      }
      if (goalLower.includes("escucha") && dId === "dynamic_014") {
        score += 10; // Extra boost for Active Listening
      }
      if (goalLower.includes("confianza")) {
        if (dId === "dynamic_011" || dId === "dynamic_013" || dId === "dynamic_016" || dId === "dynamic_019" || dId === "dynamic_020") {
          score += 6;
        }
      }
    }
    if (goalLower.includes("vulnerabilidad")) {
      if (dynamic.emotionalIntensity === "profunda") {
        score += 8;
      }
      if (dId === "dynamic_020" || dId === "dynamic_018" || dId === "dynamic_011") {
        score += 10; // Extra boost for Deep Questions, Me Too, and Story Weaving
      }
    }
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
  if (phase === 'Conexión' && (dynamic.module.toLowerCase().includes('conexión') || dynamic.module.toLowerCase().includes('conexion'))) {
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

  // 5. Group Relation / Familiarity
  const relation = (formData.groupRelation || '').toLowerCase();
  if (relation.includes("no se conocen") || relation.includes("nuevo")) {
    // If they don't know each other, prioritize presentation and icebreaker-like connection dynamics
    if (dId === "dynamic_012" || dId === "dynamic_001") {
      score += 12; // Mi Nombre, Mi Energía and Círculo del Nombre is fantastic for new groups!
    }
    if (dynamic.module.includes("Apertura")) {
      score += 10;
    }
    // Penalize very deep vulnerability questions for new groups
    if (dynamic.emotionalIntensity === "profunda" || dId === "dynamic_020") {
      score -= 15;
    }
  } else if (relation.includes("ya se conocen") || relation.includes("consolidado") || relation.includes("confianza")) {
    // If they are a consolidated group, prioritize deeper trust/listening connection dynamics
    if (dId === "dynamic_014" || dId === "dynamic_011" || dId === "dynamic_019" || dId === "dynamic_020" || dId === "dynamic_018") {
      score += 10;
    }
  }

  // 6. Materials Constraints
  const hasNoMaterials = considerations.some((c: string) => 
    c.toLowerCase().includes("sin materiales") || 
    c.toLowerCase().includes("no materiales") ||
    c.toLowerCase().includes("sin materiales disponibles")
  );

  if (hasNoMaterials) {
    if (dynamic.materials.length === 0) {
      score += 15; // Give high priority to material-free activities
    } else {
      score -= 25; // Heavily penalize activities requiring cardboards, envelopes, yarn, etc.
    }
  }

  return score;
}
