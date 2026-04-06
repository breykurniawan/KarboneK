import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "pingpong_secret_key_2026";

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token tidak valid" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak, hanya admin" });
  }
  next();
};

export { JWT_SECRET };
