import { useState, useEffect } from "react";
import { fetchUsers, updateUser } from "../../services/userServices";
import './Usuarios.css';

function Usuarios() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleAdminChange = async (id, currentUser) => {
    try {
      const updatedUser = {
        name: currentUser.name,
        email: currentUser.email,
        userType: currentUser.userType === 1 ? 0 : 1,
      };

      await updateUser(id, updatedUser);

      await loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="cuentos-page">
      <h1>Gestión de Usuarios</h1>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombres</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {users.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.userType === 1 ? "Administrador" : "Usuario"}</td>
              <td>
                <button
                  className={`status-btn ${
                    row?.userType === 1 ? "admin" : "no-admin"
                  }`}
                  onClick={() => handleAdminChange(row.id, row)}
                >
                  {row?.userType === 1 ? "Remover" : "Asignar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Usuarios;
