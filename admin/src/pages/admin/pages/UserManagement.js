import React, { useState, useEffect } from "react";
import UserService from "../../../services/user.service";
import { useNavigate } from "react-router-dom";
import { EditIcon, TrashIcon, PlusIcon } from "lucide-react";
import { toast } from "react-toastify";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ role: "user", isBan: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);

  const navigate = useNavigate(); // Hook để điều hướng

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const response = await UserService.getAllUsers();
      if (response.success) {
        setUsers(response.users);
      } else {
        setError(response.message);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleOpenEditModal = (user) => {
    setEditData(user);
    setFormData({
      role: user.role,
      isBan: user.isBan,
    });
    setModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editData || !editData._id) {
      toast.error("Không tìm thấy ID user để cập nhật");
      return;
    }

    const updatedUser = {
      role: formData.role,
      isBan: formData.isBan,
    };

    const result = await UserService.updateUser(editData._id, updatedUser);

    if (result.success) {
      toast.success("Cập nhật user thành công!");
      console.log("Cập nhật user thành công:", result.user);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === editData._id ? { ...user, ...updatedUser } : user))
      );
    } else {
      toast.error(`Cập nhật user thất bại: ${result.message}`);
      console.error("Cập nhật user thất bại:", result.message);
    }

    setModalOpen(false);
  };

  const handleDeleteUser = (_id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== _id));
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-grow p-6 bg-gray-100 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-gray-500">User Name</th>
                <th className="p-4 text-left text-gray-500">Phone</th>
                <th className="p-4 text-left text-gray-500">Email</th>
                <th className="p-4 text-left text-gray-500">Role</th>
                <th className="p-4 text-left text-gray-500">Status</th>
                <th className="p-4 text-left text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-left cursor-pointer">{user.username}</td>
                  <td className="p-4 text-left">{user.phone}</td>
                  <td className="p-4 text-left">{user.email}</td>
                  <td className="p-4 text-left">{user.role}</td>

                  <td className="p-4 text-left">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        user.isBan ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      }`}
                    >
                      {user.isBan ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="p-4 flex space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="text-green-500 hover:bg-green-100 p-2 rounded-full"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal chỉnh sửa */}
          {modalOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Edit User</h2>
                <label className="block mb-2">Role:</label>
                <select
                  className="w-full border p-2 mb-4 rounded"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="nutritionist">Nutritionist</option>
                </select>
                <label className="block mb-2">Status:</label>
                <select
                  className="w-full border p-2 mb-4 rounded"
                  value={formData.isBan ? "inactive" : "active"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isBan: e.target.value === "inactive",
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleSaveChanges}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select
                className="border rounded px-2 py-1"
                onChange={(e) => setUsersPerPage(Number(e.target.value))}
              >
                <option value="5">5 Users</option>
                <option value="10">10 Users</option>
                <option value="15">15 Users</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                className="border rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? "bg-green-500 text-white" : "border hover:bg-gray-100"
                  }`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="border rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(users.length / usersPerPage)}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
