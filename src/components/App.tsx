// components/App.tsx

import { h } from "preact";
import { useAuth } from "../context/AuthContext";
import { useGlobal } from "../context/GlobalContext";
import Profile from "./auth/Profile";
import Login from "./auth/Login";
import Utils from "./Mode";
import UtilString from "./strings/UtilString";
import UtilURL from "./url/UtilURL";
// import SettingsSelector from "./SettingsSelector";

const App: React.FC = () => {
  const { authToken, user } = useAuth();
  const { mode } = useGlobal();

  if (!authToken) {
    return <Login />;
  }

  const renderModeContent = () => {
    switch (mode) {
      case "string":
        return <UtilString />;
      case "url":
        return <UtilURL />;
      default:
        return null;
    }
  };

  return (
    <div className="text-base w-full h-full overflow-x-hidden">
      <div class="absolute top-0 left-0 bg-red-500 bg-opacity-50">
        <p>DEV</p>

        {/* <p>{JSON.stringify(user)}</p> */}
      </div>
      <Profile />
      <Utils />
      {renderModeContent()}
    </div>
  );
};

export default App;
