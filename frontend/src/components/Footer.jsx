import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl mb-3">
            <span className="text-2xl">🏓</span>
            <span>Club TM Garuda</span>
          </div>
          <p className="text-blue-200 text-sm">
            Club Tenis Meja Garuda berdiri sejak 2010, berkomitmen mengembangkan atlet tenis meja berprestasi.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-yellow-400">Navigasi</h4>
          <ul className="space-y-2 text-sm text-blue-200">
            <li><Link to="/" className="hover:text-white">Beranda</Link></li>
            <li><Link to="/events" className="hover:text-white">Event & Turnamen</Link></li>
            <li><Link to="/members" className="hover:text-white">Anggota</Link></li>
            <li><Link to="/news" className="hover:text-white">Berita</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-yellow-400">Kontak</h4>
          <ul className="space-y-2 text-sm text-blue-200">
            <li>📍 Jl. Olahraga No. 10, Jakarta</li>
            <li>📞 (021) 1234-5678</li>
            <li>✉️ info@clubtmgaruda.id</li>
            <li>🕐 Latihan: Selasa, Kamis 18.00 | Sabtu 08.00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blue-800 text-center py-4 text-sm text-blue-300">
        © 2026 Club Tenis Meja Garuda. All rights reserved.
      </div>
    </footer>
  );
}
