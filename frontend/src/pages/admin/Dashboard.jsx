import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, members: 0, registrations: 0, news: 0 });
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/events"),
      api.get("/members/all"),
      api.get("/news"),
    ]).then(([events, members, news]) => {
      const totalRegs = events.data.reduce((sum, e) => sum + (e._count?.registrations || 0), 0);
      setStats({ events: events.data.length, members: members.data.length, registrations: totalRegs, news: news.data.length });
      setRecentEvents(events.data.slice(0, 5));
    });
  }, []);

  const adminLinks = [
    { to: "/admin/events", icon: "🏆", label: "Kelola Event" },
    { to: "/admin/members", icon: "👥", label: "Kelola Anggota" },
    { to: "/admin/news", icon: "📰", label: "Kelola Berita" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: "🏆", label: "Total Event", value: stats.events, color: "bg-blue-50 text-blue-800" },
          { icon: "👥", label: "Total Anggota", value: stats.members, color: "bg-green-50 text-green-800" },
          { icon: "📋", label: "Total Pendaftaran", value: stats.registrations, color: "bg-yellow-50 text-yellow-800" },
          { icon: "📰", label: "Total Berita", value: stats.news, color: "bg-purple-50 text-purple-800" },
        ].map((s) => (
          <div key={s.label} className={`card ${s.color}`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {adminLinks.map((l) => (
          <Link key={l.to} to={l.to} className="card hover:shadow-md transition-shadow flex items-center gap-4">
            <span className="text-3xl">{l.icon}</span>
            <span className="font-semibold">{l.label}</span>
            <span className="ml-auto text-gray-400">→</span>
          </Link>
        ))}
      </div>

      {/* Recent events */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Event Terbaru</h2>
          <Link to="/admin/events" className="text-blue-600 text-sm hover:underline">Kelola semua</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">Nama Event</th>
                <th className="pb-2 pr-4">Tanggal</th>
                <th className="pb-2 pr-4">Peserta</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{e.title}</td>
                  <td className="py-2 pr-4 text-gray-500">{new Date(e.startDate).toLocaleDateString("id-ID")}</td>
                  <td className="py-2 pr-4">{e._count?.registrations}/{e.maxParticipants}</td>
                  <td className="py-2">
                    <span className={`badge ${e.status === "upcoming" ? "bg-green-100 text-green-800" : e.status === "ongoing" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                      {e.status === "upcoming" ? "Akan Datang" : e.status === "ongoing" ? "Berlangsung" : "Selesai"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
