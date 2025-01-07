// components/App.tsx

import { h } from "preact";
import { useAuth } from "../context/AuthContext";
import Profile from "./auth/Profile";
import Login from "./auth/Login";
import Utils from "./Mode";
import UtilString from "./strings/UtilString";
import UtilURL from "./url/UtilURL";
import SettingsSelector from "./SettingsSelector";
import { useGlobal } from "../context/GlobalContext";

const App: React.FC = () => {
  const { authToken, user } = useAuth();

  if (!authToken) {
    return <Login />;
  }

  return (
    <div className="text-base">
      <Profile />
      <SettingsSelector />
      <Utils />
      {/* modes */}
      <UtilURL />
      <UtilString />
    </div>
  );
};

export default App;
