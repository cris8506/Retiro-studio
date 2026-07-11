export default function handler(req: any, res: any) {
  // Reject non-GET requests for the health endpoint
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      error: `Method ${req.method} not allowed`
    });
  }

  // Check GEMINI_API_KEY presence
  const apiKey = process.env.GEMINI_API_KEY || "";
  const isConfigured = apiKey.trim() !== "" && apiKey !== "undefined" && !apiKey.includes("MY_GEMINI_API_KEY");

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: "ok",
    geminiKeyConfigured: isConfigured,
    environment: process.env.NODE_ENV || "production"
  });
}
