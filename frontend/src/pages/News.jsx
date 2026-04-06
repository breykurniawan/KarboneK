import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/news").then((r) => { setNews(r.data); setLoading(false); });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Berita & Pengumuman</h1>
      <p className="text-gray-600 mb-8">Informasi terbaru dari Club Tenis Meja Garuda.</p>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Memuat berita...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((n) => (
            <Link key={n.id} to={`/news/${n.id}`} className="card hover:shadow-md transition-shadow block">
              <div className="text-xs text-gray-500 mb-2">
                {new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • {n.author}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{n.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-4">{n.content}</p>
              <div className="mt-4 text-blue-600 text-sm font-medium">Baca selengkapnya →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
