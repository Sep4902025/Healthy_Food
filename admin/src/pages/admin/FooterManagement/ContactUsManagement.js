import React, { useEffect, useState } from "react";
import contactServices from "../../../services/footer/contactServices";
import { TrashIcon, CheckCircleIcon } from "lucide-react";
import Pagination from "../../../components/Pagination";
import { toast } from "react-toastify"; // Import toast

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
      const result = await contactServices.getContacts(currentPage + 1, itemsPerPage);
      console.log("🔍 ContactUs API Response:", result);
      if (result.success && result.data) {
        const fetchedContacts = result.data.data?.contactUs || result.data.contactUs || [];
        setContacts(fetchedContacts);
        setTotalItems(result.data.total || fetchedContacts.length);
      } else {
        setError(result.message || "No data returned from API");
        toast.error(result.message || "No data returned from API"); // Sử dụng toast.error
        setContacts([]);
      }
    } catch (err) {
      setError("Failed to fetch Contacts data");
      toast.error("Failed to fetch Contacts data"); // Sử dụng toast.error
      console.error("❌ Fetch Error:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolved = async (contact) => {
    const updatedContact = { ...contact, isResolved: !contact.isResolved };
    try {
      const response = await contactServices.updateContact(contact._id, updatedContact);
      if (response.success) {
        toast.success(
          `Contact marked as ${updatedContact.isResolved ? "resolved" : "pending"} successfully!`
        ); // Sử dụng toast.success
        fetchContacts();
      } else {
        toast.error("Failed to update contact status"); // Sử dụng toast.error
      }
    } catch (err) {
      toast.error("Failed to update contact status"); // Sử dụng toast.error
      console.error("❌ Error toggling resolved:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        const response = await contactServices.deleteContact(id);
        if (response.success) {
          toast.success("Contact deleted successfully!"); // Sử dụng toast.success
          fetchContacts();
        } else {
          toast.error("Failed to delete contact"); // Sử dụng toast.error
        }
      } catch (err) {
        toast.error("Failed to delete contact"); // Sử dụng toast.error
        console.error("❌ Error deleting contact:", err);
      }
    }
  };

  const handlePageClick = ({ selected }) => {
    console.log("Selected Page:", selected);
    setCurrentPage(selected);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex flex-col items-center justify-center z-50">
        <div className="loader border-t-4 border-[#40B491] rounded-full w-8 h-8 animate-spin"></div>
        <p className="mt-4 text-white text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg font-semibold">Error: {error}</p>
      </div>
    );
  }

  console.log("Current Page in Render:", currentPage); // Debug log

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          Contact Us Management
        </h1>
      </div>

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
          <div className="col-span-1">No.</div>
          <div className="col-span-2">Full Name</div>
          <div className="col-span-2">Email</div>
          <div className="col-span-2">Topic</div>
          <div className="col-span-3">Message</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>

        <div className="divide-y divide-gray-200">
          {contacts.length > 0 ? (
            contacts.map((contact, index) => (
              <div
                key={contact._id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-opacity duration-300 items-center"
              >
                <div className="col-span-1 text-gray-600 font-medium">
                  {currentPage * itemsPerPage + index + 1}
                </div>
                <div className="col-span-2 text-gray-700 text-sm">{contact.name}</div>
                <div className="col-span-2 text-gray-700 text-sm">{contact.mail}</div>
                <div className="col-span-2 text-gray-700 text-sm">{contact.subject}</div>
                <div className="col-span-3 text-gray-700 text-sm line-clamp-2">
                  {contact.message}
                </div>
                <div className="col-span-1 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      contact.isResolved ? "bg-[#40B491] text-white" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {contact.isResolved ? "Resolved" : "Pending"}
                  </span>
                </div>
                <div className="col-span-1 flex justify-center space-x-3">
                  <button
                    className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition"
                    onClick={() => handleDelete(contact._id)}
                    title="Delete"
                  >
                    <TrashIcon size={16} />
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded text-white ${
                      contact.isResolved
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-[#40B491] hover:bg-[#359c7a]"
                    } transition`}
                    onClick={() => handleToggleResolved(contact)}
                    title={contact.isResolved ? "Mark as Pending" : "Mark as Resolved"}
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

        <div className="p-4 bg-gray-50">
          <Pagination
            limit={itemsPerPage}
            setLimit={(value) => {
              setItemsPerPage(value);
              setCurrentPage(0);
            }}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            currentPage={currentPage}
            text="Contacts"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactUsManagement;