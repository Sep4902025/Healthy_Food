import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
      <p className="text-sm">Copyright &copy; 2025 HealthyFood Inc. All rights reserved.</p>
      <div className="flex space-x-4">
        <button onClick={() => navigate("/about")} className="hover:underline">About Us</button>
        <button onClick={() => navigate("/FAQs")} className="hover:underline">FAQs</button>
        <button onClick={() => navigate("/contact")} className="hover:underline">Contact Us</button>
        <button onClick={() => navigate("/term")} className="hover:underline">Term of Use</button>
      </div>
    </footer>
  );
};

export default Footer;
