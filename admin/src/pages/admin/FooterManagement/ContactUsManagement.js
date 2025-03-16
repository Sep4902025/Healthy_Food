import React, { useEffect, useState } from "react";
import contactServices from "../../../services/footer/contactServices";

const ContactUsManagement = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const result = await contactServices.getContacts();
      if (result.success) {
        setContacts(result.data);
      }
    };
    fetchContacts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Contact Us Management</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Full Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Topic</th>
            <th className="border p-2">Message</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <tr key={contact._id} className="border">
                <td className="border p-2">{contact.name}</td>
                <td className="border p-2">{contact.mail}</td>
                <td className="border p-2">{contact.subject}</td>
                <td className="border p-2">{contact.message}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4">No contact</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ContactUsManagement;
