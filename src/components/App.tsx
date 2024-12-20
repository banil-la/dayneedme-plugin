// components/App.tsx

import { h } from "preact";
import { useAuth } from "../context/AuthContext";
import Profile from "./auth/Profile";
import Login from "./Login";
import Utils from "./utils/Utils";
import UtilURL from "./UtilURL";

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
    </div>
  );
};

export default App;
