import { OFFICIAL_DYNAMICS } from '../shared/dynamics/index.js';
import { isDynamicSuitable, scoreDynamic } from '../shared/retreatRuleEngine.js';

export default function handler(req: any, res: any) {
  // Reject non-GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      error: `Method ${req.method} not allowed`
    });
  }

  const errors: string[] = [];
  const invalidDynamics: string[] = [];
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];

  // Allowed values for enums
  const allowedEnergyLevels = new Set(["baja", "media", "alta"]);
  const allowedEmotionalIntensities = new Set(["suave", "moderada", "profunda"]);
  const allowedPhysicalIntensities = new Set(["baja", "media", "alta"]);
  const allowedRiskLevels = new Set(["bajo", "medio", "alto"]);
  const allowedPhases = new Set(["apertura", "conexion", "sanacion", "cuerpo", "introspeccion", "creatividad", "integracion", "cierre"]);
  const allowedLocations = new Set(["interior", "exterior", "naturaleza"]);
  const allowedAgeGroups = new Set(["todos", "niños", "jovenes", "adultos", "adultos_mayores"]);
  const allowedExperienceLevels = new Set(["principiante", "intermedio", "avanzado", "todos"]);
  const allowedParticipantFormats = new Set(["circulo", "parejas", "individual", "grupos_pequeños", "grupo_completo"]);
  const allowedMusicCategories = new Set(["Bienvenida", "Apertura", "Meditación", "Respiración", "Conexión", "Reflexión", "Liberación", "Movimiento", "Gratitud", "Cierre"]);

  // 1. Confirm exports 10 elements
  const totalDynamics = OFFICIAL_DYNAMICS.length;

  OFFICIAL_DYNAMICS.forEach((d) => {
    const dErrors: string[] = [];

    // ID Checks
    if (!d.id) {
      dErrors.push("Missing ID");
    } else {
      if (seenIds.has(d.id)) {
        duplicateIds.push(d.id);
        dErrors.push(`Duplicate ID: ${d.id}`);
      }
      seenIds.add(d.id);
    }

    // Title Checks
    if (!d.title || d.title.trim() === "") {
      dErrors.push("Empty title");
    }

    // Durations Checks
    if (typeof d.durationMin !== "number" || d.durationMin <= 0) {
      dErrors.push(`Invalid durationMin: ${d.durationMin}`);
    }
    if (typeof d.durationMax !== "number" || d.durationMax <= 0) {
      dErrors.push(`Invalid durationMax: ${d.durationMax}`);
    }
    if (d.durationMin > d.durationMax) {
      dErrors.push(`durationMin (${d.durationMin}) cannot be greater than durationMax (${d.durationMax})`);
    }

    // Enum validations
    if (d.energyLevel && !allowedEnergyLevels.has(d.energyLevel)) {
      dErrors.push(`Invalid energyLevel: "${d.energyLevel}"`);
    }
    if (d.emotionalIntensity && !allowedEmotionalIntensities.has(d.emotionalIntensity)) {
      dErrors.push(`Invalid emotionalIntensity: "${d.emotionalIntensity}"`);
    }
    if (d.physicalIntensity && !allowedPhysicalIntensities.has(d.physicalIntensity)) {
      dErrors.push(`Invalid physicalIntensity: "${d.physicalIntensity}"`);
    }
    if (d.riskLevel && !allowedRiskLevels.has(d.riskLevel)) {
      dErrors.push(`Invalid riskLevel: "${d.riskLevel}"`);
    }
    if (d.participantFormat && !allowedParticipantFormats.has(d.participantFormat)) {
      dErrors.push(`Invalid participantFormat: "${d.participantFormat}"`);
    }
    if (d.musicCategory && !allowedMusicCategories.has(d.musicCategory)) {
      dErrors.push(`Invalid musicCategory: "${d.musicCategory}"`);
    }

    // List enums validation
    d.phases.forEach(p => {
      if (!allowedPhases.has(p)) dErrors.push(`Invalid phase: "${p}"`);
    });
    d.locations.forEach(l => {
      if (!allowedLocations.has(l)) dErrors.push(`Invalid location: "${l}"`);
    });
    d.ageGroups.forEach(ag => {
      if (!allowedAgeGroups.has(ag)) dErrors.push(`Invalid ageGroup: "${ag}"`);
    });
    d.experienceLevels.forEach(el => {
      if (!allowedExperienceLevels.has(el)) dErrors.push(`Invalid experienceLevel: "${el}"`);
    });

    // Steps order check
    if (!Array.isArray(d.steps) || d.steps.length === 0) {
      dErrors.push("Steps array is empty or invalid");
    } else {
      let expectedNum = 1;
      d.steps.forEach((step, idx) => {
        if (step.number !== expectedNum) {
          dErrors.push(`Step at index ${idx} has incorrect number ${step.number}, expected ${expectedNum}`);
        }
        if (!step.title || step.title.trim() === "") {
          dErrors.push(`Step ${step.number} has empty title`);
        }
        if (!step.description || step.description.trim() === "") {
          dErrors.push(`Step ${step.number} has empty description`);
        }
        expectedNum++;
      });
    }

    // Mandatory properties presence checks
    const mandatoryProps = [
      "intention", "description", "materials", "facilitatorRecommendations",
      "reflectionQuestions", "objectives", "expectedResults", "requiresContact",
      "requiresWriting", "requiresMovement", "mobilityFriendly", "canBeDoneSeated",
      "recommendedBefore", "recommendedAfter", "active"
    ];

    mandatoryProps.forEach(prop => {
      if ((d as any)[prop] === undefined) {
        dErrors.push(`Mandatory property "${prop}" is undefined`);
      }
    });

    if (dErrors.length > 0) {
      invalidDynamics.push(`${d.id || "Unknown"}: ${dErrors.join(" | ")}`);
    }
  });

  // Determine first and last ID from the sorted list of seenIds
  const idsList = Array.from(seenIds).sort();
  const firstId = idsList[0] || null;
  const lastId = idsList[idsList.length - 1] || null;

  // RULE ENGINE TEST CASES Execution
  const cases: Record<string, any> = {};

  // CASO 1: Grupo nuevo, 20 personas, principiantes, intensidad suave.
  const case1Data = {
    participantsCount: 20,
    experienceLevel: "principiante",
    emotionalIntensity: "Suave",
    groupRelation: "nuevo",
    specialConsiderations: ["Sin contacto físico"]
  };
  cases.case1 = runCaseSimulation(case1Data, "Conexión");

  // CASO 2: Grupo consolidado, objetivo de escucha y confianza, intensidad moderada.
  const case2Data = {
    participantsCount: 15,
    groupRelation: "consolidado",
    goal: "escucha y confianza",
    emotionalIntensity: "moderada"
  };
  cases.case2 = runCaseSimulation(case2Data, "Conexión");

  // CASO 3: Sin contacto físico.
  const case3Data = {
    specialConsiderations: ["Sin contacto físico"]
  };
  cases.case3 = runCaseSimulation(case3Data, "Conexión");

  // CASO 4: Objetivo de vulnerabilidad profunda, grupo con confianza, intensidad profunda.
  const case4Data = {
    groupRelation: "confianza",
    goal: "vulnerabilidad profunda",
    emotionalIntensity: "profunda",
    hasSpecializedFacilitator: true,
    experienceLevel: "avanzado"
  };
  cases.case4 = runCaseSimulation(case4Data, "Conexión");

  // CASO 5: Sin materiales disponibles.
  const case5Data = {
    specialConsiderations: ["Sin materiales disponibles"]
  };
  cases.case5 = runCaseSimulation(case5Data, "Conexión");

  const success = invalidDynamics.length === 0 && duplicateIds.length === 0 && totalDynamics === 80;

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    success,
    totalDynamics,
    firstId,
    lastId,
    duplicateIds,
    invalidDynamics,
    source: "shared/dynamics",
    testCases: cases
  });
}

function runCaseSimulation(formData: any, phase: string) {
  const selected: any[] = [];
  const excluded: any[] = [];

  OFFICIAL_DYNAMICS.forEach(d => {
    const isSuitable = isDynamicSuitable(d, formData);
    const score = scoreDynamic(d, formData, phase);

    if (isSuitable && score >= 0) {
      selected.push({
        id: d.id,
        title: d.title,
        score,
        reason: getSelectionReason(d, formData, phase)
      });
    } else {
      excluded.push({
        id: d.id,
        title: d.title,
        reason: getExclusionReason(d, formData, phase)
      });
    }
  });

  // Sort selected descending by score
  selected.sort((a, b) => b.score - a.score);

  return {
    selected,
    excluded
  };
}

function getSelectionReason(d: any, formData: any, phase: string): string {
  const reasons: string[] = ["Cumple con todos los requisitos de idoneidad."];
  
  // Specific checks
  if (phase === "Apertura" && d.phases.includes("apertura")) {
    reasons.push("Bonus por fase de Apertura.");
  }
  if (formData.goal) {
    const goalLower = formData.goal.toLowerCase();
    if (goalLower.includes("cuerpo") && d.requiresMovement) {
      reasons.push("Alineado con el objetivo corporal.");
    }
    if (goalLower.includes("presencia") && d.intention.toLowerCase().includes("presencia")) {
      reasons.push("Coincidencia semántica con 'presencia' en la intención.");
    }
  }
  if (formData.specialConsiderations && formData.specialConsiderations.includes("Sin materiales disponibles")) {
    if (d.materials.length === 0) {
      reasons.push("Ideal al no requerir materiales.");
    }
  }
  return reasons.join(" ");
}

function getExclusionReason(d: any, formData: any, phase: string): string {
  const considerations = formData.specialConsiderations || [];
  
  if (formData.emotionalIntensity === "Suave" && d.emotionalIntensity === "profunda") {
    return "Excluido por intensidad emocional profunda (retorneo suave solicitado).";
  }
  if (formData.emotionalIntensity === "Suave" && d.physicalIntensity === "alta") {
    return "Excluido por alta intensidad física.";
  }
  if (considerations.some((c: string) => c.toLowerCase().includes("sin contacto")) && d.requiresContact) {
    return "Excluido por requerir contacto físico.";
  }
  if (considerations.some((c: string) => c.toLowerCase().includes("movilidad")) && !d.mobilityFriendly) {
    return "Excluido por no ser apto para movilidad reducida.";
  }
  const exp = (formData.experienceLevel || '').toLowerCase();
  if (exp.includes("principiante") && !d.experienceLevels.some((el: string) => el === "principiante" || el === "todos")) {
    return `Excluido por nivel de experiencia (requiere ${d.experienceLevels.join(", ")}).`;
  }
  return "Excluido por idoneidad general o puntuación negativa.";
}
