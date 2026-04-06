import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminMembers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);

  const fetchUsers = () => api.get("/members/all").then((r) => setUsers(r.data));
  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/members/${id}/role`, { role });
      toast.success("Role diperbarui");
      fetchUsers();
    } catch {
      toast.error("Gagal memperbarui role");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus user ini?")) return;
    try {
      await api.delete(`/members/${id}`);
      toast.success("User dihapus");
      fetchUsers();
    } catch {
      toast.error("Gagal menghapus user");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Kelola Anggota</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">Nama</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Telepon</th>
              <th className="pb-3 pr-4">Role</th>
              <th className="pb-3 pr-4">Bergabung</th>
              <th className="pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium">{u.name}</td>
                <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                <td className="py-3 pr-4 text-gray-500">{u.phone || "-"}</td>
                <td className="py-3 pr-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === currentUser?.id}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-3 pr-4 text-gray-500">{new Date(u.joinedAt).toLocaleDateString("id-ID")}</td>
                <td className="py-3">
                  {u.id !== currentUser?.id && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
