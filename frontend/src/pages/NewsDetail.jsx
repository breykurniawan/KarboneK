import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/news/${id}`).then((r) => { setNews(r.data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Memuat...</div>;
  if (!news) return <div className="text-center py-20 text-gray-500">Berita tidak ditemukan</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/news" className="text-blue-600 hover:text-blue-800 text-sm mb-6 inline-block">← Kembali ke Berita</Link>
      <div className="card">
        <div className="text-sm text-gray-500 mb-3">
          {new Date(news.createdAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • {news.author}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{news.title}</h1>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{news.content}</div>
      </div>
    </div>
  );
}
