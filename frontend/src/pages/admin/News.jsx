import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const emptyForm = { title: "", content: "", author: "", published: true };

export default function AdminNews() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm, author: user?.name || "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNews = () => api.get("/news").then((r) => setNews(r.data));
  useEffect(() => { fetchNews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/news/${editId}`, form);
        toast.success("Berita diperbarui");
      } else {
        await api.post("/news", form);
        toast.success("Berita ditambahkan");
      }
      setShowForm(false);
      setForm({ ...emptyForm, author: user?.name || "" });
      setEditId(null);
      fetchNews();
    } catch (err) {
      toast.error("Gagal menyimpan berita");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (n) => {
    setForm({ title: n.title, content: n.content, author: n.author, published: n.published });
    setEditId(n.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus berita ini?")) return;
    try {
      await api.delete(`/news/${id}`);
      toast.success("Berita dihapus");
      fetchNews();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Berita</h1>
        <button onClick={() => { setShowForm(true); setForm({ ...emptyForm, author: user?.name || "" }); setEditId(null); }} className="btn-primary">
          + Tambah Berita
        </button>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2 className="font-bold text-lg mb-4">{editId ? "Edit Berita" : "Tambah Berita"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
              <input type="text" required className="input" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penulis</label>
              <input type="text" required className="input" value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
              <textarea rows={6} required className="input" value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <label htmlFor="published" className="text-sm text-gray-700">Publikasikan</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Menyimpan..." : editId ? "Perbarui" : "Simpan"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="space-y-4">
          {news.map((n) => (
            <div key={n.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{n.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{n.content}</p>
                  <div className="text-xs text-gray-400 mt-2">{n.author} • {new Date(n.createdAt).toLocaleDateString("id-ID")}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(n)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(n.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
