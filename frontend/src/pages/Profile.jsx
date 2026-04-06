import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [registrations, setRegistrations] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/events/my/registrations").then((r) => setRegistrations(r.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/me", form);
      toast.success("Profil diperbarui");
    } catch (err) {
      toast.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const statusColor = { pending: "bg-yellow-100 text-yellow-800", confirmed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };
  const statusLabel = { pending: "Menunggu", confirmed: "Dikonfirmasi", cancelled: "Dibatalkan" };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profil Saya</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile form */}
        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-lg">{user?.name}</div>
              <div className="text-gray-500 text-sm">{user?.email}</div>
              <span className={`badge mt-1 ${user?.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                {user?.role === "admin" ? "Admin" : "Anggota"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
              <input type="tel" className="input" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>

        {/* Registrations */}
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Pendaftaran Event Saya</h2>
          {registrations.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada pendaftaran event</p>
          ) : (
            <div className="space-y-3">
              {registrations.map((reg) => (
                <div key={reg.id} className="border rounded-lg p-3">
                  <div className="font-medium text-sm">{reg.event.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(reg.event.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <span className={`badge mt-2 ${statusColor[reg.status]}`}>{statusLabel[reg.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
