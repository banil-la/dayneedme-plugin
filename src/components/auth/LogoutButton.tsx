import { h } from "preact";
import { emit } from "@create-figma-plugin/utilities";
import { useAuth } from "../../context/AuthContext";

const LogoutButton: React.FC = () => {
  const { setTokens } = useAuth();

  const handleLogout = () => {
    // console.log("Logout button clicked");
    setTokens(null); // Clear the token
    emit("DELETE_TOKEN"); // Emit an event to delete the token from storage
  };

  return (
    <button className="btn btn-xs" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
