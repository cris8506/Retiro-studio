import { GoogleGenAI } from "@google/genai";
import { OFFICIAL_DYNAMICS } from "./_lib/dynamics.js";
import { generateRetreatWithoutAI, scoreDynamic } from "./_lib/generatorNoAi.js";

// Centralized Gemini model constant as requested
const GEMINI_MODEL = "gemini-3.5-flash";

// Score and pre-select 8-12 relevant dynamics from the database based on retreat attributes to reduce input token footprint
const getSelectedDynamicsContext = (
  formData: any,
  limit = 9
) => {
  const scored = OFFICIAL_DYNAMICS.map(d => {
    // Score with our advanced scoreDynamic function using 'Conexión' as a neutral phase for pre-selection
    const score = scoreDynamic(d, formData, 'Conexión');
    return { dynamic: d, score };
  });

  // Filter out any hard excluded dynamics (score <= -50)
  const filtered = scored.filter(x => x.score > -50);
  
  // If we filtered out too many, fall back to scored to avoid empty lists
  const finalScored = filtered.length > 0 ? filtered : scored;

  // Sort descending by score
  finalScored.sort((a, b) => b.score - a.score);

  // Take the slice
  const selected = finalScored.slice(0, limit).map(x => x.dynamic);

  // Format only essential properties (saving up to 80% input tokens per dynamic)
  const contextString = selected.map(d => {
    return `ID: "${d.id}"
Nombre: "${d.name}"
Categoría: "${d.category}"
Duración: ${d.duration} min
Intensidad: "${d.intensity}"
Objetivo: "${d.objective}"`;
  }).join("\n---\n");

  return {
    contextString,
    selectedCount: selected.length
  };
};

// Helper to sanitize and parse JSON response from Gemini
const cleanAndParseJson = (text: string): any => {
  if (!text) return {};
  let cleaned = text.trim();
  
  // Try to find markdown code block ```json ... ```
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const matchJson = cleaned.match(jsonBlockRegex);
  if (matchJson && matchJson[1]) {
    cleaned = matchJson[1].trim();
  } else {
    // Try to find generic code block ``` ... ```
    const codeBlockRegex = /```\s*([\s\S]*?)\s*```/;
    const matchCode = cleaned.match(codeBlockRegex);
    if (matchCode && matchCode[1]) {
      cleaned = matchCode[1].trim();
    }
  }

  // Remove any remaining start/end backticks just in case
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").trim();
  }
  
  return JSON.parse(cleaned);
};

export default async function handler(req: any, res: any) {
  // Ensure Content-Type is application/json
  res.setHeader('Content-Type', 'application/json');

  // Accept only POST requests and reject other methods with 405 Method Not Allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      error: `Método ${req.method} no permitido. Utiliza POST.`
    });
  }

  // Extract properties sent by the frontend form
  const {
    name,
    type,
    goal,
    duration,
    participantsCount,
    participantsAge,
    participantsProfile,
    experienceLevel,
    locationType,
    desiredEnergy,
    expectedResults,
    useAI,
    emotionalIntensity,
    participantRelationship,
    specialConsiderations
  } = req.body;

  try {
    if (!name || !type || !goal) {
      console.error("[generate-retreat] Missing required fields", { name, type, goal });
      return res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        error: "Faltan campos obligatorios (nombre, tipo y objetivo principal)."
      });
    }

    // Direct path for generating without AI
    if (useAI === false) {
      console.log("[generate-retreat] Bypassing AI and generating using procedural system...");
      const retreat = generateRetreatWithoutAI(req.body);
      return res.status(200).json({
        success: true,
        retreat: retreat,
        isAiGenerated: false
      });
    }

    // Validation of GEMINI_API_KEY existence
    const serverApiKey = process.env.GEMINI_API_KEY || "";
    if (!serverApiKey || serverApiKey.trim() === "" || serverApiKey === "undefined" || serverApiKey.includes("MY_GEMINI_API_KEY")) {
      console.warn("[generate-retreat] GEMINI_API_KEY no está configurada en el servidor. Usando fallback autónomo...");
      const retreat = generateRetreatWithoutAI(req.body);
      return res.status(200).json({
        success: true,
        retreat: retreat,
        isAiGenerated: false,
        warning: "Se utilizó la generación automática sin IA debido a la falta de credenciales de Gemini."
      });
    }

    const requestedDuration = Number(duration) || 3;
    const requestedCount = Number(participantsCount) || 15;

    // Smart pre-selection of 9 dynamics (within the 8-12 range)
    const { contextString: dynamicsContext, selectedCount } = getSelectedDynamicsContext(
      req.body,
      9
    );

    console.log(`[generate-retreat] Pre-selected ${selectedCount} of ${OFFICIAL_DYNAMICS.length} dynamics for optimization.`);

    const systemInstruction = `Eres Retiro Studio AI, un asistente experto y diseñador de retiros de bienestar de alta gama.
Diseña una estructura de retiro funcional, inspiradora y sumamente CONCISA en español.

REGLAS DE CONCISIÓN EXTREMA PARA AHORRO DE TOKENS:
1. No infles los textos. Sé directo y concreto.
2. Limita la propiedad 'description' a un máximo de 2 frases sencillas.
3. Limita la propiedad 'idealProfile' a un máximo de 2 frases cortas.
4. Para cada actividad de la agenda, mantén las propiedades 'emotionalGoal', 'preparation', 'script', 'closing' y 'transition' en un máximo de 1 o 2 oraciones muy breves y funcionales.
5. Usa como máximo 2 preguntas de reflexión cortas por actividad en 'reflectionQuestions'.
6. Programa bloques de alimentación conscientes (Desayuno, Almuerzo, Cena) de manera mística breve para cada día de la agenda.
7. Basa las actividades principales prioritariamente en la BIBLIOTECA OFICIAL de Retiro Studio que se te proporciona. Para dinámicas de la biblioteca, mantén "isAiSuggested": false. Si creas alguna dinámica adaptada especial que no esté en la biblioteca, márcala con "isAiSuggested": true.

REGLAS DE CONCORDANCIA Y FILTRADO:
- No selecciones o sugieras dinámicas con contacto físico (por ejemplo, 'El Hilo de la Red Invisible' o 'Respiración Holotrópica' en parejas) si se indica "Actividades sin contacto físico" en las consideraciones especiales.
- No selecciones dinámicas profundas o de alta intensidad emocional si la intensidad emocional es "Suave".
- No selecciones dinámicas físicamente exigentes si hay "Movilidad reducida" o limitaciones físicas en las consideraciones especiales.

BIBLIOTECA OFICIAL SELECCIONADA:
${dynamicsContext}

Tu respuesta DEBE ser un JSON estricto y válido. No incluyas explicaciones de texto antes o después del bloque JSON.`;

    const promptText = `Genera la estructura del retiro en español con esta configuración:
Nombre del retiro: "${name}"
Tipo de retiro: "${type}"
Objetivo principal: "${goal}"
Duración: ${requestedDuration} días
Número de participantes: ${requestedCount}
Edad aproximada: "${participantsAge || "30-50 años"}"
Perfil de participantes: "${participantsProfile || "General"}"
Experiencia: "${experienceLevel || "Principiante"}"
Lugar: "${locationType || "Naturaleza"}"
Energía deseada: "${desiredEnergy || "Serena"}"
Intensidad emocional: "${emotionalIntensity || "Moderada"}"
Relación entre participantes: "${participantRelationship || "No se conocen"}"
Resultados esperados: "${Array.isArray(expectedResults) ? expectedResults.join(', ') : (expectedResults || "Reconexión")}"
Consideraciones especiales: "${Array.isArray(specialConsiderations) ? specialConsiderations.join(', ') : (specialConsiderations || "Ninguna")}"

Estructura el JSON devuelto con estas propiedades exactas (usa oraciones sumamente cortas):
{
  "description": "Breve descripción de máximo 2 frases",
  "idealProfile": "Resumen corto de perfil ideal de máximo 2 frases",
  "agenda": [
    {
      "day": 1,
      "focus": "Enfoque principal del día",
      "activities": [
        {
          "time": "Rango de hora (ej: 08:00 AM — 09:15 AM)",
          "title": "Nombre de la actividad o comida",
          "duration": 45,
          "emotionalGoal": "Objetivo emocional ultra breve (máximo 1 frase)",
          "dynamicId": "ID de la dinámica oficial (ej: 'almuerzo_silencio' o deja vacío si es sugerida)",
          "dynamicName": "Nombre de la dinámica",
          "isAiSuggested": false,
          "materials": ["Material 1", "Material 2"],
          "preparation": "Instrucción de preparación muy corta para el facilitador",
          "script": "Guion muy corto para introducir en sala (máximo 2 frases)",
          "reflectionQuestions": ["Pregunta de reflexión 1", "Pregunta de reflexión 2"],
          "closing": "Cierre muy breve de la experiencia",
          "recommendedMusic": "Canción, artista o estilo recomendado breve",
          "transition": "Transición rápida de una frase"
        }
      ]
    }
  ],
  "materialsList": ["Lista consolidada de los materiales esenciales necesarios de todo el retiro"],
  "participantsList": [
    {"name": "Elena Martínez", "dietary": "Vegana", "restrictions": "Alergia Nueces"},
    {"name": "Julián Rivera", "dietary": "Sin restricciones", "restrictions": "Ninguna"}
  ],
  "notes": ["Notas logísticas generales muy breves"]
}`;

    const ai = new GoogleGenAI({
      apiKey: serverApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Timeout setup for Gemini call
    const generatePromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 2500, // Reasonable output token limit to prevent excessive output generation
      },
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const err = new Error("Timeout calling Gemini API");
        (err as any).isTimeout = true;
        reject(err);
      }, 50000); // 50 seconds timeout
    });

    // Race the generation against timeout
    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    const responseText = response.text || "";
    if (!responseText.trim()) {
      throw new Error("Respuesta vacía recibida del servidor de Gemini.");
    }

    console.log("Gemini API call returned successfully. Parsing response...");
    
    let parsedData;
    try {
      parsedData = cleanAndParseJson(responseText);
    } catch (parseErr: any) {
      console.error("Failed to parse Gemini response as JSON. Original response:", responseText);
      const parseError = new Error("La respuesta de Gemini no tiene un formato JSON estructurado válido.");
      (parseError as any).isJsonParseError = true;
      throw parseError;
    }

    const id = 'retreat_' + Date.now();
    const generatedRetreat = {
      id: id,
      name: name,
      type: type,
      goal: goal,
      duration: requestedDuration,
      participantsCount: requestedCount,
      participantsAge: participantsAge || "25-45 años",
      participantsProfile: participantsProfile || "General",
      experienceLevel: experienceLevel || "Principiante",
      locationType: locationType || "Naturaleza",
      desiredEnergy: desiredEnergy || "Calma",
      expectedResults: expectedResults || ["Reconexión"],
      emotionalIntensity: emotionalIntensity || "Moderada",
      participantRelationship: participantRelationship || "No se conocen",
      specialConsiderations: specialConsiderations || [],
      description: parsedData.description || `Retiro transformacional ${name}.`,
      idealProfile: parsedData.idealProfile || "Facilitadores de bienestar.",
      agenda: (parsedData.agenda || []).map((dayData: any, dayIdx: number) => ({
        day: dayData.day || (dayIdx + 1),
        focus: dayData.focus || "Prácticas de conexión y enraizamiento",
        activities: (dayData.activities || []).map((act: any, actIdx: number) => ({
          id: `act_${dayIdx + 1}_${actIdx + 1}`,
          time: act.time || "09:00 AM",
          title: act.title || "Actividad",
          duration: Number(act.duration) || 30,
          emotionalGoal: act.emotionalGoal || "Contención y Presencia",
          dynamicId: act.dynamicId || undefined,
          dynamicName: act.dynamicName || act.title,
          isAiSuggested: act.isAiSuggested !== undefined ? act.isAiSuggested : true,
          materials: act.materials || [],
          preparation: act.preparation || "Preparar el espacio adecuadamente.",
          script: act.script || "Bienvenidos a esta experiencia profunda.",
          reflectionQuestions: act.reflectionQuestions || [],
          closing: act.closing || "Cerrar con una exhalación profunda.",
          recommendedMusic: act.recommendedMusic || "Aura of Silence - Deuter",
          transition: act.transition || "Transicionar suavemente al siguiente bloque."
        }))
      })),
      materialsList: parsedData.materialsList || [],
      participantsList: parsedData.participantsList || [
        { name: 'Elena Martínez', dietary: 'Vegana', restrictions: 'Alergia Nueces' },
        { name: 'Julián Rivera', dietary: 'Sin restricciones', restrictions: 'Ninguna' }
      ],
      notes: parsedData.notes || ["Mantener las transiciones con suavidad en todo momento."],
      progress: 40
    };

    // Ensure we have consolidated materialsList
    if (!generatedRetreat.materialsList || generatedRetreat.materialsList.length === 0) {
      generatedRetreat.materialsList = Array.from(new Set(generatedRetreat.agenda.flatMap(day => day.activities.flatMap(act => act.materials))));
    }

    console.log(`Retreat "${name}" generated successfully with ID ${id}`);
    
    return res.status(200).json({
      success: true,
      retreat: generatedRetreat
    });

  } catch (err: any) {
    console.error("[generate-retreat] Failed:", {
      message: err.message,
      isTimeout: err.isTimeout,
      isJsonParseError: err.isJsonParseError
    });
    
    let code = "INTERNAL_SERVER_ERROR";
    const errMsg = (err.message || "").toLowerCase();

    if (err.isTimeout) {
      code = "GEMINI_TIMEOUT";
    } else if (errMsg.includes("api key") && (errMsg.includes("not valid") || errMsg.includes("invalid") || errMsg.includes("not found") || errMsg.includes("api_key_invalid"))) {
      code = "GEMINI_AUTH_ERROR";
    } else if (errMsg.includes("permission") || errMsg.includes("denied") || errMsg.includes("forbidden") || errMsg.includes("authorized")) {
      code = "GEMINI_PERMISSION_ERROR";
    } else if (errMsg.includes("quota") || errMsg.includes("limit") || errMsg.includes("rate limit") || errMsg.includes("429") || errMsg.includes("exhausted")) {
      code = "GEMINI_QUOTA_ERROR";
    } else if (errMsg.includes("model") && (errMsg.includes("not found") || errMsg.includes("unsupported") || errMsg.includes("not exist") || errMsg.includes("model_not_found"))) {
      code = "GEMINI_MODEL_ERROR";
    } else if (errMsg.includes("vacía") || errMsg.includes("empty") || errMsg.includes("no text")) {
      code = "GEMINI_EMPTY_RESPONSE";
    } else if (err.isJsonParseError) {
      code = "GEMINI_INVALID_JSON";
    } else if (errMsg.includes("fetch") || errMsg.includes("conn") || errMsg.includes("network") || errMsg.includes("econnrefused")) {
      code = "GEMINI_NETWORK_ERROR";
    }

    return res.status(200).json({
      success: false,
      code,
      error: "Gemini no está disponible en este momento. Puedes crear el retiro automáticamente utilizando nuestra biblioteca y sistema de planificación.",
      canGenerateWithoutAI: true,
      details: err.message
    });
  }
}
