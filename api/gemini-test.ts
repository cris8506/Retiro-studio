import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-3.5-flash";

export default async function handler(req: any, res: any) {
  // Ensure we set headers to JSON response
  res.setHeader('Content-Type', 'application/json');

  // 13. For methods other than GET, return 405 Method Not Allowed
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      error: `Método ${req.method} no permitido. Utiliza GET.`
    });
  }

  // 3. Read exclusively from process.env.GEMINI_API_KEY
  const serverApiKey = process.env.GEMINI_API_KEY || "";
  const isKeyConfigured = serverApiKey.trim() !== "" && serverApiKey !== "undefined" && !serverApiKey.includes("MY_GEMINI_API_KEY");

  if (!isKeyConfigured) {
    console.error("[gemini-test] GEMINI_API_KEY no está configurada en el servidor.");
    return res.status(400).json({
      success: false,
      keyConfigured: false,
      stage: "api_key_check",
      status: 400,
      code: "API_KEY_MISSING",
      error: "GEMINI_API_KEY no está configurada en el servidor"
    });
  }

  try {
    // 4. Initialise SDK from @google/genai
    const ai = new GoogleGenAI({
      apiKey: serverApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // 12. Maximum timeout control (15 seconds for this simple sanity check)
    const geminiPromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Responde únicamente con la palabra OK",
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const err = new Error("Timeout calling Gemini API");
        (err as any).isTimeout = true;
        reject(err);
      }, 15000);
    });

    const response = (await Promise.race([geminiPromise, timeoutPromise])) as any;
    const responseText = (response.text || "").trim();

    if (!responseText) {
      return res.status(500).json({
        success: false,
        keyConfigured: true,
        stage: "gemini_response_validation",
        status: 500,
        code: "GEMINI_EMPTY_RESPONSE",
        error: "Respuesta vacía del servidor de Gemini."
      });
    }

    // 7. Successful JSON response
    return res.status(200).json({
      success: true,
      keyConfigured: true,
      model: GEMINI_MODEL,
      geminiResponse: responseText
    });

  } catch (err: any) {
    console.error("[gemini-test] Error caught during Gemini API call:", err);

    let code = "INTERNAL_SERVER_ERROR";
    let userFriendlyError = "Error de servidor interno.";
    const errMsg = (err.message || "").toLowerCase();

    if (err.isTimeout) {
      code = "GEMINI_TIMEOUT";
      userFriendlyError = "Tiempo de espera agotado al conectar con Gemini.";
    } else if (errMsg.includes("api key") && (errMsg.includes("not valid") || errMsg.includes("invalid") || errMsg.includes("not found") || errMsg.includes("api_key_invalid"))) {
      code = "GEMINI_AUTH_ERROR";
      userFriendlyError = "La clave de API de Gemini es inválida o no existe.";
    } else if (errMsg.includes("permission") || errMsg.includes("denied") || errMsg.includes("forbidden") || errMsg.includes("authorized")) {
      code = "GEMINI_PERMISSION_ERROR";
      userFriendlyError = "Error de permisos al acceder a la API de Gemini.";
    } else if (errMsg.includes("quota") || errMsg.includes("limit") || errMsg.includes("rate limit") || errMsg.includes("429") || errMsg.includes("exhausted")) {
      code = "GEMINI_QUOTA_ERROR";
      userFriendlyError = "Se ha alcanzado temporalmente el límite de solicitudes o cuota.";
    } else if (errMsg.includes("model") && (errMsg.includes("not found") || errMsg.includes("unsupported") || errMsg.includes("not exist") || errMsg.includes("model_not_found"))) {
      code = "GEMINI_MODEL_ERROR";
      userFriendlyError = "El modelo especificado es incompatible o no está disponible.";
    }

    // 8. Error JSON response
    return res.status(500).json({
      success: false,
      keyConfigured: true,
      stage: "gemini_request",
      status: 500,
      code,
      error: userFriendlyError
    });
  }
}
