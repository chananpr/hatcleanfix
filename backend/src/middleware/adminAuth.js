export function requireAdmin(req, res, next) {
  const adminSecret = process.env.ADMIN_SECRET || 'super-secret-admin-token';
  const provided = req.header('x-admin-secret');
  if (!provided || provided !== adminSecret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return next();
}
