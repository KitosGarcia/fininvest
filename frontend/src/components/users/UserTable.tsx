import { useEffect, useState } from "react";
import api from "../../services/api";
import UserFormModal from "./UserFormModal";

interface Role { role_id: number; role_name: string }
interface User {
  user_id: number; username: string; role_name: string;
  last_login: string | null; is_active?: boolean;
}

export default function UserTable() {
  const [users, setUsers]   = useState<User[]>([]);
  const [roles, setRoles]   = useState<Role[]>([]);
  const [modal, setModal]   = useState(false);
  const [selUser, setSelUser] = useState<any>(null);

  const load = async () => {
    const [u, r] = await Promise.all([api.get("/users"), api.get("/roles")]);
    setUsers(u.data); setRoles(r.data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="text-white">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Utilizadores</h2>
        <button onClick={() => { setSelUser(null); setModal(true); }}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded">Novo Utilizador</button>
      </div>

      <table className="w-full text-sm bg-blue-950 border border-blue-800 rounded">
        <thead className="bg-blue-900"><tr>
          <th className="p-2 text-left">Username</th>
          <th className="p-2 text-left">Perfil</th>
          <th className="p-2 text-left">Último login</th>
          <th className="p-2 text-center">Ações</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.user_id} className="border-t border-blue-800">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.role_name}</td>
              <td className="p-2">{u.last_login ? new Date(u.last_login).toLocaleString() : "—"}</td>
              <td className="p-2 text-center">
                <button className="text-blue-400 mr-2" onClick={() => { setSelUser(u); setModal(true); }}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <UserFormModal
        isOpen={modal}
        user={selUser}
        roles={roles}
        onClose={() => setModal(false)}
        onSuccess={load}
      />
    </div>
  );
}
