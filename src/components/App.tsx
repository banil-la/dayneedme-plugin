// components/App.tsx

import { h } from "preact";
import { useAuth } from "../context/AuthContext";
import { useGlobal } from "../context/GlobalContext";
import Profile from "./auth/Profile";
import Login from "./auth/Login";
import Utils from "./Mode";
import UtilString from "./strings/UtilString";
import UtilURL from "./url/UtilURL";
import UtilImage from "./image/UtilImage";
import SettingsSelector from "./SettingsSelector";
import UtilHistory from "./history/UtilHistory";
// import SettingsSelector from "./SettingsSelector";

const App: React.FC = () => {
  const { authToken, user } = useAuth();
  const { mode } = useGlobal();

  if (!authToken) {
    return <Login />;
  }

  const renderModeContent = () => {
    switch (mode) {
      case "history":
        return <UtilHistory />;
      case "string":
        return <UtilString />;
      case "url":
        return <UtilURL />;
      case "image":
        return <UtilImage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="shrink-0">
        <Profile />
        <SettingsSelector />
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Utils />
        <div className="flex-1 overflow-auto">{renderModeContent()}</div>
      </div>
    </div>
  );
};

export default App;
