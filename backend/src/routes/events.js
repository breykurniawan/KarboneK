import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authenticate, adminOnly } from "../middleware/auth.js";

const router = Router();

// Get all events
router.get("/", async (req, res) => {
  try {
    const { status, category, level } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (level) where.level = level;

    const events = await prisma.event.findMany({
      where,
      include: { _count: { select: { registrations: true } } },
      orderBy: { startDate: "asc" },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my registrations — harus sebelum /:id agar tidak tertangkap sebagai id
router.get("/my/registrations", authenticate, async (req, res) => {
  try {
    const regs = await prisma.registration.findMany({
      where: { userId: req.user.id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single event
router.get("/:id", async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        _count: { select: { registrations: true } },
        registrations: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!event) return res.status(404).json({ message: "Event tidak ditemukan" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create event (admin)
router.post("/", authenticate, adminOnly, async (req, res) => {
  try {
    const { allowNonMember, nonMemberFee, ...rest } = req.body;
    const event = await prisma.event.create({
      data: {
        ...rest,
        allowNonMember: allowNonMember ?? false,
        nonMemberFee: Number(nonMemberFee ?? 0),
        maxParticipants: Number(rest.maxParticipants),
        fee: Number(rest.fee ?? 0),
      },
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update event (admin)
router.put("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const { allowNonMember, nonMemberFee, ...rest } = req.body;
    const event = await prisma.event.update({
      where: { id: Number(req.params.id) },
      data: {
        ...rest,
        allowNonMember: allowNonMember ?? false,
        nonMemberFee: Number(nonMemberFee ?? 0),
        maxParticipants: Number(rest.maxParticipants),
        fee: Number(rest.fee ?? 0),
      },
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete event (admin)
router.delete("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Event dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register to event — member (harus login)
router.post("/:id/register", authenticate, async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });
    if (!event) return res.status(404).json({ message: "Event tidak ditemukan" });
    if (event.status !== "upcoming") return res.status(400).json({ message: "Pendaftaran sudah ditutup" });
    if (new Date() > new Date(event.registrationDeadline))
      return res.status(400).json({ message: "Batas pendaftaran sudah lewat" });
    if (event._count.registrations >= event.maxParticipants)
      return res.status(400).json({ message: "Kuota peserta sudah penuh" });

    const reg = await prisma.registration.create({
      data: { userId, eventId, participantType: "member", feeCharged: event.fee },
      include: { event: true, user: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json(reg);
  } catch (err) {
    if (err.code === "P2002") return res.status(400).json({ message: "Anda sudah terdaftar di event ini" });
    res.status(500).json({ message: err.message });
  }
});

// Register to event — non-anggota (tidak perlu login)
router.post("/:id/register-guest", async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { guestName, guestEmail, guestPhone } = req.body;

    if (!guestName || !guestEmail || !guestPhone)
      return res.status(400).json({ message: "Nama, email, dan nomor telepon wajib diisi" });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });
    if (!event) return res.status(404).json({ message: "Event tidak ditemukan" });
    if (!event.allowNonMember) return res.status(400).json({ message: "Event ini hanya untuk anggota club" });
    if (event.status !== "upcoming") return res.status(400).json({ message: "Pendaftaran sudah ditutup" });
    if (new Date() > new Date(event.registrationDeadline))
      return res.status(400).json({ message: "Batas pendaftaran sudah lewat" });
    if (event._count.registrations >= event.maxParticipants)
      return res.status(400).json({ message: "Kuota peserta sudah penuh" });

    // Cek duplikat email non-anggota di event yang sama
    const duplicate = await prisma.registration.findFirst({
      where: { eventId, guestEmail, participantType: "non_member" },
    });
    if (duplicate) return res.status(400).json({ message: "Email ini sudah terdaftar di event ini" });

    const reg = await prisma.registration.create({
      data: {
        userId: null,
        eventId,
        participantType: "non_member",
        guestName,
        guestEmail,
        guestPhone,
        feeCharged: event.nonMemberFee,
      },
      include: { event: true },
    });
    res.status(201).json(reg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel registration (member)
router.delete("/:id/register", authenticate, async (req, res) => {
  try {
    await prisma.registration.delete({
      where: { userId_eventId: { userId: req.user.id, eventId: Number(req.params.id) } },
    });
    res.json({ message: "Pendaftaran dibatalkan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
