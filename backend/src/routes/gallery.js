import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authenticate, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const gallery = await prisma.gallery.findMany({ orderBy: { createdAt: "desc" } });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", authenticate, adminOnly, async (req, res) => {
  try {
    const item = await prisma.gallery.create({ data: req.body });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.gallery.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Foto dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
