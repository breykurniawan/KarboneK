import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Daftar nama pemain untuk seed
const playerNames = [
  "Andi Wijaya", "Budi Santoso", "Citra Dewi", "Dian Pratama", "Eko Susanto",
  "Fajar Nugroho", "Gita Rahayu", "Hendra Kusuma", "Indah Permata", "Joko Widodo",
  "Kartika Sari", "Lukman Hakim", "Maya Putri", "Nanda Saputra", "Oki Firmansyah",
  "Putri Handayani", "Qori Ananda", "Rudi Hartono", "Sari Wulandari", "Tono Subekti",
  "Umar Bakri", "Vina Melati", "Wahyu Setiawan", "Xena Pratiwi", "Yudi Prasetyo",
  "Zara Amelia", "Agus Salim", "Bagas Prayoga", "Cindy Lestari", "Doni Kusuma",
  "Elsa Fitriani", "Fandi Ahmad", "Galih Permana", "Hani Rahmawati", "Ivan Santoso",
  "Julia Anggraini", "Kevin Pratama", "Lina Susanti", "Miko Andrianto", "Nina Kurnia",
];

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pingpongclub.com" },
    update: {},
    create: {
      name: "Admin Club",
      email: "admin@pingpongclub.com",
      password: adminPassword,
      role: "admin",
      phone: "08123456789",
    },
  });

  // Buat 40 user member untuk peserta
  const memberUsers = [];
  for (let i = 0; i < playerNames.length; i++) {
    const name = playerNames[i];
    const email = `player${i + 1}@pingpongclub.com`;
    const pw = await bcrypt.hash("player123", 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, password: pw, role: "member", phone: `0812000${String(i).padStart(4, "0")}` },
    });
    memberUsers.push(user);
  }

  // 10 completed events
  const completedEvents = [
    {
      title: "Turnamen Pembukaan 2025",
      description: "Turnamen perdana club untuk menyambut tahun 2025. Diikuti 48 peserta dari berbagai daerah.",
      category: "single", level: "open",
      startDate: new Date("2025-01-15"), endDate: new Date("2025-01-16"),
      registrationDeadline: new Date("2025-01-10"),
      location: "GOR Serbaguna, Jakarta",
      maxParticipants: 64, fee: 100000, nonMemberFee: 175000, allowNonMember: true,
      prize: "Rp 3.000.000 / Rp 1.500.000 / Rp 750.000", status: "completed",
    },
    {
      title: "Liga Internal Seri 1 - 2025",
      description: "Seri pertama liga internal anggota club tahun 2025.",
      category: "single", level: "intermediate",
      startDate: new Date("2025-02-08"), endDate: new Date("2025-02-08"),
      registrationDeadline: new Date("2025-02-03"),
      location: "Sekretariat Club",
      maxParticipants: 32, fee: 50000, nonMemberFee: 0, allowNonMember: false,
      prize: "Trofi + Sertifikat", status: "completed",
    },
    {
      title: "Kejuaraan Tenis Meja Antar Pelajar",
      description: "Turnamen khusus pelajar SMP dan SMA se-Jakarta. Terbuka untuk umum.",
      category: "single", level: "beginner",
      startDate: new Date("2025-03-22"), endDate: new Date("2025-03-23"),
      registrationDeadline: new Date("2025-03-15"),
      location: "Aula SMAN 5 Jakarta",
      maxParticipants: 48, fee: 75000, nonMemberFee: 125000, allowNonMember: true,
      prize: "Rp 1.500.000 / Rp 750.000 / Rp 500.000", status: "completed",
    },
    {
      title: "Turnamen Ganda Putra Open",
      description: "Turnamen ganda putra terbuka untuk semua kalangan. Pasangan bebas.",
      category: "double", level: "open",
      startDate: new Date("2025-04-12"), endDate: new Date("2025-04-13"),
      registrationDeadline: new Date("2025-04-05"),
      location: "Sport Hall Senayan",
      maxParticipants: 32, fee: 150000, nonMemberFee: 250000, allowNonMember: true,
      prize: "Rp 4.000.000 per pasangan", status: "completed",
    },
    {
      title: "Liga Internal Seri 2 - 2025",
      description: "Seri kedua liga internal. Poin akumulasi dari seri 1 diperhitungkan.",
      category: "single", level: "intermediate",
      startDate: new Date("2025-05-10"), endDate: new Date("2025-05-10"),
      registrationDeadline: new Date("2025-05-05"),
      location: "Sekretariat Club",
      maxParticipants: 32, fee: 50000, nonMemberFee: 0, allowNonMember: false,
      prize: "Trofi + Sertifikat", status: "completed",
    },
    {
      title: "Turnamen HUT Club ke-15",
      description: "Turnamen spesial memperingati HUT Club Tenis Meja Garuda ke-15.",
      category: "single", level: "open",
      startDate: new Date("2025-06-20"), endDate: new Date("2025-06-22"),
      registrationDeadline: new Date("2025-06-10"),
      location: "GOR Serbaguna, Jakarta",
      maxParticipants: 64, fee: 125000, nonMemberFee: 200000, allowNonMember: true,
      prize: "Rp 7.500.000 / Rp 3.500.000 / Rp 1.500.000", status: "completed",
    },
    {
      title: "Kejuaraan Tenis Meja Veteran 40+",
      description: "Turnamen khusus atlet veteran usia 40 tahun ke atas. Terbuka untuk umum.",
      category: "single", level: "open",
      startDate: new Date("2025-07-19"), endDate: new Date("2025-07-20"),
      registrationDeadline: new Date("2025-07-12"),
      location: "GOR Kelurahan Menteng",
      maxParticipants: 32, fee: 75000, nonMemberFee: 125000, allowNonMember: true,
      prize: "Trofi + Rp 2.000.000", status: "completed",
    },
    {
      title: "Turnamen Beregu Antar RT/RW",
      description: "Turnamen beregu mewakili RT/RW se-kecamatan. Setiap tim terdiri dari 3 pemain.",
      category: "team", level: "open",
      startDate: new Date("2025-08-17"), endDate: new Date("2025-08-17"),
      registrationDeadline: new Date("2025-08-10"),
      location: "Lapangan Olahraga Kecamatan",
      maxParticipants: 16, fee: 200000, nonMemberFee: 300000, allowNonMember: true,
      prize: "Piala Bergilir + Rp 3.000.000", status: "completed",
    },
    {
      title: "Liga Internal Seri 3 - Grand Final 2025",
      description: "Grand final liga internal 2025. 8 besar terbaik dari seri 1 dan 2 bertanding.",
      category: "single", level: "advanced",
      startDate: new Date("2025-09-27"), endDate: new Date("2025-09-28"),
      registrationDeadline: new Date("2025-09-20"),
      location: "Sekretariat Club",
      maxParticipants: 8, fee: 0, nonMemberFee: 0, allowNonMember: false,
      prize: "Trofi Juara Liga + Rp 1.000.000", status: "completed",
    },
    {
      title: "Turnamen Akhir Tahun 2025",
      description: "Turnamen penutup tahun 2025. Terbuka untuk semua kalangan.",
      category: "single", level: "open",
      startDate: new Date("2025-12-13"), endDate: new Date("2025-12-14"),
      registrationDeadline: new Date("2025-12-05"),
      location: "GOR Serbaguna, Jakarta",
      maxParticipants: 64, fee: 100000, nonMemberFee: 175000, allowNonMember: true,
      prize: "Rp 5.000.000 / Rp 2.500.000 / Rp 1.000.000", status: "completed",
    },
  ];

  // 3 upcoming events dengan peserta
  const upcomingEvents = [
    {
      title: "Turnamen Tenis Meja Open 2026",
      description: "Turnamen tenis meja terbuka untuk semua kalangan. Hadiah total Rp 10.000.000.",
      category: "single", level: "open",
      startDate: new Date("2026-05-10"), endDate: new Date("2026-05-12"),
      registrationDeadline: new Date("2026-05-01"),
      location: "GOR Serbaguna, Jakarta",
      maxParticipants: 16, fee: 150000, nonMemberFee: 250000, allowNonMember: true,
      prize: "Rp 5.000.000 / Rp 3.000.000 / Rp 1.000.000", status: "upcoming",
    },
    {
      title: "Liga Internal Club - Seri 1 2026",
      description: "Liga internal anggota club. Khusus anggota terdaftar.",
      category: "single", level: "intermediate",
      startDate: new Date("2026-04-20"), endDate: new Date("2026-04-20"),
      registrationDeadline: new Date("2026-04-15"),
      location: "Sekretariat Club",
      maxParticipants: 8, fee: 50000, nonMemberFee: 0, allowNonMember: false,
      prize: "Trofi + Sertifikat", status: "upcoming",
    },
    {
      title: "Turnamen Ganda Campuran 2026",
      description: "Turnamen ganda campuran untuk pasangan putra-putri. Terbuka untuk umum.",
      category: "double", level: "open",
      startDate: new Date("2026-06-01"), endDate: new Date("2026-06-02"),
      registrationDeadline: new Date("2026-05-25"),
      location: "Sport Hall Senayan",
      maxParticipants: 8, fee: 200000, nonMemberFee: 350000, allowNonMember: true,
      prize: "Rp 3.000.000 per pasangan", status: "upcoming",
    },
  ];

  await prisma.event.createMany({ data: [...completedEvents, ...upcomingEvents] });

  // Ambil event upcoming yang baru dibuat
  const events = await prisma.event.findMany({ where: { status: "upcoming" }, orderBy: { id: "asc" } });

  // Event 1: Turnamen Open 2026 — 16 peserta (12 member + 4 non-member)
  const event1 = events[0];
  const event1Members = memberUsers.slice(0, 12);
  for (const u of event1Members) {
    await prisma.registration.create({
      data: { userId: u.id, eventId: event1.id, participantType: "member", feeCharged: event1.fee, status: "confirmed" },
    });
  }
  const guestPlayers1 = [
    { guestName: "Rizky Aditya", guestEmail: "rizky@gmail.com", guestPhone: "08111111111" },
    { guestName: "Sinta Maharani", guestEmail: "sinta@gmail.com", guestPhone: "08222222222" },
    { guestName: "Taufik Hidayat", guestEmail: "taufik@gmail.com", guestPhone: "08333333333" },
    { guestName: "Umi Kalsum", guestEmail: "umi@gmail.com", guestPhone: "08444444444" },
  ];
  for (const g of guestPlayers1) {
    await prisma.registration.create({
      data: { userId: null, eventId: event1.id, participantType: "non_member", ...g, feeCharged: event1.nonMemberFee, status: "confirmed" },
    });
  }

  // Event 2: Liga Internal — 8 peserta member
  const event2 = events[1];
  const event2Members = memberUsers.slice(12, 20);
  for (const u of event2Members) {
    await prisma.registration.create({
      data: { userId: u.id, eventId: event2.id, participantType: "member", feeCharged: event2.fee, status: "confirmed" },
    });
  }

  // Event 3: Ganda Campuran — 8 peserta (6 member + 2 non-member)
  const event3 = events[2];
  const event3Members = memberUsers.slice(20, 26);
  for (const u of event3Members) {
    await prisma.registration.create({
      data: { userId: u.id, eventId: event3.id, participantType: "member", feeCharged: event3.fee, status: "confirmed" },
    });
  }
  const guestPlayers3 = [
    { guestName: "Vino Bastian", guestEmail: "vino@gmail.com", guestPhone: "08555555555" },
    { guestName: "Wulan Guritno", guestEmail: "wulan@gmail.com", guestPhone: "08666666666" },
  ];
  for (const g of guestPlayers3) {
    await prisma.registration.create({
      data: { userId: null, eventId: event3.id, participantType: "non_member", ...g, feeCharged: event3.nonMemberFee, status: "confirmed" },
    });
  }

  // Sample news
  await prisma.news.createMany({
    data: [
      {
        title: "Selamat Datang di Club Tenis Meja Garuda",
        content: "Club Tenis Meja Garuda resmi membuka pendaftaran anggota baru untuk tahun 2026. Bergabunglah bersama kami dan tingkatkan kemampuan tenis meja Anda bersama pelatih berpengalaman.",
        author: "Admin Club",
      },
      {
        title: "Jadwal Latihan Rutin Bulan April 2026",
        content: "Latihan rutin dilaksanakan setiap Selasa, Kamis pukul 18.00-21.00 dan Sabtu pukul 08.00-12.00 di Sekretariat Club. Semua anggota wajib hadir minimal 2x seminggu.",
        author: "Admin Club",
      },
      {
        title: "Prestasi Anggota di Kejuaraan Nasional",
        content: "Selamat kepada anggota kita yang berhasil meraih medali perak di Kejuaraan Tenis Meja Nasional 2025. Kebanggaan bagi seluruh keluarga besar Club Tenis Meja Garuda.",
        author: "Admin Club",
      },
    ],
  });

  console.log("Seed selesai:", { admin: admin.email, totalPlayers: memberUsers.length });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
