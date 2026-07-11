import { GoogleGenAI } from "@google/genai";

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
    const { message, currentRetreatId, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        error: "Falta el mensaje para el Asistente IA."
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
      console.warn("[api/assistant] GEMINI_API_KEY no configurada. Usando fallback estático.");
      const lowMessage = message.toLowerCase();
      let reply = "Hola. Como tu mentor experto de retiros, estoy aquí para guiarte en cada paso técnico, logístico y humano del proceso. ";
      
      if (lowMessage.includes("poca participación") || lowMessage.includes("participan") || lowMessage.includes("habla") || lowMessage.includes("callad") || lowMessage.includes("silencio") || lowMessage.includes("no quieren hablar")) {
        reply += `\n\n### Intervención para Baja Participación en el Grupo:
La resistencia a hablar suele nacer del miedo a la vulnerabilidad o falta de seguridad psicológica en el círculo.

1. **No fuerces la palabra individual:** Si el grupo está callado, evita preguntar directamente a alguien. Rompe la tensión con un 'vaciado somático' rápido (sacudir las manos, estirarse o suspirar colectivamente).
2. **Utiliza el Objeto de Habla:** Saca una piedra de río o cuarzo. Solo quien sostiene el objeto tiene la palabra, pero haz explícito que se permite sostenerlo en silencio durante un minuto si no desea hablar. Esto libera la presión social de inmediato.
3. **Dinámicas en Parejas:** Divide al grupo en parejas para responder la consigna durante 3 minutos. Al dialogar en un micro-contenedor de dos personas, la timidez disminuye y, al volver al círculo grande, la disposición para compartir aumenta un 80%.
4. **Preguntas Corporales Rápidas:** Haz preguntas cerradas que requieran respuesta física antes de abrir los micrófonos: "Alcen la mano los que hoy sintieron que su mente saboteaba el silencio". Esto activa la presencia visual grupal.`;
      } else if (lowMessage.includes("afectado") || lowMessage.includes("llor") || lowMessage.includes("emocion") || lowMessage.includes("contencion") || lowMessage.includes("catarsis") || lowMessage.includes("crisis") || lowMessage.includes("angustia")) {
        reply += `\n\n### Guía de Contención para Procesos Emocionales Intensos (Llanto o Catarsis):
La catarsis es un síntoma de que el contenedor de retiro es lo suficientemente seguro para descargar el estrés postraumático o las memorias del dolor.

1. **Respeta la sacralidad de la emoción:** No corras inmediatamente a abrazar o dar pañuelos al participante que llora. Hacerlo de forma abrupta interrumpe la descarga del sistema nervioso y puede hacerlo sentir juzgado o expuesto. Sostiene una mirada de compasión y mantén tu respiración profunda.
2. **Valida el proceso colectivamente:** Incluye al resto del grupo guiándolos a respirar juntos: "La medicina de uno es la medicina de todos. Vamos a tomar aire profundo juntos para sostener este espacio con amor".
3. **Anclaje Físico Sutil:** Coloca suavemente una manta cálida sobre sus hombros o un cojín de apoyo. Si la intensidad es desbordante, pídele con voz suave que coloque las palmas de sus manos planas sobre el suelo para reconectarlo con la estabilidad física de la Tierra.
4. **Acompañamiento Post-sesión:** Al finalizar la actividad, acércate en privado para validar su estado, asegurándole que todo lo liberado es parte de su sanación, y ofrécele un vaso de agua tibia con limón.`;
      } else if (lowMessage.includes("tiempo") || lowMessage.includes("retraso") || lowMessage.includes("reprogram") || lowMessage.includes("agenda") || lowMessage.includes("tarde") || lowMessage.includes("retrasados")) {
        reply += `\n\n### Gestión ante Falta de Tiempo o Desviaciones en la Agenda:
En un retiro consciente, el tiempo debe estar al servicio de la transformación, y no al revés. Es normal y saludable que los bloques orgánicos requieran más permanencia.

1. **Mantén una vibración de paz:** Si tú como facilitador te muestras ansioso o acelerado, contagiarás al grupo. Ralentiza tu caminar y mantén tu tono de voz pausado.
2. **No recortes los cierres:** El error más común es acortar el círculo de reflexión final o la meditación para cumplir con el horario. Es preferible reducir la duración de la dinámica principal o simplificar la introducción teórica.
3. **Fusión Inteligente de Dinámicas:** Si tienes poco tiempo en la tarde, integra un ejercicio somático corto de movimiento justo al inicio del taller introspectivo en lugar de hacerlos en bloques aislados.
4. **Anuncio de Adaptabilidad:** Comunica de manera transparente: "Este espacio es orgánico y nos pide más permanencia hoy. Reajustaremos el bloque de la tarde para honrar el hermoso ritmo que hemos construido juntos". El grupo lo percibirá como maestría y flexibilidad profesional.`;
      } else if (lowMessage.includes("cansad") || lowMessage.includes("sueño") || lowMessage.includes("baja energia") || lowMessage.includes("pesadez") || lowMessage.includes("fatiga") || lowMessage.includes("aburrido") || lowMessage.includes("desganados")) {
        reply += `\n\n### Estrategias para Elevar la Energía del Grupo (Sueño o Pesadez):
La baja de energía es típica después de las comidas (curva digestiva) o tras un bloque de alta carga mental.

1. **Despertar Somático Vocal:** Pon a todos de pie en círculo. Pídeles inhalar elevando los hombros y exhalar dejándolos caer con un sonido liberador y sonoro: "¡HAAAA!". Repite esto tres veces para disolver el cortisol.
2. **Caminata de Conexión Espacial:** Haz que caminen libremente por el salón cambiando de velocidad (del 1 al 10) y de dirección cada vez que toques la campana tibetana. Esto es excelente para reactivar el flujo sanguíneo de inmediato.
3. **Estímulo Olfativo Rápido:** Utiliza una bruma o difusor de aceites esenciales cítricos (limón, naranja) o menta en la sala. Los aromas cítricos activan instantáneamente el sistema límbico y despejan la somnolencia.
4. **Activación rítmica:** Pon una pista musical rítmica de percusión orgánica de fondo y pide sacudir el cuerpo (manos, piernas, cabeza) libremente durante 2 minutos antes de tomar asiento.`;
      } else {
        reply += `\n\nMe preguntas sobre: "${message}".

Como tu Asistente Mentor de Retiro Studio, recuerda los 3 Pilares del Facilitador Líder:
1. **El Contenedor es Sagrado:** Todo lo que surja en la sala es bienvenido. No intentes "corregir" o "solucionar" el dolor de inmediato; dale espacio seguro.
2. **Las Transiciones son la Medicina Secreta:** Nunca pases abruptamente de un taller de alta estimulación mental a uno de relajación sin un puente transicional sutil.
3. **El Facilitador es un Espejo:** Sostén tu propia presencia y respiración abdominal antes de dirigir al grupo.`;
      }

      return res.status(200).json({
        reply,
        warning: "Respuesta del Asistente generada por el motor de contingencia de Retiro Studio AI debido a que no hay una clave de API configurada en el servidor."
      });
    }

    const systemInstruction = `Actúas como un mentor experto y psicólogo transpersonal especializado en la facilitación de retiros de bienestar de alta calidad ("Retiro Studio AI").
Tu función es acompañar al facilitador con consejos prácticos, claros, compasivos y orientados a la acción.
Debes responder en un tono profesional, inspirador, empático y estructurado. Tu lenguaje debe evocar serenidad y autoridad de facilitador experto con años de experiencia.

Aborda siempre las consultas comprendiendo:
1. ¿Por qué ocurre la situación? (Dinámica oculta del grupo)
2. ¿Qué necesita emocionalmente el grupo o el participante?
3. ¿Cuál es la acción inmediata que debe tomar el facilitador paso a paso?

Al responder, utiliza un formato scannable y elegante, estructurando tus guías con viñetas, bloques destacados y pasos claros.

${contextString}

Historial de conversación reciente para contexto:
${JSON.stringify(chatHistory || [])}`;

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
        temperature: 0.7,
      },
    });

    return res.status(200).json({ reply: response.text });

  } catch (err: any) {
    console.error("[api/assistant] Error:", err);
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: "No se pudo consultar al Asistente IA. Por favor reintenta.",
      details: err.message
    });
  }
}
