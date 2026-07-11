import { GoogleGenAI } from "@google/genai";
import { getAssistantFallbackReply } from "./_lib/generatorNoAi.js";

const GEMINI_MODEL = "gemini-3.5-flash";

// Sample retreat for serverless context seeding
const sampleRetreat = {
  id: 'despertar_sentidos',
  name: 'El Despertar de los Sentidos',
  type: 'Bienestar y Reconexión',
  goal: 'Desconectar del estrés cotidiano y reconectar con la sabiduría del cuerpo a través de prácticas sensoriales y meditación.',
  duration: 3,
  participantsCount: 18,
  participantsAge: '30 - 55 años',
  participantsProfile: 'Profesionales estresados en busca de una pausa y herramientas de calma.',
  experienceLevel: 'Principiante a Intermedio',
  locationType: 'Naturaleza (Bosque templado)',
  desiredEnergy: 'Serena, introspectiva pero conectada',
  expectedResults: 'Mayor presencia mental, técnicas de respiración aprendidas, liberación de tensión física.'
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

  const { message, currentRetreatId, chatHistory, forceNoAI } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      code: "INVALID_REQUEST",
      error: "Falta el mensaje para el Asistente."
    });
  }

  // Check if this matches one of the 8 predefined quick options
  const msgNormalized = message.trim().toLowerCase().replace(/\.$/, '');
  const quickOptionKeywords = [
    "baja participación y el grupo está silencioso",
    "grupo está completamente callado y cuesta que hablen",
    "comenzó a llorar intensamente y necesita contención",
    "baja energía, sueño o cansancio digestivo",
    "conflicto grupal o tensión pasivo-agresiva",
    "retraso en la agenda y desvío del horario",
    "falta de materiales o suministros",
    "poco tiempo disponible para completar"
  ];

  const isQuickOption = quickOptionKeywords.some(keyword => {
    return msgNormalized.includes(keyword) || keyword.includes(msgNormalized);
  });

  // Force No-AI route if requested or if matched with one of the 8 quick options
  if (forceNoAI || isQuickOption) {
    console.log(`[api/assistant] Bypassing AI (forceNoAI: ${forceNoAI}, isQuickOption: ${isQuickOption})...`);
    const reply = getAssistantFallbackReply(message);
    return res.status(200).json({
      reply,
      isAiResponse: false
    });
  }

  // Look up retreat context (seed with sample if matches)
  let retreatContext: any = null;
  if (currentRetreatId === 'despertar_sentidos') {
    retreatContext = sampleRetreat;
  }

  let contextString = "";
  if (retreatContext) {
    contextString = `CONTEXTO DEL RETIRO ACTUAL DEL FACILITADOR:
Nombre del Retiro: "${retreatContext.name}"
Objetivo Principal: "${retreatContext.goal}"
Duración: ${retreatContext.duration} días
Energía Deseada: "${retreatContext.desiredEnergy}"
Resultados Esperados: "${retreatContext.expectedResults}"
Perfil de Participantes: "${retreatContext.participantsProfile}"`;
  }

  // Robust validation of GEMINI_API_KEY existence
  const serverApiKey = process.env.GEMINI_API_KEY || "";
  if (!serverApiKey || serverApiKey.trim() === "" || serverApiKey === "undefined" || serverApiKey.includes("MY_GEMINI_API_KEY")) {
    console.warn("[api/assistant] GEMINI_API_KEY no configurada. Usando motor de contingencia autónomo.");
    const reply = getAssistantFallbackReply(message);
    return res.status(200).json({
      reply,
      warning: "Respuesta del Asistente generada por el motor de contingencia de Retiro Studio debido a que no hay una clave de API configurada en el servidor.",
      isAiResponse: false
    });
  }

  try {
    const systemInstruction = `Actúas como el Mentor IA de Retiro Studio para facilitadores de retiros de bienestar. Tu objetivo es responder de manera breve, clara y útil, resolviendo rápidamente la duda del facilitador con la menor cantidad de texto posible.

ESTILO DE RESPUESTA REQUERIDO:
1. Responde siempre en español.
2. Usa un lenguaje cercano, profesional y directo.
3. NUNCA escribas introducciones largas, saludos ni despedidas.
4. NUNCA repitas la pregunta o frase del usuario.
5. NO uses frases motivacionales innecesarias ni teoría extensa.
6. Evita párrafos largos. La respuesta debe tener normalmente entre 60 y 140 palabras.
7. Solo puedes superar ese límite cuando exista una situación de seguridad física, emocional o una crisis extrema que requiera instrucciones detalladas.
8. No hagas más de una pregunta de aclaración, y solo si es absolutamente indispensable.
9. Prioriza acciones concretas aplicables de inmediato.

ESTRUCTURA OBLIGATORIA DE RESPUESTA:
Debes usar EXACTAMENTE este formato con las etiquetas exactas:

Acción inmediata:
[Indica en una o dos frases qué debe hacer el facilitador ahora]

Qué evitar:
[Menciona brevemente qué acción podría empeorar la situación]

Sugerencia:
[Recomienda una dinámica, adaptación o intervención adecuada]

Duración:
[Indica el tiempo aproximado necesario]

REGLAS ESPECÍFICAS SEGÚN LA SITUACIÓN:
- Grupo callado: Recomienda actividades suaves, evita dinámicas profundas al inicio, sugiere parejas o grupos pequeños.
- Baja energía: Recomienda movimiento, respiración activa o cambio de espacio. Evita explicaciones teóricas largas o meditaciones pasivas.
- Persona llorando/catarsis: Prioriza contención, privacidad y consentimiento. No diagnostiques, no obligues a compartir. Sugiere pausar o delegar el cuidado a un responsable.
- Conflicto: Detén la actividad si es necesario, reduce la exposición pública. Escucha por separado antes de un diálogo grupal. No tomes partido.
- Retraso en la agenda: Identifica qué reducir, reemplazar o eliminar. Protege apertura, descansos, integración y cierre.
- Falta de tiempo: Recomienda versión corta de la dinámica manteniendo el objetivo principal; reduce instrucciones y rondas de palabra.
- Falta de materiales: Propón alternativa sencilla con recursos disponibles, sin cambiar el objetivo principal.

SEGURIDAD CRÍTICA:
No reemplaces atención médica ni psicológica. Si detectas riesgo de autolesión, violencia, desmayo, dificultad respiratoria, crisis intensa o peligro físico:
1. Indica suspender de inmediato la actividad.
2. Protege al grupo.
3. Solicita apoyo profesional o servicios de emergencia.
4. Prohibido continuar con una dinámica emocional.

DATOS DE CONTEXTO DEL RETIRO (utilízalos internamente para personalizar la recomendación de forma sutil, NO los menciones explícitamente ni los repitas todos en tu respuesta):
${contextString}

CONSUMO DE TOKENS Y LÍMITES:
- No envíes respuestas extensas.
- No presentes más de dos alternativas.
- No repitas instrucciones ni incluyas resúmenes finales.
- Limita la respuesta a un máximo estricto de 220 tokens de salida, salvo casos de emergencia de seguridad física o emocional.`;

    const ai = new GoogleGenAI({
      apiKey: serverApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.6,
        maxOutputTokens: 350,
      },
    });

    return res.status(200).json({ 
      reply: response.text,
      isAiResponse: true
    });

  } catch (err: any) {
    console.error("[api/assistant] Error al llamar a Gemini. Activando fallback autónomo de contingencia...", err);
    // Graceful fallback to avoid throwing a 500
    const reply = getAssistantFallbackReply(message);
    return res.status(200).json({
      reply,
      warning: "Gemini no está disponible en este momento. Se activó automáticamente el motor autónomo de contingencia de Retiro Studio.",
      isAiResponse: false,
      errorDetails: err.message
    });
  }
}
