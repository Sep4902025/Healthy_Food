import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useAuthCheck = (userId) => {
  const navigate = useNavigate();

  const checkLogin = () => {
    if (!userId) {
      toast.info("You need to login to continue!", {
        autoClose: 2000,
      });

      const currentPath = window.location.pathname;
      localStorage.setItem("redirectAfterLogin", currentPath);
      navigate("/signin");
      return false;
    }
    return true;
  };

  return { checkLogin };
};

export default useAuthCheck;