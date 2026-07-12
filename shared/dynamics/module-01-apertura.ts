import type { DynamicType } from './types.js';

export const dynamics01: DynamicType[] = [
  {
    id: "dynamic_001",
    number: 1,
    title: "Círculo del Nombre con Intención",
    module: "Apertura y Bienvenida",
    phases: ["apertura"],
    intention: "Crear presencia grupal, invitar a compartir desde el inicio y establecer una atmósfera consciente.",
    description: "Para dar inicio al retiro, invito al grupo a reunirse en un círculo. Les pido que dejen sus pertenencias a un lado, respiren profundo y simplemente estén presentes. La idea es que este primer momento sea un acto simbólico de llegada: cada persona trae su nombre y su intención como semillas para el campo grupal.",
    durationMin: 20,
    durationMax: 30,
    materials: [],
    steps: [
      {
        number: 1,
        title: "Preparación del espacio",
        duration: 3,
        description: "Reúne a todos los participantes en un círculo amplio. Pide que dejen sus mochilas y pertenencias a un lado y se coloquen de pie o sentados cómodamente, según el espacio."
      },
      {
        number: 2,
        title: "Introducción de la dinámica",
        duration: 2,
        description: "Explica brevemente: 'Vamos a comenzar presentándonos de una forma especial. Cada uno va a decir su nombre y una palabra o frase que represente su intención para este retiro.'"
      },
      {
        number: 3,
        title: "Demuestra con tu ejemplo",
        duration: 1,
        description: "Sé el primero en compartir. Ejemplo: 'Soy David, y mi intención es abrirme a lo nuevo.'"
      },
      {
        number: 4,
        title: "Ronda de participación",
        duration: 25,
        description: "Pide que uno a uno compartan su nombre e intención. Luego, el grupo completo responde repitiendo: 'Te recibimos, [nombre]. [Intención].'"
      },
      {
        number: 5,
        title: "Cierre del ejercicio",
        duration: 2,
        description: "Agradece la energía compartida y reconoce el paso que representa hablar en público con intención. Puedes cerrar con una frase inspiradora."
      }
    ],
    facilitatorRecommendations: [
      "Sé paciente: algunos participantes pueden necesitar más tiempo.",
      "Refuerza la importancia de la escucha activa: todos deben prestar atención a quien habla.",
      "Si el grupo es muy grande (+25 personas), puedes dividirlos en subgrupos para que no se extienda demasiado."
    ],
    facilitatorScript: "Hoy vamos a comenzar de una manera especial. Cada uno dirá su nombre y, junto a él, una palabra o frase que represente su intención para este retiro. Puede ser algo que quieran soltar, algo que buscan o algo que deseen cultivar. Al hacerlo, vamos a reconocerlos y dar la bienvenida a esa intención como grupo. Para dar confianza, soy el primero en compartir. Digo, por ejemplo: 'Soy David, y mi intención es abrirme a lo nuevo.' El grupo responde en coro: 'Te recibimos, David. Abrirte a lo nuevo.' Gracias por traer sus voces, sus nombres y sus intenciones. Lo que se nombra, se activa.",
    reflectionQuestions: [],
    objectives: [
      "Crear presencia grupal",
      "Invitar a compartir desde el inicio",
      "Establecer una atmósfera consciente"
    ],
    expectedResults: [
      "Sintonía grupal inicial y ruptura de barreras de comunicación",
      "Sentimiento de llegada, bienvenida y pertenencia",
      "Compromiso individual y colectivo con las intenciones declaradas"
    ],
    energyLevel: "media",
    emotionalIntensity: "suave",
    physicalIntensity: "baja",
    participantFormat: "circulo",
    minimumParticipants: 3,
    maximumParticipants: null,
    ageGroups: ["adultos", "jovenes"],
    experienceLevels: ["todos"],
    locations: ["interior", "exterior"],
    requiresContact: false,
    requiresWriting: false,
    requiresMovement: false,
    mobilityFriendly: true,
    canBeDoneSeated: true,
    noPhysicalContactVersion: null,
    suggestedAdaptation: null,
    avoidWhen: null,
    safetyNotes: null,
    riskLevel: "bajo",
    requiresExplicitConsent: false,
    requiresSpecializedFacilitator: false,
    musicCategory: "Apertura",
    recommendedBefore: [],
    recommendedAfter: ["dynamic_002"],
    active: true
  },
  {
    id: "dynamic_002",
    number: 2,
    title: "El Objeto que Me Representa",
    module: "Apertura y Bienvenida",
    phases: ["apertura"],
    intention: "Fomentar una presentación más profunda usando el lenguaje simbólico; invitar al compartir desde el corazón.",
    description: "En el inicio de esta dinámica, preparo un espacio central en el círculo, como un pequeño altar simbólico. Sobre una tela bonita dispongo diversos objetos: piedras, plumas, ramas, telas de colores, conchas, figuras pequeñas... cada uno cargado de la posibilidad de convertirse en símbolo. Al verlos, los participantes ya sienten que ese lugar es especial, un espacio sagrado donde lo invisible empieza a tener forma.",
    durationMin: 40,
    durationMax: 60,
    materials: [
      "Objetos simbólicos dispuestos en el centro del círculo (pueden ser plumas, piedras, ramas, cuencos, telas, conchas, figuras pequeñas, etc.)",
      "Una tela bonita",
      "Música suave de fondo"
    ],
    steps: [
      {
        number: 1,
        title: "Preparación del altar simbólico",
        duration: 5,
        description: "Prepara un espacio central con una tela bonita donde colocarás entre 30–50 objetos variados, naturales o significativos."
      },
      {
        number: 2,
        title: "Introducción del ejercicio",
        duration: 3,
        description: "Explica: 'En el centro hay diversos objetos simbólicos. Cada uno representa algo. Hoy te invito a escoger uno que hable por ti: algo que represente cómo llegas, qué traes en el corazón, o qué necesitas.'"
      },
      {
        number: 3,
        title: "Momento de elección",
        duration: 7,
        description: "Invita a los participantes a caminar en silencio por el círculo central y elegir su objeto. Acompaña el momento con música suave de fondo."
      },
      {
        number: 4,
        title: "Ronda de compartir",
        duration: 40,
        description: "Uno a uno, comparten su nombre, muestran su objeto y explican por qué lo eligieron. Los demás escuchan en silencio, sin comentar ni interrumpir."
      },
      {
        number: 5,
        title: "Cierre del ejercicio",
        duration: 5,
        description: "Invita a colocar nuevamente los objetos en el centro, forming un altar colectivo. Explícales que este altar será el corazón simbólico del retiro."
      }
    ],
    facilitatorRecommendations: [
      "Puedes invitar a los participantes a traer objetos desde casa si avisas con anticipación.",
      "Si el grupo es grande, divide en subgrupos de 6–8 personas para compartir."
    ],
    facilitatorScript: "En el centro hay objetos simbólicos, cada uno con una energía única. Hoy te invito a escoger uno que hable por ti: algo que represente cómo llegas a este retiro, qué traes en el corazón o qué necesitas en este momento. Ese objeto será tu voz, y a través de él podrás expresarte de manera más auténtica. Al finalizar, coloquen todos los objetos nuevamente en el centro, pero ahora de forma colectiva, formando un altar grupal. Este altar será el corazón simbólico del retiro, un recordatorio de la unión de cada voz y cada intención. Cuando hablas desde el símbolo, el alma escucha.",
    reflectionQuestions: [],
    objectives: [
      "Fomentar una presentación profunda de los participantes",
      "Utilizar el lenguaje simbólico como puente de expresión auténtica",
      "Invitar al compartir desde el corazón en un ambiente seguro"
    ],
    expectedResults: [
      "Conexión grupal empática y sin juicios",
      "Apertura emocional al expresar sentimientos y necesidades iniciales",
      "Constitución de un altar grupal que servirá de anclaje simbólico"
    ],
    energyLevel: "baja",
    emotionalIntensity: "moderada",
    physicalIntensity: "baja",
    participantFormat: "circulo",
    minimumParticipants: 10,
    maximumParticipants: 20,
    ageGroups: ["adultos", "jovenes"],
    experienceLevels: ["todos"],
    locations: ["interior"],
    requiresContact: false,
    requiresWriting: false,
    requiresMovement: true,
    mobilityFriendly: true,
    canBeDoneSeated: true,
    noPhysicalContactVersion: null,
    suggestedAdaptation: null,
    avoidWhen: null,
    safetyNotes: null,
    riskLevel: "bajo",
    requiresExplicitConsent: false,
    requiresSpecializedFacilitator: false,
    musicCategory: "Bienvenida",
    recommendedBefore: ["dynamic_001"],
    recommendedAfter: ["dynamic_003"],
    active: true
  },
  {
    id: "dynamic_003",
    number: 3,
    title: "Respirar Juntos",
    module: "Apertura y Bienvenida",
    phases: ["apertura"],
    intention: "Calmar el sistema nervioso, entrar en presencia grupal y generar sintonía energética desde el cuerpo",
    description: "Después de viajes largos o de momentos en los que el grupo está demasiado en la mente, esta dinámica ofrece un regreso sencillo pero profundo al presente compartido. Invito a los participantes a sentarse cómodamente, ya sea en cojines, sillas o esterillas. Les pido que cierren los ojos, enderecen suavemente la espalda y relajen sus manos sobre el regazo.",
    durationMin: 12,
    durationMax: 15,
    materials: [
      "Opcional: música instrumental muy suave o cuenco tibetano"
    ],
    steps: [
      {
        number: 1,
        title: "Preparación del espacio",
        duration: 2,
        description: "Pide que todos se sienten cómodamente (en cojín, silla o esterilla). Ojos cerrados, espalda recta, manos relajadas."
      },
      {
        number: 2,
        title: "Inicio guiado",
        duration: 1,
        description: "Explica con calma: 'Vamos a tomarnos un momento para llegar. Para que el cuerpo se asiente, la mente se aquiete y el alma se abra.'"
      },
      {
        number: 3,
        title: "Respiración sincronizada",
        duration: 5,
        description: "Guía durante 5 ciclos: Inhala por la nariz (4 segundos), retén (1 segundo), exhala por la boca (6 segundos). El facilitador marca los tiempos con su voz o con un suave gesto."
      },
      {
        number: 4,
        title: "Pausa en silencio",
        duration: 2,
        description: "Dejar 2 minutos de completo silencio. 'Solo siente. Observa cómo estás. Solo eso.'"
      },
      {
        number: 5,
        title: "Cierre suave",
        duration: 3,
        description: "Invita a abrir lentamente los ojos y hacer contacto visual. Cada uno dice una palabra que represente cómo se siente."
      }
    ],
    facilitatorRecommendations: [
      "Usa música ambiental o un cuenco tibetano si ayuda a crear un contenedor emocional.",
      "Habla con voz tranquila y mantén presencia corporal durante toda la guía.",
      "Puedes repetir este ejercicio diariamente como ritual de apertura del retiro."
    ],
    facilitatorScript: "Vamos a tomarnos un momento para llegar. Para que el cuerpo se asiente, la mente se aquiete y el alma se abra. Vamos a respirar juntos, en silencio. Inhalamos por la nariz contando hasta 4, retenemos un segundo y exhalamos lentamente por la boca durante 6 segundos. Repitamos juntos... Solo siente. Observa cómo estás. Solo eso. Ahora abre lentamente los ojos y haz contacto visual con el grupo. Digamos cada uno una palabra que represente cómo nos sentimos. Respirar juntos es recordar que no estamos solos.",
    reflectionQuestions: [],
    objectives: [
      "Calmar y regular el sistema nervioso de los participantes",
      "Sincronizar energéticamente al grupo en el presente compartido",
      "Facilitar el arraigo y el contacto corporal de forma directa"
    ],
    expectedResults: [
      "Reducción notable de la dispersión mental y física",
      "Sintonía colectiva profunda mediante la respiración sincronizada",
      "Clima de quietud, calma y disposición respetuosa"
    ],
    energyLevel: "baja",
    emotionalIntensity: "suave",
    physicalIntensity: "baja",
    participantFormat: "circulo",
    minimumParticipants: null,
    maximumParticipants: null,
    ageGroups: ["adultos", "jovenes", "niños", "adultos_mayores"],
    experienceLevels: ["todos"],
    locations: ["interior", "exterior"],
    requiresContact: false,
    requiresWriting: false,
    requiresMovement: false,
    mobilityFriendly: true,
    canBeDoneSeated: true,
    noPhysicalContactVersion: null,
    suggestedAdaptation: null,
    avoidWhen: null,
    safetyNotes: null,
    riskLevel: "bajo",
    requiresExplicitConsent: false,
    requiresSpecializedFacilitator: false,
    musicCategory: "Respiración",
    recommendedBefore: [],
    recommendedAfter: [],
    active: true
  },
  {
    id: "dynamic_004",
    number: 4,
    title: "Caminar en Silencio y Presencia",
    module: "Apertura y Bienvenida",
    phases: ["apertura"],
    intention: "Invitar al aterrizaje corporal y la conexión con el entorno; cultivar presencia",
    description: "Llevo al grupo hacia un espacio abierto: puede ser un jardín, un sendero en el bosque, la playa o cualquier lugar que invite al contacto con la naturaleza. Antes de comenzar, los invito a ponerse de pie en círculo y cerrar los ojos por un instante, solo para sentir el suelo bajo los pies.",
    durationMin: 20,
    durationMax: 30,
    materials: [
      "Un espacio natural (jardín, bosque, playa) o un lugar amplio para caminar"
    ],
    steps: [
      {
        number: 1,
        title: "Introducción",
        duration: 3,
        description: "Explica que se realizará una caminata consciente en silencio, con atención plena, y que el objetivo no es llegar a un lugar específico, sino estar presentes en el movimiento."
      },
      {
        number: 2,
        title: "Inicio de la caminata",
        duration: 5,
        description: "Pide a los participantes que se dispersen, manteniendo cierta distancia. Recomienda caminar lento, observando el entorno, el suelo, los sonidos y el viento."
      },
      {
        number: 3,
        title: "Atención plena",
        duration: 15,
        description: "Durante el recorrido, invítalos a enfocar su atención en la sensación del pie al tocar el suelo, los sonidos naturales o urbanos, el ritmo de la respiración y la textura del aire en la piel. Puede usarse de forma mental la frase guía: 'Inhalo, estoy presente. Exhalo, suelto.'"
      },
      {
        number: 4,
        title: "Retorno al círculo",
        duration: 5,
        description: "Reúne al grupo nuevamente en círculo. Pide que cada uno comparta en una palabra o gesto cómo se sienten tras la experiencia."
      }
    ],
    facilitatorRecommendations: [
      "Si el grupo es grande, delimita la zona de caminata para evitar dispersión excesiva.",
      "Acompaña caminando de forma natural, pero manteniendo tu presencia atenta y serena."
    ],
    facilitatorScript: "Ahora vamos a hacer una caminata consciente. No se trata de llegar a un lugar, sino de habitar el camino. Caminaremos en silencio, con atención plena, como si cada paso fuera una oración. Inhala y siente que llegas al presente. Exhala y suelta lo que ya no necesitas. Enfóquense en el contacto del pie con la tierra, en los sonidos naturales que los envuelven, en la textura del aire sobre su piel. Sostengamos mentalmente en silencio: 'Inhalo, estoy presente. Exhalo, suelto.' Caminar en silencio es dejar que la Tierra respire contigo.",
    reflectionQuestions: [],
    objectives: [
      "Promover la propiocepción y el enraizamiento corporal",
      "Conectar con los elementos y ritmos de la naturaleza",
      "Cultivar la atención plena activa y la observación sensorial"
    ],
    expectedResults: [
      "Gran pacificación mental y reducción de ruidos cognitivos",
      "Disminución de tensiones físicas acumuladas",
      "Experiencia meditativa activa e integración con el entorno natural"
    ],
    energyLevel: "baja",
    emotionalIntensity: "suave",
    physicalIntensity: "baja",
    participantFormat: "individual",
    minimumParticipants: null,
    maximumParticipants: null,
    ageGroups: ["adultos", "jovenes", "adultos_mayores"],
    experienceLevels: ["todos"],
    locations: ["exterior", "naturaleza"],
    requiresContact: false,
    requiresWriting: false,
    requiresMovement: true,
    mobilityFriendly: false,
    canBeDoneSeated: false,
    noPhysicalContactVersion: null,
    suggestedAdaptation: null,
    avoidWhen: "Clima adverso extremo o con grupos que tengan dificultades severas de movilidad física.",
    safetyNotes: "Es importante delimitar un área segura de caminata que esté libre de riesgos o precipicios para evitar accidentes en silencio.",
    riskLevel: "bajo",
    requiresExplicitConsent: false,
    requiresSpecializedFacilitator: false,
    musicCategory: null,
    recommendedBefore: [],
    recommendedAfter: [],
    active: true
  },
  {
    id: "dynamic_005",
    number: 5,
    title: "La Caja de los Miedos y Deseos",
    module: "Apertura y Bienvenida",
    phases: ["apertura"],
    intention: "Dar lugar a las emociones iniciales, abrirse con honestidad y sembrar claridad interior",
    description: "Imagina un círculo en silencio, con una caja o cofre colocado en el centro como símbolo de confianza. Cada participante tiene en sus manos dos pequeños papeles: en uno escribe un miedo que trae consigo, y en el otro un deseo que anhela para el retiro.",
    durationMin: 30,
    durationMax: 40,
    materials: [
      "Caja decorativa o cofre",
      "Papelitos para escribir",
      "Bolígrafos o lápices",
      "Música instrumental suave",
      "Un cuenco tibetano"
    ],
    steps: [
      {
        number: 1,
        title: "Preparación",
        duration: 3,
        description: "Coloca la caja en el centro del círculo, junto con los papeles y bolígrafos para que todos tengan acceso."
      },
      {
        number: 2,
        title: "Introducción del ejercicio",
        duration: 5,
        description: "Explica con voz serena: 'Cada uno recibirá dos papeles. En uno escribirás un miedo que traes contigo. En el otro, un deseo que tienes para este retiro.'"
      },
      {
        number: 3,
        title: "Escritura individual",
        duration: 10,
        description: "Entrega dos papeles a cada persona. Invita a escribir en silencio mientras suena música instrumental suave que inspire calma y conexión."
      },
      {
        number: 4,
        title: "Depósito ritual",
        duration: 10,
        description: "Uno a uno, en silencio, los participantes se acercan a la caja. Antes de depositar los papeles, hacen una pequeña reverencia acompañada del sonido de un cuenco tibetano."
      },
      {
        number: 5,
        title: "Cierre colectivo",
        duration: 5,
        description: "Agradece el valor de la honestidad y la entrega grupal: 'Todo lo que fue entregado aquí será sostenido con respeto y presencia.'"
      }
    ],
    facilitatorRecommendations: [
      "Puedes quemar los papeles al final del retiro como acto de cierre (avisando al grupo desde el inicio).",
      "Si el grupo lo permite, invita a leer algunos papeles de manera anónima para abrir la reflexión colectiva."
    ],
    facilitatorScript: "Cada uno recibirá dos papeles. En uno escribirás un miedo que traes contigo. En el otro, un deseo que tienes para este retiro. Acérquense uno a uno en silencio, hagan una reverencia y coloquen sus papeles en esta caja que representa nuestro cofre de confianza. Sientan el sonido del cuenco tibetano al depositar. Todo lo que fue entregado aquí será sostenido con respeto y presencia. No se trata de eliminar el miedo, sino de hacerle espacio con conciencia.",
    reflectionQuestions: [],
    objectives: [
      "Externalizar y soltar miedos, dudas y resistencias de cara al retiro",
      "Clarificar e intencionar los propósitos profundos de cada participante",
      "Establecer un contenedor colectivo de honestidad, contención y confianza"
    ],
    expectedResults: [
      "Sensación de desahogo y liberación al nombrar por escrito las cargas",
      "Nivel inicial elevado de sintonía emocional auténtica",
      "Consolidación simbólica de la seguridad e intimidad del círculo"
    ],
    energyLevel: "baja",
    emotionalIntensity: "moderada",
    physicalIntensity: "baja",
    participantFormat: "circulo",
    minimumParticipants: null,
    maximumParticipants: null,
    ageGroups: ["adultos", "jovenes"],
    experienceLevels: ["todos"],
    locations: ["interior"],
    requiresContact: false,
    requiresWriting: true,
    requiresMovement: true,
    mobilityFriendly: true,
    canBeDoneSeated: true,
    noPhysicalContactVersion: null,
    suggestedAdaptation: null,
    avoidWhen: null,
    safetyNotes: "El contenido de las tarjetas es totalmente confidencial. Si se decide quemar los papeles al cierre, hágase de forma segura al aire libre en un recipiente resistente al fuego.",
    riskLevel: "bajo",
    requiresExplicitConsent: false,
    requiresSpecializedFacilitator: false,
    musicCategory: "Conexión",
    recommendedBefore: [],
    recommendedAfter: [],
    active: true
  },
  {
    id: "dynamic_006",
    number: 6,
    title: "Yo Soy, Tú Eres, Nosotros Somos",
    module: "Apertura y Bienvenida",
    phases: ["apertura"],
    intention: "Establecer conexión empática entre los participantes desde la afirmación positiva",
    description: "Imagina que estás en un círculo con el grupo. La energía está tranquila, los rostros reflejan curiosidad y apertura. Invitas a todos a elegir una pareja, preferiblemente alguien con quien no hayan conversado antes. Una vez frente a frente, pides que se miren a los ojos por unos segundos en silencio.",
    durationMin: 25,
    durationMax: 35,
    materials: [],
    steps: [
      {
        number: 1,
        title: "Formación de parejas y contacto visual",
        duration: 3,
        description: "Invita a todos a elegir una pareja con la que no hayan conversado antes. Una vez frente a frente, se miran a los ojos por unos segundos en silencio."
      },
      {
        number: 2,
        title: "Ronda 1: Yo soy...",
        duration: 7,
        description: "Cualidades personales. Uno dirá: 'Yo soy...' completando con algo verdadero sobre sí mismo, por ejemplo: 'Yo soy valiente'. El compañero responderá: 'Tú eres valiente'. Luego se invierten los roles. Ejemplos de frases: Yo soy alegre, Yo soy fuerte, Yo soy sensible."
      },
      {
        number: 3,
        title: "Ronda 2: Yo necesito...",
        duration: 7,
        description: "Necesidades profundas. Invita a que la segunda ronda sea con la frase 'Yo necesito...'. Por ejemplo, 'Yo necesito descansar' - El compañero responde 'Tú necesitas descansar'."
      },
      {
        number: 4,
        title: "Ronda 3: Yo confío...",
        duration: 7,
        description: "Opcional. Se propone una tercera ronda: 'Yo confío...'. Al escuchar frases como 'Yo confío en mí' o 'Yo confío en la vida', el compañero responde 'Tú confías en ti' o 'Tú confías en la vida'."
      },
      {
        number: 5,
        title: "Cierre grupal",
        duration: 6,
        description: "Reúnes a todos en círculo para compartir sensaciones de ser vistos y reconocidos, finalizando en un marco impregnado de empatía y conexión."
      }
    ],
    facilitatorRecommendations: [
      "Si algunos se sienten incómodos, acompaña y recuerda que no deben compartir algo muy íntimo."
    ],
    facilitatorScript: "En este ejercicio vamos a afirmar quiénes somos y, al mismo tiempo, reconocer al otro. Uno dirá: 'Yo soy…' completando con algo verdadero sobre sí mismo, por ejemplo: 'Yo soy valiente'. El compañero responderá: 'Tú eres valiente'. Luego se invierten los roles. Continuemos la segunda ronda con 'Yo necesito...'. Y si lo desean, cerremos con la tercera ronda de 'Yo confío...'. Sientan la resonancia en sintonía de este círculo de reconocimiento mutuo. Lo que decimos del otro, también habla de nosotros.",
    reflectionQuestions: [
      "¿Cómo se sintieron al ser vistos y reconocidos de manera positiva por otra persona?",
      "¿Qué se sintió al declarar en voz alta tus necesidades personales con 'Yo necesito...'?"
    ],
    objectives: [
      "Establecer una sintonía emocional empática de forma rápida",
      "Validar el autoconcepto de los participantes mediante afirmaciones positivas",
      "Construir un clima de confianza mutua e intimidad no invasiva"
    ],
    expectedResults: [
      "Eliminación notable de la timidez o reservas iniciales",
      "Fortalecimiento de la autoestima y autoaceptación colectiva",
      "Ambiente cargado de empatía, calidez y un sentimiento de contención"
    ],
    energyLevel: "media",
    emotionalIntensity: "moderada",
    physicalIntensity: "baja",
    participantFormat: "parejas",
    minimumParticipants: 4,
    maximumParticipants: null,
    ageGroups: ["adultos", "jovenes"],
    experienceLevels: ["todos"],
    locations: ["interior", "exterior"],
    requiresContact: false,
    requiresWriting: false,
    requiresMovement: false,
    mobilityFriendly: true,
    canBeDoneSeated: true,
    noPhysicalContactVersion: null,
    suggestedAdaptation: null,
    avoidWhen: null,
    safetyNotes: "Garantizar que nadie sea presionado a compartir de forma sobre-vulnerable si siente incomodidad.",
    riskLevel: "bajo",
    requiresExplicitConsent: false,
    requiresSpecializedFacilitator: false,
    musicCategory: null,
    recommendedBefore: [],
    recommendedAfter: [],
    active: true
  },
  {
    id: "dynamic_007",
    number: 7,
    title: "Manos que Sienten",
    module: "Apertura y Bienvenida",
    phases: ["apertura"],
    intention: "Cultivar presencia, confianza y conexión a través del tacto consciente",
    description: "Imagina el momento: el grupo está reunido en círculo, quizá aún con un poco de timidez o desconfianza. El facilitador invita a todos a cerrar los ojos por unos segundos mientras suena una música suave. Se explica que esta dinámica no es sobre hablar, sino sobre sentir.",
    durationMin: 20,
    durationMax: 25,
    materials: [
      "Música suave",
      "Opcional: gel antibacterial o agua de aromas para higienizar las manos"
    ],
    steps: [
      {
        number: 1,
        title: "Formar parejas",
        duration: 2,
        description: "Pide a los participantes que formen parejas, preferiblemente con alguien que no conocen. Esto ayuda a salir de la zona de confort y abrirse a nuevas conexiones."
      },
      {
        number: 2,
        title: "Explicación de la dinámica",
        duration: 2,
        description: "El facilitador dice: 'Vamos a tocar las manos del otro de forma consciente. No hay palabras. Solo contacto suave, con respeto y atención.'"
      },
      {
        number: 3,
        title: "Desarrollo del ejercicio táctil",
        duration: 15,
        description: "Durante 3 minutos: una persona acaricia suavemente la mano del otro con las yemas de los dedos. Luego se invierten los roles (3 minutos). Finalmente, dedican 4 minutos a tomarse ambas manos en silencio, asimilando el tacto mutuo de forma respetuosa."
      },
      {
        number: 4,
        title: "Cierre y compartir",
        duration: 5,
        description: "El facilitador pide compartir una sola palabra que describa cómo se sienten. Surgen respuestas como: 'abierto', 'cómodo', 'extraño, pero bien'."
      }
    ],
    facilitatorRecommendations: [
      "Repite la importancia del consentimiento al inicio: nadie está obligado a participar si no se siente listo.",
      "Ofrece gel antibacterial o agua para limpiar las manos antes del ejercicio, generando un ambiente higiénico y cómodo."
    ],
    facilitatorScript: "Vamos a tocar las manos del otro de forma consciente. No hay palabras. Solo contacto suave, con respeto y atención. Sientan las manos de su compañero con total presencia, permitiendo que la energía del silencio disuelva cualquier barrera. Agradezcan al final este puente sagrado. El tacto es la primera forma de lenguaje.",
    reflectionQuestions: [],
    objectives: [
      "Experimentar el tacto consciente como herramienta de conexión no verbal",
      "Romper miedos y prejuicios corporales iniciales de forma amorosa",
      "Sostener la presencia plena mediante la atención sensorial enfocada"
    ],
    expectedResults: [
      "Transformación del ambiente del grupo hacia una confianza íntima y sincera",
      "Mayor vulnerabilidad contenida y disolución de barreras",
      "Sintonización sensorial profunda con el resto de los participantes"
    ],
    energyLevel: "baja",
    emotionalIntensity: "moderada",
    physicalIntensity: "baja",
    participantFormat: "parejas",
    minimumParticipants: 4,
    maximumParticipants: null,
    ageGroups: ["adultos"],
    experienceLevels: ["intermedio", "avanzado"],
    locations: ["interior"],
    requiresContact: true,
    requiresWriting: false,
    requiresMovement: false,
    mobilityFriendly: true,
    canBeDoneSeated: true,
    noPhysicalContactVersion: null,
    suggestedAdaptation: "Los participantes pueden colocar las manos a pocos milímetros de distancia sin llegar a tocarse, sintiendo la energía térmica e intuitiva del otro.",
    avoidWhen: "Evitar en las primeras horas del retiro si el grupo demuestra excesiva timidez corporativa o barreras culturales restrictivas con respecto al tacto, o si algún participante tiene fobias específicas.",
    safetyNotes: "Sostener siempre el principio de la libre participación. Es indispensable realizar higiene previa de manos por comodidad y respeto mutuo.",
    riskLevel: "medio",
    requiresExplicitConsent: true,
    requiresSpecializedFacilitator: false,
    musicCategory: "Conexión",
    recommendedBefore: ["dynamic_003"],
    recommendedAfter: [],
    active: true
  },
  {
    id: "dynamic_008",
    number: 8,
    title: "Palabras que Abren",
    module: "Apertura y Bienvenida",
    phases: ["apertura"],
    intention: "Crear una lluvia de palabras inspiradoras que activen la energía del retiro",
    description: "Un ejercicio simple y poderoso. A través de la asociación libre, los participantes nombran palabras que desean que estén presentes en el retiro. Estas se escriben en un gran mural visible durante todos los días.",
    durationMin: 15,
    durationMax: 20,
    materials: [
      "Pizarrón grande o papel kraft visible en la pared",
      "Marcadores gruesos de colores"
    ],
    steps: [
      {
        number: 1,
        title: "Preparación",
        duration: 3,
        description: "Coloca un gran papel kraft en la pared con el título: '¿Qué palabras queremos sembrar aquí?'"
      },
      {
        number: 2,
        title: "Lluvia de palabras",
        duration: 12,
        description: "Uno a uno, los participantes van diciendo una palabra. El facilitador la escribe grande y visible en el mural. Ejemplos: 'libertad', 'confianza', 'risa', 'claridad', 'honestidad'."
      },
      {
        number: 3,
        title: "Lectura colectiva",
        duration: 5,
        description: "Una vez lleno, lee las palabras en voz alta y agradece al grupo por co-crear la intención colectiva."
      }
    ],
    facilitatorRecommendations: [
      "Asegúrate de escribir con buena letra y lo suficientemente grande para que todos puedan leerlo.",
      "Deja el mural visible durante todo el retiro para mantener la intención viva.",
      "Si algún participante se queda en silencio, invítalo con suavidad, pero sin presionarlo."
    ],
    facilitatorScript: "El salón está en calma y frente a nosotros se despliega este papel kraft en blanco, como un lienzo esperando ser pintado con nuestras intenciones colectivas. Les pregunto: ¿Qué palabras queremos sembrar aquí? Uno a uno pronuncien palabras cargadas de energía. Vamos leyéndolas todos juntos en voz alta para sembrar su vibración en este espacio. Las palabras tienen poder: siembra las correctas, y florecerá el alma.",
    reflectionQuestions: [],
    objectives: [
      "Establecer intenciones grupales de forma visual y participativa",
      "Generar un marco de cocreación respetuosa y libre expresión",
      "Estructurar un espejo constante de los anhelos del colectivo"
    ],
    expectedResults: [
      "Mural físico de recordatorio visible durante todo el retiro",
      "Cohesión en torno a los ideales de la convivencia y el crecimiento",
      "Activación de la palabra hablada con intención clara"
    ],
    energyLevel: "media",
    emotionalIntensity: "suave",
    physicalIntensity: "baja",
    participantFormat: "grupo_completo",
    minimumParticipants: null,
    maximumParticipants: null,
    ageGroups: ["todos"],
    experienceLevels: ["todos"],
    locations: ["interior"],
    requiresContact: false,
    requiresWriting: false,
    requiresMovement: false,
    mobilityFriendly: true,
    canBeDoneSeated: true,
    noPhysicalContactVersion: null,
    suggestedAdaptation: null,
    avoidWhen: null,
    safetyNotes: null,
    riskLevel: "bajo",
    requiresExplicitConsent: false,
    requiresSpecializedFacilitator: false,
    musicCategory: null,
    recommendedBefore: [],
    recommendedAfter: [],
    active: true
  },
  {
    id: "dynamic_009",
    number: 9,
    title: "Meditación de Aterrizaje",
    module: "Apertura y Bienvenida",
    phases: ["apertura"],
    intention: "Alinear cuerpo, mente y corazón en el momento presente",
    description: "El grupo se acomoda en círculo, el ambiente es sereno y la luz tenue invita al recogimiento. El sonido del cuenco tibetano resuena suavemente, marcando el inicio del ejercicio. Cada participante cierra los ojos, encuentra una postura cómoda y poco a poco empieza a conectar con su respiración.",
    durationMin: 15,
    durationMax: 15,
    materials: [
      "Música instrumental suave o cuenco tibetano",
      "Atmósfera de iluminación tenue y tranquila"
    ],
    steps: [
      {
        number: 1,
        title: "Postura cómoda",
        duration: 3,
        description: "Pide al grupo que se siente en silencio, con la columna erguida y los ojos cerrados, buscando relajar tensiones corporales."
      },
      {
        number: 2,
        title: "Conexión con la respiración",
        duration: 3,
        description: "Guía una respiración suave: 'Inhala por la nariz… exhala por la boca… Suelta. Llegas. Aquí estás.'"
      },
      {
        number: 3,
        title: "Visualización de arraigo",
        duration: 6,
        description: "Dice mentalmente: 'Imagina raíces que nacen desde tus pies y se extienden profundamente hacia la Tierra. Siente cómo tu energía desciende y se asienta.'"
      },
      {
        number: 4,
        title: "Regreso suave",
        duration: 3,
        description: "Invita a abrir los ojos lentamente, mover el cuerpo con suavidad y decir en voz baja: 'Estoy aquí.'"
      }
    ],
    facilitatorRecommendations: [
      "Cuida el tono de tu voz: debe ser pausado, suave y claro para favorecer la relajación.",
      "Puedes utilizar un cuenco tibetano o una campanilla al inicio y al final para marcar el ejercicio.",
      "Asegúrate de que la sala esté en silencio y con una atmósfera adecuada (luces tenues, música suave)."
    ],
    facilitatorScript: "Inhala por la nariz… exhala por la boca… Suelta. Llegas. Aquí estás. Imaginen raíces que nacen desde sus pies y se extienden profundamente hacia la Tierra. Sientan cómo su energía desciende, se asienta, y su cuerpo se relaja por completo. Abran lentamente los ojos, muevan sus articulaciones con ternura y digamos juntos en voz baja: 'Estoy aquí.' Estar presente es el primer acto de amor.",
    reflectionQuestions: [],
    objectives: [
      "Instalar un espacio de recogimiento, quietud y silencio íntimo",
      "Fomentar la conexión de la respiración como ancla somática",
      "Establecer la visualización de arraigo de cara a los trabajos del retiro"
    ],
    expectedResults: [
      "Disminución de tensiones físicas, nerviosismo o fatiga del viaje",
      "Atmósfera de respeto sagrado compartida en todo el salón",
      "Predisposición meditativa de todos los participantes"
    ],
    energyLevel: "baja",
    emotionalIntensity: "suave",
    physicalIntensity: "baja",
    participantFormat: "circulo",
    minimumParticipants: null,
    maximumParticipants: null,
    ageGroups: ["todos"],
    experienceLevels: ["todos"],
    locations: ["interior"],
    requiresContact: false,
    requiresWriting: false,
    requiresMovement: false,
    mobilityFriendly: true,
    canBeDoneSeated: true,
    noPhysicalContactVersion: null,
    suggestedAdaptation: null,
    avoidWhen: null,
    safetyNotes: "Sostener un clima templado y ventilado en la sala ya que la quietud suele disminuir la temperatura corporal.",
    riskLevel: "bajo",
    requiresExplicitConsent: false,
    requiresSpecializedFacilitator: false,
    musicCategory: "Meditación",
    recommendedBefore: [],
    recommendedAfter: [],
    active: true
  },
  {
    id: "dynamic_010",
    number: 10,
    title: "Mapa del Viaje Interior",
    module: "Apertura y Bienvenida",
    phases: ["apertura"],
    intention: "Visualizar el retiro como un camino de transformación",
    description: "Al presentar la dinámica, invito al grupo a imaginar que todo el retiro es un viaje. No un viaje físico, sino un camino interior lleno de aprendizajes y descubrimientos. Les pido trazar simbólicamente ese mapa que represente sus retos, fluidez, metas y transiciones.",
    durationMin: 30,
    durationMax: 40,
    materials: [
      "Hojas de papel en blanco",
      "Lápices de colores, bolígrafos, marcadores o crayones"
    ],
    steps: [
      {
        number: 1,
        title: "Introducción al viaje",
        duration: 3,
        description: "Invita al grupo a visualizar el retiro como un viaje interior. Explica que el ejercicio consiste en dibujar un mapa simbólico de lo que esperan recorrer, sentir o aprender en estos días."
      },
      {
        number: 2,
        title: "Dibujo creativo",
        duration: 25,
        description: "Entrega hojas y lápices de colores. Aclara que no es necesario saber dibujar, solo expresar con símbolos, formas y colores. Sugiere símbolos de fluidez (un río), desafíos y metas (montaña, sol) o transformación (una puerta)."
      },
      {
        number: 3,
        title: "Compartir en parejas",
        duration: 10,
        description: "Forma dúos para que cada participante explique su mapa al otro de forma pausada. Se recalca la importancia de escuchar sin juzgar ni interpretar."
      },
      {
        number: 4,
        title: "Cierre de la sesión",
        duration: 2,
        description: "Indica que guarden sus mapas de forma personal, pues se retomarán en el cierre del retiro como un espejo del camino recorrido."
      }
    ],
    facilitatorRecommendations: [
      "Enfatiza que el valor reside en la metáfora personal y los símbolos escogidos, no en la técnica artística.",
      "Recuerda que la escucha compartida debe ser completamente activa y libre de interpretaciones externas."
    ],
    facilitatorScript: "Imaginen que hoy están en el punto de partida del retiro. Aún no saben qué encontrarán en este camino, pero dentro de ustedes ya hay símbolos, emociones y expectativas. Vamos a dibujar un mapa de ese viaje interior. No busquemos un dibujo perfecto. Cada línea y color será un reflejo de lo que esperan vivir: un río para fluir, una montaña para un reto, un sol para una meta, o una puerta para transformarse... Compártanlo con su pareja en total respeto. El mapa no es el territorio, pero dibujarlo nos ayuda a transitarlo.",
    reflectionQuestions: [],
    objectives: [
      "Plasmar de manera visual y metafórica los anhelos e inquietudes",
      "Promover el diálogo sincero y la empatía en parejas",
      "Crear un recurso de anclaje inicial para contrastar en el cierre del retiro"
    ],
    expectedResults: [
      "Claridad y focalización individual en las metas de crecimiento",
      "Establecimiento de lazos interpersonales íntimos en parejas",
      "Producción de un testigo material para la sesión de integración final"
    ],
    energyLevel: "media",
    emotionalIntensity: "moderada",
    physicalIntensity: "baja",
    participantFormat: "parejas",
    minimumParticipants: null,
    maximumParticipants: null,
    ageGroups: ["adultos", "jovenes"],
    experienceLevels: ["todos"],
    locations: ["interior"],
    requiresContact: false,
    requiresWriting: false,
    requiresMovement: false,
    mobilityFriendly: true,
    canBeDoneSeated: true,
    noPhysicalContactVersion: null,
    suggestedAdaptation: null,
    avoidWhen: null,
    safetyNotes: null,
    riskLevel: "bajo",
    requiresExplicitConsent: false,
    requiresSpecializedFacilitator: false,
    musicCategory: "Reflexión",
    recommendedBefore: [],
    recommendedAfter: [],
    active: true
  }
];
