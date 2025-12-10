/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userSession");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold">Access Denied</h1>
      <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
      <button
        onClick={handleGoToLogin}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Go to Login
      </button>
    </div>
  );
};

export default Unauthorized;
