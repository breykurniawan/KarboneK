import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import EventRegistrationModal from "../components/EventRegistrationModal";

const statusColor = { upcoming: "bg-green-100 text-green-800", ongoing: "bg-blue-100 text-blue-800", completed: "bg-gray-100 text-gray-800", cancelled: "bg-red-100 text-red-800" };
const statusLabel = { upcoming: "Akan Datang", ongoing: "Berlangsung", completed: "Selesai", cancelled: "Dibatalkan" };

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const fetchEvent = () =>
    api.get(`/events/${id}`).then((r) => {
      setEvent(r.data);
      setLoading(false);
      if (user) setIsRegistered(r.data.registrations.some((reg) => reg.userId === user.id));
    });

  useEffect(() => { fetchEvent(); }, [id, user]);

  const handleCancel = async () => {
    if (!confirm("Batalkan pendaftaran?")) return;
    try {
      await api.delete(`/events/${id}/register`);
      toast.success("Pendaftaran dibatalkan");
      setIsRegistered(false);
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membatalkan");
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Memuat...</div>;
  if (!event) return <div className="text-center py-20 text-gray-500">Event tidak ditemukan</div>;

  const regCount = event._count?.registrations ?? 0;
  const isFull = regCount >= event.maxParticipants;
  const isPastDeadline = new Date() > new Date(event.registrationDeadline);
  const isOpen = event.status === "upcoming" && !isFull && !isPastDeadline;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <Link to="/events" className="text-blue-600 hover:text-blue-800 text-sm inline-block">← Kembali ke Event</Link>
        <Link to={`/events/${id}/bracket`} className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          🏆 Lihat Bracket Pertandingan
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <span className={`badge ${statusColor[event.status]}`}>{statusLabel[event.status]}</span>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{event.category === "single" ? "Tunggal" : event.category === "double" ? "Ganda" : "Beregu"}</span>
            <span>•</span>
            <span>{event.level === "open" ? "Terbuka" : event.level === "beginner" ? "Pemula" : event.level === "intermediate" ? "Menengah" : "Lanjutan"}</span>
            {event.allowNonMember && (
              <span className="badge bg-orange-100 text-orange-800">Terbuka untuk Umum</span>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h1>
        <p className="text-gray-600 mb-6">{event.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { icon: "📅", label: "Tanggal Mulai", value: new Date(event.startDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
            { icon: "📅", label: "Tanggal Selesai", value: new Date(event.endDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
            { icon: "⏰", label: "Batas Pendaftaran", value: new Date(event.registrationDeadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
            { icon: "📍", label: "Lokasi", value: event.location },
            { icon: "👥", label: "Peserta", value: `${regCount} / ${event.maxParticipants}` },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{item.icon} {item.label}</div>
              <div className="font-semibold text-gray-900">{item.value}</div>
            </div>
          ))}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">💰 Biaya Pendaftaran</div>
            <div className="font-semibold text-gray-900">
              Anggota: {event.fee > 0 ? `Rp ${event.fee.toLocaleString("id-ID")}` : "Gratis"}
            </div>
            {event.allowNonMember && (
              <div className="text-orange-700 font-semibold text-sm mt-1">
                Non-Anggota: {event.nonMemberFee > 0 ? `Rp ${event.nonMemberFee.toLocaleString("id-ID")}` : "Gratis"}
              </div>
            )}
          </div>
        </div>

        {event.prize && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="font-semibold text-yellow-800 mb-1">🏆 Hadiah</div>
            <div className="text-yellow-700">{event.prize}</div>
          </div>
        )}

        {/* Registration Section */}
        {isOpen && (
          <div className="space-y-3">
            {isRegistered ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium text-sm">✓ Sudah Terdaftar</div>
                <button onClick={handleCancel} className="btn-danger text-sm">Batalkan Pendaftaran</button>
              </div>
            ) : (
              <button onClick={() => setShowRegistrationModal(true)} className="btn-primary w-full sm:w-auto">
                📝 Daftar Event
              </button>
            )}
          </div>
        )}

        {!isOpen && event.status !== "completed" && (
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
            {isFull ? "❌ Kuota peserta sudah penuh"
              : isPastDeadline ? "❌ Batas pendaftaran sudah lewat"
              : "❌ Pendaftaran tidak tersedia"}
          </div>
        )}
      </div>

      {/* Participants */}
      {event.registrations?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Peserta Terdaftar ({regCount})</h2>
          <div className="space-y-2">
            {event.registrations.map((reg, i) => (
              <div key={reg.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className="w-7 h-7 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {reg.participantType === "non_member" ? reg.guestName : reg.user?.name}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{new Date(reg.createdAt).toLocaleDateString("id-ID")}</span>
                    {reg.participantType === "non_member" && (
                      <span className="badge bg-orange-100 text-orange-700">Non-Anggota</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && (
        <EventRegistrationModal
          event={event}
          user={user}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={() => {
            setIsRegistered(true);
            fetchEvent();
          }}
        />
      )}
    </div>
  );
}
