import React, { useEffect, useState } from "react";
import contactServices from "../../../services/footer/contactServices";
import { TrashIcon, CheckCircleIcon } from "lucide-react";

const ContactUsManagement = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async (callback) => {
        setLoading(true);
        const result = await contactServices.getContacts();
        if (result.success) {
            setContacts(result.data);
            if (callback) callback(result.data);
        } else {
            setError(result.message);
        }
        setLoading(false);
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
            await contactServices.deleteContact(id);
            fetchContacts(() => {
                const totalPages = Math.ceil((contacts.length - 1) / itemsPerPage);
                if (currentPage > totalPages) {
                    setCurrentPage(totalPages || 1);
                }
            });
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = contacts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(contacts.length / itemsPerPage);

    if (loading) return <p className="text-center text-blue-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error: {error}</p>;

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold">Contact Us Management</h1>
            <div className="bg-white shadow-lg rounded-2xl p-6">
                <table className="w-full border-collapse">
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
                        {currentData.length > 0 ? (
                            currentData.map((contact, index) => (
                                <tr key={contact._id} className="border-b border-gray-200 text-gray-900">
                                    <td className="p-3">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td className="p-3">{contact.name}</td>
                                    <td className="p-3">{contact.mail}</td>
                                    <td className="p-3">{contact.subject}</td>
                                    <td className="p-3">{contact.message}</td>
                                    <td className="p-3 text-center">
                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${contact.isResolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
                                                className={`p-2 rounded-full ${contact.isResolved ? "bg-gray-500 text-white" : "bg-green-300 text-black"}`}
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
                                <td colSpan="7" className="text-center text-gray-500 p-4">No contacts available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <span>Show</span>
                        <select
                            className="border rounded px-2 py-1"
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
                            <option value="5">5 Contacts</option>
                            <option value="10">10 Contacts</option>
                            <option value="15">15 Contacts</option>
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className="border rounded px-3 py-1 hover:bg-gray-100"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-green-500 text-white" : "border hover:bg-gray-100"}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="border rounded px-3 py-1 hover:bg-gray-100"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsManagement;