// components/App.tsx

import { h } from "preact";
import { useAuth } from "../context/AuthContext";
import Profile from "./auth/Profile";
import Login from "./Login";
import Utils from "./utils/Utils";
import UtilURL from "./utils/UtilURL";
import UtilString from "./utils/UtilString";

const App: React.FC = () => {
  const { authToken, user } = useAuth();

  if (!authToken) {
    return <Login />;
  }

  return (
    <div className="text-base">
      <Profile />
      <Utils />
      {/* modes */}
      <UtilURL />
      <UtilString />
    </div>
  );
};

export default App;
