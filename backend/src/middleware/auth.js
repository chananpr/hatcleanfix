import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'change-me');
    req.admin = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
