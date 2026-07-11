import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-3.5-flash";

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
  // Accept only POST requests and reject other methods with 405 Method Not Allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      error: `Método ${req.method} no permitido. Utiliza POST.`
    });
  }

  try {
    const { category, duration, intensity, objective, groupType } = req.body;

    if (!objective) {
      return res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        error: "Falta especificar el objetivo de la dinámica."
      });
    }

    // Robust validation of GEMINI_API_KEY existence
    const serverApiKey = process.env.GEMINI_API_KEY || "";
    if (!serverApiKey || serverApiKey.trim() === "" || serverApiKey === "undefined" || serverApiKey.includes("MY_GEMINI_API_KEY")) {
      console.warn("[api/generate-dynamic] GEMINI_API_KEY no configurada. Usando fallback estático.");
      const mockDynamic: any = {
        id: 'ai_' + Date.now(),
        name: `Respiración del Espacio Interno`,
        category: category || 'Meditación',
        duration: Number(duration) || 15,
        intensity: intensity || 'Baja',
        objective: objective,
        whenToUse: 'Ideal para asentar mentes dispersas e integrar el grupo en la quietud.',
        whenToAvoid: 'Si hay personas con asma severo sin inhalador o fatiga extrema.',
        materials: ['Cojín de meditación', 'Silencio absoluto'],
        preparation: 'Disponer al grupo sentados cómodamente de espaldas erguidas.',
        steps: [
          'Guiar 3 respiraciones profundas inhalando por la nariz y exhalando largo por la boca.',
          'Pausar reteniendo el aire con pulmones llenos durante 4 segundos para percibir la pausa natural.',
          'Ronda de respiración alterna de manera sutil durante 10 minutos.',
          'Toque de cuenco tibetano suave para cerrar.'
        ],
        script: 'Siente cómo el aire no solo entra a tus pulmones, sino que ensancha el espacio de tu mente. En el vacío entre respiraciones se encuentra tu verdadera calma.',
        reflectionQuestions: ['¿Qué cambió en tu espacio mental en la retención?', '¿Cómo sientes tu respiración ahora?'],
        variations: ['Hacerlo acostados si hay tensión lumbar.'],
        isAiSuggested: true
      };
      return res.status(200).json({
        dynamic: mockDynamic,
        warning: "Dinámica generada por motor de plantilla debido a falta de API key."
      });
    }

    const systemInstruction = `Eres el catalogador experto de dinámicas de Retiro Studio AI.
Tu tarea es diseñar una dinámica o ejercicio específico adaptado a las necesidades planteadas por el usuario.
Debes estructurarla con el máximo rigor pedagógico y sensibilidad emocional.
Indica claramente que es una "adaptación sugerida por IA" marcando "isAiSuggested": true.

Estructura el JSON devuelto con estas propiedades exactas:
{
  "name": "Nombre místico y evocador de la dinámica",
  "category": "Una de: Meditación, Icebreaker, Creatividad, Silencio, Cuerpo, Liberación, Integración",
  "duration": 20, // duración aproximada en minutos
  "intensity": "Baja, Media o Alta",
  "objective": "Objetivo emocional y vivencial",
  "whenToUse": "Momento ideal del retiro para aplicarla",
  "whenToAvoid": "Contraindicaciones o momentos donde NO debe usarse",
  "materials": ["Lista de materiales necesarios"],
  "preparation": "Cómo debe el facilitador acondicionar el espacio",
  "steps": ["Paso 1 de instrucciones", "Paso 2...", "Paso 3..."],
  "script": "Qué debe decir exactamente el facilitador en primera persona para guiarla",
  "reflectionQuestions": ["Pregunta 1 de reflexión posterior", "Pregunta 2..."],
  "variations": ["Variación posible 1", "Variación 2"]
}`;

    const promptText = `Crea una dinámica enfocada en:
Objetivo: "${objective}"
Categoría deseada: "${category || 'No especificada'}"
Duración recomendada: ${duration || 15} minutos
Intensidad emocional: "${intensity || 'Media'}"
Tipo de grupo: "${groupType || 'General'}"`;

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
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const responseText = response.text || "";
    if (!responseText.trim()) {
      throw new Error("Respuesta vacía de Gemini.");
    }

    let parsedData;
    try {
      parsedData = cleanAndParseJson(responseText);
    } catch (err: any) {
      console.error("Failed to parse individual dynamic JSON:", responseText);
      const parseError = new Error("La respuesta de Gemini no es JSON válido.");
      (parseError as any).isJsonParseError = true;
      throw parseError;
    }

    const id = 'ai_' + Date.now();
    const dynamic = {
      id: id,
      ...parsedData,
      isAiSuggested: true
    };

    return res.status(200).json({ dynamic });

  } catch (err: any) {
    console.error("[api/generate-dynamic] Error:", err);
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: "No se pudo generar la dinámica individual. Por favor reintenta.",
      details: err.message
    });
  }
}
