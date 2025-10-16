export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear authentication cookies
  res.setHeader('Set-Cookie', [
    'hana_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    'hana_logged_in=; Secure; SameSite=Strict; Max-Age=0; Path=/'
  ]);

  res.status(200).json({ success: true });
}