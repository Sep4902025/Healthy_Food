import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-white py-8 px-12 flex justify-between items-center mt-auto w-full border-t">
      <p className="text-sm">Copyright © 2025 HFINC | All rights reserved</p>
      <div className="flex space-x-6">
        <button onClick={() => navigate("/about")} className="hover:underline">
          About Us
        </button>
        <button onClick={() => navigate("/FAQs")} className="hover:underline">
          FAQs
        </button>
        <button
          onClick={() => navigate("/contact")}
          className="hover:underline"
        >
          Contact Us
        </button>
        <button onClick={() => navigate("/term")} className="hover:underline">
          Term of use
        </button>
      </div>
    </footer>
  );
};

export default Footer;
