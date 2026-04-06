import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password minimal 6 karakter");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success("Registrasi berhasil! Selamat datang.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏓</div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Anggota Baru</h1>
          <p className="text-gray-600 mt-1">Karboneʞ</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" required className="input" placeholder="Nama Anda"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required className="input" placeholder="email@contoh.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
              <input type="tel" className="input" placeholder="08xxxxxxxxxx"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required className="input" placeholder="Minimal 6 karakter"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
