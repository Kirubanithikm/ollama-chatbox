import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome, {user?.username}!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          This is your chat dashboard.
        </p>
        <Button onClick={handleLogout} className="mt-6">
          Logout
        </Button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;