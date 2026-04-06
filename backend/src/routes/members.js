import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authenticate, adminOnly } from "../middleware/auth.js";

const router = Router();

// Get all members (public)
router.get("/", async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { role: "member" },
      select: { id: true, name: true, email: true, phone: true, avatar: true, joinedAt: true },
      orderBy: { joinedAt: "desc" },
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (admin)
router.get("/all", authenticate, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, joinedAt: true },
      orderBy: { joinedAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user role (admin)
router.put("/:id/role", authenticate, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user (admin)
router.delete("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "User dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
