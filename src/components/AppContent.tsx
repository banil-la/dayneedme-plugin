import { h } from "preact";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import Profile from "./auth/Profile";
import Utils from "./utils/Utils";
import UtilURL from "./utils/UtilURL";
import UtilString from "./utils/UtilString";

const AppContent: React.FC = () => {
  const { authToken, isLoading } = useAuth();

  console.log("[AppContent] Render:", { authToken, isLoading });

  if (isLoading) {
    console.log("[AppContent] Still loading...");
    return <div>Loading...</div>;
  }

  if (!authToken) {
    console.log("[AppContent] No auth token, showing login");
    return <Login />;
  }

  console.log("[AppContent] Auth token exists, showing main content");
  return (
    <div className="text-base">
      <Profile />
      <Utils />
      <UtilURL />
      <UtilString />
    </div>
  );
};

export default AppContent;
