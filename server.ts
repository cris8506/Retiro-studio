import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { OFFICIAL_DYNAMICS } from "./src/data/dynamics";
import { OFFICIAL_PLAYLISTS } from "./src/data/music";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Mock database to store user-created retreats in-memory so they are interactive during the session
interface Retreat {
  id: string;
  name: string;
  type: string;
  goal: string;
  duration: number;
  participantsCount: number;
  participantsAge: string;
  participantsProfile: string;
  experienceLevel: string;
  locationType: string;
  desiredEnergy: string;
  expectedResults: string;
  description: string;
  idealProfile: string;
  agenda: Array<{
    day: number;
    focus: string;
    activities: Array<{
      id: string;
      time: string;
      title: string;
      duration: number;
      emotionalGoal: string;
      dynamicId?: string;
      dynamicName: string;
      isAiSuggested: boolean;
      materials: string[];
      preparation: string;
      script: string;
      reflectionQuestions: string[];
      closing: string;
      recommendedMusic: string;
      transition: string;
    }>;
  }>;
  materialsList: string[];
  participantsList: Array<{
    name: string;
    dietary: string;
    restrictions: string;
  }>;
  notes: string[];
  progress: number;
}

const retreatsDb: Map<string, Retreat> = new Map();

// Seed database with a sample retreat representing "El Despertar de los Sentidos"
const sampleRetreat: Retreat = {
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
  expectedResults: 'Mayor presencia mental, técnicas de respiración aprendidas, liberación de tensión física.',
  description: 'Un viaje sagrado de tres días para ralentizar el ritmo mental, despertar los sentidos corporales y co-crear una comunidad de apoyo mutuo en Valle de Bravo.',
  idealProfile: 'Personas comprometidas con su bienestar emocional, abiertas a prácticas corporales e introspección en silencio.',
  agenda: [
    {
      day: 1,
      focus: 'Llegada y Seguridad (Enraizamiento)',
      activities: [
        {
          id: 'act_1',
          time: '08:00 AM — 09:30 AM',
          title: 'Círculo de Bienvenida Ceremonial',
          duration: 45,
          emotionalGoal: 'Establecer seguridad, contención, confianza grupal y alinear intenciones comunes.',
          dynamicId: 'circulo_bienvenida',
          dynamicName: 'Círculo de Bienvenida Ceremonial',
          isAiSuggested: false,
          materials: ['Una vela central grande', 'Flores y piedras para el altar', 'Fósforos.'],
          preparation: 'Crear un altar estético en el centro de la sala de reuniones. Asegurar luces tenues y música suave.',
          script: 'Bienvenidos a este santuario de autodescubrimiento. Aquí no hay expectativas de perfección, solo de autenticidad. Nos regalamos este tiempo para pausar y sentir.',
          reflectionQuestions: ['¿Qué se siente al ser escuchado plenamente sin juicios?', '¿Cuál es la intención que guiará tus pasos estos días?'],
          closing: 'Toque de cuenco tibetano, respiración profunda compartida e inicio formal de las actividades.',
          recommendedMusic: 'Cantos Ancestrales - Danit & Poranguí',
          transition: 'Caminata lenta hacia los tapetes de yoga para asentar el cuerpo físico.'
        },
        {
          id: 'act_2',
          time: '10:00 AM — 12:00 PM',
          title: 'Práctica de Despertar Somático',
          duration: 30,
          emotionalGoal: 'Liberar rigidez del viaje, oxigenar las células y anclarse en el cuerpo físico.',
          dynamicId: 'despertar_somatico',
          dynamicName: 'Despertar Somático',
          isAiSuggested: false,
          materials: ['Tapetes de yoga', 'Música instrumental progresiva.'],
          preparation: 'Ventilar bien el salón. Disponer los tapetes de manera que todos se sientan cómodos.',
          script: 'Tu cuerpo es el templo de tu experiencia terrenal. Sacude el cansancio heredado, dale permiso a tus células de vibrar y respirar.',
          reflectionQuestions: ['¿Dónde sentías mayor resistencia?', '¿Cómo fluye tu energía corporal ahora?'],
          closing: 'Estiramiento final, relajación acostados boca arriba y asimilación silenciosa.',
          recommendedMusic: 'Tierra que Late - Liquid Bloom',
          transition: 'Transición hacia el comedor manteniendo una actitud introspectiva.'
        },
        {
          id: 'act_3',
          time: '01:30 PM — 03:00 PM',
          title: 'Almuerzo Consciente en Silencio',
          duration: 60,
          emotionalGoal: 'Experimentar la alimentación consciente y explorar el silencio compartido.',
          dynamicId: 'almuerzo_silencio',
          dynamicName: 'Almuerzo Consciente en Silencio',
          isAiSuggested: false,
          materials: ['Menú orgánico saludable', 'Campana tibetana.'],
          preparation: 'Explicar los lineamientos antes de sentarse a la mesa. Pedir al personal de comedor absoluto silencio.',
          script: 'Deja que tus sentidos despierten al sabor, al color, a la textura de lo que la Tierra te regala hoy. Come como si fuera una meditación.',
          reflectionQuestions: ['¿Cómo cambió tu relación con el alimento?', '¿Qué inquietud surgió en tu mente al habitar el silencio compartido?'],
          closing: 'Sonido suave de campana tibetana y suaves murmullos para finalizar.',
          recommendedMusic: 'El Retorno al Silencio - Ludovico Einaudi',
          transition: 'Espacio libre para descanso y descanso meditativo individual.'
        }
      ]
    }
  ],
  materialsList: [
    'Tapetes de Yoga Premium (20)',
    'Cuencos de Cuarzo',
    'Kits de Escritura Orgánica',
    'Incienso de Sándalo Real',
    'Mantas de Lana Merino'
  ],
  participantsList: [
    { name: 'Elena Martínez', dietary: 'Vegana', restrictions: 'Alergia Nueces' },
    { name: 'Julián Rivera', dietary: 'Sin restricciones', restrictions: 'Ninguna' }
  ],
  notes: [
    'Recordar que el silencio en el almuerzo es de 30 minutos totales. Preparar la campana tibetana.',
    'Asegurar que los kits de escritura estén dispuestos en los cojines antes de la sesión de la tarde.'
  ],
  progress: 70
};

retreatsDb.set(sampleRetreat.id, sampleRetreat);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", seeded: true, apiKeyConfigured: !!apiKey });
});

// Endpoint to list retreats
app.get("/api/retreats", (req, res) => {
  res.json(Array.from(retreatsDb.values()));
});

// Endpoint to get a single retreat
app.get("/api/retreats/:id", (req, res) => {
  const retreat = retreatsDb.get(req.params.id);
  if (!retreat) {
    return res.status(404).json({ error: "Retiro no encontrado" });
  }
  res.json(retreat);
});

// Endpoint to update materials, notes, or progress of a retreat
app.patch("/api/retreats/:id", (req, res) => {
  const retreat = retreatsDb.get(req.params.id);
  if (!retreat) {
    return res.status(404).json({ error: "Retiro no encontrado" });
  }
  const updated = { ...retreat, ...req.body };
  retreatsDb.set(req.params.id, updated);
  res.json(updated);
});

// Helper: Format official dynamics into a string text block for Gemini context
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

// Helper to generate a highly detailed, personalized, custom retreat when Gemini is not configured or fails.
// Features: Dynamic day focus, specific meals (Breakfast, Lunch, Dinner), precise music with artist and room volume, and consolidated materials checklists.
const generateFallbackRetreat = (
  name: string,
  type: string,
  goal: string,
  duration: number,
  participantsCount: number,
  participantsAge: string,
  participantsProfile: string,
  experienceLevel: string,
  locationType: string,
  desiredEnergy: string,
  expectedResults: string
): Retreat => {
  const id = 'retreat_' + Date.now();
  
  const agenda = Array.from({ length: duration }).map((_, dIdx) => {
    const dayNum = dIdx + 1;
    let dayFocus = "";
    let acts = [];
    
    if (dayNum === 1) {
      dayFocus = "Apertura, Seguridad y Enraizamiento Colectivo";
      acts = [
        {
          time: '08:00 AM — 09:15 AM',
          title: 'Desayuno de Enraizamiento en Silencio (Alimentación)',
          duration: 75,
          emotionalGoal: 'Iniciar el retiro nutriendo el cuerpo físico en presencia absoluta para asentar el silencio mental.',
          dynamicId: 'almuerzo_silencio',
          dynamicName: 'Desayuno Consciente en Silencio',
          isAiSuggested: false,
          materials: ['Fruta de estación picada', 'Tés herbales y café orgánico', 'Letreros de madera de "Presencia y Silencio"', 'Campana tibetana de mano'],
          preparation: 'Disponer las mesas de manera espaciosa. Encender incienso sutil. Colocar un letrero de "Silencio Sagrado" en la entrada.',
          script: 'Bienvenidos a su primer alimento en este espacio sagrado. Los invito a depositar sus dispositivos fuera de la mesa y saborear cada ingrediente en absoluto silencio, permitiendo que su atención descienda de la mente pensante hacia los sentidos físicos.',
          reflectionQuestions: ['¿Qué sensaciones o sabores percibiste con mayor nitidez al comer sin ruidos externos?', '¿Qué tan difícil le resultó a tu mente sostener el silencio inicial?'],
          closing: 'Tocar tres veces la campana tibetana sutilmente indicando el cierre del bloque de comida.',
          recommendedMusic: 'Aura of Silence - Deuter (Ajustar volumen en comedor al 20%)',
          transition: 'Caminar despacio y en fila silenciosa hacia el salón circular para el encuentro de apertura.'
        },
        {
          time: '09:30 AM — 11:30 AM',
          title: 'Círculo de Bienvenida Ceremonial y Altar',
          duration: 120,
          emotionalGoal: 'Establecer el contenedor de seguridad y contención mutua, compartir intenciones profundas y vulnerabilidad.',
          dynamicId: 'circulo_bienvenida',
          dynamicName: 'Círculo de Bienvenida Ceremonial',
          isAiSuggested: false,
          materials: ['Vela central grande de cera de abejas', 'Flores silvestres de colores', 'Piedras de río', 'Copal o sahumerio de sándalo', 'Cojines de meditación para todos'],
          preparation: 'Crear un altar circular estético en el centro. Asegurar luces tenues y temperatura agradable en sala.',
          script: 'En este círculo sagrado, dejamos fuera los roles cotidianos. Aquí eres bienvenido exactamente como estás hoy: con tu cansancio, tus temores, tus anhelos o tu dolor. Este es un espacio de no-juicio y profunda contención grupal.',
          reflectionQuestions: ['¿Qué etiqueta o peso cotidiano decides dejar hoy fuera de este círculo?', '¿Cuál es la intención profunda que guiará tus respiraciones durante estos días?'],
          closing: 'Cada participante toma una flor, comparte su intención en voz alta y la coloca en el altar central como compromiso visual.',
          recommendedMusic: 'Cantos Ancestrales - Danit & Poranguí (Volumen en sala al 45%)',
          transition: 'Hacer tres exhalaciones sonoras y estirar los brazos antes de salir al jardín.'
        },
        {
          time: '01:30 PM — 03:00 PM',
          title: 'Almuerzo de Integración Sensorial (Alimentación)',
          duration: 90,
          emotionalGoal: 'Nutrir el templo físico con alimentos orgánicos, estimulando los sentidos para asentar los aprendizajes de la mañana.',
          dynamicId: undefined,
          dynamicName: 'Almuerzo Sensorial Consciente',
          isAiSuggested: true,
          materials: ['Almuerzo vegetariano colorido y alto en nutrientes', 'Difusor de aromaterapia con aceite esencial de menta y limón'],
          preparation: 'Ventilar el comedor para que el aire sea fresco. Encender el difusor 15 minutos antes. Disponer platos calientes.',
          script: 'El alimento es energía pura de la tierra. Siente la calidez de este plato. Saborea cada bocado agradeciendo a los elementos y las manos que cultivaron esta medicina. Nutre tu presencia.',
          reflectionQuestions: ['¿De qué manera la velocidad con la que comes afecta tu nivel de estrés interno?', '¿Qué notas en tu respiración mientras masticas con conciencia?'],
          closing: 'Depositar las manos en el centro del pecho en señal de gratitud mutua.',
          recommendedMusic: 'Flautas Sagradas - Deuter (Volumen bajo de fondo al 25%)',
          transition: 'Disfrutar de un espacio libre de 45 minutos para caminar descalzos en el césped o descansar bajo un árbol.'
        },
        {
          time: '04:00 PM — 06:00 PM',
          title: 'Dinámica de Enlace: El Hilo de la Red Invisible',
          duration: 120,
          emotionalGoal: 'Consolidar la cohesión del contenedor, fomentando la empatía y visualizando los lazos invisibles de apoyo mutuo.',
          dynamicId: 'hilo_red',
          dynamicName: 'El Hilo de la Red Invisible',
          isAiSuggested: false,
          materials: ['Un ovillo grande de lana o hilo de color natural o tierra'],
          preparation: 'Reunir al grupo de nuevo en círculo. Tener listo el ovillo de lana en manos del facilitador.',
          script: 'Estamos unidos por hilos invisibles de presencia y empatía profunda. Al lanzar este ovillo, tejemos una red geométrica en el centro de nuestra comunidad: un campo de contención donde si alguien tambalea, la red lo sostiene.',
          reflectionQuestions: ['¿Cómo se siente notar visualmente que eres parte indispensable de este tejido?', '¿Qué emoción te genera saber que hay una red humana sosteniendo tu experiencia hoy?'],
          closing: 'Cortar el hilo de lana para que cada persona ate un fragmento alrededor de su muñeca izquierda como recordatorio físico.',
          recommendedMusic: 'Tierra que Late - Liquid Bloom (Volumen rítmico progresivo de 35% a 50%)',
          transition: 'Compartir un abrazo grupal en silencio y caminar con calma al comedor para la cena.'
        },
        {
          time: '08:00 PM — 09:30 PM',
          title: 'Cena de Diálogo Consciente (Alimentación)',
          duration: 90,
          emotionalGoal: 'Integrar las vivencias del primer día mediante una comunicación verbal consciente y de alta escucha.',
          dynamicId: undefined,
          dynamicName: 'Cena de Luz de Velas y Palabra Activa',
          isAiSuggested: true,
          materials: ['Velas pequeñas de té en frascos de vidrio', 'Tarjetas escritas a mano con preguntas profundas de indagación'],
          preparation: 'Apagar luces eléctricas intensas del comedor y encender únicamente velas en el centro de las mesas. Dejar una tarjeta sobre cada mesa.',
          script: 'Compartimos esta cena para nutrirnos física y espiritualmente. Los invito a tomar una tarjeta por mesa y responder desde la vulnerabilidad del corazón, practicando la escucha activa sin interrumpir.',
          reflectionQuestions: ['¿Qué respuesta de tu compañero resonó con tu propia historia de vida?', '¿De qué te sientes más agradecido en esta primera jornada de retiro?'],
          closing: 'Soplar colectivamente las velas con una exhalación profunda al unísono.',
          recommendedMusic: 'Nuvole Bianche - Ludovico Einaudi (Volumen suave al 30%)',
          transition: 'Fomentar el silencio nocturno digital y retirarse a descansar con el corazón liviano.'
        }
      ];
    } else if (dayNum === duration && duration > 1) {
      dayFocus = "Integración Sutil, Cierre Formal y Retorno Consciente al Mundo";
      acts = [
        {
          time: '08:00 AM — 09:15 AM',
          title: 'Desayuno de Gratitud Compartida (Alimentación)',
          duration: 75,
          emotionalGoal: 'Celebrar los lazos del contenedor grupal expresando agradecimiento activo antes del cierre del proceso.',
          dynamicId: undefined,
          dynamicName: 'Desayuno de Gratitud Activa',
          isAiSuggested: true,
          materials: ['Alimentos saludables de fácil digestión', 'Notas de papel kraft', 'Lápices ecológicos', 'Caja de madera para mensajes'],
          preparation: 'Disponer las notas de papel kraft y lápices en la entrada del comedor para uso libre.',
          script: 'Hoy iniciamos nuestra última jornada de inmersión. Mientras desayunamos de manera pausada, escribe un mensaje de gratitud anónimo para algún compañero del círculo y colócalo en la caja común.',
          reflectionQuestions: ['¿Qué tan fácil te resulta recibir palabras de aprecio genuinas?', '¿Cómo ha mutado tu sensación de soledad desde el primer día?'],
          closing: 'El facilitador lee al azar tres mensajes de la caja común para ambientar el comedor con amor.',
          recommendedMusic: 'Glow - Liquid Bloom (Volumen suave de fondo al 25%)',
          transition: 'Desplazarse en calma hacia la sala principal para anclar la visión de futuro.'
        },
        {
          time: '09:30 AM — 11:30 AM',
          title: 'Taller de Proyección: Mapa de Visión Intuitivo',
          duration: 120,
          emotionalGoal: 'Plasmar e integrar los aprendizajes emocionales del retiro, anclándolos mediante la creatividad intuitiva.',
          dynamicId: 'mapa_vision',
          dynamicName: 'Mapa de Visión Intuitivo',
          isAiSuggested: false,
          materials: ['Cartulinas kraft de gran formato', 'Revistas variadas de naturaleza y bienestar', 'Tijeras', 'Pegamento en barra', 'Lápices de colores pastel'],
          preparation: 'Disponer los materiales de arte sobre mantas en el suelo o en mesas grandes. Poner música instrumental estimulante.',
          script: 'Esta cartulina es tu lienzo. Deja que tus manos recorten imágenes sin la intervención del juicio intelectual. Tu alma sabe perfectamente qué medicina, recordatorios y compromisos necesitas llevar grabados en tu retina.',
          reflectionQuestions: ['¿Qué imagen te sorprendió recortar de las revistas y qué representa hoy para ti?', '¿Cuál es el compromiso principal e innegociable de autocuidado que te llevas contigo al regresar a casa?'],
          closing: 'Compartir el mapa visual terminado en parejas, mirándose fijamente a los ojos durante un minuto.',
          recommendedMusic: 'We Are One - East Forest (Volumen en sala al 45%)',
          transition: 'Preparar en silencio los equipajes personales antes del almuerzo festivo.'
        },
        {
          time: '01:30 PM — 03:00 PM',
          title: 'Almuerzo de Celebración y Brindis de Agua (Alimentación)',
          duration: 90,
          emotionalGoal: 'Honrar el camino transitado y celebrar la fuerza colectiva construida.',
          dynamicId: undefined,
          dynamicName: 'Almuerzo Festivo Comunitario',
          isAiSuggested: true,
          materials: ['Menú festivo orgánico', 'Copas de agua con rodajas de cítricos frescos'],
          preparation: 'Colocar arreglos florales alegres y abundantes en las mesas de comedor.',
          script: 'Brindamos hoy con esta agua pura por nuestra valentía de pausar, por la vulnerabilidad compartida y por el amor incondicional que sostiene este círculo sagrado de facilitación.',
          reflectionQuestions: ['¿Cuál fue el mayor obstáculo que derribaste en estos días?', '¿Qué regalo invisible te llevas del resto del grupo?'],
          closing: 'Brindis de agua grupal sonriendo y agradeciendo al personal de cocina.',
          recommendedMusic: 'Tierra que Late - Liquid Bloom & Poranguí (Volumen festivo al 40%)',
          transition: 'Caminar del brazo de los compañeros hacia el círculo final de cierre ceremonial.'
        },
        {
          time: '03:30 PM — 05:30 PM',
          title: 'Círculo de Cierre Ceremonial y Cuencos de Cuarzo',
          duration: 120,
          emotionalGoal: 'Cerrar formalmente el umbral transformacional del retiro, asimilar el proceso sutil y despedirse en gracia.',
          dynamicId: undefined,
          dynamicName: 'Ceremonia Final de Clausura',
          isAiSuggested: true,
          materials: ['Cuencos de cuarzo o tibetanos', 'Brumas aromáticas de lavanda', 'Velas encendidas'],
          preparation: 'Limpiar el centro de la sala y encender las velas del altar para la despedida formal.',
          script: 'El retiro físico culmina en este instante, pero la paz y soberanía emocional que has despertado en tu interior te acompañan de regreso a tu hogar. Eres tu propio santuario de luz.',
          reflectionQuestions: ['¿Qué palabra define el estado con el que cruzas este umbral de regreso?', '¿De qué forma concreta protegerás tu espacio de paz diario a partir de mañana?'],
          closing: 'Hacer sonar los cuencos de cuarzo durante 5 minutos en absoluto silencio colectivo, culminando con un aplauso de gozo.',
          recommendedMusic: 'Experience - Ludovico Einaudi (Volumen progresivo de 35% a 65% en clímax)',
          transition: 'Abrazos libres de agradecimiento y partida de los participantes de manera consciente.'
        }
      ];
    } else {
      dayFocus = `Profundización del Proceso Interno y Desintoxicación (Día ${dayNum})`;
      acts = [
        {
          time: '08:00 AM — 09:15 AM',
          title: `Desayuno Nutritivo en Silencio — Día ${dayNum} (Alimentación)`,
          duration: 75,
          emotionalGoal: 'Facilitar la asimilación del descanso nocturno y entrar al nuevo día con una mente despejada.',
          dynamicId: 'almuerzo_silencio',
          dynamicName: 'Desayuno Consciente en Silencio',
          isAiSuggested: false,
          materials: ['Fruta de estación', 'Té de jazmín', 'Campana tibetana'],
          preparation: 'Ventilar e iluminar con luz natural sutil el comedor.',
          script: 'Entramos de nuevo en el templo del silencio corporal. Saborea el dulzor natural de los frutos. El silencio no es la ausencia de sonido, sino la presencia de la esencia.',
          reflectionQuestions: ['¿Cómo se sintió tu despertar corporal hoy en comparación con ayer?', '¿Qué pensamientos intentan distraerte de habitar tu cuerpo en el momento presente?'],
          closing: 'Tocar una sola vez el cuenco tibetano al terminar.',
          recommendedMusic: 'East of the Full Moon - Deuter (Volumen en sala al 25%)',
          transition: 'Caminar despacio y con respiración abdominal rítmica hacia el salón de prácticas somáticas.'
        },
        {
          time: '09:30 AM — 11:30 AM',
          title: 'Práctica de Despertar Somático y Liberación Corporal',
          duration: 120,
          emotionalGoal: 'Movilizar y liberar la rigidez de las articulaciones, oxigenar las células y disolver el cortisol estancado.',
          dynamicId: 'despertar_somatico',
          dynamicName: 'Despertar Somático',
          isAiSuggested: false,
          materials: ['Tapetes de yoga', 'Manta fina de relajación', 'Difusor con aroma de eucalipto'],
          preparation: 'Limpiar el salón con esencias frescas de eucalipto. Tener las mantas dobladas al lado de cada tapete.',
          script: 'Sacude tus muñecas. Siente la planta de tus pies conectada al suelo. El cuerpo guarda historias que la mente intenta ocultar. Permítele sacudirse la rigidez y exhalar libremente.',
          reflectionQuestions: ['¿En qué zona física experimentaste mayor rigidez y cómo cambió tras movilizarla?', '¿Qué emoción asociada a esa zona física lograste disolver?'],
          closing: 'Relajación profunda en Shavasana (boca arriba) sintiendo el sostén físico del suelo.',
          recommendedMusic: 'Sacred Grass - Liquid Bloom (Volumen al 45%)',
          transition: 'Beber agua fresca y reunirse en el exterior para iniciar la caminata de baño forestal.'
        },
        {
          time: '01:30 PM — 03:00 PM',
          title: `Almuerzo de Enraizamiento y Densidad Natural — Día ${dayNum} (Alimentación)`,
          duration: 90,
          emotionalGoal: 'Nutrir la presencia corporal con vegetales de tierra para sostener la jornada de profundización emocional.',
          dynamicId: undefined,
          dynamicName: 'Almuerzo de Conexión Terrestre',
          isAiSuggested: true,
          materials: ['Caldo de vegetales con jengibre', 'Arroz integral con raíces horneadas', 'Infusión caliente'],
          preparation: 'Colocar mesas rústicas al aire libre si el clima lo permite, o cerca de ventanas grandes.',
          script: 'El alimento caliente asienta el sistema nervioso. Recibe esta nutrición como medicina de enraizamiento. Siente el jengibre calentando tus canales internos.',
          reflectionQuestions: ['¿Cómo repercute la temperatura de los alimentos en tu nivel de calma nerviosa?', '¿Sientes saciedad digestiva o mental?'],
          closing: 'Colocar la mano derecha sobre el corazón para un segundo de reverencia sutil.',
          recommendedMusic: 'Wind & Mountain - Deuter (Volumen de fondo al 25%)',
          transition: 'Tiempo libre introspectivo de descanso para pasear por los senderos arbolados.'
        },
        {
          time: '04:00 PM — 06:00 PM',
          title: 'Caminata Consciente y Baño de Silencio',
          duration: 120,
          emotionalGoal: 'Reconectar de manera profunda con el ritmo orgánico de la naturaleza y abrir los canales sensoriales táctiles.',
          dynamicId: 'caminata_consciente',
          dynamicName: 'Caminata Consciente',
          isAiSuggested: false,
          materials: ['Sendero arbolado seguro o jardines del predio'],
          preparation: 'Recorrer previamente el sendero y retirar cualquier obstáculo cortante o riesgoso.',
          script: 'Camina como si tus pies estuvieran besando la corteza de la tierra. A cada paso inhala la fragancia del pino, a cada paso exhala el pasado. El bosque no te exige nada, solo te sostiene.',
          reflectionQuestions: ['¿Qué sonido de la naturaleza resonó con mayor fuerza dentro de tu propia mente?', '¿Cómo se siente pertenecer a un ecosistema vivo sin la prisa de producir nada?'],
          closing: 'Reunirse de pie abrazando de manera visual un árbol antiguo compartiendo su estabilidad.',
          recommendedMusic: 'Guacamaya - Danit (Ajustar volumen al 35% si es espacio semi-interior, o silencio natural)',
          transition: 'Regresar en silencio contemplativo hacia la sala de cojines para prepararse para la cena.'
        },
        {
          time: '08:00 PM — 09:30 PM',
          title: `Cena de Luz Cálida e Integración Sutil — Día ${dayNum} (Alimentación)`,
          duration: 90,
          emotionalGoal: 'Consolidar las vivencias físicas del día en una atmósfera de alta paz y contención sutil.',
          dynamicId: undefined,
          dynamicName: 'Cena a la Luz de las Velas',
          isAiSuggested: true,
          materials: ['Cena orgánica ligera de fácil digestión', 'Música de piano acústico suave'],
          preparation: 'Atenuar las luces, encender veladoras de cera de abejas en las mesas de comedor.',
          script: 'Cenamos esta noche en un espacio de paz conquistado. Siente el calor de esta sopa, la calidez de la compañía que te rodea. Estás a salvo en este contenedor.',
          reflectionQuestions: ['¿Qué resistencia interna lograste soltar hoy en el bosque?', '¿Qué mensaje de paz te susurra tu cuerpo al finalizar esta jornada?'],
          closing: 'Compartir una infusión tibia sosteniendo la taza con ambas manos en silencio.',
          recommendedMusic: 'Giorni Dispari - Ludovico Einaudi (Volumen suave al 30%)',
          transition: 'Cerrar el día con silencio nocturno absoluto promoviendo el descanso digital profundo.'
        }
      ];
    }

    return {
      day: dayNum,
      focus: dayFocus,
      activities: acts.map((act, actIdx) => ({
        id: `act_${dayNum}_${actIdx + 1}`,
        time: act.time,
        title: act.title,
        duration: act.duration,
        emotionalGoal: act.emotionalGoal,
        dynamicId: act.dynamicId,
        dynamicName: act.dynamicName,
        isAiSuggested: act.isAiSuggested,
        materials: act.materials,
        preparation: act.preparation,
        script: act.script,
        reflectionQuestions: act.reflectionQuestions,
        closing: act.closing,
        recommendedMusic: act.recommendedMusic,
        transition: act.transition
      }))
    };
  });

  const materialsList = Array.from(new Set(agenda.flatMap(day => day.activities.flatMap(act => act.materials))));

  const description = `Un retiro magistral de ${duration} días titulado "${name}" diseñado con fundamentos neuroacústicos y espirituales para albergar y canalizar una energía "${desiredEnergy}". Especialmente estructurado para acompañar a ${participantsProfile} a transitar un contenedor transformador de nivel ${experienceLevel} y alcanzar ${expectedResults}.`;
  
  const idealProfile = `Participantes con perfil de "${participantsProfile}" de nivel de experiencia "${experienceLevel}", que anhelan ${expectedResults} y buscan habitar un contenedor seguro rodeados de una energía "${desiredEnergy}".`;

  return {
    id,
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
    description,
    idealProfile,
    agenda,
    materialsList,
    participantsList: [
      { name: 'Elena Martínez', dietary: 'Vegana', restrictions: 'Alergia Nueces' },
      { name: 'Julián Rivera', dietary: 'Sin restricciones', restrictions: 'Ninguna' }
    ],
    notes: [
      '🔴 [IMPORTANTE] Verificar de manera proactiva que el servicio de catering atienda la restricción alimentaria de Elena Martínez (Alergia a las nueces, menú vegano).',
      '⚙️ [LOGÍSTICA] Comprar y disponer todos los insumos creativos para el Mapa de Visión el último día del retiro (cartulinas, revistas variadas, pegamentos, tijeras).',
      '📝 Facilitar un recordatorio al inicio del retiro para depositar los teléfonos móviles en una cesta segura y favorecer la desconexión total del cortisol.',
      '📝 Mantener los volúmenes en comedor regulados por debajo de un 30% para sostener la vibración introspectiva de los alimentos consciente.'
    ],
    progress: 40
  };
};

// Helper to sanitize and parse JSON response from Gemini
const cleanAndParseJson = (text: string): any => {
  if (!text) return {};
  let cleaned = text.trim();
  // Remove markdown code block markers
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").trim();
  }
  return JSON.parse(cleaned);
};

// MÓDULO 1: DISEÑADOR INTELIGENTE DE RETIROS
app.post("/api/generate-retreat", async (req, res) => {
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
      return res.status(400).json({ error: "Faltan campos obligatorios (nombre, tipo y objetivo principal)." });
    }

    const requestedDuration = Number(duration) || 3;
    const requestedCount = Number(participantsCount) || 15;

    // Check if API key is configured or valid
    if (!apiKey || apiKey === "undefined" || apiKey.includes("MY_GEMINI_API_KEY")) {
      console.log("No valid Gemini API Key detected. Using robust Dynamic Local Generator fallback.");
      const generated = generateFallbackRetreat(
        name, type, goal, requestedDuration, requestedCount,
        participantsAge || "30-50 años", participantsProfile || "General",
        experienceLevel || "Principiante", locationType || "Naturaleza",
        desiredEnergy || "Serena", expectedResults || "Paz mental"
      );
      retreatsDb.set(generated.id, generated);
      return res.json({ 
        retreat: generated,
        warning: "Se utilizó el Generador de Alta Fidelidad de Retiro Studio AI debido a que no hay una clave de API configurada." 
      });
    }

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

    // Set a timeout of 22 seconds for Gemini API to keep things fast
    const generatePromise = ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout calling Gemini API")), 22000);
    });

    // Race the generation against timeout
    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    const responseText = response.text || "";
    console.log("Gemini API call returned successfully. Parsing response...");
    
    const parsedData = cleanAndParseJson(responseText);

    // Add unique ID and process the parsed response
    const id = 'retreat_' + Date.now();
    const generatedRetreat: Retreat = {
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

    retreatsDb.set(id, generatedRetreat);
    console.log(`Retreat "${name}" generated successfully with ID ${id}`);
    res.json({ retreat: generatedRetreat });

  } catch (err: any) {
    console.error("Failed to generate retreat via Gemini, using dynamic fallback generator:", err.message);
    // If anything fails (API error, JSON error, parsing error), we fallback gracefully
    // to our high-fidelity, custom dynamic retreat generator so the user NEVER experiences a hang!
    const fallbackRetreat = generateFallbackRetreat(
      name, type, goal, Number(duration) || 3, Number(participantsCount) || 15,
      participantsAge || "30-50 años", participantsProfile || "General",
      experienceLevel || "Principiante", locationType || "Naturaleza",
      desiredEnergy || "Serena", expectedResults || "Integración profunda"
    );
    retreatsDb.set(fallbackRetreat.id, fallbackRetreat);
    res.json({ 
      retreat: fallbackRetreat,
      warning: "La generación con IA fue canalizada a través del generador dinámico de respaldo para asegurar la respuesta inmediata. ¡Tu retiro está listo!"
    });
  }
});

// MÓDULO 3: ASISTENTE DEL FACILITADOR
app.post("/api/assistant", async (req, res) => {
  try {
    const { message, currentRetreatId, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Falta el mensaje para el Asistente IA." });
    }

    const retreatContext = currentRetreatId ? retreatsDb.get(currentRetreatId) : null;
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

    // Robust check for missing or placeholder API Keys
    if (!apiKey || apiKey === "undefined" || apiKey.includes("MY_GEMINI_API_KEY")) {
      // High-quality static/rule-based assistant feedback if Gemini is not configured
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
2. **Caminata de Conexión Espacial:** Haz que caminen libremente por el salón cambiando de velocidad (del 1 al 10) y de dirección cada vez que toques la campana tibetana. Esto estimula el flujo sanguíneo de inmediato.
3. **Estímulo Olfativo Rápido:** Utiliza una bruma o difusor de aceites esenciales cítricos (limón, naranja) o menta en la sala. Los aromas cítricos activan instantáneamente el sistema límbico y despejan la somnolencia.
4. **Activación rítmica:** Pon una pista musical rítmica de percusión orgánica de fondo y pide sacudir el cuerpo (manos, piernas, cabeza) libremente durante 2 minutos antes de tomar asiento.`;
      } else if (lowMessage.includes("inicio") || lowMessage.includes("bienvenida") || lowMessage.includes("rompehielos") || lowMessage.includes("presentar") || lowMessage.includes("presentacion") || lowMessage.includes("abrir") || lowMessage.includes("apertura") || lowMessage.includes("primer dia") || lowMessage.includes("comenzar")) {
        reply += `\n\n### Dinámicas y Recomendaciones para la Apertura y Bienvenida (Primer Día):
El inicio del retiro define las bases de la confianza del contenedor. La prioridad absoluta aquí es desarticular la ansiedad social y consagrar las reglas.

1. **La Co-creación del Altar:** Pide a cada participante que traiga un objeto pequeño significativo o elija una flor. Al ingresar, lo colocarán en el altar circular del centro de la sala, materializando visualmente su aporte y compromiso con el contenedor sagrado.
2. **Definición de Acuerdos del Contenedor:** Establece acuerdos claros en conjunto. No los llames "reglas", llámalos "Acuerdos de Presencia":
   - **Confidencialidad absoluta:** Lo que se dice en el círculo, se queda en el círculo.
   - **No-juicio:** Recibimos el sentir de los demás sin intentar dar consejos no pedidos o juzgar.
   - **Desconexión Digital:** Depositar los teléfonos móviles en una cesta segura fuera del salón.
3. **Círculo de Bienvenida Ceremonial (Dinámica Oficial):** Reúne al grupo en círculo, enciende una vela central y guíalos a compartir su nombre y cuál es el peso de la vida cotidiana que eligen soltar durante estos días. Sostén música ancestral de Danit o Poranguí de fondo.`;
      } else if (lowMessage.includes("cierre") || lowMessage.includes("clausura") || lowMessage.includes("terminar") || lowMessage.includes("final") || lowMessage.includes("despedida") || lowMessage.includes("integracion") || lowMessage.includes("ultimo dia")) {
        reply += `\n\n### Estructuración del Cierre, Clausura e Integración Final:
El último bloque de un retiro es el umbral de retorno. Los participantes necesitan anclar sus vivencias emocionales para que la paz no se disuelva al llegar a casa.

1. **La Dinámica del Mapa de Visión Intuitivo:** Bríndales cartulina kraft, revistas y tijeras. Pídeles plasmar de forma no verbal un collage con imágenes que representen sus compromisos innegociables de autocuidado. Esto activa el pensamiento simbólico protector de la mente.
2. **Círculo de Palabra Sintética:** Reúne al grupo alrededor del altar por última vez. Cada participante toma el objeto de habla y comparte exactamente una palabra o frase corta que capture su transformación del retiro.
3. **El Amuleto de Retorno:** Entrega a cada uno un pequeño recordatorio físico consagrado en el altar (una pequeña piedra de río pulida, una semilla, una pulsera de hilo natural) que sirva como anclaje táctil diario para regresar a su estado de paz en la rutina.
4. **Abrazos de Gratitud:** Facilita un espacio libre donde puedan despedirse de manera física e integradora antes de partir, cerrando con un aplauso colectivo de celebración.`;
      } else if (lowMessage.includes("musica") || lowMessage.includes("sonido") || lowMessage.includes("cancion") || lowMessage.includes("playlist") || lowMessage.includes("audio") || lowMessage.includes("cuenco") || lowMessage.includes("instrumental") || lowMessage.includes("reproducir")) {
        reply += `\n\n### El Manejo Acústico y Uso de Música en Retiros:
La música es un conductor vibracional directo hacia el cerebro límbico. Modula la química cerebral y la profundidad del grupo.

1. **Control de Volúmenes por Actividad:**
   - **Bloques de Alimentación:** Mantén la música a un volumen muy tenue de fondo (15-20%) para que no compita con el silencio o la conversación consciente.
   - **Talleres Somáticos / Movimiento:** Puedes elevar progresivamente el volumen de percusiones orgánicas hasta un 50-55% para guiar la activación.
   - **Meditación / Silencio:** Música ambiental de texturas de sonido sutil por debajo de un 25%.
2. **Recomendaciones de Artistas y Playlists:**
   - **Para Apertura y Círculos:** Danit, Poranguí, Shimshai (fomentan el sentido de pertenencia ancestral).
   - **Para Movimiento / Yoga:** Liquid Bloom, Desert Dwellers (música electrónica orgánica de texturas profundas).
   - **Para Silencio y Meditaciones:** Deuter, East Forest, cuencos de cuarzo o tibetanos.
   - **Para Integración y Cenas:** Ludovico Einaudi, piano acústico minimalista, Yann Tiersen.
3. **El Desvanecimiento Gradual:** Nunca detengas una pista de música abruptamente al finalizar una dinámica. Dedica 10-15 segundos a bajar el potenciómetro gradualmente hasta fundirse con el silencio natural.`;
      } else if (lowMessage.includes("comida") || lowMessage.includes("alimentacion") || lowMessage.includes("almuerzo") || lowMessage.includes("cena") || lowMessage.includes("desayuno") || lowMessage.includes("nutricion") || lowMessage.includes("dietas") || lowMessage.includes("alergias")) {
        reply += `\n\n### Directrices para la Alimentación Consciente en Retiros:
El alimento físico es la medicina que sostiene la estabilidad del contenedor de retiro. Las digestiones pesadas saturan de sangre el estómago y reducen la claridad cerebral.

1. **Menús de Alta Vitalidad:** Diseña menús basados en ingredientes orgánicos locales, ligeros, limpios y libres de toxinas. Prioriza vegetales de raíz horneados (para enraizamiento), caldos templados y cereales germinados. Evita azúcares procesados o carnes rojas de digestión lenta.
2. **El Almuerzo de Silencio Sagrado (Práctica Clave):** Dedica al menos un almuerzo o desayuno del retiro a comer en absoluto silencio de forma guiada. Pide a los participantes masticar cada bocado al menos 30 veces para ralentizar la ingesta y despertar los sentidos gustativos.
3. **Rigurosidad con Alergias y Restricciones:** Asegúrate de revisar detenidamente la lista de restricciones de salud. Por ejemplo, en el grupo actual, verifica proactivamente con cocina que Elena Martínez reciba platos libres de trazas de nueces debido a su alergia severa.
4. **Infusiones de Integración:** Mantén una estación permanente de agua caliente con hojas de jengibre fresco, menta, manzanilla y limón para facilitar la asimilación digestiva continua.`;
      } else if (lowMessage.includes("silencio") || lowMessage.includes("noble") || lowMessage.includes("no hablar") || lowMessage.includes("introspeccion")) {
        reply += `\n\n### Prácticas de Silencio Consciente en el Contenedor:
El silencio es el espacio fértil donde la mente suspende el compromiso social de dar respuestas premeditadas, permitiendo que surja el verdadero ser.

1. **Introducción Progresiva:** No impongas 24 horas de silencio absoluto el primer día. Comienza con micro-silencios, como desayunar en silencio durante 30 minutos, y luego expande la práctica de forma progresiva.
2. **El Gesto del Corazón:** Enseña un lenguaje gestual universal para comunicarse sin emitir sonidos: llevar la mano derecha al centro del pecho con una leve reverencia. Esto permite que los participantes validen su presencia mutuamente sin quebrar el silencio.
3. **Diario de Flujo de Conciencia:** Suministra libretas de papel kraft desde el inicio. El silencio físico debe ser acompañado de la descarga escrita para evitar la saturación mental.
4. **La Campana Tibetana como Guía:** Utiliza el tañido de la campana como única señal de inicio y cierre de los bloques de silencio, evitando dar explicaciones verbales innecesarias.`;
      } else if (lowMessage.includes("lugar") || lowMessage.includes("locacion") || lowMessage.includes("hotel") || lowMessage.includes("instalaciones") || lowMessage.includes("habitaciones") || lowMessage.includes("naturaleza") || lowMessage.includes("clima")) {
        reply += `\n\n### Directrices Logísticas de Locación y Espacios de Trabajo:
El confort básico y la estética visual de la locación sustentan la sensación de contención emocional en la pirámide de necesidades del participante.

1. **Climatización y Ventilación Activa:** Entrar a una sala fría o sofocante bloquea el sistema nervioso. Ventila el espacio 20 minutos antes de cada sesión grupal y utiliza calefacción o mantas finas de lana si el clima desciende.
2. **La Geometría Sagrada de la Sala:** Dispone siempre los cojines y tapetes en un círculo perfecto alrededor de un altar central. Evita filas o estructuras lineales de estilo escolar que inhiben la equidad del grupo.
3. **Espacios Seguros Alternos:** Identifica un rincón arbolado con sombra o una sala privada pequeña de la locación para poder retirar con calma a un participante si requiere una sesión de contención personal fuera del salón principal.
4. **Inmersión en la Naturaleza:** Aprovecha el entorno. Si el retiro es en la naturaleza, programa la 'Caminata Consciente de Enraizamiento' en el bosque para descargar el exceso de ondas electromagnéticas del grupo.`;
      } else if (lowMessage.includes("conflicto") || lowMessage.includes("tension") || lowMessage.includes("pelea") || lowMessage.includes("discusion") || lowMessage.includes("dos personas") || lowMessage.includes("molesto")) {
        reply += `\n\n### Resolución de Conflictos y Tensión Grupal en Sala:
En los círculos íntimos de sanación, las incomodidades hacia otros participantes son proyecciones de heridas emocionales personales de la infancia.

1. **Haz de la tensión una medicina consciente:** No evites la fricción. Abórdala desde un lugar de compasión: "En este espacio sagrado, las personas que nos causan incomodidad son nuestros espejos más valiosos para notar qué herida nos está pidiendo atención".
2. **La Mediación Somática Silenciosa:** Si dos participantes tienen un conflicto explícito, siéntalos frente a frente en privado. Pídeles mirarse a los ojos durante un minuto entero en absoluto silencio y respirar al unísono antes de expresar cualquier palabra. Esto desactiva el mecanismo de ataque-defensa de la amígdala cerebral.
3. **Redirección No-Verbal:** Si la tensión flota en la sala de forma grupal, pon música rítmica de percusión baja y realiza una dinámica somática de liberación corporal o sacudimiento para disipar físicamente el campo energético de estrés del salón.`;
      } else {
        reply += `\n\nMe preguntas sobre: "${message}".

Como tu Asistente Mentor de Retiro Studio, para apoyarte en cualquier aspecto de la facilitación de retiros, recuerda los 3 Pilares del Facilitador Líder:
1. **El Contenedor es Sagrado:** Todo lo que surja en la sala es bienvenido. No intentes "corregir" o "solucionar" el dolor o el llanto de inmediato; solo dale espacio seguro para ser sentido plenamente.
2. **Las Transiciones son la Medicina Secreta:** Nunca pases abruptamente de un taller de alta estimulación mental a uno corporal. Dedica siempre de 2 a 3 minutos de silencio meditativo de transición antes de mover al grupo.
3. **El Facilitador es un Espejo:** Si estás nervioso por la logística o la agenda, el grupo lo sentirá en tu respiración. Respira profundo con el abdomen antes de tomar el micrófono.`;
      }

      return res.json({ reply, warning: "Respuesta del Asistente generada por el motor de contingencia de Retiro Studio AI para garantizar el funcionamiento sin clave de API." });
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });

  } catch (err: any) {
    console.error("Error in AI assistant:", err);
    res.status(500).json({ error: "No se pudo consultar al Asistente IA. Por favor reintenta.", details: err.message });
  }
});

// MÓDULO 2: GENERADOR O ADAPTADOR DE DINÁMICAS INDIVIDUALES
app.post("/api/generate-dynamic", async (req, res) => {
  try {
    const { category, duration, intensity, objective, groupType } = req.body;

    if (!objective) {
      return res.status(400).json({ error: "Falta especificar el objetivo de la dinámica." });
    }

    // Robust check for missing or placeholder API Keys
    if (!apiKey || apiKey === "undefined" || apiKey.includes("MY_GEMINI_API_KEY")) {
      // High quality fallback dynamic
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
      return res.json({ dynamic: mockDynamic, warning: "Dinámica generada por motor de plantilla debido a falta de API key." });
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    const dynamic = {
      id: 'ai_' + Date.now(),
      ...parsed,
      isAiSuggested: true
    };

    res.json({ dynamic });

  } catch (err: any) {
    console.error("Error generating dynamic:", err);
    res.status(500).json({ error: "No se pudo generar la dinámica de manera inteligente.", details: err.message });
  }
});

// Vite middleware and static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
