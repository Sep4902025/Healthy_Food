import React, { useState, useEffect, useMemo } from "react";
import UserService from "../../../services/user.service";
import { EditIcon, TrashIcon, SearchIcon } from "lucide-react";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("users");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Debounce search term (300ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch data when pagination changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await UserService.getAllUsers(
          currentPage,
          usersPerPage
        );
        console.log("API Response for page", currentPage, ":", userResponse);

        if (userResponse.success) {
          setUsers(userResponse.users || []);
          setTotalItems(userResponse.total || 0);
          setTotalPages(userResponse.totalPages || 1);
        } else {
          setUsers([]);
          setError(userResponse.message);
        }

        const pendingResponse = await UserService.getPendingNutritionists();
        if (pendingResponse.success) {
          setPendingNutritionists(pendingResponse.users || []);
        } else {
          setPendingNutritionists([]);
        }
      } catch (error) {
        setUsers([]);
        setPendingNutritionists([]);
        setError("An error occurred while loading data: " + error.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [currentPage, usersPerPage]);

  // Apply client-side filtering when searchTerm or roleFilter changes
  useEffect(() => {
    let filtered = [...users];
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.email
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.userPreferenceId?.phoneNumber
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      );
    }
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }
    setFilteredUsers(filtered);
    console.log("Filtered users:", filtered);
  }, [users, debouncedSearchTerm, roleFilter]);

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
      toast.success("Update User successfully!");
      setUsers((prev) =>
        prev.map((u) => (u._id === editData._id ? { ...u, ...updatedUser } : u))
      );
      // Update filteredUsers to reflect the change
      setFilteredUsers((prev) =>
        prev.map((u) => (u._id === editData._id ? { ...u, ...updatedUser } : u))
      );
    } else {
      toast.error(`Cập nhật user thất bại: ${result.message}`);
    }
    setModalOpen(false);
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((u) => u._id === userId);
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (
      !userToDelete ||
      !userToDelete._id ||
      typeof userToDelete._id !== "string"
    ) {
      toast.error("ID người dùng không hợp lệ.");
      setDeleteModalOpen(false);
      setUserToDelete(null);
      return;
    }

    console.log("Deleting user with ID:", userToDelete._id);
    const result = await UserService.deleteUser(userToDelete._id);
    if (result.success) {
      toast.success("Delete User successfully!");
      const userResponse = await UserService.getAllUsers(
        currentPage,
        usersPerPage
      );
      if (userResponse.success) {
        setUsers(userResponse.users || []);
        setTotalItems(userResponse.total || 0);
        setTotalPages(userResponse.totalPages || 1);
        if (userResponse.users.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } else {
      toast.error(
        result.message === "No user found with that ID"
          ? "Người dùng không tồn tại hoặc đã bị xóa trước đó."
          : `Xóa user thất bại: ${result.message}`
      );
    }
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleReviewApplication = async (userId, action) => {
    const result = await UserService.reviewNutritionistApplication({
      userId,
      action,
    });
    if (result.success) {
      toast.success(
        `Application ${action}d successfully! Email notification sent to user.`
      );
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
      }
    } else {
      toast.error(result.message);
    }
    setSelectedApplication(null);
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    console.log(
      "handlePageClick: selected =",
      data.selected,
      "new currentPage =",
      selectedPage
    );
    if (selectedPage >= 1 && selectedPage <= totalPages) {
      setCurrentPage(selectedPage);
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "User Management";
    workbook.created = new Date();

    // Fetch all users without pagination
    let allUsers = [];
    try {
      const userResponse = await UserService.getAllUsers(1, 1000); // Fetch up to 1000 users
      if (userResponse.success) {
        allUsers = userResponse.users || [];
      } else {
        console.error("Failed to fetch all users:", userResponse.message);
      }
    } catch (error) {
      console.error("Error fetching all users:", error.message);
    }

    // Apply search and role filters to all users
    let exportUsers = [...allUsers];
    if (searchTerm) {
      exportUsers = exportUsers.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userPreferenceId?.phoneNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== "all") {
      exportUsers = exportUsers.filter((user) => user.role === roleFilter);
    }

    // Sheet 1: All Users
    const userSheet = workbook.addWorksheet("All Users", {
      properties: { tabColor: { argb: "FF40B491" } },
    });

    userSheet.addRow(["User Management Report"]).font = {
      size: 16,
      bold: true,
    };
    userSheet.addRow([
      `Generated on: ${new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      })}`,
    ]);
    userSheet.addRow([]);
    userSheet.addRow(["All Users"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    userSheet.getCell("A4").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    userSheet.addRow([
      "No.",
      "Username",
      "Phone",
      "Email",
      "Role",
      "Status",
    ]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    ["A5", "B5", "C5", "D5", "E5", "F5"].forEach((cell) => {
      userSheet.getCell(cell).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF40B491" },
      };
    });

    exportUsers.forEach((user, index) => {
      userSheet.addRow([
        index + 1,
        user.username || "N/A",
        user.userPreferenceId?.phoneNumber || "N/A",
        user.email || "N/A",
        user.role || "N/A",
        user.isBan ? "Inactive" : "Active",
      ]);
    });

    userSheet.addRow(["Total Users", exportUsers.length]).font = { bold: true };

    userSheet.getRows(5, exportUsers.length + 2).forEach((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        if (cell.value && typeof cell.value === "number") {
          cell.numFmt = "#,##0";
        }
      });
    });

    userSheet.columns = [
      { key: "no", width: 10 },
      { key: "username", width: 20 },
      { key: "phone", width: 15 },
      { key: "email", width: 30 },
      { key: "role", width: 15 },
      { key: "status", width: 15 },
    ];

    // Sheet 2: Pending Nutritionist Applications
    const pendingSheet = workbook.addWorksheet("Pending Applications");
    pendingSheet.addRow(["Pending Nutritionist Applications"]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    pendingSheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF40B491" },
    };

    pendingSheet.addRow([
      "No.",
      "Username",
      "Email",
      "Submitted At",
      "Full Name",
      "Phone",
      "Address",
      "Introduction",
    ]).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    ["A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2"].forEach((cell) => {
      pendingSheet.getCell(cell).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF40B491" },
      };
    });

    pendingNutritionists.forEach((user, index) => {
      pendingSheet.addRow([
        index + 1,
        user.username || "N/A",
        user.email || "N/A",
        new Date(user.nutritionistApplication.submittedAt).toLocaleDateString(
          "en-US"
        ),
        user.nutritionistApplication.personalInfo.fullName || "N/A",
        user.nutritionistApplication.personalInfo.phoneNumber || "N/A",
        user.nutritionistApplication.personalInfo.address || "N/A",
        user.nutritionistApplication.introduction || "No introduction provided",
      ]);
    });

    pendingSheet.addRow([
      "Total Pending Applications",
      pendingNutritionists.length,
    ]).font = {
      bold: true,
    };

    pendingSheet.getRows(2, pendingNutritionists.length + 2).forEach((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        if (cell.value && typeof cell.value === "number") {
          cell.numFmt = "#,##0";
        }
      });
    });

    pendingSheet.columns = [
      { key: "no", width: 10 },
      { key: "username", width: 20 },
      { key: "email", width: 30 },
      { key: "submittedAt", width: 15 },
      { key: "fullName", width: 25 },
      { key: "phone", width: 15 },
      { key: "address", width: 30 },
      { key: "introduction", width: 40 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "User_Management_Report.xlsx");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-[#40B491] text-lg font-semibold">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg font-semibold">Error: {error}</p>
      </div>
    );

  console.log("Rendering table with filteredUsers:", filteredUsers);
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          User Management
        </h1>
        <button
          onClick={exportToExcel}
          className="bg-custom-green text-white px-4 py-2 rounded hover:bg-[#359c7a]"
        >
          Export to Excel
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by username, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40B491]"
          />
          <SearchIcon
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40B491]"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="nutritionist">Nutritionist</option>
        </select>
      </div>

      <div className="mb-6 flex gap-4">
        <button
          className={`px-6 py-2 rounded-full font-semibold transition duration-300 ${
            activeTab === "users"
              ? "bg-[#40B491] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("users")}
        >
          All Users
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold transition duration-300 ${
            activeTab === "pending"
              ? "bg-[#40B491] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Nutritionists
        </button>
      </div>

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
        {activeTab === "users" ? (
          <>
            <div className="grid grid-cols-12 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
              <div className="col-span-1">No.</div>
              <div className="col-span-2">Username</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-1">Role</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <div
                    key={user._id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-opacity duration-300 items-center"
                  >
                    <div className="col-span-1 text-gray-600 font-medium">
                      {(currentPage - 1) * usersPerPage + index + 1}
                    </div>
                    <div className="col-span-2 text-gray-700 text-sm">
                      {user.username}
                    </div>
                    <div className="col-span-2 text-gray-700 text-sm">
                      {user.userPreferenceId?.phoneNumber || "N/A"}
                    </div>
                    <div className="col-span-3 text-gray-700 text-sm">
                      {user.email}
                    </div>
                    <div className="col-span-1 text-gray-700 text-sm">
                      {user.role}
                    </div>
                    <div className="col-span-1 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.isBan
                            ? "bg-red-100 text-red-800"
                            : "bg-[#40B491] text-white"
                        }`}
                      >
                        {user.isBan ? "Inactive" : "Active"}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center space-x-3">
                      <button
                        className="p-1 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                        onClick={() => handleOpenEditModal(user)}
                        title="Edit"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        onClick={() => handleDeleteUser(user._id)}
                        title="Delete"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No users found.
                </div>
              )}
            </div>

            {totalItems > 0 && !loading && (
              <div className="p-4 bg-gray-50">
                <Pagination
                  limit={usersPerPage}
                  setLimit={(value) => {
                    setUsersPerPage(value);
                    setCurrentPage(1);
                  }}
                  totalItems={totalItems}
                  handlePageClick={handlePageClick}
                  currentPage={currentPage - 1}
                  text="Users"
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-[#40B491]">
              Pending Nutritionist Applications
            </h2>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
              <div className="col-span-1">No.</div>
              <div className="col-span-3">Username</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-3">Submitted At</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {pendingNutritionists.length > 0 ? (
                pendingNutritionists.map((user, index) => (
                  <div
                    key={user._id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-opacity duration-300"
                  >
                    <div className="col-span-1 text-gray-600 font-medium">
                      {index + 1}
                    </div>
                    <div className="col-span-3 text-gray-700 text-sm">
                      {user.username}
                    </div>
                    <div className="col-span-3 text-gray-700 text-sm">
                      {user.email}
                    </div>
                    <div className="col-span-3 text-gray-700 text-sm">
                      {new Date(
                        user.nutritionistApplication.submittedAt
                      ).toLocaleDateString()}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <button
                        className="px-4 py-1 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                        onClick={() => setSelectedApplication(user)}
                      >
                        View CV
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No pending applications.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#40B491]">
              Edit User
            </h2>
            <label className="block mb-2 text-gray-700">Role:</label>
            <select
              className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="nutritionist">Nutritionist</option>
            </select>
            <label className="block mb-2 text-gray-700">Status:</label>
            <select
              className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-[#40B491]"
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
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#40B491] text-white rounded hover:bg-[#359c7a] transition"
                onClick={handleSaveChanges}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#40B491]">
              Confirm Delete
            </h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={confirmDeleteUser}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
            <h2 className="text-2xl font-bold mb-6 text-[#40B491]">
              Nutritionist Application
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 flex flex-col">
                <div className="mb-4">
                  {selectedApplication.nutritionistApplication.profileImage ? (
                    <img
                      src={
                        selectedApplication.nutritionistApplication.profileImage
                      }
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
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Full Name:</strong>{" "}
                    {selectedApplication.nutritionistApplication.personalInfo
                      .fullName || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedApplication.nutritionistApplication.personalInfo
                      .phoneNumber || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {selectedApplication.nutritionistApplication.personalInfo
                      .address || "N/A"}
                  </p>
                  <p>
                    <strong>Certificate Link:</strong>{" "}
                    {selectedApplication.nutritionistApplication
                      .certificateLink ? (
                      <a
                        href={
                          selectedApplication.nutritionistApplication
                            .certificateLink
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Certificate
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <h3 className="text-lg font-semibold mb-2 text-[#40B491]">
                  Introduction
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedApplication.nutritionistApplication.introduction ||
                    "No introduction provided."}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="px-4 py-2 bg-[#40B491] text-white rounded hover:bg-[#359c7a] transition"
                onClick={() =>
                  handleReviewApplication(selectedApplication._id, "approve")
                }
              >
                Approve
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={() =>
                  handleReviewApplication(selectedApplication._id, "reject")
                }
              >
                Reject
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
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
