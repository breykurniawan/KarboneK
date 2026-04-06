import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Beranda" },
    { to: "/events", label: "Event" },
    { to: "/members", label: "Anggota" },
    { to: "/news", label: "Berita" },
  ];

  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🏓</span>
            <span>Club TM Garuda</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  isActive ? "text-yellow-400 font-semibold" : "hover:text-yellow-300 transition-colors"
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="text-sm hover:text-yellow-300">
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-sm transition-colors">
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-yellow-300 text-sm transition-colors">Masuk</Link>
                <Link to="/register" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors">
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white"></div>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded ${isActive ? "bg-blue-700 text-yellow-400" : "hover:bg-blue-800"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                {user.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="block py-2 px-3 text-yellow-400">Admin Panel</Link>}
                <Link to="/profile" onClick={() => setOpen(false)} className="block py-2 px-3 hover:bg-blue-800 rounded">Profil</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="block w-full text-left py-2 px-3 text-red-400 hover:bg-blue-800 rounded">Keluar</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block py-2 px-3 hover:bg-blue-800 rounded">Masuk</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block py-2 px-3 bg-yellow-500 text-blue-900 font-semibold rounded">Daftar</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
