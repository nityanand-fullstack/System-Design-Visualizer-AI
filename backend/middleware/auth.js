export const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res
      .status(401)
      .json({ success: false, message: "Admin authentication required" });
  }
  next();
};
