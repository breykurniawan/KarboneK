import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const roundNames = (round, total) => {
  const fromEnd = total - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semi Final";
  if (fromEnd === 2) return "Perempat Final";
  if (fromEnd === 3) return "16 Besar";
  return `Babak ${round}`;
};

const statusColor = {
  pending: "border-gray-200 bg-white",
  ongoing: "border-blue-400 bg-blue-50",
  completed: "border-green-400 bg-white",
  bye: "border-gray-100 bg-gray-50",
};

function MatchCard({ match, onScoreUpdate, isAdmin }) {
  const [editing, setEditing] = useState(false);
  const [scores, setScores] = useState({ p1: match.player1Score ?? "", p2: match.player2Score ?? "", winner: match.winnerId ?? "" });

  const p1 = match.player1;
  const p2 = match.player2;
  const winner = match.winner;
  const isBye = match.status === "bye";
  const isCompleted = match.status === "completed";

  const handleSave = async () => {
    if (!scores.winner) return toast.error("Pilih pemenang");
    try {
      await onScoreUpdate(match.id, { player1Score: scores.p1, player2Score: scores.p2, winnerId: Number(scores.winner) });
      setEditing(false);
      toast.success("Skor disimpan");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan skor");
    }
  };

  return (
    <div className={`border-2 rounded-xl p-3 w-52 shrink-0 transition-all ${statusColor[match.status]}`}>
      <div className="text-xs text-gray-400 mb-2 font-medium">Match #{match.matchNumber}</div>

      {/* Player 1 */}
      <div className={`flex items-center justify-between rounded-lg px-2 py-1.5 mb-1 text-sm
        ${winner?.id === p1?.id ? "bg-green-100 font-bold text-green-800" : "bg-gray-50"}`}>
        <span className="truncate max-w-[120px]">
          {p1 ? (
            <>
              {p1.name}
              {p1.type === "non_member" && <span className="ml-1 text-xs text-orange-500">(U)</span>}
            </>
          ) : <span className="text-gray-300 italic">BYE</span>}
        </span>
        {isCompleted && <span className="text-xs font-bold ml-1">{match.player1Score ?? "-"}</span>}
      </div>

      {/* Player 2 */}
      <div className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm
        ${winner?.id === p2?.id ? "bg-green-100 font-bold text-green-800" : "bg-gray-50"}`}>
        <span className="truncate max-w-[120px]">
          {p2 ? (
            <>
              {p2.name}
              {p2.type === "non_member" && <span className="ml-1 text-xs text-orange-500">(U)</span>}
            </>
          ) : <span className="text-gray-300 italic">BYE</span>}
        </span>
        {isCompleted && <span className="text-xs font-bold ml-1">{match.player2Score ?? "-"}</span>}
      </div>

      {/* Status */}
      {isBye && <div className="text-xs text-gray-400 mt-2 text-center">BYE — Lolos otomatis</div>}
      {isCompleted && winner && (
        <div className="text-xs text-green-700 mt-2 text-center font-medium">🏆 {winner.name}</div>
      )}

      {/* Admin: input skor */}
      {isAdmin && !isBye && !isCompleted && p1 && p2 && (
        <div className="mt-2">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1 transition-colors">
              Input Skor
            </button>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 w-16 truncate">{p1.name.split(" ")[0]}</span>
                <input type="number" min={0} className="w-12 border rounded px-1 py-0.5 text-xs text-center"
                  value={scores.p1} onChange={(e) => setScores({ ...scores, p1: e.target.value })} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 w-16 truncate">{p2.name.split(" ")[0]}</span>
                <input type="number" min={0} className="w-12 border rounded px-1 py-0.5 text-xs text-center"
                  value={scores.p2} onChange={(e) => setScores({ ...scores, p2: e.target.value })} />
              </div>
              <select className="w-full text-xs border rounded px-1 py-0.5"
                value={scores.winner} onChange={(e) => setScores({ ...scores, winner: e.target.value })}>
                <option value="">-- Pemenang --</option>
                <option value={p1.id}>{p1.name}</option>
                <option value={p2.id}>{p2.name}</option>
              </select>
              <div className="flex gap-1">
                <button onClick={handleSave} className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded py-1">Simpan</button>
                <button onClick={() => setEditing(false)} className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 rounded py-1">Batal</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin: edit skor yang sudah ada */}
      {isAdmin && isCompleted && (
        <button onClick={() => setEditing(!editing)} className="w-full text-xs text-gray-400 hover:text-gray-600 mt-1">
          {editing ? "Tutup" : "Edit skor"}
        </button>
      )}
      {isAdmin && isCompleted && editing && (
        <div className="space-y-1.5 mt-1">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 w-16 truncate">{p1?.name.split(" ")[0]}</span>
            <input type="number" min={0} className="w-12 border rounded px-1 py-0.5 text-xs text-center"
              value={scores.p1} onChange={(e) => setScores({ ...scores, p1: e.target.value })} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 w-16 truncate">{p2?.name.split(" ")[0]}</span>
            <input type="number" min={0} className="w-12 border rounded px-1 py-0.5 text-xs text-center"
              value={scores.p2} onChange={(e) => setScores({ ...scores, p2: e.target.value })} />
          </div>
          <select className="w-full text-xs border rounded px-1 py-0.5"
            value={scores.winner} onChange={(e) => setScores({ ...scores, winner: e.target.value })}>
            <option value="">-- Pemenang --</option>
            {p1 && <option value={p1.id}>{p1.name}</option>}
            {p2 && <option value={p2.id}>{p2.name}</option>}
          </select>
          <button onClick={handleSave} className="w-full text-xs bg-green-600 hover:bg-green-700 text-white rounded py-1">Update</button>
        </div>
      )}
    </div>
  );
}

export default function Bracket() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [event, setEvent] = useState(null);
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchBracket = async () => {
    try {
      const [evRes, brRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/bracket/${id}`),
      ]);
      setEvent(evRes.data);
      setBracket(brRes.data);
    } catch (err) {
      toast.error("Gagal memuat data bracket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBracket(); }, [id]);

  const handleGenerate = async () => {
    if (!confirm("Generate bracket baru? Bracket lama akan dihapus.")) return;
    setGenerating(true);
    try {
      const { data } = await api.post(`/bracket/${id}/generate`);
      toast.success(`Bracket dibuat: ${data.participants} peserta, ${data.totalRounds} babak, ${data.byes} BYE`);
      await fetchBracket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal generate bracket");
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset bracket? Semua data pertandingan akan dihapus.")) return;
    try {
      await api.delete(`/bracket/${id}`);
      toast.success("Bracket direset");
      await fetchBracket();
    } catch (err) {
      toast.error("Gagal reset bracket");
    }
  };

  const handleScoreUpdate = async (matchId, data) => {
    await api.put(`/bracket/${id}/match/${matchId}`, data);
    await fetchBracket();
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Memuat bracket...</div>;

  const regCount = event?._count?.registrations ?? 0;
  const levelLabel = { open: "Terbuka", beginner: "Pemula", intermediate: "Menengah", advanced: "Lanjutan" };

  return (
    <div className="max-w-full px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <Link to={`/events/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">← Kembali ke Event</Link>
            <h1 className="text-2xl font-bold text-gray-900">{event?.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span>🏆 Sistem Gugur</span>
              <span>•</span>
              <span>Level: {levelLabel[event?.level]}</span>
              <span>•</span>
              <span>👥 {regCount} peserta terdaftar</span>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={handleGenerate} disabled={generating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                {generating ? "Generating..." : bracket?.generated ? "🔄 Generate Ulang" : "⚡ Generate Bracket"}
              </button>
              {bracket?.generated && (
                <button onClick={handleReset} className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2 border-gray-200 bg-white"></div> Menunggu</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2 border-green-400 bg-white"></div> Selesai</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2 border-gray-100 bg-gray-50"></div> BYE</div>
          <div className="flex items-center gap-1.5"><span className="text-orange-500 font-bold">(U)</span> Non-Anggota (Umum)</div>
          {event?.level === "intermediate" && (
            <div className="flex items-center gap-1.5 text-blue-600">ℹ️ Anggota club mendapat seeding prioritas di level Menengah</div>
          )}
        </div>

        {/* Bracket */}
        {!bracket?.generated ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏓</div>
            <p className="text-gray-500 text-lg mb-2">Bracket belum dibuat</p>
            <p className="text-gray-400 text-sm mb-6">
              {regCount < 2
                ? "Minimal 2 peserta terdaftar untuk membuat bracket"
                : `${regCount} peserta siap — klik "Generate Bracket" untuk membuat jadwal`}
            </p>
            {isAdmin && regCount >= 2 && (
              <button onClick={handleGenerate} disabled={generating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                {generating ? "Generating..." : "⚡ Generate Bracket Sekarang"}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto pb-6">
            <div className="flex gap-8 min-w-max items-start">
              {Array.from({ length: bracket.totalRounds }, (_, i) => i + 1).map((round) => {
                const roundMatches = bracket.rounds[round] || [];
                const roundName = roundNames(round, bracket.totalRounds);
                // Tinggi tiap match card + gap, disesuaikan per babak
                const matchHeight = 160; // px per match card
                const gapMultiplier = Math.pow(2, round - 1);

                return (
                  <div key={round} className="flex flex-col">
                    {/* Round header */}
                    <div className="text-center mb-4">
                      <span className="bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {roundName}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">{roundMatches.length} pertandingan</div>
                    </div>

                    {/* Matches */}
                    <div className="flex flex-col" style={{ gap: `${(gapMultiplier - 1) * matchHeight + (gapMultiplier > 1 ? 16 : 0)}px` }}>
                      {roundMatches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          onScoreUpdate={handleScoreUpdate}
                          isAdmin={isAdmin}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Juara */}
              {bracket.totalRounds > 0 && (() => {
                const finalRound = bracket.rounds[bracket.totalRounds];
                const finalMatch = finalRound?.[0];
                const champion = finalMatch?.winner;
                return (
                  <div className="flex flex-col items-center justify-start pt-10">
                    <div className="text-center mb-4">
                      <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">🏆 Juara</span>
                    </div>
                    <div className="w-52 border-2 border-yellow-400 bg-yellow-50 rounded-xl p-4 text-center">
                      {champion ? (
                        <>
                          <div className="text-3xl mb-2">🥇</div>
                          <div className="font-bold text-yellow-800">{champion.name}</div>
                          {champion.type === "non_member" && <div className="text-xs text-orange-500 mt-1">Non-Anggota</div>}
                        </>
                      ) : (
                        <>
                          <div className="text-3xl mb-2">🏆</div>
                          <div className="text-gray-400 text-sm">Menunggu hasil final</div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Daftar peserta */}
        {event?.registrations?.length > 0 && (
          <div className="mt-10 max-w-2xl">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Daftar Peserta ({regCount})</h2>
            <div className="card">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.registrations.map((reg, i) => (
                  <div key={reg.id} className="flex items-center gap-3 py-2 border-b last:border-0 sm:last:border-0">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {reg.participantType === "non_member" ? reg.guestName : reg.user?.name}
                      </div>
                    </div>
                    {reg.participantType === "non_member" && (
                      <span className="badge bg-orange-100 text-orange-700 shrink-0">Umum</span>
                    )}
                    <span className={`badge shrink-0 ${reg.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {reg.status === "confirmed" ? "✓" : "⏳"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
