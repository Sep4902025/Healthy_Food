import React, { useState, useEffect } from "react";
import UserService from "../../../services/user.service";
import { EditIcon, TrashIcon, SearchIcon } from "lucide-react";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading";

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
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("users");
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await UserService.getAllUsers(currentPage, usersPerPage);
        if (userResponse.success) {
          setUsers(userResponse.users || []);
          setFilteredUsers(userResponse.users || []);
          setTotalPages(userResponse.totalPages || 1);
          setTotalItems(userResponse.total || 0);
        } else {
          setError(userResponse.message);
          setUsers([]);
          setFilteredUsers([]);
          setTotalPages(1);
          setTotalItems(0);
        }
        const pendingResponse = await UserService.getPendingNutritionists();
        if (pendingResponse.success) {
          setPendingNutritionists(pendingResponse.users || []);
        } else {
          setPendingNutritionists([]);
        }
      } catch (err) {
        setError("Lỗi không xác định khi tải dữ liệu");
        setUsers([]);
        setFilteredUsers([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
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
    setTotalItems(result.length);
    setTotalPages(Math.ceil(result.length / usersPerPage) || 1);
  }, [searchTerm, roleFilter, users, usersPerPage]);

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

  const handleDeleteUser = async (_id) => {
    const result = await UserService.deleteUser(_id);
    if (result.success) {
      toast.success("Xóa user thành công!");
      setUsers((prev) => prev.filter((u) => u._id !== _id));
      setFilteredUsers((prev) => prev.filter((u) => u._id !== _id));
    } else {
      toast.error(`Xóa user thất bại: ${result.message}`);
    }
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

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    if (selectedPage >= 1 && selectedPage <= totalPages) {
      setCurrentPage(selectedPage);
    }
  };

  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg font-semibold">Error: {error}</p>
      </div>
    );

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          User Management
        </h1>
      </div>

      {/* Tabs and Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex gap-3">
          <button
            className={`px-6 py-2 rounded-md font-semibold ${
              activeTab === "users"
                ? "bg-[#40B491] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-200`}
            onClick={() => setActiveTab("users")}
          >
            All Users
          </button>
          <button
            className={`px-6 py-2 rounded-md font-semibold ${
              activeTab === "pending"
                ? "bg-[#40B491] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-200`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Nutritionists
          </button>
        </div>
        {activeTab === "users" && (
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by username, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              />
              <SearchIcon
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="nutritionist">Nutritionist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
      </div>

      {/* Data Container */}
      <Loading isLoading={loading}>
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {activeTab === "users" ? (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
                <div className="col-span-2">User Name</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-2 text-center">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers
                    .slice(
                      (currentPage - 1) * usersPerPage,
                      currentPage * usersPerPage
                    )
                    .map((user) => (
                      <div
                        key={user._id}
                        className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition duration-200 items-center"
                      >
                        <div className="col-span-2 text-gray-700 text-sm line-clamp-1">
                          {user.username}
                        </div>
                        <div className="col-span-2 text-gray-700 text-sm line-clamp-1">
                          {user.userPreferenceId?.phoneNumber || "N/A"}
                        </div>
                        <div className="col-span-3 text-gray-700 text-sm line-clamp-1">
                          {user.email}
                        </div>
                        <div className="col-span-2 text-gray-700 text-sm line-clamp-1">
                          {user.role}
                        </div>
                        <div className="col-span-1 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.isBan
                                ? "bg-gray-200 text-gray-700"
                                : "bg-[#40B491] text-white"
                            }`}
                          >
                            {user.isBan ? "Inactive" : "Active"}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-center space-x-3">
                          <button
                            className="p-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                            onClick={() => handleOpenEditModal(user)}
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No users available.
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="p-4 bg-gray-50">
                <Pagination
                  limit={usersPerPage}
                  setLimit={setUsersPerPage}
                  totalItems={totalItems}
                  handlePageClick={handlePageClick}
                  text={"Users"}
                />
              </div>
            </>
          ) : (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4 text-[#40B491]">
                Pending Nutritionist Applications
              </h2>
              {pendingNutritionists.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No pending applications.
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
                    <div className="col-span-3">Username</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-3">Submitted At</div>
                    <div className="col-span-3 text-center">Actions</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {pendingNutritionists.map((user) => (
                      <div
                        key={user._id}
                        className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition duration-200 items-center"
                      >
                        <div className="col-span-3 text-gray-700 text-sm line-clamp-1">
                          {user.username}
                        </div>
                        <div className="col-span-3 text-gray-700 text-sm line-clamp-1">
                          {user.email}
                        </div>
                        <div className="col-span-3 text-gray-700 text-sm line-clamp-1">
                          {new Date(
                            user.nutritionistApplication.submittedAt
                          ).toLocaleDateString()}
                        </div>
                        <div className="col-span-3 flex justify-center">
                          <button
                            className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition duration-200"
                            onClick={() => setSelectedApplication(user)}
                          >
                            View CV
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Loading>

      {/* Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold text-[#40B491] mb-6">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  className="w-full border rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="nutritionist">Nutritionist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full border rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
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
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                onClick={handleSaveChanges}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nutritionist Application Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl shadow-xl">
            <h2 className="text-2xl font-bold text-[#40B491] mb-6">
              Nutritionist Application
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 flex flex-col">
                <div className="mb-4">
                  {selectedApplication.nutritionistApplication.profileImage ? (
                    <img
                      src={selectedApplication.nutritionistApplication.profileImage}
                      alt="Profile"
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/150")
                      }
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No Image Provided</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p>
                    <strong>Full Name:</strong>{" "}
                    {selectedApplication.nutritionistApplication.personalInfo.fullName || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedApplication.nutritionistApplication.personalInfo.phoneNumber || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {selectedApplication.nutritionistApplication.personalInfo.address || "N/A"}
                  </p>
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <h3 className="text-lg font-semibold mb-2 text-[#40B491]">
                  Introduction
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedApplication.nutritionistApplication.introduction || "No introduction provided."}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                onClick={() => handleReviewApplication(selectedApplication._id, "approve")}
              >
                Approve
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                onClick={() => handleReviewApplication(selectedApplication._id, "reject")}
              >
                Reject
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;