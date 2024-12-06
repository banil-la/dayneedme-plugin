// components/App.tsx

import { h } from "preact";
import CreateShortUrl from "./CreateShortUrl";
import Profile from "./auth/Profile";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";

const App: React.FC = () => {
  const { authToken } = useAuth();

  if (!authToken) {
    return <Login />;
  }

  return (
    <div class="text-base">
      <Profile />
      <CreateShortUrl />
    </div>
  );
};

export default App;
