import React, { useState, useEffect } from "react";
import UserService from "../../../services/user.service";
import { EditIcon, TrashIcon, SearchIcon } from "lucide-react";
import { toast } from "react-toastify";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [pendingNutritionists, setPendingNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ role: "user", isBan: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("users");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userResponse = await UserService.getAllUsers(
        currentPage,
        usersPerPage
      );
      if (userResponse.success) {
        setUsers(userResponse.users);
        setFilteredUsers(userResponse.users);
        setTotalPages(userResponse.totalPages);
      } else {
        setError(userResponse.message);
      }
      const pendingResponse = await UserService.getPendingNutritionists();
      if (pendingResponse.success) {
        setPendingNutritionists(pendingResponse.users || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [currentPage, usersPerPage]);

  useEffect(() => {
    let result = [...users];
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userPreferenceId?.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }
    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, users]);

  const handleOpenEditModal = (user) => {
    setEditData(user);
    setFormData({ role: user.role, isBan: user.isBan });
    setModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editData || !editData._id) {
      toast.error("Không tìm thấy ID user để cập nhật");
      return;
    }
    const updatedUser = { role: formData.role, isBan: formData.isBan };
    const result = await UserService.updateUser(editData._id, updatedUser);
    if (result.success) {
      toast.success("Cập nhật user thành công!");
      setUsers((prev) =>
        prev.map((u) => (u._id === editData._id ? { ...u, ...updatedUser } : u))
      );
      setFilteredUsers((prev) =>
        prev.map((u) => (u._id === editData._id ? { ...u, ...updatedUser } : u))
      );
    } else {
      toast.error(`Cập nhật user thất bại: ${result.message}`);
    }
    setModalOpen(false);
  };

  const handleDeleteUser = (_id) => {
    setUsers((prev) => prev.filter((u) => u._id !== _id));
    setFilteredUsers((prev) => prev.filter((u) => u._id !== _id));
  };

  const handleReviewApplication = async (userId, action) => {
    const result = await UserService.reviewNutritionistApplication({
      userId,
      action,
    });
    if (result.success) {
      toast.success(`Application ${action}d successfully!`);
      setPendingNutritionists((prev) => prev.filter((u) => u._id !== userId));
      if (action === "approve") {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, role: "nutritionist" } : u
          )
        );
        setFilteredUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, role: "nutritionist" } : u
          )
        );
      } else if (action === "reject") {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, nutritionistApplication: null } : u
          )
        );
        setFilteredUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, nutritionistApplication: null } : u
          )
        );
      }
    } else {
      toast.error(result.message);
    }
    setSelectedApplication(null);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex h-screen">
      <div className="flex-grow p-6 bg-gray-100 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by username, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <SearchIcon
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="nutritionist">Nutritionist</option>
          </select>
        </div>

        <div className="mb-6">
          <button
            className={`px-4 py-2 mr-2 ${
              activeTab === "users" ? "bg-green-500 text-white" : "bg-gray-200"
            } rounded`}
            onClick={() => setActiveTab("users")}
          >
            All Users
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "pending"
                ? "bg-green-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Nutritionists
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {activeTab === "users" ? (
            <>
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
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-left cursor-pointer">
                        {user.username}
                      </td>
                      <td className="p-4 text-left">
                        {user.userPreferenceId?.phoneNumber || "N/A"}
                      </td>
                      <td className="p-4 text-left">{user.email}</td>
                      <td className="p-4 text-left">{user.role}</td>
                      <td className="p-4 text-left">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            user.isBan
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
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

              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <select
                    className="border rounded px-2 py-1"
                    value={usersPerPage}
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
                    {"<"}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded ${
                        currentPage === i + 1
                          ? "bg-green-500 text-white"
                          : "border hover:bg-gray-100"
                      }`}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="border rounded px-3 py-1 hover:bg-gray-100"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {">"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">
                Pending Nutritionist Applications
              </h2>
              {pendingNutritionists.length === 0 ? (
                <p>No pending applications</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-left text-gray-500">Username</th>
                      <th className="p-4 text-left text-gray-500">Email</th>
                      <th className="p-4 text-left text-gray-500">
                        Submitted At
                      </th>
                      <th className="p-4 text-left text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingNutritionists.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{user.username}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">
                          {new Date(
                            user.nutritionistApplication.submittedAt
                          ).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => setSelectedApplication(user)}
                          >
                            View CV
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedApplication && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                    <h2 className="text-2xl font-bold mb-6">
                      Nutritionist Application
                    </h2>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3 flex flex-col">
                        <div className="mb-4">
                          {selectedApplication.nutritionistApplication
                            .profileImage ? (
                            <img
                              src={
                                selectedApplication.nutritionistApplication
                                  .profileImage
                              }
                              alt="Profile"
                              className="w-full h-64 object-cover rounded-lg shadow-md"
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/150")
                              }
                            />
                          ) : (
                            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500">
                                No Image Provided
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p>
                            <strong>Full Name:</strong>{" "}
                            {selectedApplication.nutritionistApplication
                              .personalInfo.fullName || "N/A"}
                          </p>
                          <p>
                            <strong>Phone:</strong>{" "}
                            {selectedApplication.nutritionistApplication
                              .personalInfo.phoneNumber || "N/A"}
                          </p>
                          <p>
                            <strong>Address:</strong>{" "}
                            {selectedApplication.nutritionistApplication
                              .personalInfo.address || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="w-full md:w-2/3">
                        <h3 className="text-lg font-semibold mb-2">
                          Introduction
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedApplication.nutritionistApplication
                            .introduction || "No introduction provided."}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() =>
                          handleReviewApplication(
                            selectedApplication._id,
                            "approve"
                          )
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() =>
                          handleReviewApplication(
                            selectedApplication._id,
                            "reject"
                          )
                        }
                      >
                        Reject
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        onClick={() => setSelectedApplication(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
