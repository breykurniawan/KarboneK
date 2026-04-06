import { Link } from "react-router-dom";

const statusColor = {
  upcoming: "bg-green-100 text-green-800",
  ongoing: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabel = {
  upcoming: "Akan Datang",
  ongoing: "Berlangsung",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const categoryLabel = { single: "Tunggal", double: "Ganda", team: "Beregu" };
const levelLabel = { open: "Terbuka", beginner: "Pemula", intermediate: "Menengah", advanced: "Lanjutan" };

export default function EventCard({ event }) {
  const regCount = event._count?.registrations ?? 0;
  const isFull = regCount >= event.maxParticipants;
  const deadline = new Date(event.registrationDeadline);
  const isPastDeadline = new Date() > deadline;

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <span className={`badge ${statusColor[event.status]}`}>{statusLabel[event.status]}</span>
        <span className="text-xs text-gray-500">{categoryLabel[event.category]} • {levelLabel[event.level]}</span>
      </div>

      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>

      <div className="space-y-1.5 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{new Date(event.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>👥</span>
          <span>{regCount}/{event.maxParticipants} peserta {isFull && <span className="text-red-600 font-medium">(Penuh)</span>}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>💰</span>
          <span>
            {event.fee > 0 ? `Anggota: Rp ${event.fee.toLocaleString("id-ID")}` : "Anggota: Gratis"}
            {event.allowNonMember && (
              <span className="text-orange-600 ml-1">
                {" "}| Umum: {event.nonMemberFee > 0 ? `Rp ${event.nonMemberFee.toLocaleString("id-ID")}` : "Gratis"}
              </span>
            )}
          </span>
        </div>
        {event.allowNonMember && (
          <div className="flex items-center gap-2">
            <span>🌐</span>
            <span className="text-green-700 text-xs font-medium">Terbuka untuk umum</span>
          </div>
        )}
      </div>

      <Link to={`/events/${event.id}`} className="btn-primary text-center text-sm">
        Lihat Detail
      </Link>
    </div>
  );
}
