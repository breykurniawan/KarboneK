import { useEffect, useState } from "react";
import api from "../lib/api";
import EventCard from "../components/EventCard";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", category: "", level: "" });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.status) params.set("status", filter.status);
    if (filter.category) params.set("category", filter.category);
    if (filter.level) params.set("level", filter.level);
    api.get(`/events?${params}`).then((r) => { setEvents(r.data); setLoading(false); });
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Event & Turnamen</h1>
      <p className="text-gray-600 mb-8">Daftar semua event dan turnamen tenis meja yang diselenggarakan club kami.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select className="input w-auto" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Semua Status</option>
          <option value="upcoming">Akan Datang</option>
          <option value="ongoing">Berlangsung</option>
          <option value="completed">Selesai</option>
        </select>
        <select className="input w-auto" value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
          <option value="">Semua Kategori</option>
          <option value="single">Tunggal</option>
          <option value="double">Ganda</option>
          <option value="team">Beregu</option>
        </select>
        <select className="input w-auto" value={filter.level} onChange={(e) => setFilter({ ...filter, level: e.target.value })}>
          <option value="">Semua Level</option>
          <option value="open">Terbuka</option>
          <option value="beginner">Pemula</option>
          <option value="intermediate">Menengah</option>
          <option value="advanced">Lanjutan</option>
        </select>
        {(filter.status || filter.category || filter.level) && (
          <button onClick={() => setFilter({ status: "", category: "", level: "" })} className="btn-secondary text-sm">
            Reset Filter
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Memuat event...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Tidak ada event ditemukan</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
