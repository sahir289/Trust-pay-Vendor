/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import Button from "@/components/Base/Button";


const NotFound = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleGoToLogin = () => {
    navigate("/");
  };

  return (
   <div className="flex flex-col items-center justify-center min-h-screen color dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-5 right-5 p-2 bg-gray-200 dark:bg-gray-800 rounded-full shadow-md hover:scale-105 transition"
      >
        {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-800" />}
      </button>
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-2">Oops! Page Not Found</p>
      <p className="text-gray-500 dark:text-gray-400 mt-1">
        The page you are looking for doesn’t exist.
      </p>
      <Button
        onClick={handleGoToLogin}
        className="mt-6 px-6 py-3 bg-primary text-current"
      >
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;
