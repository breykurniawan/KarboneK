import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../lib/api";

const emptyForm = {
  title: "", description: "", category: "single", level: "open",
  startDate: "", endDate: "", registrationDeadline: "", location: "",
  maxParticipants: 32, fee: 0, nonMemberFee: 0, allowNonMember: false, prize: "", status: "upcoming",
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEvents = () => api.get("/events").then((r) => setEvents(r.data));
  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, maxParticipants: Number(form.maxParticipants), fee: Number(form.fee) };
      if (editId) {
        await api.put(`/events/${editId}`, data);
        toast.success("Event diperbarui");
      } else {
        await api.post("/events", data);
        toast.success("Event dibuat");
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setForm({
      ...event,
      startDate: event.startDate.slice(0, 10),
      endDate: event.endDate.slice(0, 10),
      registrationDeadline: event.registrationDeadline.slice(0, 10),
      allowNonMember: event.allowNonMember ?? false,
      nonMemberFee: event.nonMemberFee ?? 0,
    });
    setEditId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus event ini?")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event dihapus");
      fetchEvents();
    } catch (err) {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Event</h1>
        <button onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); }} className="btn-primary">
          + Tambah Event
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="font-bold text-lg mb-4">{editId ? "Edit Event" : "Tambah Event Baru"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Event</label>
              <input type="text" required className="input" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea rows={3} required className="input" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="single">Tunggal</option>
                <option value="double">Ganda</option>
                <option value="team">Beregu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option value="open">Terbuka</option>
                <option value="beginner">Pemula</option>
                <option value="intermediate">Menengah</option>
                <option value="advanced">Lanjutan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input type="date" required className="input" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
              <input type="date" required className="input" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batas Pendaftaran</label>
              <input type="date" required className="input" value={form.registrationDeadline}
                onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
              <input type="text" required className="input" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maks. Peserta</label>
              <input type="number" required min={1} className="input" value={form.maxParticipants}
                onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Anggota (Rp)</label>
              <input type="number" min={0} className="input" value={form.fee}
                onChange={(e) => setForm({ ...form, fee: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hadiah</label>
              <input type="text" className="input" value={form.prize}
                onChange={(e) => setForm({ ...form, prize: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="upcoming">Akan Datang</option>
                <option value="ongoing">Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <input type="checkbox" id="allowNonMember" checked={form.allowNonMember}
                onChange={(e) => setForm({ ...form, allowNonMember: e.target.checked })} />
              <label htmlFor="allowNonMember" className="text-sm font-medium text-orange-800">
                Izinkan pendaftaran non-anggota (peserta umum)
              </label>
            </div>
            {form.allowNonMember && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Non-Anggota (Rp)</label>
                <input type="number" min={0} className="input" value={form.nonMemberFee}
                  onChange={(e) => setForm({ ...form, nonMemberFee: e.target.value })} />
              </div>
            )}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Menyimpan..." : editId ? "Perbarui" : "Simpan"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">Judul</th>
              <th className="pb-3 pr-4">Tanggal</th>
              <th className="pb-3 pr-4">Peserta</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium max-w-xs truncate">{e.title}</td>
                <td className="py-3 pr-4 text-gray-500">{new Date(e.startDate).toLocaleDateString("id-ID")}</td>
                <td className="py-3 pr-4">{e._count?.registrations}/{e.maxParticipants}</td>
                <td className="py-3 pr-4">
                  <span className={`badge ${e.status === "upcoming" ? "bg-green-100 text-green-800" : e.status === "ongoing" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                    {e.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <Link to={`/events/${e.id}/bracket`} className="text-purple-600 hover:underline text-xs">Bracket</Link>
                    <button onClick={() => handleEdit(e)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
