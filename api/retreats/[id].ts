export default function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method === 'GET') {
    return res.status(200).json({ id });
  } else if (req.method === 'PATCH' || req.method === 'PUT' || req.method === 'POST') {
    // Simply echo back the updated retreat body so the frontend client's local state is successfully updated
    return res.status(200).json({
      success: true,
      ...req.body
    });
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'PUT', 'POST']);
    return res.status(405).end(`Método ${req.method} no permitido`);
  }
}
