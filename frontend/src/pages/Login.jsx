import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Selamat datang, ${user.name}!`);
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏓</div>
          <h1 className="text-2xl font-bold text-gray-900">Masuk ke Akun</h1>
          <p className="text-gray-600 mt-1">Karboneʞ</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required className="input" placeholder="email@contoh.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required className="input" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Belum punya akun?{" "}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">Daftar sekarang</Link>
          </p>

          {/* Demo Accounts */}
          <div className="mt-6 space-y-2">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="font-semibold text-blue-900 text-sm mb-2">👨‍💼 Admin</div>
              <div className="text-xs text-blue-700 space-y-1">
                <div><span className="font-mono bg-white px-2 py-1 rounded">admin@karbone-k.id</span></div>
                <div><span className="font-mono bg-white px-2 py-1 rounded">admin123</span></div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="font-semibold text-green-900 text-sm mb-2">👥 Anggota Demo</div>
              <div className="text-xs text-green-700 space-y-2">
                <div>
                  <div className="font-medium">Adi Kusuma</div>
                  <div><span className="font-mono bg-white px-2 py-1 rounded text-xs">adi@karbone-k.id</span> / <span className="font-mono bg-white px-2 py-1 rounded text-xs">adi123</span></div>
                </div>
                <div>
                  <div className="font-medium">Siti Rahayu</div>
                  <div><span className="font-mono bg-white px-2 py-1 rounded text-xs">siti@karbone-k.id</span> / <span className="font-mono bg-white px-2 py-1 rounded text-xs">siti123</span></div>
                </div>
                <div>
                  <div className="font-medium">Roni Wijaya</div>
                  <div><span className="font-mono bg-white px-2 py-1 rounded text-xs">roni@karbone-k.id</span> / <span className="font-mono bg-white px-2 py-1 rounded text-xs">roni123</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
