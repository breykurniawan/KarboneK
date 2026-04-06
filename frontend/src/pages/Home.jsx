import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import EventCard from "../components/EventCard";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState({ events: 0, members: 0 });

  useEffect(() => {
    api.get("/events?status=upcoming").then((r) => setEvents(r.data.slice(0, 3)));
    api.get("/news").then((r) => setNews(r.data.slice(0, 3)));
    Promise.all([api.get("/events"), api.get("/members")]).then(([e, m]) =>
      setStats({ events: e.data.length, members: m.data.length })
    );
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">🏓</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Karboneʞ</h1>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Bergabunglah bersama kami dan kembangkan kemampuan tenis meja Anda bersama pelatih berpengalaman dan komunitas yang solid.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-xl text-lg transition-colors">
              Daftar Sekarang
            </Link>
            <Link to="/events" className="border-2 border-white hover:bg-white hover:text-blue-900 font-bold px-8 py-3 rounded-xl text-lg transition-colors">
              Lihat Event
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: "🏆", value: stats.events, label: "Total Event" },
            { icon: "👥", value: stats.members, label: "Anggota Aktif" },
            { icon: "🥇", value: "15+", label: "Prestasi Nasional" },
            { icon: "📅", value: "2010", label: "Tahun Berdiri" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-blue-900">{s.value}</div>
              <div className="text-gray-600 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Event Mendatang</h2>
          <Link to="/events" className="text-blue-600 hover:text-blue-800 font-medium">Lihat Semua →</Link>
        </div>
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada event mendatang</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {/* About */}
      <section className="bg-blue-50 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tentang Club Kami</h2>
            <p className="text-gray-600 mb-4">
              Karboneʞ berdiri sejak tahun 2010 dengan visi menjadi club tenis meja terbaik di Indonesia. Kami memiliki fasilitas latihan modern dan pelatih bersertifikat nasional.
            </p>
            <p className="text-gray-600 mb-6">
              Dengan lebih dari 100 anggota aktif, kami rutin mengadakan latihan, turnamen internal, dan mengikuti kejuaraan tingkat daerah hingga nasional.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🏋️", title: "Fasilitas Modern", desc: "10 meja standar internasional" },
                { icon: "👨‍🏫", title: "Pelatih Bersertifikat", desc: "Lisensi PTMSI nasional" },
                { icon: "📅", title: "Latihan Rutin", desc: "3x seminggu terjadwal" },
                { icon: "🏆", title: "Turnamen Rutin", desc: "Liga internal bulanan" },
              ].map((f) => (
                <div key={f.title} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="font-semibold text-sm">{f.title}</div>
                  <div className="text-gray-500 text-xs">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 text-white text-center">
            <div className="text-5xl mb-4">🏓</div>
            <h3 className="text-xl font-bold mb-2">Jadwal Latihan</h3>
            <div className="space-y-3 text-blue-100">
              <div className="bg-blue-800 rounded-lg p-3">
                <div className="font-semibold">Selasa & Kamis</div>
                <div className="text-sm">18.00 - 21.00 WIB</div>
              </div>
              <div className="bg-blue-800 rounded-lg p-3">
                <div className="font-semibold">Sabtu</div>
                <div className="text-sm">08.00 - 12.00 WIB</div>
              </div>
              <div className="text-sm mt-4">📍 Sekretariat Club, Jl. Olahraga No. 10</div>
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Berita Terbaru</h2>
          <Link to="/news" className="text-blue-600 hover:text-blue-800 font-medium">Lihat Semua →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((n) => (
            <Link key={n.id} to={`/news/${n.id}`} className="card hover:shadow-md transition-shadow block">
              <div className="text-xs text-gray-500 mb-2">
                {new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{n.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3">{n.content}</p>
              <div className="mt-3 text-blue-600 text-sm font-medium">Baca selengkapnya →</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
