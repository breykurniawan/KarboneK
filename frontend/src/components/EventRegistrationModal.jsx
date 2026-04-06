import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/api";

const CATEGORIES = {
  single: "Tunggal",
  double: "Ganda",
  team: "Beregu",
};

const LEVELS = {
  open: "Terbuka",
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
};

export default function EventRegistrationModal({ event, user, onClose, onSuccess }) {
  const [registrationType, setRegistrationType] = useState(user ? "member" : null);
  const [category, setCategory] = useState(event.category);
  const [level, setLevel] = useState(event.level);
  const [guestForm, setGuestForm] = useState({ guestName: "", guestEmail: "", guestPhone: "" });
  const [loading, setLoading] = useState(false);

  const handleMemberRegister = async () => {
    setLoading(true);
    try {
      await api.post(`/events/${event.id}/register`, { category, level });
      toast.success("Berhasil mendaftar event!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/events/${event.id}/register-guest`, {
        ...guestForm,
        category,
        level,
      });
      toast.success("Pendaftaran berhasil!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 flex items-center justify-between sticky top-0">
          <h2 className="text-xl font-bold">Daftar Event</h2>
          <button onClick={onClose} className="text-2xl hover:opacity-75 transition-opacity">
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Event Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">{event.title}</h3>
            <div className="text-sm text-blue-800">
              <p>📅 {new Date(event.startDate).toLocaleDateString("id-ID")}</p>
              <p>📍 {event.location}</p>
            </div>
          </div>

          {/* Type Selection */}
          {!user ? (
            <div className="space-y-3 mb-6">
              <p className="font-semibold text-gray-900">Anda adalah:</p>
              <button
                onClick={() => setRegistrationType("member")}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  registrationType === "member"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                <div className="font-semibold text-gray-900">👤 Anggota Club</div>
                <div className="text-sm text-gray-600">Login dengan akun Karboneʞ</div>
              </button>
              <button
                onClick={() => setRegistrationType("guest")}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  registrationType === "guest"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-orange-300"
                }`}
              >
                <div className="font-semibold text-gray-900">🌐 Non-Anggota</div>
                <div className="text-sm text-gray-600">Daftar sebagai peserta umum</div>
              </button>

              {!event.allowNonMember && registrationType === "guest" && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-red-700 text-sm">
                  Event ini hanya terbuka untuk anggota club Karboneʞ
                </div>
              )}
            </div>
          ) : null}

          {/* Category & Level Selection */}
          {registrationType === "member" || (user && !registrationType) ? (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Kategori Pertandingan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Pilih kategori</option>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Level Pertandingan
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Pilih level</option>
                  {Object.entries(LEVELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-yellow-800">
                  <span className="font-semibold">Biaya Pendaftaran:</span>
                  {event.fee > 0 ? (
                    <span className="ml-2 font-bold text-lg">Rp {event.fee.toLocaleString("id-ID")}</span>
                  ) : (
                    <span className="ml-2 font-bold text-lg text-green-600">Gratis</span>
                  )}
                </div>
              </div>

              {/* Member Register Button */}
              <button
                onClick={handleMemberRegister}
                disabled={loading || !category || !level}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  loading || !category || !level
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Mendaftar..." : "Konfirmasi Pendaftaran"}
              </button>
            </div>
          ) : null}

          {/* Non-Member Form */}
          {registrationType === "guest" && event.allowNonMember ? (
            <form onSubmit={handleGuestRegister} className="space-y-4">
              <h3 className="font-bold text-orange-800 mb-3">Data Peserta</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  placeholder="Nama lengkap peserta"
                  value={guestForm.guestName}
                  onChange={(e) =>
                    setGuestForm({ ...guestForm, guestName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="input w-full"
                  placeholder="email@contoh.com"
                  value={guestForm.guestEmail}
                  onChange={(e) =>
                    setGuestForm({ ...guestForm, guestEmail: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Telepon *
                </label>
                <input
                  type="tel"
                  required
                  className="input w-full"
                  placeholder="08xxxxxxxxxx"
                  value={guestForm.guestPhone}
                  onChange={(e) =>
                    setGuestForm({ ...guestForm, guestPhone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Kategori Pertandingan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Pilih kategori</option>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Level Pertandingan
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Pilih level</option>
                  {Object.entries(LEVELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="text-sm text-orange-800">
                  <span className="font-semibold">Biaya Pendaftaran:</span>
                  {event.nonMemberFee > 0 ? (
                    <span className="ml-2 font-bold text-lg">Rp {event.nonMemberFee.toLocaleString("id-ID")}</span>
                  ) : (
                    <span className="ml-2 font-bold text-lg text-green-600">Gratis</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !guestForm.guestName ||
                    !guestForm.guestEmail ||
                    !guestForm.guestPhone ||
                    !category ||
                    !level
                  }
                  className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                    loading ||
                    !guestForm.guestName ||
                    !guestForm.guestEmail ||
                    !guestForm.guestPhone ||
                    !category ||
                    !level
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {loading ? "Mendaftar..." : "Konfirmasi Pendaftaran"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg font-bold border-2 border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : null}

          {/* Member Login Redirect */}
          {user === null && registrationType === "member" ? (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm text-center">
                Silakan login dengan akun Karboneʞ untuk mendaftar
              </p>
              <a
                href="/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-center transition-colors"
              >
                Login
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
