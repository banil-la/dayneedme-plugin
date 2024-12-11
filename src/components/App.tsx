// components/App.tsx

import { h } from "preact";
import { useAuth } from "../context/AuthContext";
import Profile from "./auth/Profile";
import Login from "./Login";
import Utils from "./utils/Utils";
import UtilURL from "./UtilURL";
import EnvironmentSwitcher from "./EnviromentSwitcher";
import { useGlobal } from "../context/GlobalContext";

const App: React.FC = () => {
  const { authToken } = useAuth();
  const { environment } = useGlobal();

  if (!authToken) {
    return <Login />;
  }

  return (
    <div className="text-base">
      <p>ENVIRONMENT: {environment}</p>
      <Profile />
      <EnvironmentSwitcher />
      <Utils />
      {/* modes */}
      <UtilURL />
    </div>
  );
};

export default App;
