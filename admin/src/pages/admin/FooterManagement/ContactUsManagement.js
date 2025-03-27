import React, { useEffect, useState } from "react";
import contactServices from "../../../services/footer/contactServices";
import { TrashIcon, CheckCircleIcon } from "lucide-react";
import Pagination from "../../../components/Pagination";

const ContactUsManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchContacts();
  }, [currentPage, itemsPerPage]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const result = await contactServices.getContacts(currentPage + 1, itemsPerPage); // +1 vì API dùng từ 1
      if (result.success) {
        setContacts(result.data.data.contactUs || []);
        setTotalItems(result.data.total || 0);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Lỗi không xác định khi tải Contacts");
      console.error("❌ Lỗi trong fetchContacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolved = async (contact) => {
    const updatedContact = { ...contact, isResolved: !contact.isResolved };
    const response = await contactServices.updateContact(contact._id, updatedContact);
    if (response.success) fetchContacts();
    else console.error("Error updating status:", response.message);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      await contactServices.deleteContact(id);
      fetchContacts();
    }
  };

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  if (loading) return <p className="text-center text-blue-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-custom-green">Contact Us Management</h1>
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <table className="w-full border-collapse mb-2">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left">No.</th>
              <th className="p-3 text-left">Full Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Topic</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <tr key={contact._id} className="border-b border-gray-200 text-gray-900">
                  <td className="p-3">{currentPage * itemsPerPage + index + 1}</td>
                  <td className="p-3">{contact.name}</td>
                  <td className="p-3">{contact.mail}</td>
                  <td className="p-3">{contact.subject}</td>
                  <td className="p-3">{contact.message}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                        contact.isResolved
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {contact.isResolved ? "Resolved" : "Pending"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        onClick={() => handleDelete(contact._id)}
                      >
                        <TrashIcon size={16} />
                      </button>
                      <button
                        className={`p-2 rounded-full ${
                          contact.isResolved ? "bg-gray-500 text-white" : "bg-green-300 text-black"
                        } hover:${contact.isResolved ? "bg-gray-600" : "bg-green-400"}`}
                        onClick={() => handleToggleResolved(contact)}
                      >
                        <CheckCircleIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 p-4">
                  No contacts available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          limit={itemsPerPage}
          setLimit={setItemsPerPage}
          totalItems={totalItems}
          handlePageClick={handlePageClick}
          currentPage={currentPage} // Thêm currentPage
          text="Contacts"
        />
      </div>
    </div>
  );
};

export default ContactUsManagement;
