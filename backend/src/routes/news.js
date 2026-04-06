import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authenticate, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const news = await prisma.news.findUnique({ where: { id: Number(req.params.id) } });
    if (!news) return res.status(404).json({ message: "Berita tidak ditemukan" });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", authenticate, adminOnly, async (req, res) => {
  try {
    const news = await prisma.news.create({ data: req.body });
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const news = await prisma.news.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.news.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Berita dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
