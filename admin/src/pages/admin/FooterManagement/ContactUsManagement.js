import React, { useEffect, useState } from "react";
import contactServices from "../../../services/footer/contactServices";
import { TrashIcon, CheckCircleIcon } from "lucide-react";
import Pagination from "../../../components/Pagination"; // Import Pagination
import Loading from "../../../components/Loading"; // Import Loading

const ContactUsManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Thêm totalItems để khớp với Pagination

  useEffect(() => {
    fetchContacts();
  }, [currentPage, itemsPerPage]);

  const fetchContacts = async (callback) => {
    setLoading(true);
    try {
      const result = await contactServices.getContacts(currentPage, itemsPerPage);
      if (result.success) {
        setContacts(result.data.items || []);
        setTotalPages(result.data.totalPages || 1);
        setTotalItems(result.data.total || 0); // Cập nhật totalItems từ API
        if (callback) callback(result.data);
      } else {
        setError(result.message);
        setContacts([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      setError("Lỗi không xác định khi tải dữ liệu");
      setContacts([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolved = async (contact) => {
    const updatedContact = { ...contact, isResolved: !contact.isResolved };
    const response = await contactServices.updateContact(contact._id, updatedContact);
    if (response.success) {
      fetchContacts();
    } else {
      console.error("Error updating status:", response.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      const response = await contactServices.deleteContact(id);
      if (response.success) {
        fetchContacts((result) => {
          const totalItems = result.total;
          const newTotalPages = Math.ceil(totalItems / itemsPerPage) || 1;
          if (result.items.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
          }
        });
      } else {
        console.error("Error deleting contact:", response.message);
      }
    }
  };

  // Xử lý sự kiện thay đổi trang từ Pagination
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1; // ReactPaginate dùng index từ 0
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
          Contact Us Management
        </h1>
      </div>

      {/* Data Container */}
      <Loading isLoading={loading}>
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
            <div className="col-span-1 text-center">No.</div>
            <div className="col-span-2">Full Name</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-2">Topic</div>
            <div className="col-span-2">Message</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <div
                  key={contact._id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition duration-200 items-center"
                >
                  <div className="col-span-1 text-gray-600 font-medium text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div>
                  <div className="col-span-2 text-gray-700 text-sm line-clamp-1">
                    {contact.name}
                  </div>
                  <div className="col-span-2 text-gray-700 text-sm line-clamp-1">
                    {contact.mail}
                  </div>
                  <div className="col-span-2 text-gray-700 text-sm line-clamp-1">
                    {contact.subject}
                  </div>
                  <div className="col-span-2 text-gray-700 text-sm line-clamp-1">
                    {contact.message}
                  </div>
                  <div className="col-span-1 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        contact.isResolved
                          ? "bg-[#40B491] text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {contact.isResolved ? "Resolved" : "Pending"}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-center space-x-3">
                    <button
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                      onClick={() => handleDelete(contact._id)}
                    >
                      <TrashIcon size={16} />
                    </button>
                    <button
                      className={`p-2 rounded-md text-white ${
                        contact.isResolved
                          ? "bg-gray-500 hover:bg-gray-600"
                          : "bg-[#40B491] hover:bg-[#359c7a]"
                      } transition`}
                      onClick={() => handleToggleResolved(contact)}
                    >
                      <CheckCircleIcon size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No contacts available.</div>
            )}
          </div>

          {/* Pagination */}
          <div className="p-4 bg-gray-50">
            <Pagination
              limit={itemsPerPage}
              setLimit={setItemsPerPage}
              totalItems={totalItems}
              handlePageClick={handlePageClick}
              text={"Contacts"}
            />
          </div>
        </div>
      </Loading>
    </div>
  );
};

export default ContactUsManagement;