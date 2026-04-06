import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/members").then((r) => { setMembers(r.data); setLoading(false); });
  }, []);

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Anggota Club</h1>
      <p className="text-gray-600 mb-8">Kenali para anggota aktif Club Tenis Meja Garuda.</p>

      <input
        type="text"
        placeholder="Cari anggota..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input max-w-sm mb-8"
      />

      {loading ? (
        <div className="text-center py-16 text-gray-500">Memuat anggota...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Tidak ada anggota ditemukan</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((m) => (
            <div key={m.id} className="card text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-gray-900">{m.name}</h3>
              <p className="text-gray-500 text-sm mt-1">
                Bergabung {new Date(m.joinedAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
              </p>
              {m.phone && <p className="text-gray-400 text-xs mt-1">{m.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
