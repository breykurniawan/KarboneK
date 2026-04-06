import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authenticate, adminOnly } from "../middleware/auth.js";

const router = Router();

/**
 * Hitung jumlah babak untuk n peserta (sistem gugur)
 * Selalu dibulatkan ke atas ke pangkat 2 terdekat
 */
function calcRounds(n) {
  return Math.ceil(Math.log2(n));
}

/**
 * Shuffle array (Fisher-Yates) — untuk undian peserta
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Urutkan peserta berdasarkan level event:
 * - advanced: acak (semua dianggap setara)
 * - intermediate: member dulu, lalu non-member
 * - beginner/open: acak
 * Seeding sederhana: member club mendapat posisi unggulan di level intermediate
 */
function seedPlayers(registrations, level) {
  if (level === "intermediate") {
    const members = shuffle(registrations.filter((r) => r.participantType === "member"));
    const guests = shuffle(registrations.filter((r) => r.participantType === "non_member"));
    return [...members, ...guests];
  }
  return shuffle(registrations);
}

// GET bracket event
router.get("/:eventId", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const matches = await prisma.match.findMany({
      where: { eventId },
      orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
    });

    if (matches.length === 0) return res.json({ generated: false, matches: [] });

    // Ambil semua registrasi yang terlibat
    const regIds = new Set();
    matches.forEach((m) => {
      if (m.player1RegId) regIds.add(m.player1RegId);
      if (m.player2RegId) regIds.add(m.player2RegId);
      if (m.winnerId) regIds.add(m.winnerId);
    });

    const registrations = await prisma.registration.findMany({
      where: { id: { in: [...regIds] } },
      include: { user: { select: { id: true, name: true } } },
    });

    const regMap = {};
    registrations.forEach((r) => {
      regMap[r.id] = {
        id: r.id,
        name: r.participantType === "non_member" ? r.guestName : r.user?.name,
        type: r.participantType,
      };
    });

    // Kelompokkan per babak
    const rounds = {};
    matches.forEach((m) => {
      if (!rounds[m.round]) rounds[m.round] = [];
      rounds[m.round].push({
        ...m,
        player1: m.player1RegId ? regMap[m.player1RegId] : null,
        player2: m.player2RegId ? regMap[m.player2RegId] : null,
        winner: m.winnerId ? regMap[m.winnerId] : null,
      });
    });

    const totalRounds = Math.max(...matches.map((m) => m.round));
    res.json({ generated: true, totalRounds, rounds, matches: matches.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST generate bracket (admin)
router.post("/:eventId/generate", authenticate, adminOnly, async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          where: { status: { in: ["confirmed", "pending"] } },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });
    if (!event) return res.status(404).json({ message: "Event tidak ditemukan" });

    const regs = event.registrations;
    if (regs.length < 2) return res.status(400).json({ message: "Minimal 2 peserta untuk membuat bracket" });

    // Hapus bracket lama jika ada
    await prisma.match.deleteMany({ where: { eventId } });

    const seeded = seedPlayers(regs, event.level);
    const n = seeded.length;
    const totalRounds = calcRounds(n);
    // Kapasitas bracket (pangkat 2)
    const bracketSize = Math.pow(2, totalRounds);
    const byeCount = bracketSize - n;

    // Isi slot dengan peserta + BYE
    const slots = [...seeded.map((r) => r.id), ...Array(byeCount).fill(null)];

    // Buat semua match untuk semua babak
    // Babak 1: pasangkan slot[0] vs slot[1], slot[2] vs slot[3], dst
    const matchesByRound = {};
    for (let round = 1; round <= totalRounds; round++) {
      matchesByRound[round] = [];
      const matchCount = bracketSize / Math.pow(2, round);
      for (let i = 0; i < matchCount; i++) {
        matchesByRound[round].push({ round, matchNumber: i + 1, eventId });
      }
    }

    // Insert semua match dulu (tanpa player), lalu update babak 1 dengan peserta
    const createdMatches = {};
    for (let round = totalRounds; round >= 1; round--) {
      createdMatches[round] = [];
      for (const m of matchesByRound[round]) {
        const created = await prisma.match.create({ data: m });
        createdMatches[round].push(created);
      }
    }

    // Set nextMatchId: match di babak r, nomor i → babak r+1, nomor ceil(i/2)
    for (let round = 1; round < totalRounds; round++) {
      for (let i = 0; i < createdMatches[round].length; i++) {
        const nextIdx = Math.floor(i / 2);
        const nextMatch = createdMatches[round + 1][nextIdx];
        await prisma.match.update({
          where: { id: createdMatches[round][i].id },
          data: { nextMatchId: nextMatch.id },
        });
      }
    }

    // Isi peserta di babak 1
    for (let i = 0; i < createdMatches[1].length; i++) {
      const p1 = slots[i * 2] ?? null;
      const p2 = slots[i * 2 + 1] ?? null;
      let status = "pending";
      let winnerId = null;

      // Jika salah satu BYE, langsung menang
      if (p1 && !p2) { winnerId = p1; status = "bye"; }
      else if (!p1 && p2) { winnerId = p2; status = "bye"; }
      else if (!p1 && !p2) { status = "bye"; }

      await prisma.match.update({
        where: { id: createdMatches[1][i].id },
        data: { player1RegId: p1, player2RegId: p2, winnerId, status },
      });

      // Propagasi BYE ke babak berikutnya
      if (winnerId && createdMatches[1][i].nextMatchId) {
        await propagateWinner(createdMatches[1][i].id, winnerId, createdMatches);
      }
    }

    res.json({ message: "Bracket berhasil dibuat", totalRounds, bracketSize, participants: n, byes: byeCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper: propagasi pemenang ke match berikutnya
async function propagateWinner(matchId, winnerId, createdMatches) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match?.nextMatchId) return;

  const nextMatch = await prisma.match.findUnique({ where: { id: match.nextMatchId } });
  if (!nextMatch) return;

  // Tentukan slot: match ganjil → player1, match genap → player2
  const isOdd = match.matchNumber % 2 === 1;
  const updateData = isOdd
    ? { player1RegId: winnerId }
    : { player2RegId: winnerId };

  // Cek apakah kedua slot sudah terisi setelah update
  const updatedNext = await prisma.match.update({
    where: { id: nextMatch.id },
    data: updateData,
  });

  // Jika salah satu slot masih kosong dan yang lain BYE, propagasi lagi
  const p1 = updatedNext.player1RegId;
  const p2 = updatedNext.player2RegId;
  if (p1 && !p2) {
    await prisma.match.update({ where: { id: nextMatch.id }, data: { winnerId: p1, status: "bye" } });
    await propagateWinner(nextMatch.id, p1, createdMatches);
  } else if (!p1 && p2) {
    await prisma.match.update({ where: { id: nextMatch.id }, data: { winnerId: p2, status: "bye" } });
    await propagateWinner(nextMatch.id, p2, createdMatches);
  }
}

// PUT update skor match (admin)
router.put("/:eventId/match/:matchId", authenticate, adminOnly, async (req, res) => {
  try {
    const matchId = Number(req.params.matchId);
    const { player1Score, player2Score, winnerId } = req.body;

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ message: "Match tidak ditemukan" });
    if (match.status === "bye") return res.status(400).json({ message: "Match BYE tidak bisa diupdate" });

    // Validasi pemenang
    if (winnerId !== match.player1RegId && winnerId !== match.player2RegId) {
      return res.status(400).json({ message: "Pemenang harus salah satu peserta match ini" });
    }

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: { player1Score: Number(player1Score), player2Score: Number(player2Score), winnerId, status: "completed" },
    });

    // Propagasi pemenang ke babak berikutnya
    if (updated.nextMatchId) {
      const nextMatch = await prisma.match.findUnique({ where: { id: updated.nextMatchId } });
      const isOdd = match.matchNumber % 2 === 1;
      await prisma.match.update({
        where: { id: updated.nextMatchId },
        data: isOdd ? { player1RegId: winnerId } : { player2RegId: winnerId },
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE reset bracket (admin)
router.delete("/:eventId", authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.match.deleteMany({ where: { eventId: Number(req.params.eventId) } });
    res.json({ message: "Bracket direset" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
