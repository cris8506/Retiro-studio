import { GoogleGenAI } from "@google/genai";
import { OFFICIAL_DYNAMICS } from "../src/data/dynamics";

// Centralized Gemini model constant as requested
const GEMINI_MODEL = "gemini-3.5-flash";

// Format official dynamics into a string text block for Gemini context
const getDynamicsContext = () => {
  return OFFICIAL_DYNAMICS.map(d => {
    return `ID: "${d.id}"
Nombre: "${d.name}"
Categoría: "${d.category}"
Duración: ${d.duration} min
Intensidad: "${d.intensity}"
Objetivo: "${d.objective}"
Cuándo utilizarla: "${d.whenToUse}"
Cuándo evitarla: "${d.whenToAvoid}"
Materiales: [${d.materials.join(', ')}]
Preparación: "${d.preparation}"
Instrucciones clave: ${d.steps.join(' | ')}
Guion sugerido: "${d.script}"
Preguntas reflexión: [${d.reflectionQuestions.join(', ')}]
Variaciones: [${d.variations.join(', ')}]`;
  }).join("\n\n---\n\n");
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
  // 6. Accept only POST requests and reject other methods with 405 Method Not Allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      error: `Método ${req.method} no permitido. Utiliza POST.`
    });
  }

  // 7. Extract the exact properties sent by the frontend form
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
    expectedResults
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

    // 9. Validation of GEMINI_API_KEY existence
    const serverApiKey = process.env.GEMINI_API_KEY || "";
    if (!serverApiKey || serverApiKey.trim() === "" || serverApiKey === "undefined" || serverApiKey.includes("MY_GEMINI_API_KEY")) {
      console.error("[generate-retreat] GEMINI_API_KEY no está configurada en el servidor.");
      return res.status(400).json({
        success: false,
        code: "API_KEY_MISSING",
        error: "GEMINI_API_KEY no está configurada en el servidor."
      });
    }

    const requestedDuration = Number(duration) || 3;
    const requestedCount = Number(participantsCount) || 15;

    const dynamicsContext = getDynamicsContext();

    const systemInstruction = `Eres Retiro Studio AI, un asistente experto y diseñador de retiros transformacionales de alta gama.
Tu tarea es tomar las necesidades del facilitador y diseñar una estructura de retiro PERFECTA de alta calidad.
Debes basar las actividades principales prioritariamente en la BIBLIOTECA OFICIAL de Retiro Studio que se te proporciona a continuación.
Si no hay una dinámica oficial adecuada en la biblioteca, puedes crear una "adaptación sugerida por IA", pero debes marcar "isAiSuggested": true y crear campos detallados para ella. Para dinámicas oficiales, mantén "isAiSuggested": false.

DEBES programar obligatoriamente bloques de alimentación conscientes (Desayuno, Almuerzo, Cena) de manera adaptada y mística para cada día de la agenda (por ejemplo: 'Desayuno de Enraizamiento en Silencio', 'Almuerzo de Integración Sensorial').
Cada actividad o comida DEBE incluir una recomendación de música detallada (con artista/canción o estilo específico) en la propiedad 'recommendedMusic' indicando en qué momento reproducirla o ajustar su volumen en sala.
Todos los materiales necesarios para cada actividad DEBEN listarse en la propiedad 'materials' y al final consolidarse por completo en 'materialsList'.

La agenda completa debe estructurarse de manera coherente día a día. Debe de haber equilibrio entre:
- Activación (Cuerpo, movimiento)
- Conexión (Grupal, círculos)
- Reflexión (Silencio, meditación)
- Descanso / Integración
- Alimentación (Desayuno, Almuerzo, Cena)
Evita colocar actividades de alta intensidad seguidas.

BIBLIOTECA OFICIAL DE DINÁMICAS DISPONIBLES:
${dynamicsContext}

Tu respuesta DEBE ser un JSON estricto y válido. No incluyas explicaciones en texto antes ni después del bloque JSON.`;

    const promptText = `Por favor genera la estructura del retiro en español con la siguiente configuración:
Nombre del retiro: "${name}"
Tipo de retiro: "${type}"
Objetivo principal: "${goal}"
Duración: ${requestedDuration} días
Número de participantes esperado: ${requestedCount}
Edad aproximada: "${participantsAge || "30-50 años"}"
Perfil de los participantes: "${participantsProfile || "General"}"
Nivel de experiencia: "${experienceLevel || "Principiante a Intermedio"}"
Lugar del retiro: "${locationType || "Naturaleza"}"
Energía deseada: "${desiredEnergy || "Serena"}"
Resultados esperados: "${expectedResults || "Integración"}"

Estructura el JSON devuelto con estas propiedades exactas:
{
  "description": "Breve descripción inspiradora del retiro (máximo 3 frases)",
  "idealProfile": "Resumen de perfil ideal del participante y por qué encaja",
  "agenda": [
    {
      "day": 1,
      "focus": "Enfoque principal del día",
      "activities": [
        {
          "time": "Rango de hora (ej: 08:00 AM — 09:15 AM)",
          "title": "Nombre de la actividad o comida (ej: Desayuno Consciente en Silencio)",
          "duration": 45, // duración en minutos
          "emotionalGoal": "Objetivo emocional concreto de la dinámica o momento de comida",
          "dynamicId": "ID de la dinámica oficial (ej: 'almuerzo_silencio' o deja vacío si es inventada/sugerida)",
          "dynamicName": "Nombre de la dinámica",
          "isAiSuggested": false, // true si es inventada/sugerida por la IA, false si coincide con la biblioteca oficial
          "materials": ["Material 1", "Material 2"], // Lista de insumos físicos para esta actividad
          "preparation": "Instrucciones de preparación detalladas para el facilitador",
          "script": "Guion sugerido exacto para introducir la actividad en primera persona en sala",
          "reflectionQuestions": ["Pregunta de reflexión 1", "Pregunta de reflexión 2"],
          "closing": "Forma concreta de cerrar la experiencia de manera armoniosa",
          "recommendedMusic": "Canción, artista o estilo recomendado y el momento/volumen sugerido para reproducirlo",
          "transition": "Indicación exacta para guiar la transición del grupo al siguiente bloque"
        }
      ]
    }
  ],
  "materialsList": ["Lista única consolidada de todos los materiales físicos necesarios de todo el retiro"],
  "participantsList": [
    {"name": "Elena Martínez", "dietary": "Vegana", "restrictions": "Alergia Nueces"},
    {"name": "Julián Rivera", "dietary": "Sin restricciones", "restrictions": "Ninguna"}
  ],
  "notes": ["Notas de facilitación logísticas generales"]
}`;

    const ai = new GoogleGenAI({
      apiKey: serverApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // 12. Timeout setup for Gemini call
    const generatePromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const err = new Error("Timeout calling Gemini API");
        (err as any).isTimeout = true;
        reject(err);
      }, 25000); // 25 seconds timeout
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
      const parseError = new Error("La respuesta de Gemini no tiene un formato JSON válido.");
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
      expectedResults: expectedResults || "Reconexión",
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
    
    // 13. Successful response must return structured JSON
    return res.status(200).json({
      success: true,
      retreat: generatedRetreat
    });

  } catch (err: any) {
    // 15. Server-side log for Vercel console logs (no sensitive data exposed)
    console.error("[generate-retreat] Failed:", {
      message: err.message,
      isTimeout: err.isTimeout,
      isJsonParseError: err.isJsonParseError
    });
    
    // 14. Error code categorization
    let code = "INTERNAL_SERVER_ERROR";
    let userFriendlyError = "No pudimos generar el retiro. Revisa la configuración de Gemini o inténtalo nuevamente.";
    const errMsg = (err.message || "").toLowerCase();

    if (err.isTimeout) {
      code = "GEMINI_TIMEOUT";
      userFriendlyError = "Tiempo de espera agotado al conectar con Gemini. Por favor, inténtalo de nuevo.";
    } else if (errMsg.includes("api key") && (errMsg.includes("not valid") || errMsg.includes("invalid") || errMsg.includes("not found") || errMsg.includes("api_key_invalid"))) {
      code = "GEMINI_AUTH_ERROR";
      userFriendlyError = "La clave de API de Gemini es inválida o no existe.";
    } else if (errMsg.includes("permission") || errMsg.includes("denied") || errMsg.includes("forbidden") || errMsg.includes("authorized")) {
      code = "GEMINI_PERMISSION_ERROR";
      userFriendlyError = "Error de permisos al acceder a Gemini.";
    } else if (errMsg.includes("quota") || errMsg.includes("limit") || errMsg.includes("rate limit") || errMsg.includes("429") || errMsg.includes("exhausted")) {
      code = "GEMINI_QUOTA_ERROR";
      userFriendlyError = "Se ha superado el límite de uso o cuota de la API de Gemini.";
    } else if (errMsg.includes("model") && (errMsg.includes("not found") || errMsg.includes("unsupported") || errMsg.includes("not exist") || errMsg.includes("model_not_found"))) {
      code = "GEMINI_MODEL_ERROR";
      userFriendlyError = "Error de compatibilidad con el modelo de Gemini seleccionado.";
    } else if (errMsg.includes("vacía") || errMsg.includes("empty") || errMsg.includes("no text")) {
      code = "GEMINI_EMPTY_RESPONSE";
      userFriendlyError = "Respuesta vacía recibida del modelo Gemini.";
    } else if (err.isJsonParseError) {
      code = "GEMINI_INVALID_JSON";
      userFriendlyError = "La respuesta de Gemini no tiene un formato JSON estructurado válido.";
    } else if (errMsg.includes("fetch") || errMsg.includes("conn") || errMsg.includes("network") || errMsg.includes("econnrefused")) {
      code = "INTERNAL_SERVER_ERROR";
      userFriendlyError = "Error de conexión al intentar alcanzar los servidores de Gemini.";
    }

    return res.status(500).json({
      success: false,
      code,
      error: userFriendlyError,
      details: err.message
    });
  }
}
