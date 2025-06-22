import { useEffect, useState } from "react";
import axios from "../../services/api";
import { UserFormModal } from "../../components/users/UserFormModal";

interface User {
  user_id: number;
  member_id: number | null;
  username: string;
  role_id: number;
  two_factor_enabled: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Erro ao buscar utilizadores:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openNewModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Utilizadores</h2>
        <button
          onClick={openNewModal}
          className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
        >
          Novo Utilizador
        </button>
      </div>

      <table className="w-full text-sm border border-blue-800 bg-blue-950 rounded shadow">
        <thead className="bg-blue-900">
          <tr>
            <th className="p-2 text-left">Username</th>
            <th className="p-2 text-left">Membro</th>
            <th className="p-2 text-left">Perfil</th>
            <th className="p-2 text-center">2FA</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id} className="border-t border-blue-800">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.member_id ?? "—"}</td>
              <td className="p-2">{u.role_id}</td>
              <td className="p-2 text-center">{u.two_factor_enabled ? "✅" : "❌"}</td>
              <td className="p-2 text-center">
                <button onClick={() => openEditModal(u)} className="text-blue-400 hover:text-blue-600">Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

     <UserFormModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  initialData={selectedUser}
  onSubmit={fetchUsers}
  mode={selectedUser ? "edit" : "create"}
/>


    </div>
  );
}
